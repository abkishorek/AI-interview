const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getPerformance,
  getTopics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboard);
router.get('/performance', protect, getPerformance);
router.get('/topics', protect, getTopics);

module.exports = router;
