const mongoose = require('mongoose');

const InterviewItemSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  },
  questionText: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  type: {
    type: String,
    enum: ['technical', 'hr', 'coding_theory'],
    default: 'technical',
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
});

const InterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['technical', 'hr', 'mixed'],
      default: 'technical',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
    },
    duration: {
      type: Number, // in seconds (e.g. 900 for 15 minutes)
      default: 900,
    },
    timeRemaining: {
      type: Number,
      default: 900,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    questions: [InterviewItemSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
    },
    technicalScore: {
      type: Number,
    },
    hrScore: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    adaptiveNotes: {
      type: [String],
      default: [],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', InterviewSchema);
