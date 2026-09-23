const mongoose = require('mongoose');

const weightRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number, // in kg
    required: true,
    min: 0
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

module.exports = mongoose.model('WeightRecord', weightRecordSchema);
