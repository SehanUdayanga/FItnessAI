const express = require('express');
const router = express.Router();
const {
  searchFoods,
  getFoodById,
  createFood,
  analyzeFoodImage
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/search', searchFoods);
router.get('/:id', getFoodById);
router.post('/analyze-image', analyzeFoodImage);
router.post('/', createFood);

module.exports = router;
