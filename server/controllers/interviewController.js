const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const interviewAiService = require('../services/ai/interviewAiService');
const recommendationsAiService = require('../services/ai/recommendationsAiService');

// @desc    Start an adaptive mock interview session
// @route   POST /api/interviews/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const { type = 'technical', difficulty = 'medium', targetRole, topic, totalQuestions = 5 } = req.body;
    const userRole = targetRole || req.user.targetRole || 'Full Stack Engineer';
    const chosenTopic = topic || 'Authentication';

    // Generate the initial question dynamically using AI
    let initialQuestionData;
    if (type === 'hr') {
      initialQuestionData = await interviewAiService.generateHRQuestion({
        targetRole: userRole,
        experienceLevel: req.user.experienceLevel || 'entry',
      });
    } else {
      initialQuestionData = await interviewAiService.generateTechnicalQuestion({
        targetRole: userRole,
        topic: chosenTopic,
        difficulty,
      });
    }

    const interview = await Interview.create({
      userId: req.user.id,
      type,
      difficulty,
      targetRole: userRole,
      duration: 900, // 15 minutes
      timeRemaining: 900,
      totalQuestions,
      currentQuestionIndex: 0,
      questions: [
        {
          questionText: initialQuestionData.question,
          topic: initialQuestionData.topic || chosenTopic,
          difficulty: initialQuestionData.difficulty || difficulty,
          type: type === 'hr' ? 'hr' : 'technical',
          isAnswered: false,
        },
      ],
      adaptiveNotes: [`Initial baseline set to ${difficulty.toUpperCase()} for ${userRole}`],
    });

    res.status(201).json({
      success: true,
      interview: {
        id: interview._id,
        type: interview.type,
        difficulty: interview.difficulty,
        targetRole: interview.targetRole,
        duration: interview.duration,
        timeRemaining: interview.timeRemaining,
        totalQuestions: interview.totalQuestions,
        currentQuestionIndex: 0,
        currentQuestion: interview.questions[0],
        adaptiveNotes: interview.adaptiveNotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resolve only sessions belonging to the authenticated user.
async function resolveInterview(id, userId) {
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return null;
  }

  return Interview.findOne({ _id: id, userId });
}

// @desc    Submit answer for current question and get AI evaluation
// @route   POST /api/interviews/:id/answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { answerText } = req.body;
    const interview = await resolveInterview(req.params.id, req.user.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    let currentQuestion = interview.questions[interview.currentQuestionIndex];
    if (!currentQuestion) {
      currentQuestion = interview.questions[0];
      interview.currentQuestionIndex = 0;
    }

    if (!answerText || answerText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide an answer before submitting' });
    }

    // AI Evaluation of student answer
    const evaluation = await interviewAiService.evaluateAnswer({
      question: currentQuestion.questionText,
      answer: answerText,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      targetRole: interview.targetRole,
    });

    // Save Answer record
    const savedAnswer = await Answer.create({
      interviewId: interview._id,
      userId: req.user.id,
      questionText: currentQuestion.questionText,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      answer: answerText,
      score: evaluation.score,
      technicalAccuracy: evaluation.technicalAccuracy,
      relevance: evaluation.relevance,
      completeness: evaluation.completeness,
      clarity: evaluation.clarity,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      suggestions: evaluation.suggestions,
    });

    // Update question in interview
    currentQuestion.answerId = savedAnswer._id;
    currentQuestion.isAnswered = true;
    await interview.save();

    res.json({
      success: true,
      answerId: savedAnswer._id,
      evaluation: {
        score: evaluation.score,
        technicalAccuracy: evaluation.technicalAccuracy,
        relevance: evaluation.relevance,
        completeness: evaluation.completeness,
        clarity: evaluation.clarity,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: evaluation.suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate next adaptive question based on previous performance
// @route   POST /api/interviews/:id/next-question
// @access  Private
exports.nextQuestion = async (req, res, next) => {
  try {
    const interview = await resolveInterview(req.params.id, req.user.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const nextIndex = interview.currentQuestionIndex + 1;
    if (nextIndex >= interview.totalQuestions) {
      return res.status(400).json({
        success: false,
        message: 'All questions for this session have been completed. Please finalize the interview.',
      });
    }

    // Retrieve previous answer evaluation to determine adaptation
    const lastQuestion = interview.questions[interview.currentQuestionIndex];
    if (!lastQuestion?.answerId) {
      return res.status(400).json({
        success: false,
        message: 'Submit an answer to the current question before continuing.',
      });
    }

    const previousAnswer = await Answer.findById(lastQuestion.answerId);
    if (!previousAnswer) {
      return res.status(404).json({ success: false, message: 'The previous answer evaluation was not found.' });
    }

    const lastEvaluation = {
      score: previousAnswer.score,
      weaknesses: previousAnswer.weaknesses,
    };

    // Determine next topic
    const topicPool = ['Database Systems', 'Async JavaScript', 'Operating Systems', 'System Design', 'Computer Networks', 'Authentication'];
    const usedTopics = interview.questions.map((q) => q.topic);
    const availableTopics = topicPool.filter((t) => !usedTopics.includes(t));
    const nextTopic = availableTopics.length > 0 ? availableTopics[0] : topicPool[Math.floor(Math.random() * topicPool.length)];

    let nextQuestionData;
    if (interview.type === 'hr') {
      nextQuestionData = await interviewAiService.generateHRQuestion({
        targetRole: interview.targetRole,
        experienceLevel: req.user.experienceLevel,
        previousAnswers: interview.questions,
      });
    } else {
      nextQuestionData = await interviewAiService.generateFollowUpQuestion({
        previousQuestion: lastQuestion ? lastQuestion.questionText : 'Explain system architecture design.',
        previousAnswer: previousAnswer.answer,
        evaluation: lastEvaluation,
        currentDifficulty: lastQuestion ? lastQuestion.difficulty : 'medium',
        topic: nextTopic,
      });
    }

    const adaptiveNote = nextQuestionData.adaptiveNote || `Adaptive trajectory: Adjusted to ${nextQuestionData.difficulty.toUpperCase()} based on performance.`;
    interview.adaptiveNotes.push(adaptiveNote);

    interview.questions.push({
      questionText: nextQuestionData.question,
      topic: nextQuestionData.topic || nextTopic,
      difficulty: nextQuestionData.difficulty || 'medium',
      type: interview.type === 'hr' ? 'hr' : 'technical',
      isAnswered: false,
    });

    interview.currentQuestionIndex = nextIndex;
    await interview.save();

    res.json({
      success: true,
      currentQuestionIndex: nextIndex,
      totalQuestions: interview.totalQuestions,
      question: interview.questions[nextIndex],
      adaptiveNote,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview and calculate final scores
// @route   POST /api/interviews/:id/complete
// @access  Private
exports.completeInterview = async (req, res, next) => {
  try {
    const interview = await resolveInterview(req.params.id, req.user.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Fetch all answers
    const answers = await Answer.find({ interviewId: interview._id });

    let techScores = [];
    let hrScores = [];

    answers.forEach((ans) => {
      const q = interview.questions.find((iq) => iq.questionText === ans.questionText);
      if (q && q.type === 'hr') {
        hrScores.push(ans.score);
      } else {
        techScores.push(ans.score);
      }
    });

    const avgTech = techScores.length > 0 ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : null;
    const avgHr = hrScores.length > 0 ? Math.round(hrScores.reduce((a, b) => a + b, 0) / hrScores.length) : null;
    const overall = answers.length > 0
      ? Math.round(answers.reduce((total, answer) => total + answer.score, 0) / answers.length)
      : null;

    interview.overallScore = overall;
    interview.technicalScore = avgTech;
    interview.hrScore = avgHr;
    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    // Trigger weak topic re-analysis
    await recommendationsAiService.analyzeWeakTopics(req.user.id);

    res.json({
      success: true,
      message: 'Interview completed successfully',
      summary: {
        id: interview._id,
        type: interview.type,
        difficulty: interview.difficulty,
        overallScore: overall,
        technicalScore: avgTech,
        hrScore: avgHr,
        totalQuestionsAnswered: answers.length,
        adaptiveNotes: interview.adaptiveNotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user interview history
// @route   GET /api/interviews/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const history = interviews.map((item) => ({
      id: item._id,
      date: item.createdAt,
      type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
      score: Number.isFinite(item.overallScore) ? item.overallScore : null,
      difficulty: item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1),
      duration: `${Math.round((item.duration - item.timeRemaining) / 60)} mins`,
      status: item.status,
    }));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed interview report by ID
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterviewById = async (req, res, next) => {
  try {
    const interview = await resolveInterview(req.params.id, req.user.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const answers = await Answer.find({ interviewId: interview._id });

    res.json({
      success: true,
      interview: {
        id: interview._id,
        type: interview.type,
        difficulty: interview.difficulty,
        targetRole: interview.targetRole,
        duration: interview.duration,
        timeRemaining: interview.timeRemaining,
        totalQuestions: interview.totalQuestions,
        currentQuestionIndex: interview.currentQuestionIndex,
        overallScore: interview.overallScore,
        technicalScore: interview.technicalScore,
        hrScore: interview.hrScore,
        status: interview.status,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        adaptiveNotes: interview.adaptiveNotes,
        questions: interview.questions,
        answers,
      },
    });
  } catch (error) {
    next(error);
  }
};
