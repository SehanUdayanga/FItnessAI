const User = require('../models/User');
const WeightRecord = require('../models/WeightRecord');

// Helper to calculate BMI and Category dynamically
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, bmiCategory: 'Normal' };
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
  else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';
  return { bmi, bmiCategory };
};

// @desc    Get current user profile & metrics
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get latest weight record dynamically from weightrecords collection
    const latestWeightDoc = await WeightRecord.findOne({ userId }).sort({ date: -1, createdAt: -1 });
    const currentWeight = latestWeightDoc ? latestWeightDoc.weight : (user.targetWeight || 70);

    // Calculate BMI dynamically
    const { bmi, bmiCategory } = calculateBMI(currentWeight, user.height);

    const responseData = {
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      age: user.age || 25,
      gender: user.gender || 'Male',
      height: user.height || 170,
      currentWeight,
      targetWeight: user.targetWeight || 65,
      healthGoal: user.healthGoal || 'Maintain Weight',
      waterGoal: user.waterGoal || 2500,
      profileImage: user.profileImage || '',
      bmi,
      bmiCategory,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching profile'
    });
  }
};

// @desc    Update user profile & log weight record if weight provided
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      name,
      age,
      gender,
      height,
      currentWeight,
      weight,
      targetWeight,
      healthGoal,
      waterGoal,
      profileImage
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update User fields
    if (name) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);
    if (gender !== undefined) user.gender = gender;
    if (height !== undefined) user.height = Number(height);
    if (targetWeight !== undefined) user.targetWeight = Number(targetWeight);
    if (healthGoal !== undefined) user.healthGoal = healthGoal;
    if (waterGoal !== undefined) user.waterGoal = Number(waterGoal);
    if (profileImage !== undefined) user.profileImage = profileImage;
    user.updatedAt = Date.now();

    await user.save();

    // If a new weight value is supplied, save to weightrecords collection
    const weightToLog = currentWeight !== undefined ? currentWeight : weight;
    if (weightToLog !== undefined && Number(weightToLog) > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      await WeightRecord.create({
        userId,
        weight: Number(weightToLog),
        date: todayStr
      });
    }

    // Fetch latest weight dynamically
    const latestWeightDoc = await WeightRecord.findOne({ userId }).sort({ date: -1, createdAt: -1 });
    const latestWeight = latestWeightDoc ? latestWeightDoc.weight : (user.targetWeight || 70);

    // Dynamic BMI calculation
    const { bmi, bmiCategory } = calculateBMI(latestWeight, user.height);

    const updatedData = {
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      age: user.age,
      gender: user.gender,
      height: user.height,
      currentWeight: latestWeight,
      targetWeight: user.targetWeight,
      healthGoal: user.healthGoal,
      waterGoal: user.waterGoal,
      profileImage: user.profileImage,
      bmi,
      bmiCategory,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
