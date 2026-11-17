const express = require('express');
const router = express.Router();
const {
  getProblems,
  getProblemById,
  runCode,
  submitCode,
  getSubmissions,
} = require('../controllers/codingController');
const { protect } = require('../middleware/auth');

router.get('/problems', getProblems);
router.get('/problems/:id', getProblemById);
router.post('/run', protect, runCode);
router.post('/submit', protect, submitCode);
router.get('/submissions', protect, getSubmissions);

module.exports = router;
