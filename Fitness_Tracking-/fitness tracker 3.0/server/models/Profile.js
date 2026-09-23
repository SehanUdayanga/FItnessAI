const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: false
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Male'
  },
  height: {
    type: Number, // in cm
    required: false
  },
  currentWeight: {
    type: Number, // in kg
    required: false
  },
  targetWeight: {
    type: Number, // in kg
    required: false
  },
  healthGoal: {
    type: String,
    enum: ['Lose Weight', 'Maintain Weight', 'Gain Weight', 'Improve General Health'],
    default: 'Maintain Weight'
  },
  waterGoal: {
    type: Number, // in ml
    default: 2500
  },
  calorieGoal: {
    type: Number, // in kcal
    default: 2100
  },
  profileImage: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema);
