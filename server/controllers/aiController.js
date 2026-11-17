const interviewAiService = require('../services/ai/interviewAiService');
const codingAiService = require('../services/ai/codingAiService');
const recommendationsAiService = require('../services/ai/recommendationsAiService');

// @desc    Generate technical or HR interview question
// @route   POST /api/ai/generate-question
// @access  Private
exports.generateQuestion = async (req, res, next) => {
  try {
    const { type, topic, difficulty, targetRole } = req.body;

    let questionData;
    if (type === 'hr') {
      questionData = await interviewAiService.generateHRQuestion({
        targetRole,
        experienceLevel: req.user.experienceLevel,
      });
    } else {
      questionData = await interviewAiService.generateTechnicalQuestion({
        targetRole,
        topic,
        difficulty,
      });
    }

    res.json({
      success: true,
      question: questionData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate student interview answer
// @route   POST /api/ai/evaluate-answer
// @access  Private
exports.evaluateAnswer = async (req, res, next) => {
  try {
    const { question, answer, topic, difficulty, targetRole } = req.body;

    const evaluation = await interviewAiService.evaluateAnswer({
      question,
      answer,
      topic,
      difficulty,
      targetRole: targetRole || req.user.targetRole,
    });

    res.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate dynamic coding challenge
// @route   POST /api/ai/generate-coding-problem
// @access  Private
exports.generateCodingProblem = async (req, res, next) => {
  try {
    const { topic, difficulty } = req.body;
    const problem = await codingAiService.generateCodingProblem({ topic, difficulty });
    res.json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate code independently
// @route   POST /api/ai/evaluate-code
// @access  Private
exports.evaluateCode = async (req, res, next) => {
  try {
    const { problemTitle, problemDescription, language, code, testResults } = req.body;
    const review = await codingAiService.evaluateCode({
      problemTitle,
      problemDescription,
      language,
      code,
      testResults: testResults || [],
    });
    res.json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized practice recommendations
// @route   POST /api/ai/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await recommendationsAiService.generateRecommendations(req.user.id);
    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};
