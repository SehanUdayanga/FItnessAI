const https = require('https');
const User = require('../models/User');
const Meal = require('../models/Meal');
const WaterIntake = require('../models/WaterIntake');
const WeightRecord = require('../models/WeightRecord');
const aiService = require('../services/aiService');

// System Instruction as defined by user requirement
const SYSTEM_INSTRUCTION = `You are the FitTrack Health Assistant.


Your purpose is to provide general health,
nutrition, hydration, weight-management and
wellness guidance based on the user's
FitTrack information.

Use the user's FitTrack data when relevant.

Only use information provided by the user's
FitTrack data.

Do not invent missing health data.

Do not diagnose diseases.

Do not prescribe medication.

Do not recommend changing prescribed medication.

Do not claim to be a doctor or healthcare professional.

Do not provide emergency medical treatment.

Do not make definitive medical diagnoses.

If a question requires professional medical advice,
recommend consulting a qualified healthcare professional.

Keep responses clear, concise, friendly and practical.`;

/**
 * Low-level HTTP helper to send JSON request to Gemini API
 */
function sendGeminiRequest(modelName, apiKey, payload) {
  return new Promise((resolve, reject) => {
    const cleanModel = modelName.replace(/^models\//, '');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
    const url = new URL(endpoint);

    const postData = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Failed to parse Gemini response: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Helper to call Google Gemini API
 */
async function callGeminiAPI(systemInstruction, promptText) {
  const apiKey = aiService.getEffectiveApiKey();

  if (
    !apiKey ||
    apiKey === 'YOUR_GEMINI_API_KEY_HERE' ||
    apiKey.trim() === ''
  ) {
    aiService.recordRequest(false);
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const primaryModel = aiService.getEffectiveModel();
  const candidateModels = [
    primaryModel,
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite'
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);


  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  if (systemInstruction) {
    payload.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await sendGeminiRequest(model, apiKey, payload);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Empty response received from Gemini API');
        }
        console.log(`FitTrack AI: Connected via Gemini/${model}`);
        return text;
      }

      const errMsg = response.data?.error?.message || `HTTP ${response.statusCode}`;
      const errMsgLower = errMsg.toLowerCase();

      if (
        response.statusCode === 401 ||
        response.statusCode === 403 ||
        errMsgLower.includes('api_key') ||
        errMsgLower.includes('key not valid') ||
        errMsgLower.includes('api key not valid')
      ) {
        throw new Error('GEMINI_API_KEY_INVALID');
      }

      // If model not found (404), rate limit/quota exhausted (429), or retired, try next candidate model
      if (
        response.statusCode === 429 ||
        response.statusCode === 404 ||
        errMsgLower.includes('quota') ||
        errMsgLower.includes('rate-limit') ||
        errMsgLower.includes('resource_exhausted') ||
        errMsgLower.includes('no longer available') ||
        errMsgLower.includes('not found') ||
        errMsgLower.includes('not supported')
      ) {
        console.warn(`Gemini model ${model} temporarily unavailable or rate-limited (${errMsg.split('\n')[0]}), trying fallback...`);
        lastError = new Error(errMsg);
        continue;
      }

      throw new Error(`Gemini API Error (${response.statusCode}): ${errMsg}`);
    } catch (err) {
      if (err.message === 'GEMINI_API_KEY_INVALID') {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API');
}

// @desc    Chat with FitTrack AI Assistant
// @route   POST /api/assistant/chat
// @access  Private
const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid text message.'
      });
    }

    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch user and fitness tracking data from the 4 official collections
    const user = await User.findById(userId).select('-password');
    const todayMeals = await Meal.find({ userId, date: todayStr }).sort({ createdAt: -1 });
    const todayWaterLogs = await WaterIntake.find({ userId, date: todayStr });
    const weightRecords = await WeightRecord.find({ userId }).sort({ date: 1 });

    // Calculate metrics
    const userName = user ? user.name : 'User';
    const age = user?.age || 'Not specified';
    const gender = user?.gender || 'Not specified';
    const height = user?.height || 170; // in cm
    const targetWeight = user?.targetWeight || 65;
    const healthGoal = user?.healthGoal || 'Maintain Weight';
    const waterGoal = user?.waterGoal || 2500; // in ml

    const startingWeight = weightRecords.length > 0 ? weightRecords[0].weight : (user?.targetWeight || 70);
    const currentWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : (user?.targetWeight || 70);

    const heightMeters = height / 100;
    const bmi = parseFloat((currentWeight / (heightMeters * heightMeters)).toFixed(1));
    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
    else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';


    const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const todayWater = todayWaterLogs.reduce((sum, w) => sum + w.amount, 0);
    const remainingWater = Math.max(0, waterGoal - todayWater);

    const recentMealsSummary = todayMeals.map(m => `- ${m.mealType}: ${m.foodName} (${m.calories} kcal)`).join('\n') || 'None recorded today';
    const recentWeightSummary = weightRecords.slice(-5).map(w => `${w.date}: ${w.weight} kg`).join(', ') || `${currentWeight} kg`;

    // Construct Context Prompt
    const contextPrompt = `User Info & FitTrack Health Context:
- Name: ${userName}
- Age: ${age}
- Gender: ${gender}
- Height: ${height} cm
- Current Weight: ${currentWeight} kg
- Starting Weight: ${startingWeight} kg
- Target Weight: ${targetWeight} kg
- Health Goal: ${healthGoal}
- Calculated BMI: ${bmi} (${bmiCategory})
- Today's Water Intake: ${todayWater} ml (Goal: ${waterGoal} ml, Remaining: ${remainingWater} ml)
- Today's Total Calories: ${todayCalories} kcal
- Today's Meals Logged:\n${recentMealsSummary}
- Recent Weight Records: ${recentWeightSummary}

User Question:
"${message.trim()}"`;

    const aiMessage = await callGeminiAPI(SYSTEM_INSTRUCTION, contextPrompt);
    aiService.recordRequest(true);

    return res.json({
      success: true,
      message: aiMessage
    });
  } catch (error) {
    console.error('FitTrack AI Error:', error.message);
    aiService.recordRequest(false);

    if (error.message === 'GEMINI_API_KEY_NOT_CONFIGURED') {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured. Please add your GEMINI_API_KEY in the server's .env file."
      });
    }

    if (error.message === 'GEMINI_API_KEY_INVALID') {
      return res.status(401).json({
        success: false,
        message: "Invalid Gemini API key. Please check your GEMINI_API_KEY in the server's .env file."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Sorry, I couldn't connect to FitTrack AI right now. Please try again."
    });
  }
};

module.exports = {
  chatWithAssistant
};

