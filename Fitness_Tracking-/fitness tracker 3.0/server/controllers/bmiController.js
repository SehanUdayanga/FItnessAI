const HealthMetric = require('../models/HealthMetric');
const Profile = require('../models/Profile');
const WeightRecord = require('../models/WeightRecord');

// @desc    Calculate BMI & save record
// @route   POST /api/bmi/calculate
// @access  Private
const calculateBMI = async (req, res) => {
  try {
    let { height, weight } = req.body;

    const profile = await Profile.findOne({ userId: req.user.id });
    const latestWeightRecord = await WeightRecord.findOne({ userId: req.user.id }).sort({ date: -1 });

    // Fallback to latest saved height/weight if missing
    if (!height && profile && profile.height) {
      height = profile.height;
    }
    if (!weight) {
      if (latestWeightRecord) {
        weight = latestWeightRecord.weight;
      } else if (profile && profile.currentWeight) {
        weight = profile.currentWeight;
      }
    }

    if (!height || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid height (in cm) and weight (in kg) or complete your profile setup first.'
      });
    }

    const heightNum = Number(height);
    const weightNum = Number(weight);
    const heightMeters = heightNum / 100;
    const bmi = parseFloat((weightNum / (heightMeters * heightMeters)).toFixed(1));

    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
    else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    const todayStr = new Date().toISOString().split('T')[0];

    const metric = await HealthMetric.create({
      userId: req.user.id,
      weight: weightNum,
      bmi,
      bmiCategory,
      date: todayStr
    });

    res.json({
      success: true,
      message: 'BMI calculated successfully',
      data: {
        height: heightNum,
        weight: weightNum,
        bmi,
        bmiCategory,
        date: todayStr,
        _id: metric._id
      }
    });
  } catch (error) {
    console.error('Calculate BMI error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error calculating BMI'
    });
  }
};

// @desc    Get BMI calculation history
// @route   GET /api/bmi/history
// @access  Private
const getBMIHistory = async (req, res) => {
  try {
    const history = await HealthMetric.find({ userId: req.user.id }).sort({ date: 1 });
    const profile = await Profile.findOne({ userId: req.user.id });
    const latestWeight = await WeightRecord.findOne({ userId: req.user.id }).sort({ date: -1 });

    res.json({
      success: true,
      defaults: {
        height: profile ? profile.height : 175,
        weight: latestWeight ? latestWeight.weight : (profile ? profile.currentWeight : 70)
      },
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Get BMI history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching BMI history'
    });
  }
};

module.exports = {
  calculateBMI,
  getBMIHistory
};
