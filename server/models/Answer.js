const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    answer: {
      type: String,
      required: [true, 'Student answer text is required'],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    technicalAccuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    relevance: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    completeness: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    clarity: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', AnswerSchema);
