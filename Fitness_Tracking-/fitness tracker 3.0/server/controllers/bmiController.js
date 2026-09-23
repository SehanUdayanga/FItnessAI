const User = require('../models/User');
const WeightRecord = require('../models/WeightRecord');

// Helper to determine BMI Category
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi <= 24.9) return 'Normal';
  if (bmi <= 29.9) return 'Overweight';
  return 'Obese';
};

// @desc    Calculate BMI dynamically on the fly (Do not store BMI in database)
// @route   POST /api/bmi/calculate
// @access  Private
const calculateBMI = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let { height, weight } = req.body;

    const user = await User.findById(userId);
    const latestWeightRecord = await WeightRecord.findOne({ userId }).sort({ date: -1, createdAt: -1 });

    // Fallback to user saved height or latest weight if not provided in payload
    if (!height && user && user.height) {
      height = user.height;
    }
    if (!weight) {
      if (latestWeightRecord) {
        weight = latestWeightRecord.weight;
      } else if (user && user.targetWeight) {
        weight = user.targetWeight;
      }
    }

    if (!height || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid height (in cm) and weight (in kg).'
      });
    }

    const heightNum = Number(height);
    const weightNum = Number(weight);
    const heightMeters = heightNum / 100;
    const bmi = parseFloat((weightNum / (heightMeters * heightMeters)).toFixed(1));
    const bmiCategory = getBMICategory(bmi);

    const todayStr = new Date().toISOString().split('T')[0];

    res.json({
      success: true,
      message: 'BMI calculated successfully',
      data: {
        height: heightNum,
        weight: weightNum,
        bmi,
        bmiCategory,
        date: todayStr
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

// @desc    Get BMI history computed dynamically from weightrecords + user height
// @route   GET /api/bmi/history
// @access  Private
const getBMIHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    const height = user?.height || 170;
    const heightMeters = height / 100;

    const weightRecords = await WeightRecord.find({ userId }).sort({ date: 1 });

    const history = weightRecords.map((record) => {
      const bmi = parseFloat((record.weight / (heightMeters * heightMeters)).toFixed(1));
      return {
        _id: record._id,
        userId: record.userId,
        weight: record.weight,
        bmi,
        bmiCategory: getBMICategory(bmi),
        date: record.date,
        createdAt: record.createdAt
      };
    });

    const latestWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : (user?.targetWeight || 70);

    res.json({
      success: true,
      defaults: {
        height,
        weight: latestWeight
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
