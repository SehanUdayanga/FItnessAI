const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'USER', 'ADMIN'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    age: {
      type: Number,
      default: 25
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Male'
    },
    height: {
      type: Number, // in cm
      default: 170
    },
    targetWeight: {
      type: Number, // in kg
      default: 65
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
    profileImage: {
      type: String,
      default: ''
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
