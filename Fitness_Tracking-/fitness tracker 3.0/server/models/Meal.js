const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    required: true
  },
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    default: '1 serving'
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    default: null
  },
  quantityGrams: {
    type: Number,
    min: 0,
    default: null
  },
  caloriesPer100g: {
    type: Number,
    min: 0,
    default: null
  },
  totalCalories: {
    type: Number,
    min: 0,
    default: null
  },
  source: {
    type: String,
    enum: ['manual', 'ai'],
    default: 'manual'
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast queries by user and date
mealSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);
