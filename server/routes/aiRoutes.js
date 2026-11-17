const express = require('express');
const router = express.Router();
const {
  generateQuestion,
  evaluateAnswer,
  generateCodingProblem,
  evaluateCode,
  getRecommendations,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate-question', protect, generateQuestion);
router.post('/evaluate-answer', protect, evaluateAnswer);
router.post('/generate-coding-problem', protect, generateCodingProblem);
router.post('/evaluate-code', protect, evaluateCode);
router.post('/recommendations', protect, getRecommendations);

module.exports = router;
