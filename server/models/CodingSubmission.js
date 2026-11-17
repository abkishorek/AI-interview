const mongoose = require('mongoose');

const CodingSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingProblem',
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    passedTests: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    testResults: [
      {
        testIndex: Number,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        status: String,
        executionTime: Number,
        memory: Number,
        error: String,
      },
    ],
    runtime: {
      type: String,
    },
    memory: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Runner Unavailable'],
      default: 'Wrong Answer',
    },
    aiFeedback: {
      type: new mongoose.Schema(
        {
          correctness: Number,
          codeQuality: Number,
          efficiency: Number,
          timeComplexity: String,
          spaceComplexity: String,
          observation: String,
          possibleImprovement: String,
        },
        { _id: false }
      ),
      default: undefined,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodingSubmission', CodingSubmissionSchema);
