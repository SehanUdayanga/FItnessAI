const mongoose = require('mongoose');

const weightRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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

// Compound index for fast queries by user and date
weightRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightRecord', weightRecordSchema);
