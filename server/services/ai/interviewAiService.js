const aiProvider = require('./aiProvider');

class InterviewAiService {
  async generateTechnicalQuestion({ targetRole = 'Software Engineer', topic = 'Full Stack Development', difficulty = 'medium', previousPerformance = null }) {
    const prompt = `Generate a realistic, high-quality technical interview question for a candidate applying for ${targetRole}.
Topic: ${topic}
Difficulty: ${difficulty.toUpperCase()}
${previousPerformance ? `Previous Performance Context: Average score ${previousPerformance.avgScore}%, struggling with: ${previousPerformance.struggles?.join(', ') || 'N/A'}` : ''}

Respond with pure JSON conforming to this schema:
{
  "question": "string - clear, direct technical question without unnecessary conversational fluff",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "expectedKeyPoints": ["point 1", "point 2", "point 3", "point 4"]
}`;

    const fallbackHandler = () => {
      const topicFallbacks = {
        'Authentication': {
          easy: {
            question: 'What is the primary difference between session-based authentication and token-based authentication (like JWT)?',
            topic: 'Authentication',
            difficulty: 'easy',
            expectedKeyPoints: ['Stateful server sessions vs stateless tokens', 'Storage mechanisms (cookies vs local/session storage)', 'Horizontal scalability advantages of tokens', 'Revocation trade-offs'],
          },
          medium: {
            question: 'Explain how JWT authentication works in a web application. Describe token signing, transmission, and safe storage strategies against XSS and CSRF.',
            topic: 'Authentication',
            difficulty: 'medium',
            expectedKeyPoints: ['Header, Payload, Signature structure', 'HMAC/RSA cryptographic signing', 'HttpOnly secure SameSite cookies to mitigate XSS', 'CSRF protection mechanisms like anti-CSRF tokens or SameSite=Strict', 'Refresh token rotation'],
          },
          hard: {
            question: 'How would you architect a zero-downtime JWT revocation and token rotation mechanism in a distributed microservices environment?',
            topic: 'Authentication',
            difficulty: 'hard',
            expectedKeyPoints: ['Short-lived access tokens (5-15 mins) with rotating refresh tokens', 'Distributed Redis revocation denylist / bloom filter for instant blacklisting', 'JTI (JWT ID) tracking and family token revocation on reuse detection', 'Asymmetric keys with JWKS endpoint rotation'],
          }
        },
        'Database Systems': {
          easy: {
            question: 'What are the main differences between relational SQL databases and non-relational NoSQL databases?',
            topic: 'Database Systems',
            difficulty: 'easy',
            expectedKeyPoints: ['Schema structure (tabular vs document/key-value)', 'ACID transactions vs BASE eventual consistency', 'Vertical vs Horizontal scaling', 'Complex joins vs denormalized fast reads'],
          },
          medium: {
            question: 'What is Database Normalization? Explain 1NF, 2NF, and 3NF with a practical web development example.',
            topic: 'DBMS Normalization',
            difficulty: 'medium',
            expectedKeyPoints: ['Minimizing data redundancy and insertion/deletion anomalies', '1NF: Atomic values and primary key', '2NF: No partial dependency on composite key', '3NF: No transitive dependency'],
          },
          hard: {
            question: 'Explain the internal mechanics of B-Tree versus LSM-Tree indexing. When would you choose an LSM-Tree based database (like Cassandra or RocksDB) over a B-Tree database (like PostgreSQL or MySQL)?',
            topic: 'Database Systems',
            difficulty: 'hard',
            expectedKeyPoints: ['B-Tree balanced node reads with in-place page writes', 'LSM-Tree sequential append-only writes via MemTable and SSTables', 'Write amplification vs read/compaction overhead', 'High write-throughput ingest suitability'],
          }
        },
        'JavaScript': {
          easy: {
            question: 'Explain the difference between let, const, and var in modern JavaScript, including scope and hoisting behavior.',
            topic: 'JavaScript',
            difficulty: 'easy',
            expectedKeyPoints: ['Block scope vs function scope', 'Hoisting with Temporal Dead Zone (TDZ)', 'Re-assignment vs immutability of bindings', 'Window object property pollution with var'],
          },
          medium: {
            question: 'How does the JavaScript Event Loop work? Explain the execution order of synchronous code, process.nextTick, microtasks (Promises), and macrotasks (setTimeout).',
            topic: 'Async JavaScript',
            difficulty: 'medium',
            expectedKeyPoints: ['Call stack execution', 'Microtask queue priority over macrotask queue', 'Promise resolution and MutationObserver in microtasks', 'Timer and I/O callbacks in macrotasks', 'Event loop cycle draining microtasks before next frame/macrotask'],
          },
          hard: {
            question: 'Explain memory management and garbage collection in V8. How do hidden classes, inline caching, and closures affect heap memory and memory leak prevention?',
            topic: 'JavaScript',
            difficulty: 'hard',
            expectedKeyPoints: ['Generational GC (Young generation Scavenge vs Old generation Mark-Sweep/Compact)', 'Hidden classes (Shapes) and fast property access via inline caches', 'Accidental retention via unreferenced closures or detached DOM nodes', 'WeakMap/WeakSet for leak-free associations'],
          }
        }
      };

      const selectedTopic = topicFallbacks[topic] || topicFallbacks['Authentication'];
      return selectedTopic[difficulty] || selectedTopic['medium'];
    };

    return await aiProvider.callAI({
      systemInstruction: 'You are a veteran technical interviewer at a top engineering lab. Produce realistic, rigorous, and technical interview questions.',
      prompt,
      fallbackHandler,
    });
  }

  async generateHRQuestion({ targetRole = 'Software Engineer', experienceLevel = 'entry', previousAnswers = [] }) {
    const prompt = `Generate a behavioral / HR interview question for a ${experienceLevel}-level candidate applying for ${targetRole}.
Previous Questions Asked: ${previousAnswers.map(a => a.questionText).join('; ') || 'None'}

Respond with pure JSON conforming to this schema:
{
  "question": "string - behavioral question targeting collaboration, conflict resolution, project ownership, or learning from failure",
  "topic": "Behavioral & Culture Fit",
  "difficulty": "medium",
  "expectedKeyPoints": ["point 1", "point 2", "point 3"]
}`;

    const fallbackHandler = () => {
      const hrQuestions = [
        {
          question: 'Describe a situation where you had a technical disagreement with a team member or peer. How did you handle it and what was the outcome?',
          topic: 'Conflict Resolution & Teamwork',
          difficulty: 'medium',
          expectedKeyPoints: ['STAR structure (Situation, Task, Action, Result)', 'Objective data-driven evaluation rather than personal ego', 'Active listening and finding consensus', 'Commitment to the final team decision'],
        },
        {
          question: 'Tell me about a time when a critical bug or outage occurred in your code or project. How did you diagnose, communicate, and resolve it?',
          topic: 'Accountability & Problem Solving',
          difficulty: 'medium',
          expectedKeyPoints: ['Rapid triage and immediate containment', 'Transparent communication to stakeholders', 'Root cause analysis (RCA) and 5-Whys', 'Blameless post-mortem and preventative measures'],
        },
        {
          question: 'How do you prioritize competing deadlines and manage technical debt when delivering features under tight time constraints?',
          topic: 'Time Management & Technical Debt',
          difficulty: 'medium',
          expectedKeyPoints: ['Impact vs effort prioritization', 'Communicating trade-offs with product owners', 'Documenting shortcuts in an explicit debt backlog', 'Incremental refactoring strategy'],
        }
      ];
      return hrQuestions[Math.floor(Math.random() * hrQuestions.length)];
    };

    return await aiProvider.callAI({
      systemInstruction: 'You are an executive interviewer assessing behavioral maturity, teamwork, and ownership.',
      prompt,
      fallbackHandler,
    });
  }

  async evaluateAnswer({ question, answer, topic = 'General', difficulty = 'medium', targetRole = 'Software Engineer' }) {
    const prompt = `You are an elite technical interview assessor. Evaluate the candidate's answer to the interview question below.
ROLE: ${targetRole}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}
QUESTION: ${question}
CANDIDATE ANSWER: "${answer}"

Provide a thorough, objective technical assessment.
Evaluate:
1. Technical Accuracy (0.0 to 10.0)
2. Relevance (0.0 to 10.0)
3. Completeness (0.0 to 10.0)
4. Clarity (0.0 to 10.0)

Overall score should be the average multiplied by 10 (0 to 100).

Respond with a JSON object containing exactly these fields:
- technicalAccuracy, relevance, completeness, clarity: numbers from 0 to 10
- score: the calculated overall score from 0 to 100
- strengths, weaknesses, suggestions: arrays of concise strings specific to this candidate's answer
Do not include a model answer or reuse any sample scores or feedback.`;

    return await aiProvider.callAI({
      systemInstruction: 'You are an objective, technical interviewer. You provide precise numerical ratings and actionable, editorial feedback.',
      prompt,
    });
  }

  async generateFollowUpQuestion({ previousQuestion, previousAnswer, evaluation, currentDifficulty = 'medium', topic = 'General' }) {
    // Dynamic difficulty adjustment logic:
    // If score >= 80 -> increase difficulty
    // If score < 60 -> decrease difficulty or pivot to foundational verification
    let nextDifficulty = currentDifficulty;
    let adaptationReason = '';

    if (evaluation.score >= 80) {
      if (currentDifficulty === 'easy') nextDifficulty = 'medium';
      else if (currentDifficulty === 'medium') nextDifficulty = 'hard';
      adaptationReason = `High performance (${evaluation.score}%). Increasing difficulty to ${nextDifficulty.toUpperCase()} to evaluate architectural depth.`;
    } else if (evaluation.score < 60) {
      if (currentDifficulty === 'hard') nextDifficulty = 'medium';
      else if (currentDifficulty === 'medium') nextDifficulty = 'easy';
      adaptationReason = `Identified knowledge gaps (${evaluation.score}%). Adjusting difficulty to ${nextDifficulty.toUpperCase()} to reinforce core principles.`;
    } else {
      adaptationReason = `Consistent performance (${evaluation.score}%). Maintaining ${currentDifficulty.toUpperCase()} difficulty.`;
    }

    const questionData = await this.generateTechnicalQuestion({
      topic,
      difficulty: nextDifficulty,
      previousPerformance: { avgScore: evaluation.score, struggles: evaluation.weaknesses }
    });

    return {
      ...questionData,
      adaptiveNote: adaptationReason,
    };
  }
}

module.exports = new InterviewAiService();
