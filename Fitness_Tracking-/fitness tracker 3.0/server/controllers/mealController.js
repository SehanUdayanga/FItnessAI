const Meal = require('../models/Meal');

// @desc    Get user meals (filtered by date if provided)
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user.id };

    if (date) {
      filter.date = date;
    } else {
      filter.date = new Date().toISOString().split('T')[0];
    }

    const meals = await Meal.find(filter).sort({ createdAt: -1 });

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    res.json({
      success: true,
      count: meals.length,
      totalCalories,
      data: meals
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching meals'
    });
  }
};

// @desc    Add a new meal
// @route   POST /api/meals
// @access  Private
const addMeal = async (req, res) => {
  try {
    const { mealType, foodName, quantity, calories, date } = req.body;

    if (!mealType || !foodName || calories === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mealType, foodName, and calories'
      });
    }

    const meal = await Meal.create({
      userId: req.user.id,
      mealType,
      foodName,
      quantity: quantity || '1 serving',
      calories: Number(calories),
      date: date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: 'Meal recorded successfully',
      data: meal
    });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding meal'
    });
  }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, userId: req.user.id });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal record not found'
      });
    }

    const { mealType, foodName, quantity, calories, date } = req.body;

    if (mealType) meal.mealType = mealType;
    if (foodName) meal.foodName = foodName;
    if (quantity !== undefined) meal.quantity = quantity;
    if (calories !== undefined) meal.calories = Number(calories);
    if (date) meal.date = date;

    const updatedMeal = await meal.save();

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: updatedMeal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating meal'
    });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal record not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting meal'
    });
  }
};

module.exports = {
  getMeals,
  addMeal,
  updateMeal,
  deleteMeal
};
