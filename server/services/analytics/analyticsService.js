const Interview = require('../../models/Interview');
const CodingSubmission = require('../../models/CodingSubmission');
const CodingProblem = require('../../models/CodingProblem');
const Answer = require('../../models/Answer');
const User = require('../../models/User');
const recommendationsService = require('../ai/recommendationsAiService');

class AnalyticsService {
  async getDashboardData(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    const submissions = await CodingSubmission.find({ userId }).populate('problemId').sort({ createdAt: -1 });

    const completedInterviews = interviews.filter((i) => i.status === 'completed');
    const totalSolvedCoding = await CodingSubmission.distinct('problemId', {
      userId,
      status: 'Accepted',
    });

    const { weakTopics, strongTopics } = await recommendationsService.analyzeWeakTopics(userId);
    const recommendations = await recommendationsService.generateRecommendations(userId);

    const average = (values) =>
      values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : null;
    const techScore = average(completedInterviews.map((i) => i.technicalScore).filter(Number.isFinite));
    const hrScore = average(completedInterviews.map((i) => i.hrScore).filter(Number.isFinite));
    const evaluatedSubmissions = submissions.filter((submission) => submission.status !== 'Runner Unavailable');
    const totalSubmissionTests = evaluatedSubmissions.reduce((total, submission) => total + submission.totalTests, 0);
    const codingScore = totalSubmissionTests
      ? Math.round(
          (evaluatedSubmissions.reduce((total, submission) => total + submission.passedTests, 0) /
            totalSubmissionTests) * 100
        )
      : null;

    const scoredCategories = [
      { score: techScore, weight: 0.45 },
      { score: codingScore, weight: 0.35 },
      { score: hrScore, weight: 0.2 },
    ].filter((item) => item.score !== null);
    const totalWeight = scoredCategories.reduce((total, item) => total + item.weight, 0);
    const readinessScore = totalWeight
      ? Math.round(scoredCategories.reduce((total, item) => total + item.score * item.weight, 0) / totalWeight)
      : null;

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
      },
      readiness: {
        overallScore: readinessScore,
        maxScore: 100,
        technicalScore: techScore,
        hrScore: hrScore,
        codingScore: codingScore,
      },
      stats: {
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        problemsSolved: totalSolvedCoding.length,
        problemsAttempted: submissions.length,
      },
      weakTopics,
      strongTopics,
      nextBestPractice: recommendations.nextBestPractice,
      recentInterviews: interviews.slice(0, 5).map((i) => ({
        id: i._id,
        type: i.type,
        difficulty: i.difficulty,
        score: Number.isFinite(i.overallScore) ? i.overallScore : null,
        date: i.createdAt,
        status: i.status,
      })),
      recentSubmissions: submissions.slice(0, 5).map((s) => ({
        id: s._id,
        problemTitle: s.problemId?.title || 'Algorithm Challenge',
        language: s.language,
        status: s.status,
        passedTests: s.passedTests,
        totalTests: s.totalTests,
        runtime: s.runtime,
        date: s.createdAt,
      })),
    };
  }

  async getPerformanceData(userId) {
    const interviews = await Interview.find({ userId, status: 'completed' }).sort({ createdAt: 1 });
    const submissions = await CodingSubmission.find({ userId }).populate('problemId');
    const answers = await Answer.find({ userId }).sort({ createdAt: 1 });

    const progression = interviews
      .filter((interview) => Number.isFinite(interview.overallScore))
      .map((interview, idx) => ({
      label: `Interview ${String(idx + 1).padStart(2, '0')}`,
      score: interview.overallScore,
      date: interview.createdAt,
      type: interview.type,
      difficulty: interview.difficulty,
    }));

    const topicScores = new Map();
    answers.forEach((answer) => {
      const current = topicScores.get(answer.topic) || { total: 0, count: 0 };
      current.total += answer.score;
      current.count += 1;
      topicScores.set(answer.topic, current);
    });
    const topics = [...topicScores.entries()].map(([topic, stats]) => {
      const score = Math.round(stats.total / stats.count);
      return {
        topic,
        score,
        category: score >= 75 ? 'Strong' : score >= 60 ? 'Average' : 'Needs Work',
      };
    });

    const difficultyDist = { easy: 0, medium: 0, hard: 0 };
    submissions.forEach((s) => {
      const diff = s.problemId?.difficulty?.toLowerCase() || 'medium';
      if (difficultyDist[diff] !== undefined) difficultyDist[diff]++;
    });

    const acceptedSubmissions = submissions.filter((s) => s.status === 'Accepted');
    const totalTests = submissions.reduce((total, submission) => total + submission.totalTests, 0);
    const passedTests = submissions.reduce((total, submission) => total + submission.passedTests, 0);
    const runtimes = submissions
      .map((submission) => Number.parseFloat(submission.runtime))
      .filter(Number.isFinite);

    return {
      progression,
      topics,
      coding: {
        attempted: submissions.length,
        solved: acceptedSubmissions.length,
        averageRuntime: runtimes.length
          ? `${Math.round(runtimes.reduce((total, runtime) => total + runtime, 0) / runtimes.length)} ms`
          : null,
        averageScore: totalTests ? Math.round((passedTests / totalTests) * 100) : null,
        difficultyDistribution: {
          easy: difficultyDist.easy,
          medium: difficultyDist.medium,
          hard: difficultyDist.hard,
        },
      },
    };
  }
}

module.exports = new AnalyticsService();
