const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  explanation: { type: String, default: '' },
  isSample: { type: Boolean, default: false },
});

const ExampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const CodingProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    topic: {
      type: String,
      required: true,
    },
    supportedLanguages: {
      type: [String],
      default: ['python', 'javascript', 'java', 'cpp', 'c', 'csharp'],
    },
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
    examples: [ExampleSchema],
    constraints: {
      type: [String],
      default: [],
    },
    testCases: [TestCaseSchema],
    hiddenTestCases: [TestCaseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodingProblem', CodingProblemSchema);
