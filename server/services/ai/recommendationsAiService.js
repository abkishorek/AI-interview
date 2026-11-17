const Answer = require('../../models/Answer');
const CodingSubmission = require('../../models/CodingSubmission');
const User = require('../../models/User');

class RecommendationsAiService {
  async analyzeWeakTopics(userId) {
    const answers = await Answer.find({ userId }).sort({ createdAt: 1 });
    const topicStats = {};

    answers.forEach((ans) => {
      const topic = ans.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = [];
      }
      topicStats[topic].push(ans.score);
    });

    const weakTopics = [];
    const strongTopics = [];

    for (const [topic, scores] of Object.entries(topicStats)) {
      const score = Math.round(scores.reduce((total, value) => total + value, 0) / scores.length);
      const previousScore = scores.length > 1 ? scores[scores.length - 2] : null;

      if (score < 72) {
        weakTopics.push({
          topic,
          score,
          previousScore,
          recommendations: [
            `Review the concepts covered in your ${topic} answers`,
            `Practice another ${topic} question`,
          ],
        });
      } else if (score >= 75) {
        strongTopics.push({ topic, score });
      }
    }

    weakTopics.sort((a, b) => a.score - b.score);
    strongTopics.sort((a, b) => b.score - a.score);

    await User.findByIdAndUpdate(userId, {
      weakTopics,
      strongTopics,
    });

    return { weakTopics, strongTopics };
  }

  async generateRecommendations(userId) {
    const { weakTopics } = await this.analyzeWeakTopics(userId);
    const primaryWeak = weakTopics[0];

    if (!primaryWeak) {
      return {
        nextBestPractice: null,
        actionItems: [],
      };
    }

    return {
      nextBestPractice: {
        topic: primaryWeak.topic,
        reason: `Your recorded average for ${primaryWeak.topic} is ${primaryWeak.score}%.`,
        actionLabel: `PRACTICE ${primaryWeak.topic.toUpperCase()}`,
        estimatedTime: '15 minutes',
        difficulty: 'Medium',
        actionType: 'interview',
      },
      actionItems: [],
    };
  }
}

module.exports = new RecommendationsAiService();
