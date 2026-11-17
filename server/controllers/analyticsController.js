const analyticsService = require('../services/analytics/analyticsService');
const recommendationsService = require('../services/ai/recommendationsAiService');

// @desc    Get dashboard metrics and readiness scores
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardData(req.user.id);
    res.json({
      success: true,
      dashboard: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed performance analytics & charts
// @route   GET /api/analytics/performance
// @access  Private
exports.getPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.getPerformanceData(req.user.id);
    res.json({
      success: true,
      performance: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get topic mastery analysis (weak vs strong topics)
// @route   GET /api/analytics/topics
// @access  Private
exports.getTopics = async (req, res, next) => {
  try {
    const data = await recommendationsService.analyzeWeakTopics(req.user.id);
    res.json({
      success: true,
      weakTopics: data.weakTopics,
      strongTopics: data.strongTopics,
    });
  } catch (error) {
    next(error);
  }
};
