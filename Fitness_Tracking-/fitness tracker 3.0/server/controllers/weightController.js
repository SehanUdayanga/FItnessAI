const WeightRecord = require('../models/WeightRecord');
const Profile = require('../models/Profile');
const HealthMetric = require('../models/HealthMetric');

// @desc    Get all weight records for user
// @route   GET /api/weight
// @access  Private
const getWeightRecords = async (req, res) => {
  try {
    const records = await WeightRecord.find({ userId: req.user.id }).sort({ date: 1 });
    const profile = await Profile.findOne({ userId: req.user.id });

    const startingWeight = records.length > 0 ? records[0].weight : (profile ? profile.currentWeight : 0);
    const currentWeight = records.length > 0 ? records[records.length - 1].weight : (profile ? profile.currentWeight : 0);
    const targetWeight = profile ? (profile.targetWeight || 65) : 65;
    const weightChange = parseFloat((currentWeight - startingWeight).toFixed(1));

    res.json({
      success: true,
      summary: {
        startingWeight,
        currentWeight,
        targetWeight,
        weightChange
      },
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Get weight error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching weight records'
    });
  }
};

// @desc    Add or update a weight record
// @route   POST /api/weight
// @access  Private
const addWeightRecord = async (req, res) => {
  try {
    const { weight, date } = req.body;

    if (!weight || Number(weight) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid weight in kg'
      });
    }

    const recordDate = date || new Date().toISOString().split('T')[0];

    // Find existing record for this date or create new
    let weightRecord = await WeightRecord.findOne({
      userId: req.user.id,
      date: recordDate
    });

    if (weightRecord) {
      weightRecord.weight = Number(weight);
      await weightRecord.save();
    } else {
      weightRecord = await WeightRecord.create({
        userId: req.user.id,
        weight: Number(weight),
        date: recordDate
      });
    }

    // Also update current weight on Profile
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { currentWeight: Number(weight), updatedAt: Date.now() },
      { new: true }
    );

    // If height exists on profile, log/update a health metric
    if (profile && profile.height) {
      const heightMeters = profile.height / 100;
      const bmi = parseFloat((Number(weight) / (heightMeters * heightMeters)).toFixed(1));
      let bmiCategory = 'Normal';
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
      else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
      else if (bmi >= 30) bmiCategory = 'Obese';

      await HealthMetric.findOneAndUpdate(
        { userId: req.user.id, date: recordDate },
        {
          userId: req.user.id,
          weight: Number(weight),
          bmi,
          bmiCategory,
          date: recordDate
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Weight record saved successfully',
      data: weightRecord
    });
  } catch (error) {
    console.error('Add weight error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding weight record'
    });
  }
};

// @desc    Update weight record
// @route   PUT /api/weight/:id
// @access  Private
const updateWeightRecord = async (req, res) => {
  try {
    const record = await WeightRecord.findOne({ _id: req.params.id, userId: req.user.id });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Weight record not found'
      });
    }

    const { weight, date } = req.body;

    if (weight !== undefined) record.weight = Number(weight);
    if (date) record.date = date;

    const updatedRecord = await record.save();

    res.json({
      success: true,
      message: 'Weight record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Update weight error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating weight record'
    });
  }
};

// @desc    Delete weight record
// @route   DELETE /api/weight/:id
// @access  Private
const deleteWeightRecord = async (req, res) => {
  try {
    const record = await WeightRecord.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Weight record not found'
      });
    }

    res.json({
      success: true,
      message: 'Weight record deleted successfully'
    });
  } catch (error) {
    console.error('Delete weight error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting weight record'
    });
  }
};

module.exports = {
  getWeightRecords,
  addWeightRecord,
  updateWeightRecord,
  deleteWeightRecord
};
