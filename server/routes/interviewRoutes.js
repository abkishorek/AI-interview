const express = require('express');
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  nextQuestion,
  completeInterview,
  getHistory,
  getInterviewById,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startInterview);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterviewById);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/next-question', protect, nextQuestion);
router.post('/:id/complete', protect, completeInterview);

module.exports = router;
