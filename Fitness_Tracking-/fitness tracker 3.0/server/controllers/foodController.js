const Food = require('../models/Food');
const aiService = require('../services/aiService');
const { matchFoodToDatabase, SRI_LANKAN_ALIASES } = require('../services/foodMatchingService');

/**
 * @desc    Search foods with autocomplete, aliases, and prefix ranking
 * @route   GET /api/foods/search?q=...
 * @access  Private
 */
const searchFoods = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();

    if (!query) {
      // Return popular staple foods if empty query
      const staples = await Food.find({}).limit(10).select('name caloriesPer100g');
      return res.json({
        success: true,
        count: staples.length,
        data: staples
      });
    }

    const cleanQuery = query.toLowerCase();
    const aliasMatch = SRI_LANKAN_ALIASES[cleanQuery];

    // Escape regex special characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Query both prefix and substring matches
    const searchConditions = [
      { name: { $regex: new RegExp(`^${escapedQuery}`, 'i') } },
      { name: { $regex: new RegExp(escapedQuery, 'i') } }
    ];

    if (aliasMatch) {
      searchConditions.push({ name: { $regex: new RegExp(`^${aliasMatch}$`, 'i') } });
    }

    const matches = await Food.find({
      $or: searchConditions
    }).limit(20).select('name caloriesPer100g');

    // Sort to prioritize exact prefix matches, then aliases, then substrings
    matches.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aPrefix = aName.startsWith(cleanQuery);
      const bPrefix = bName.startsWith(cleanQuery);

      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;
      return aName.localeCompare(bName);
    });

    const results = matches.slice(0, 10);

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching foods collection'
    });
  }
};

/**
 * @desc    Get food by ID
 * @route   GET /api/foods/:id
 * @access  Private
 */
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food record not found'
      });
    }
    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Get food by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching food details'
    });
  }
};

/**
 * @desc    Add a new food to the foods database
 * @route   POST /api/foods
 * @access  Private
 */
const createFood = async (req, res) => {
  try {
    const { name, caloriesPer100g } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid food name is required.'
      });
    }

    const numericCalories = Number(caloriesPer100g);
    if (isNaN(numericCalories) || numericCalories < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid caloriesPer100g (>= 0) is required.'
      });
    }

    const trimmedName = name.trim();

    // Check if food already exists
    let food = await Food.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (food) {
      return res.status(200).json({
        success: true,
        message: 'Food already exists in database',
        data: food
      });
    }

    food = await Food.create({
      name: trimmedName,
      caloriesPer100g: numericCalories
    });

    res.status(201).json({
      success: true,
      message: 'New food added to database',
      data: food
    });
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating food record'
    });
  }
};

/**
 * @desc    AI Food Image Scanner: Identifies all visible foods, matches against DB list, estimates calories
 * @route   POST /api/foods/analyze-image
 * @access  Private
 */
const analyzeFoodImage = async (req, res) => {
  try {
    let imageBase64 = null;
    let mimeType = 'image/jpeg';

    if (req.body.image) {
      const rawImage = req.body.image;
      const match = rawImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageBase64 = match[2];
      } else {
        imageBase64 = rawImage;
      }
    } else if (req.body.imageBase64) {
      imageBase64 = req.body.imageBase64;
      mimeType = req.body.mimeType || 'image/jpeg';
    } else if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    }

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid food image.'
      });
    }

    // Step 1: Load all database food names to give Gemini reference context
    const allDbFoods = await Food.find({}).select('name caloriesPer100g');
    const availableFoodNames = allDbFoods.map((f) => f.name);

    // Step 2: Call Gemini to detect all visible foods with dynamic food list prompt
    let recognitionResult;
    try {
      recognitionResult = await aiService.identifyFoodFromImage(imageBase64, mimeType, availableFoodNames);
    } catch (aiErr) {
      console.error('Gemini image analysis error:', aiErr.message);
      if (aiErr.message === 'GEMINI_API_KEY_NOT_CONFIGURED') {
        return res.status(500).json({
          success: false,
          message: 'Gemini API key is not configured. Please add your GEMINI_API_KEY in server .env'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'AI food analysis is temporarily unavailable. Please add your meal manually.'
      });
    }

    if (recognitionResult?.isUnclear || !recognitionResult?.foods || recognitionResult.foods.length === 0) {
      return res.status(200).json({
        success: true,
        identified: false,
        isUnclear: true,
        message: "The food image is unclear or food could not be confidently recognized. Please upload a clearer image or select your food manually.",
        foods: []
      });
    }

    // Step 3: Match each detected food item against the database
    const processedFoods = [];

    for (const item of recognitionResult.foods) {
      const matchResult = matchFoodToDatabase(item.detectedName, item.matchedFoodName, allDbFoods);
      const weightGrams = item.estimatedWeightGrams > 0 ? item.estimatedWeightGrams : 150;

      let finalCaloriesPer100g = matchResult.caloriesPer100g;
      let finalFoodId = matchResult.matchedFood ? matchResult.matchedFood._id : null;
      let finalFoodName = matchResult.foodName;
      let source = 'database';

      // If food is not found in database, ask Gemini for an estimated calorie value per 100g
      if (!matchResult.isKnown || finalCaloriesPer100g === null) {
        try {
          finalCaloriesPer100g = await aiService.estimateFoodCaloriesPer100g(finalFoodName);
        } catch (calErr) {
          console.warn('Calorie estimation fallback for', finalFoodName, ':', calErr.message);
          finalCaloriesPer100g = 150.0;
        }
        source = 'gemini_estimate';
      }

      const estimatedCalories = Math.round((finalCaloriesPer100g / 100) * weightGrams);

      processedFoods.push({
        detectedName: item.detectedName,
        foodName: finalFoodName,
        foodId: finalFoodId,
        isKnown: matchResult.isKnown,
        caloriesPer100g: finalCaloriesPer100g,
        estimatedWeightGrams: weightGrams,
        estimatedCalories,
        confidence: item.confidence,
        source,
        possibleMatches: matchResult.possibleMatches || []
      });
    }

    const totalEstimatedCalories = processedFoods.reduce((sum, f) => sum + f.estimatedCalories, 0);

    return res.json({
      success: true,
      identified: true,
      isUnclear: false,
      count: processedFoods.length,
      foods: processedFoods,
      totalEstimatedCalories,
      // Backward-compatible fields for single-food readers
      foodName: processedFoods[0]?.foodName,
      foodId: processedFoods[0]?.foodId,
      caloriesPer100g: processedFoods[0]?.caloriesPer100g,
      estimatedWeightGrams: processedFoods[0]?.estimatedWeightGrams,
      estimatedTotalCalories: totalEstimatedCalories,
      isKnown: processedFoods.every((f) => f.isKnown),
      confidence: processedFoods[0]?.confidence >= 0.9 ? 'high' : (processedFoods[0]?.confidence >= 0.7 ? 'medium' : 'low')
    });
  } catch (error) {
    console.error('Analyze food image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error processing food image'
    });
  }
};

module.exports = {
  searchFoods,
  getFoodById,
  createFood,
  analyzeFoodImage
};
