const WaterIntake = require('../models/WaterIntake');

// Default water goal: 2500 ml
const DEFAULT_WATER_GOAL = 2500;

// @desc    Get water intake records for user
// @route   GET /api/water
// @access  Private
const getWaterIntake = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const logs = await WaterIntake.find({
      userId: req.user.id,
      date: targetDate
    }).sort({ createdAt: 1 });

    const totalAmount = logs.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      success: true,
      data: {
        date: targetDate,
        totalAmount, // in ml
        goal: DEFAULT_WATER_GOAL,
        percentage: Math.min(Math.round((totalAmount / DEFAULT_WATER_GOAL) * 100), 100),
        remaining: Math.max(DEFAULT_WATER_GOAL - totalAmount, 0),
        logs
      }
    });
  } catch (error) {
    console.error('Get water error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching water intake'
    });
  }
};

// @desc    Add water intake entry
// @route   POST /api/water
// @access  Private
const addWaterIntake = async (req, res) => {
  try {
    const { amount, date } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid water amount in ml'
      });
    }

    const waterLog = await WaterIntake.create({
      userId: req.user.id,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: 'Water intake recorded successfully',
      data: waterLog
    });
  } catch (error) {
    console.error('Add water error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding water intake'
    });
  }
};

// @desc    Update water intake entry
// @route   PUT /api/water/:id
// @access  Private
const updateWaterIntake = async (req, res) => {
  try {
    const { amount } = req.body;
    const log = await WaterIntake.findOne({ _id: req.params.id, userId: req.user.id });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Water log entry not found'
      });
    }

    if (amount !== undefined && Number(amount) > 0) {
      log.amount = Number(amount);
      await log.save();
    }

    res.json({
      success: true,
      message: 'Water log updated successfully',
      data: log
    });
  } catch (error) {
    console.error('Update water error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating water intake'
    });
  }
};

// @desc    Delete water intake entry
// @route   DELETE /api/water/:id
// @access  Private
const deleteWaterIntake = async (req, res) => {
  try {
    const log = await WaterIntake.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Water log entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Water log deleted successfully'
    });
  } catch (error) {
    console.error('Delete water error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting water intake'
    });
  }
};

module.exports = {
  getWaterIntake,
  addWaterIntake,
  updateWaterIntake,
  deleteWaterIntake
};
