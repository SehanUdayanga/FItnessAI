const User = require('../models/User');
const WeightRecord = require('../models/WeightRecord');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fittrack_secret_key_student_project_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in users collection
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      status: 'active',
      age: 25,
      gender: 'Male',
      height: 170,
      targetWeight: 65,
      healthGoal: 'Maintain Weight',
      waterGoal: 2500,
      profileImage: ''
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        age: user.age,
        gender: user.gender,
        height: user.height,
        targetWeight: user.targetWeight,
        healthGoal: user.healthGoal,
        waterGoal: user.waterGoal,
        profileImage: user.profileImage,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check user email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user account is deactivated
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Query latest weight dynamically from weightrecords
    const latestWeightDoc = await WeightRecord.findOne({ userId: user._id }).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        status: user.status || 'active',
        age: user.age,
        gender: user.gender,
        height: user.height,
        targetWeight: user.targetWeight,
        healthGoal: user.healthGoal,
        waterGoal: user.waterGoal,
        profileImage: user.profileImage,
        currentWeight: latestWeightDoc ? latestWeightDoc.weight : user.targetWeight || 70,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current user profile & data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Fetch latest weight dynamically from weightrecords
    const latestWeightDoc = await WeightRecord.findOne({ userId: user._id }).sort({ date: -1, createdAt: -1 });
    const currentWeight = latestWeightDoc ? latestWeightDoc.weight : user.targetWeight || 70;

    const userData = {
      ...user.toObject(),
      currentWeight
    };

    res.json({
      success: true,
      data: {
        user: userData,
        profile: userData // Backward compatibility for any frontend component expecting data.profile
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user data'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
