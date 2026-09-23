const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Meal = require('../models/Meal');
const WaterIntake = require('../models/WaterIntake');
const WeightRecord = require('../models/WeightRecord');
const HealthMetric = require('../models/HealthMetric');

// @desc    Get aggregated platform statistics for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private / Admin
const getAdminStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Registered Users & Role breakdown
    const totalUsers = await User.countDocuments();
    const regularUsers = await User.countDocuments({ role: 'user' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // 2. Today's Logs
    const totalMealsToday = await Meal.countDocuments({ date: todayStr });
    
    const waterTodayDocs = await WaterIntake.find({ date: todayStr });
    const totalWaterToday = waterTodayDocs.reduce((sum, log) => sum + (log.amount || 0), 0);

    // 3. Active Users Today (logged meals, water, or weight)
    const mealUsers = await Meal.distinct('userId', { date: todayStr });
    const waterUsers = await WaterIntake.distinct('userId', { date: todayStr });
    const weightUsers = await WeightRecord.distinct('userId', { date: todayStr });

    const activeUsersSet = new Set([
      ...mealUsers.map(id => id.toString()),
      ...waterUsers.map(id => id.toString()),
      ...weightUsers.map(id => id.toString())
    ]);
    const activeUsersToday = activeUsersSet.size;

    // 4. Average User BMI Calculation
    const profiles = await Profile.find({ height: { $gt: 0 }, currentWeight: { $gt: 0 } });
    let averageBMI = 0;
    if (profiles.length > 0) {
      const totalBMI = profiles.reduce((sum, p) => {
        const heightM = p.height / 100;
        return sum + (p.currentWeight / (heightM * heightM));
      }, 0);
      averageBMI = parseFloat((totalBMI / profiles.length).toFixed(1));
    }

    // 5. Total System Database Records
    const totalMeals = await Meal.countDocuments();
    const totalWaterLogs = await WaterIntake.countDocuments();
    const totalWeightLogs = await WeightRecord.countDocuments();
    const totalHealthMetrics = await HealthMetric.countDocuments();
    const totalSystemRecords = totalMeals + totalWaterLogs + totalWeightLogs + totalHealthMetrics;

    res.json({
      success: true,
      data: {
        totalUsers,
        regularUsers,
        adminUsers,
        activeUsersToday,
        totalMealsToday,
        totalWaterToday, // in ml
        averageBMI,
        totalSystemRecords,
        systemHealth: {
          status: 'Operational',
          uptime: '99.9%',
          database: 'Connected'
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching admin statistics'
    });
  }
};

// @desc    Get all users list with their profiles
// @route   GET /api/admin/users
// @access  Private / Admin
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const profiles = await Profile.find();

    const profileMap = new Map();
    profiles.forEach((p) => {
      if (p.userId) {
        profileMap.set(p.userId.toString(), p);
      }
    });

    const usersWithProfiles = users.map((user) => {
      const prof = profileMap.get(user._id.toString()) || {};
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt,
        gender: prof.gender || 'Not specified',
        height: prof.height || null,
        currentWeight: prof.currentWeight || null,
        targetWeight: prof.targetWeight || null,
        healthGoal: prof.healthGoal || 'Not specified',
        waterGoal: prof.waterGoal || 2500,
        calorieGoal: prof.calorieGoal || 2100
      };
    });

    res.json({
      success: true,
      count: usersWithProfiles.length,
      data: usersWithProfiles
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user list'
    });
  }
};

// @desc    Get complete activity history for a specific user
// @route   GET /api/admin/users/:id/activity
// @access  Private / Admin
const getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = await Profile.findOne({ userId: id });
    const meals = await Meal.find({ userId: id }).sort({ date: -1, createdAt: -1 }).limit(100);
    const water = await WaterIntake.find({ userId: id }).sort({ date: -1, createdAt: -1 }).limit(100);
    const weightHistory = await WeightRecord.find({ userId: id }).sort({ date: -1, createdAt: -1 }).limit(50);
    const healthMetrics = await HealthMetric.find({ userId: id }).sort({ date: -1, createdAt: -1 }).limit(50);

    res.json({
      success: true,
      data: {
        user,
        profile,
        meals,
        water,
        weightHistory,
        healthMetrics
      }
    });
  } catch (error) {
    console.error('Admin get user activity error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user activity history'
    });
  }
};

// @desc    Reset a user's password to a temporary password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private / Admin
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const temporaryPassword = newPassword || 'Reset@123';
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(temporaryPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: `Password reset successfully for ${user.email}`,
      temporaryPassword,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error resetting user password'
    });
  }
};

// @desc    Cascade and delete a user and all their records
// @route   DELETE /api/admin/users/:id
// @access  Private / Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety check: Prevent admin from deleting their own active account
    const currentUserId = req.user._id ? req.user._id.toString() : req.user.id.toString();
    if (currentUserId === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Action denied: Administrators cannot delete their own active account'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cascade delete across all collections
    await User.findByIdAndDelete(id);
    await Profile.deleteMany({ userId: id });
    await Meal.deleteMany({ userId: id });
    await WaterIntake.deleteMany({ userId: id });
    await WeightRecord.deleteMany({ userId: id });
    await HealthMetric.deleteMany({ userId: id });

    res.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) and all associated records deleted successfully`
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting user'
    });
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  getUserActivity,
  resetUserPassword,
  deleteUser
};
