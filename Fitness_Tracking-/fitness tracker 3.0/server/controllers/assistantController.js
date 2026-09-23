const Groq = require('groq-sdk');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Meal = require('../models/Meal');
const WaterIntake = require('../models/WaterIntake');
const WeightRecord = require('../models/WeightRecord');

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
 * Helper to call Groq API using the groq-sdk
 */
async function callGroqAPI(systemInstruction, promptText) {
  const apiKey = process.env.GROQ_API_KEY;

  if (
    !apiKey ||
    apiKey === 'YOUR_GROQ_API_KEY_HERE' ||
    apiKey.trim() === ''
  ) {
    throw new Error('GROQ_API_KEY_NOT_CONFIGURED');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const groq = new Groq({ apiKey });

  try {
    const chatCompletion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user',   content: promptText }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });

    const text = chatCompletion.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response received from Groq API');
    }

    console.log(`FitTrack AI: Connected via Groq/${model}`);
    return text;
  } catch (err) {
    console.error('Groq API Error:', err.message);

    // Re-surface auth errors clearly
    if (
      err.message?.toLowerCase().includes('api key') ||
      err.message?.toLowerCase().includes('authentication') ||
      err.status === 401
    ) {
      throw new Error('GROQ_API_KEY_INVALID');
    }

    throw err;
  }
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

    // Fetch user profile and data
    const user = await User.findById(userId).select('name email');
    const profile = await Profile.findOne({ userId });
    const todayMeals = await Meal.find({ userId, date: todayStr }).sort({ createdAt: -1 });
    const todayWaterLogs = await WaterIntake.find({ userId, date: todayStr });
    const weightRecords = await WeightRecord.find({ userId }).sort({ date: 1 });

    // Calculate metrics
    const userName = user ? user.name : 'User';
    const age = profile?.age || 'Not specified';
    const gender = profile?.gender || 'Not specified';
    const height = profile?.height || 175; // in cm
    const targetWeight = profile?.targetWeight || 65;
    const healthGoal = profile?.healthGoal || 'Maintain Weight';

    const startingWeight = weightRecords.length > 0 ? weightRecords[0].weight : (profile?.currentWeight || 70);
    const currentWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : (profile?.currentWeight || 70);

    const heightMeters = height / 100;
    const bmi = parseFloat((currentWeight / (heightMeters * heightMeters)).toFixed(1));
    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
    else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const todayWater = todayWaterLogs.reduce((sum, w) => sum + w.amount, 0);
    const waterGoal = profile?.waterGoal || 2500; // in ml
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

    const aiMessage = await callGroqAPI(SYSTEM_INSTRUCTION, contextPrompt);

    return res.json({
      success: true,
      message: aiMessage
    });
  } catch (error) {
    console.error('FitTrack AI Error:', error.message);

    if (error.message === 'GROQ_API_KEY_NOT_CONFIGURED') {
      return res.status(500).json({
        success: false,
        message: "Groq API key is not configured. Please add your GROQ_API_KEY in the server's .env file."
      });
    }

    if (error.message === 'GROQ_API_KEY_INVALID') {
      return res.status(401).json({
        success: false,
        message: "Invalid Groq API key. Please check your GROQ_API_KEY in the server's .env file."
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
