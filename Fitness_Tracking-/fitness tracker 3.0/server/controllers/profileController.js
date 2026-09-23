const Profile = require('../models/Profile');
const User = require('../models/User');
const WeightRecord = require('../models/WeightRecord');
const HealthMetric = require('../models/HealthMetric');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      // Create a default profile if none exists yet
      profile = await Profile.create({
        userId: req.user.id,
        age: 24,
        gender: 'Male',
        height: 175,
        currentWeight: 70,
        targetWeight: 65,
        healthGoal: 'Maintain Weight'
      });
    }

    const user = await User.findById(req.user.id).select('name email');

    res.json({
      success: true,
      data: {
        ...profile.toObject(),
        name: user ? user.name : '',
        email: user ? user.email : ''
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      healthGoal,
      waterGoal,
      calorieGoal,
      profileImage,
      name
    } = req.body;

    // Update name on User model if provided
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name });
    }

    let profile = await Profile.findOne({ userId: req.user.id });

    const updateFields = {
      updatedAt: Date.now()
    };

    if (age !== undefined) updateFields.age = Number(age);
    if (gender !== undefined) updateFields.gender = gender;
    if (height !== undefined) updateFields.height = Number(height);
    if (currentWeight !== undefined) updateFields.currentWeight = Number(currentWeight);
    if (targetWeight !== undefined) updateFields.targetWeight = Number(targetWeight);
    if (healthGoal !== undefined) updateFields.healthGoal = healthGoal;
    if (waterGoal !== undefined) updateFields.waterGoal = Number(waterGoal);
    if (calorieGoal !== undefined) updateFields.calorieGoal = Number(calorieGoal);
    if (profileImage !== undefined) updateFields.profileImage = profileImage;

    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        ...updateFields
      });
    } else {
      profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updateFields },
        { new: true }
      );
    }

    // If current weight & height are present, record a new WeightRecord and HealthMetric
    if (currentWeight && height) {
      const todayStr = new Date().toISOString().split('T')[0];
      await WeightRecord.create({
        userId: req.user.id,
        weight: Number(currentWeight),
        date: todayStr
      });

      const heightMeters = Number(height) / 100;
      const bmi = parseFloat((Number(currentWeight) / (heightMeters * heightMeters)).toFixed(1));
      let bmiCategory = 'Normal';
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
      else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
      else if (bmi >= 30) bmiCategory = 'Obese';

      await HealthMetric.create({
        userId: req.user.id,
        weight: Number(currentWeight),
        bmi,
        bmiCategory,
        date: todayStr
      });
    }

    const updatedUser = await User.findById(req.user.id).select('name email');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...profile.toObject(),
        name: updatedUser ? updatedUser.name : '',
        email: updatedUser ? updatedUser.email : ''
      }
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
