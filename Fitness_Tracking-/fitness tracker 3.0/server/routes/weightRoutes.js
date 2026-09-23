const express = require('express');
const router = express.Router();
const {
  getWeightRecords,
  addWeightRecord,
  updateWeightRecord,
  deleteWeightRecord
} = require('../controllers/weightController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getWeightRecords);
router.post('/', addWeightRecord);
router.put('/:id', updateWeightRecord);
router.delete('/:id', deleteWeightRecord);

module.exports = router;
