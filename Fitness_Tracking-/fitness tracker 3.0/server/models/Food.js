const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    caloriesPer100g: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Add text and case-insensitive index for fast querying
foodSchema.index({ name: 'text' });

module.exports = mongoose.model('Food', foodSchema);
