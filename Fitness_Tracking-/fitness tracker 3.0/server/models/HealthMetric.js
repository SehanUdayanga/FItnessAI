const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  bmi: {
    type: Number,
    required: true
  },
  bmiCategory: {
    type: String,
    enum: ['Underweight', 'Normal', 'Overweight', 'Obese'],
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
