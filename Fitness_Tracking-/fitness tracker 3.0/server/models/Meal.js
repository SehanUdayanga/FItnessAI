const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

module.exports = mongoose.model('Meal', mealSchema);
