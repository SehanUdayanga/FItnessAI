const User = require('../models/User');
const Meal = require('../models/Meal');
const WaterIntake = require('../models/WaterIntake');
const WeightRecord = require('../models/WeightRecord');
const aiService = require('../services/aiService');
const bcrypt = require('bcryptjs');

// @desc    Get Admin Dashboard Statistics (Total, Active, Inactive Users)
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getDashboardStatistics = async (req, res) => {
  try {
    // Only count regular users in the statistics (excluding admin users)
    const totalUsers = await User.countDocuments({ role: { $in: ['user', 'USER'] } });
    const activeUsers = await User.countDocuments({ role: { $in: ['user', 'USER'] }, status: 'active' });
    const inactiveUsers = await User.countDocuments({ role: { $in: ['user', 'USER'] }, status: 'inactive' });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get Users with Pagination, Search & Filter
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status ? req.query.status.trim().toLowerCase() : 'all';

    const filter = {
      role: { $in: ['user', 'USER'] } // Display managed regular users
    };

    if (status === 'active' || status === 'inactive') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        users,
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users list'
    });
  }
};

// @desc    Get single user by ID with fitness history (meals, water, weight)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch user's recent fitness records directly from the 3 activity collections
    const [meals, waterLogs, weightHistory] = await Promise.all([
      Meal.find({ userId: user._id }).sort({ date: -1, createdAt: -1 }).limit(15),
      WaterIntake.find({ userId: user._id }).sort({ date: -1, createdAt: -1 }).limit(15),
      WeightRecord.find({ userId: user._id }).sort({ date: -1, createdAt: -1 }).limit(15)
    ]);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        meals,
        waterLogs,
        weightHistory
      }
    });
  } catch (error) {
    console.error('Admin getUserById error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details and tracking records'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, age, gender, height, weight, targetWeight, healthGoal } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check email uniqueness if email changed
    if (email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Another user is already registered with this email'
        });
      }
    }

    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    if (age !== undefined) user.age = Number(age);
    if (gender !== undefined) user.gender = gender;
    if (height !== undefined) user.height = Number(height);
    if (targetWeight !== undefined) user.targetWeight = Number(targetWeight);
    if (healthGoal !== undefined) user.healthGoal = healthGoal;
    user.updatedAt = Date.now();

    await user.save();

    // If admin also entered a new weight value, add a WeightRecord
    if (weight !== undefined && Number(weight) > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      await WeightRecord.create({
        userId: user._id,
        weight: Number(weight),
        date: todayStr
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        targetWeight: user.targetWeight,
        healthGoal: user.healthGoal,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Admin updateUser error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
};

// @desc    Toggle user status (Active / Inactive)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change the status of your own admin account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newStatus = status ? status.toLowerCase() : (user.status === 'active' ? 'inactive' : 'active');

    if (!['active', 'inactive'].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "active" or "inactive"'
      });
    }

    user.status = newStatus;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: `User status changed to ${newStatus}`,
      data: {
        _id: user._id,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Admin toggleUserStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// @desc    Delete user and associated tracking data
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clean up related tracking collections
    await Promise.all([
      Meal.deleteMany({ userId }),
      WaterIntake.deleteMany({ userId }),
      WeightRecord.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({
      success: true,
      message: 'User and associated fitness records deleted successfully'
    });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// @desc    Get AI Monitoring Status
// @route   GET /api/admin/ai/status
// @access  Private/Admin
const getAIStatus = (req, res) => {
  try {
    const statusData = aiService.getStatus();
    res.json({
      success: true,
      data: statusData
    });
  } catch (error) {
    console.error('Admin getAIStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI service status'
    });
  }
};

// @desc    Get AI Configuration
// @route   GET /api/admin/ai/config
// @access  Private/Admin
const getAIConfig = (req, res) => {
  try {
    const configData = aiService.getConfig();
    res.json({
      success: true,
      data: configData
    });
  } catch (error) {
    console.error('Admin getAIConfig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI configuration'
    });
  }
};

// @desc    Update AI Configuration
// @route   PUT /api/admin/ai/config
// @access  Private/Admin
const updateAIConfig = (req, res) => {
  try {
    const { apiKey, model } = req.body;
    const updated = aiService.updateConfig({ apiKey, model });

    res.json({
      success: true,
      message: 'AI Configuration updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Admin updateAIConfig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AI configuration'
    });
  }
};

// @desc    Test connection to Gemini AI API
// @route   POST /api/admin/ai/test
// @access  Private/Admin
const testAIConnection = async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    const result = await aiService.testConnection(apiKey, model);

    res.json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Admin testAIConnection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform AI connection test'
    });
  }
};

// @desc    Update Admin Profile (Name, Email)
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const adminId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check email uniqueness
    const emailExists = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: adminId }
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in use'
      });
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    adminUser.name = name.trim();
    adminUser.email = email.toLowerCase().trim();
    adminUser.updatedAt = Date.now();
    await adminUser.save();

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status
      }
    });
  } catch (error) {
    console.error('Admin updateAdminProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin profile'
    });
  }
};

// @desc    Change Admin Password
// @route   PUT /api/admin/change-password
// @access  Private/Admin
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.user._id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all password fields'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(newPassword, salt);
    adminUser.updatedAt = Date.now();
    await adminUser.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Admin changeAdminPassword error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

module.exports = {
  getDashboardStatistics,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAIStatus,
  getAIConfig,
  updateAIConfig,
  testAIConnection,
  updateAdminProfile,
  changeAdminPassword
};
