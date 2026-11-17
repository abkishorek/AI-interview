const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    interests: {
      type: [String],
      default: ['Full Stack Development', 'System Design', 'Database Systems', 'Algorithms'],
    },
    languages: {
      type: [String],
      default: ['JavaScript', 'Python', 'TypeScript'],
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      default: 'entry',
    },
    targetRole: {
      type: String,
      default: 'Full Stack Engineer',
      trim: true,
    },
    streak: {
      type: Number,
    },
    readinessScore: {
      type: Number,
    },
    technicalScore: {
      type: Number,
    },
    hrScore: {
      type: Number,
    },
    codingScore: {
      type: Number,
    },
    demoDataCleanupVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    weakTopics: [
      {
        topic: { type: String, required: true },
        score: { type: Number, required: true },
        previousScore: { type: Number, default: 0 },
        recommendations: [{ type: String }],
      },
    ],
    strongTopics: [
      {
        topic: { type: String, required: true },
        score: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
