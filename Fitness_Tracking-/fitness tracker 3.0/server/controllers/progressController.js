const WeightRecord = require('../models/WeightRecord');
const HealthMetric = require('../models/HealthMetric');
const WaterIntake = require('../models/WaterIntake');
const Meal = require('../models/Meal');
const Profile = require('../models/Profile');

// @desc    Get progress tracking data (supports ?range=7days|4weeks and ?date=YYYY-MM-DD)
// @route   GET /api/progress
// @access  Private
const getProgressData = async (req, res) => {
  try {
    const { range, date } = req.query; // '7days' or '4weeks'
    const userId = req.user.id;
    const numDays = range === '4weeks' ? 28 : 7;
    const anchorDateStr = date || new Date().toISOString().split('T')[0];

    const anchorDate = new Date(anchorDateStr + 'T12:00:00');
    const startDate = new Date(anchorDate);
    startDate.setDate(startDate.getDate() - (numDays - 1));

    // Generate array of date strings for the requested period
    const dateList = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    // Fetch user profile for goals
    const profile = await Profile.findOne({ userId });
    const goalWeight = profile?.targetWeight || 65.0;
    const goalWater = (profile?.waterGoal || 2500) / 1000;
    const goalCalories = profile?.calorieGoal || 2100;

    // Fetch all user weight records to compute starting weight & historical weights
    const allWeightRecords = await WeightRecord.find({ userId }).sort({ date: 1 });
    const startingWeight = allWeightRecords.length > 0
      ? allWeightRecords[0].weight
      : (profile?.currentWeight || 72.0);

    const latestWeightRecord = allWeightRecords.length > 0
      ? allWeightRecords[allWeightRecords.length - 1].weight
      : (profile?.currentWeight || 68.5);

    // Fetch records in date list
    const weightRecords = await WeightRecord.find({
      userId,
      date: { $in: dateList }
    }).sort({ date: 1 });

    const waterRecords = await WaterIntake.find({
      userId,
      date: { $in: dateList }
    });

    const mealRecords = await Meal.find({
      userId,
      date: { $in: dateList }
    });

    // Map aggregated data per day for Chart.js
    let lastKnownWeight = startingWeight;
    const chartData = dateList.map(dStr => {
      const wRecord = weightRecords.find(r => r.date === dStr);
      if (wRecord) {
        lastKnownWeight = wRecord.weight;
      }

      // Water total in Liters
      const waterTotalMl = waterRecords
        .filter(r => r.date === dStr)
        .reduce((sum, r) => sum + r.amount, 0);
      const waterTotalL = parseFloat((waterTotalMl / 1000).toFixed(2));

      // Calories total
      const caloriesTotal = mealRecords
        .filter(r => r.date === dStr)
        .reduce((sum, r) => sum + r.calories, 0);

      const dateObj = new Date(dStr + 'T12:00:00');
      const label = dateObj.toLocaleDateString('en-US', {
        weekday: numDays <= 7 ? 'short' : undefined,
        month: 'short',
        day: 'numeric'
      });

      return {
        date: dStr,
        label,
        weight: wRecord ? wRecord.weight : (allWeightRecords.find(r => r.date === dStr)?.weight || null),
        goalWeight,
        water: waterTotalL,
        waterMl: waterTotalMl,
        goalWater,
        calories: caloriesTotal,
        goalCalories
      };
    });

    // Calculate Summary Metrics
    const currentWeight = latestWeightRecord;
    const toGo = parseFloat((currentWeight - goalWeight).toFixed(1));
    const weightTrend = parseFloat((currentWeight - startingWeight).toFixed(1));

    // Water average & completion
    const waterDaysWithData = chartData.filter(d => d.water > 0);
    const avgWater = waterDaysWithData.length > 0
      ? parseFloat((chartData.reduce((sum, d) => sum + d.water, 0) / chartData.length).toFixed(1))
      : 0;
    const waterCompletion = Math.min(Math.round((avgWater / goalWater) * 100), 100);

    // Calorie average
    const calDaysWithData = chartData.filter(d => d.calories > 0);
    const avgCalories = calDaysWithData.length > 0
      ? Math.round(chartData.reduce((sum, d) => sum + d.calories, 0) / chartData.length)
      : 0;

    // Fetch comprehensive historical table data (all recorded dates)
    const allMealDates = await Meal.distinct('date', { userId });
    const allWaterDates = await WaterIntake.distinct('date', { userId });
    const allWeightDates = await WeightRecord.distinct('date', { userId });

    const allActiveDates = Array.from(new Set([...dateList, ...allMealDates, ...allWaterDates, ...allWeightDates]))
      .sort()
      .reverse();

    // Fetch all meals and waters for history table
    const allMeals = await Meal.find({ userId }).sort({ createdAt: 1 });
    const allWater = await WaterIntake.find({ userId }).sort({ createdAt: 1 });

    const historyTable = allActiveDates.slice(0, 30).map(dStr => {
      const dayMeals = allMeals.filter(m => m.date === dStr);
      const dayWater = allWater.filter(w => w.date === dStr);
      const dayWeight = allWeightRecords.find(w => w.date === dStr);

      const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
      const dayWaterMl = dayWater.reduce((sum, w) => sum + w.amount, 0);
      const dayWaterL = parseFloat((dayWaterMl / 1000).toFixed(1));

      const dateObj = new Date(dStr + 'T12:00:00');
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }); // e.g. "01 Sep 2026"

      const displayWeight = dayWeight ? `${dayWeight.weight} kg` : `${currentWeight} kg`;

      return {
        date: dStr,
        formattedDate,
        weight: displayWeight,
        weightVal: dayWeight ? dayWeight.weight : currentWeight,
        water: `${dayWaterL} L`,
        waterMl: dayWaterMl,
        calories: `${dayCalories.toLocaleString()} kcal`,
        caloriesVal: dayCalories,
        mealsCount: `${dayMeals.length} ${dayMeals.length === 1 ? 'meal' : 'meals'}`,
        meals: dayMeals,
        waterLogs: dayWater
      };
    });

    res.json({
      success: true,
      range: range || '7days',
      anchorDate: anchorDateStr,
      summary: {
        currentWeight,
        goalWeight,
        startingWeight,
        toGo,
        weightTrend,
        avgWater,
        goalWater,
        waterCompletion,
        avgCalories,
        goalCalories
      },
      chartData,
      historyTable
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching progress monitoring data'
    });
  }
};

module.exports = {
  getProgressData
};
