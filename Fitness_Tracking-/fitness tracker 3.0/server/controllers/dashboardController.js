const User = require('../models/User');
const Meal = require('../models/Meal');
const WaterIntake = require('../models/WaterIntake');
const WeightRecord = require('../models/WeightRecord');

// @desc    Get aggregated dashboard summary data calculated dynamically from the 4 collections
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // 1. Get User Profile attributes directly from users collection
    const user = await User.findById(userId).select('-password');
    const height = user?.height || 170;
    const targetWeight = user?.targetWeight || 65.0;
    const waterGoal = user?.waterGoal || 2500;
    const calorieGoal = 2100; // Standard daily reference or user goal

    // 2. Weight Data across history from weightrecords collection
    const allWeightRecords = await WeightRecord.find({ userId }).sort({ date: 1 });
    
    const startingWeight = allWeightRecords.length > 0
      ? allWeightRecords[0].weight
      : targetWeight;

    // Find weight for the selected date, or closest on/before that date, or latest
    const recordsOnOrBefore = allWeightRecords.filter(r => r.date <= targetDate);
    const selectedDateRecord = allWeightRecords.find(r => r.date === targetDate);
    
    const currentWeight = selectedDateRecord
      ? selectedDateRecord.weight
      : (recordsOnOrBefore.length > 0
          ? recordsOnOrBefore[recordsOnOrBefore.length - 1].weight
          : (allWeightRecords.length > 0
              ? allWeightRecords[allWeightRecords.length - 1].weight
              : targetWeight));

    const toGo = parseFloat((currentWeight - targetWeight).toFixed(1));
    const weightChange = parseFloat((currentWeight - startingWeight).toFixed(1));

    // 3. Dynamic BMI Calculation
    const heightMeters = height / 100;
    const bmi = parseFloat((currentWeight / (heightMeters * heightMeters)).toFixed(1));
    
    let bmiCategory = 'Healthy';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Healthy';
    else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    // 4. Meals for the target date from meals collection
    const targetMeals = await Meal.find({ userId, date: targetDate }).sort({ createdAt: 1 });
    const targetCalories = targetMeals.reduce((sum, meal) => sum + meal.calories, 0);

    // 5. Water logs for the target date from waterintakes collection
    const targetWaterLogs = await WaterIntake.find({ userId, date: targetDate }).sort({ createdAt: 1 });
    const targetWater = targetWaterLogs.reduce((sum, log) => sum + log.amount, 0);

    res.json({
      success: true,
      data: {
        date: targetDate,
        userName: user ? user.name : 'User',
        userEmail: user ? user.email : '',
        currentWeight,
        startingWeight,
        targetWeight,
        toGo,
        weightChange,
        bmi,
        bmiCategory,
        todayCalories: targetCalories,
        calorieGoal,
        todayWater: targetWater,
        waterGoal,
        waterLogs: targetWaterLogs,
        recentMeals: targetMeals,
        recentWeightRecords: allWeightRecords.slice(-7)
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching dashboard summary'
    });
  }
};

module.exports = {
  getDashboardData
};
