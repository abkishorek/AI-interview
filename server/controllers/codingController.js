const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const judge0Service = require('../services/coding/judge0Service');
const codingAiService = require('../services/ai/codingAiService');

// @desc    Get all coding problems
// @route   GET /api/coding/problems
// @access  Public / Private
exports.getProblems = async (req, res, next) => {
  try {
    const { topic, difficulty } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty.toLowerCase();

    const problems = await CodingProblem.find(filter).select('-hiddenTestCases');

    res.json({
      success: true,
      count: problems.length,
      problems: problems.map((p) => ({
        id: p._id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        topic: p.topic,
        supportedLanguages: p.supportedLanguages,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single problem by ID or slug
// @route   GET /api/coding/problems/:id
// @access  Public / Private
exports.getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let problem;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await CodingProblem.findById(id).select('-hiddenTestCases');
    } else {
      problem = await CodingProblem.findOne({ slug: id }).select('-hiddenTestCases');
    }

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Coding problem not found' });
    }

    res.json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run code against sample test cases
// @route   POST /api/coding/run
// @access  Private
exports.runCode = async (req, res, next) => {
  try {
    const { problemId, language, code } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide language and code',
      });
    }

    let problem = null;
    if (problemId && typeof problemId === 'string' && problemId.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await CodingProblem.findById(problemId);
    }
    if (!problem && problemId) {
      problem = await CodingProblem.findOne({ slug: problemId });
    }
    if (!problem) {
      problem = (await CodingProblem.findOne({ slug: 'two-sum' })) || (await CodingProblem.findOne());
    }

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Filter only sample test cases for "Run"
    const sampleTests = problem.testCases.filter((tc) => tc.isSample);
    const testsToRun = sampleTests.length > 0 ? sampleTests : problem.testCases.slice(0, 3);

    const testExecution = await judge0Service.runTestCases({
      code,
      language,
      testCases: testsToRun,
    });

    res.json({
      success: true,
      execution: testExecution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit code against full test suite and trigger AI code review
// @route   POST /api/coding/submit
// @access  Private
exports.submitCode = async (req, res, next) => {
  try {
    const { problemId, language, code } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide language and code',
      });
    }

    let problem = null;
    if (problemId && typeof problemId === 'string' && problemId.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await CodingProblem.findById(problemId);
    }
    if (!problem && problemId) {
      problem = await CodingProblem.findOne({ slug: problemId });
    }
    if (!problem) {
      problem = (await CodingProblem.findOne({ slug: 'two-sum' })) || (await CodingProblem.findOne());
    }

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Combine standard test cases + hidden test cases
    const allTests = [...problem.testCases, ...(problem.hiddenTestCases || [])];

    // 1. Execute on Judge0 / local runner
    const execution = await judge0Service.runTestCases({
      code,
      language,
      testCases: allTests,
    });

    // 2. Perform AI Code Review
    let aiFeedback = null;
    let aiReviewError = '';
    try {
      aiFeedback = await codingAiService.evaluateCode({
        problemTitle: problem.title,
        problemDescription: problem.description,
        language,
        code,
        testResults: execution.results,
      });
    } catch (aiErr) {
      console.warn('[Coding Submit AI Review Warning]', aiErr.message);
      aiReviewError = 'AI code review is unavailable. Configure a Gemini or OpenAI API key to enable it.';
    }

    // 3. Save Submission
    const submission = await CodingSubmission.create({
      userId: req.user.id,
      problemId: problem._id,
      language,
      code,
      passedTests: execution.passedTests,
      totalTests: execution.totalTests,
      testResults: execution.results,
      runtime: execution.runtime,
      memory: execution.memory,
      status: execution.status,
      aiFeedback: aiFeedback || undefined,
    });

    res.json({
      success: true,
      submissionId: submission._id,
      execution: {
        passedTests: execution.passedTests,
        totalTests: execution.totalTests,
        status: execution.status,
        runtime: execution.runtime,
        memory: execution.memory,
        results: execution.results,
      },
      aiFeedback,
      aiReviewError,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's coding submissions
// @route   GET /api/coding/submissions
// @access  Private
exports.getSubmissions = async (req, res, next) => {
  try {
    const submissions = await CodingSubmission.find({ userId: req.user.id })
      .populate('problemId', 'title slug difficulty topic')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};
