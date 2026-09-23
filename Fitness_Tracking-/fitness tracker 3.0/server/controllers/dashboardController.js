const User = require('../models/User');
const Profile = require('../models/Profile');
const Meal = require('../models/Meal');
const WaterIntake = require('../models/WaterIntake');
const WeightRecord = require('../models/WeightRecord');
const HealthMetric = require('../models/HealthMetric');

// @desc    Get aggregated dashboard summary data (supports ?date=YYYY-MM-DD)
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get User & Profile
    const user = await User.findById(userId).select('name email');
    const profile = await Profile.findOne({ userId });

    // Weight Data across history
    const allWeightRecords = await WeightRecord.find({ userId }).sort({ date: 1 });
    
    const startingWeight = allWeightRecords.length > 0
      ? allWeightRecords[0].weight
      : (profile?.currentWeight || 72.0);

    // Find weight for the selected date, or closest on/before that date, or latest
    const recordsOnOrBefore = allWeightRecords.filter(r => r.date <= targetDate);
    const selectedDateRecord = allWeightRecords.find(r => r.date === targetDate);
    
    const currentWeight = selectedDateRecord
      ? selectedDateRecord.weight
      : (recordsOnOrBefore.length > 0
          ? recordsOnOrBefore[recordsOnOrBefore.length - 1].weight
          : (allWeightRecords.length > 0
              ? allWeightRecords[allWeightRecords.length - 1].weight
              : (profile?.currentWeight || 68.5)));

    const targetWeight = profile?.targetWeight || 65.0;
    const toGo = parseFloat((currentWeight - targetWeight).toFixed(1));
    const weightChange = parseFloat((currentWeight - startingWeight).toFixed(1));

    // Calculate BMI based on height
    const height = profile?.height || 175;
    const heightMeters = height / 100;
    const bmi = parseFloat((currentWeight / (heightMeters * heightMeters)).toFixed(1));
    
    let bmiCategory = 'Healthy';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Healthy';
    else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    // Meals for the target date
    const targetMeals = await Meal.find({ userId, date: targetDate }).sort({ createdAt: 1 });
    const targetCalories = targetMeals.reduce((sum, meal) => sum + meal.calories, 0);

    // Water logs for the target date
    const targetWaterLogs = await WaterIntake.find({ userId, date: targetDate }).sort({ createdAt: 1 });
    const targetWater = targetWaterLogs.reduce((sum, log) => sum + log.amount, 0);
    const waterGoal = profile?.waterGoal || 2500; // in ml (default 2.5 L)
    const calorieGoal = profile?.calorieGoal || 2100; // in kcal (default 2,100 kcal)

    res.json({
      success: true,
      data: {
        date: targetDate,
        userName: user ? user.name : 'Alex',
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
