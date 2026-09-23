const Meal = require('../models/Meal');
const Food = require('../models/Food');

// @desc    Get user meals (filtered by date if provided)
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user.id };

    if (date) {
      filter.date = date;
    } else {
      filter.date = new Date().toISOString().split('T')[0];
    }

    const meals = await Meal.find(filter).sort({ createdAt: -1 });

    const totalCalories = meals.reduce((sum, meal) => sum + (meal.totalCalories || meal.calories || 0), 0);

    res.json({
      success: true,
      count: meals.length,
      totalCalories,
      data: meals
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching meals'
    });
  }
};

// @desc    Get today's user meals
// @route   GET /api/meals/today
// @access  Private
const getTodayMeals = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const meals = await Meal.find({ userId: req.user.id, date: todayStr }).sort({ createdAt: -1 });
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.totalCalories || meal.calories || 0), 0);

    res.json({
      success: true,
      count: meals.length,
      totalCalories,
      data: meals
    });
  } catch (error) {
    console.error('Get today meals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching today meals'
    });
  }
};

// @desc    Add a new meal
// @route   POST /api/meals
// @access  Private
const addMeal = async (req, res) => {
  try {
    // Support batch saving multiple meals (e.g. multi-food plate from AI scanner)
    if (Array.isArray(req.body.meals) && req.body.meals.length > 0) {
      const savedMeals = [];
      const defaultMealType = req.body.mealType || 'Lunch';
      const defaultDate = req.body.date || new Date().toISOString().split('T')[0];

      for (const item of req.body.meals) {
        const itemMealType = item.mealType || defaultMealType;
        const itemFoodName = item.foodName ? item.foodName.trim() : '';
        if (!itemFoodName) continue;

        const numGrams = Number(item.quantityGrams) > 0 ? Number(item.quantityGrams) : 150;
        let calPer100 = Number(item.caloriesPer100g) >= 0 ? Number(item.caloriesPer100g) : 150;
        const totalCal = Math.round((calPer100 / 100) * numGrams);

        let resolvedFoodId = item.foodId || null;
        if (!resolvedFoodId) {
          const existing = await Food.findOne({
            name: { $regex: new RegExp(`^${itemFoodName}$`, 'i') }
          });
          if (existing) {
            resolvedFoodId = existing._id;
            calPer100 = existing.caloriesPer100g;
          } else if (item.saveNewFood) {
            try {
              const newFood = await Food.create({
                name: itemFoodName,
                caloriesPer100g: calPer100
              });
              resolvedFoodId = newFood._id;
            } catch (createErr) {
              console.warn('Food create error:', createErr.message);
            }
          }
        }

        const meal = await Meal.create({
          userId: req.user.id,
          mealType: itemMealType,
          foodName: itemFoodName,
          quantity: `${numGrams}g`,
          quantityGrams: numGrams,
          caloriesPer100g: calPer100,
          calories: totalCal,
          totalCalories: totalCal,
          foodId: resolvedFoodId,
          source: item.source || 'ai',
          date: item.date || defaultDate
        });
        savedMeals.push(meal);
      }

      return res.status(201).json({
        success: true,
        message: `${savedMeals.length} meal items recorded successfully`,
        count: savedMeals.length,
        data: savedMeals
      });
    }

    const {
      mealType,
      foodName,
      quantity,
      quantityGrams,
      caloriesPer100g,
      calories,
      foodId,
      source,
      date,
      saveNewFood
    } = req.body;

    if (!mealType || !foodName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mealType and foodName.'
      });
    }

    // Validate quantityGrams if provided
    let numGrams = null;
    if (quantityGrams !== undefined && quantityGrams !== null && quantityGrams !== '') {
      numGrams = Number(quantityGrams);
      if (isNaN(numGrams) || numGrams <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity in grams must be a positive number greater than 0.'
        });
      }
      if (numGrams > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Quantity exceeds reasonable maximum portion limit (10,000g).'
        });
      }
    }

    let finalCaloriesPer100g = caloriesPer100g !== undefined && caloriesPer100g !== null && caloriesPer100g !== ''
      ? Number(caloriesPer100g)
      : null;

    let finalCalories = 0;

    if (finalCaloriesPer100g !== null && numGrams !== null) {
      // Authoritative backend calculation: (caloriesPer100g / 100) * quantityGrams
      finalCalories = Math.round((finalCaloriesPer100g / 100) * numGrams);
    } else if (calories !== undefined && calories !== null && calories !== '') {
      finalCalories = Number(calories);
      if (isNaN(finalCalories) || finalCalories < 0) {
        return res.status(400).json({
          success: false,
          message: 'Calories must be a valid non-negative number.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide calories or caloriesPer100g + quantityGrams.'
      });
    }

    // Handle food reference or saving new food into "foods" collection
    let resolvedFoodId = foodId || null;

    if (!resolvedFoodId) {
      const existingFood = await Food.findOne({
        name: { $regex: new RegExp(`^${foodName.trim()}$`, 'i') }
      });

      if (existingFood) {
        resolvedFoodId = existingFood._id;
        if (finalCaloriesPer100g === null) {
          finalCaloriesPer100g = existingFood.caloriesPer100g;
        }
      } else if (saveNewFood && finalCaloriesPer100g !== null) {
        try {
          const newFood = await Food.create({
            name: foodName.trim(),
            caloriesPer100g: finalCaloriesPer100g
          });
          resolvedFoodId = newFood._id;
        } catch (foodCreateErr) {
          console.warn('Notice: Could not save new food in foods collection:', foodCreateErr.message);
        }
      }
    }

    const mealQuantityStr = numGrams ? `${numGrams}g` : (quantity || '1 serving');
    const mealSource = (source === 'ai' || source === 'manual') ? source : 'manual';

    const meal = await Meal.create({
      userId: req.user.id,
      mealType,
      foodName: foodName.trim(),
      quantity: mealQuantityStr,
      quantityGrams: numGrams,
      caloriesPer100g: finalCaloriesPer100g,
      calories: finalCalories,
      totalCalories: finalCalories,
      foodId: resolvedFoodId,
      source: mealSource,
      date: date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: 'Meal recorded successfully',
      data: meal
    });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding meal'
    });
  }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, userId: req.user.id });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal record not found'
      });
    }

    const { mealType, foodName, quantity, quantityGrams, caloriesPer100g, calories, date } = req.body;

    if (mealType) meal.mealType = mealType;
    if (foodName) meal.foodName = foodName.trim();
    if (date) meal.date = date;

    if (quantityGrams !== undefined && quantityGrams !== null && quantityGrams !== '') {
      const numGrams = Number(quantityGrams);
      if (numGrams <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity in grams must be > 0' });
      }
      meal.quantityGrams = numGrams;
      meal.quantity = `${numGrams}g`;
    } else if (quantity !== undefined) {
      meal.quantity = quantity;
    }

    if (caloriesPer100g !== undefined && caloriesPer100g !== null && caloriesPer100g !== '') {
      meal.caloriesPer100g = Number(caloriesPer100g);
    }

    if (meal.caloriesPer100g && meal.quantityGrams) {
      const computed = Math.round((meal.caloriesPer100g / 100) * meal.quantityGrams);
      meal.calories = computed;
      meal.totalCalories = computed;
    } else if (calories !== undefined) {
      meal.calories = Number(calories);
      meal.totalCalories = Number(calories);
    }

    const updatedMeal = await meal.save();

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: updatedMeal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating meal'
    });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal record not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting meal'
    });
  }
};

module.exports = {
  getMeals,
  getTodayMeals,
  addMeal,
  updateMeal,
  deleteMeal
};
