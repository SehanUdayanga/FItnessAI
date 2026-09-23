const express = require('express');
const router = express.Router();
const {
  getWaterIntake,
  addWaterIntake,
  updateWaterIntake,
  deleteWaterIntake
} = require('../controllers/waterController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getWaterIntake);
router.post('/', addWaterIntake);
router.put('/:id', updateWaterIntake);
router.delete('/:id', deleteWaterIntake);

module.exports = router;
