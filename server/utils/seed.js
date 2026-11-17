const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const CodingProblem = require('../models/CodingProblem');
const Interview = require('../models/Interview');
const Answer = require('../models/Answer');
const CodingSubmission = require('../models/CodingSubmission');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seeding...');

    // 1. Seed Questions
    const existingQuestions = await Question.countDocuments();
    if (existingQuestions === 0) {
      console.log('[Seed] Seeding Question bank...');
      const questionsData = [
        {
          question: 'Explain how JWT authentication works in a web application. Describe token signing, transmission, and safe storage strategies against XSS and CSRF.',
          type: 'technical',
          topic: 'Authentication',
          difficulty: 'medium',
          language: 'General',
          expectedKeyPoints: [
            'Header, Payload, Signature cryptographic structure',
            'HMAC or RSA asymmetric key signing',
            'HttpOnly, Secure, SameSite cookies vs localStorage',
            'Mitigating XSS and CSRF with SameSite flags and anti-CSRF tokens',
            'Short-lived access tokens combined with refresh token rotation',
          ],
        },
        {
          question: 'What is Database Normalization? Explain 1NF, 2NF, and 3NF with a practical web development example.',
          type: 'technical',
          topic: 'DBMS Normalization',
          difficulty: 'medium',
          language: 'SQL',
          expectedKeyPoints: [
            'Minimizing redundancy and avoiding update/insert anomalies',
            '1NF: Atomic attributes and primary key uniqueness',
            '2NF: Eliminating partial dependency on composite keys',
            '3NF: Removing transitive dependencies on non-key columns',
          ],
        },
        {
          question: 'How does the JavaScript Event Loop work? Detail the execution order of synchronous code, process.nextTick, microtasks (Promises), and macrotasks (setTimeout).',
          type: 'technical',
          topic: 'Async JavaScript',
          difficulty: 'medium',
          language: 'JavaScript',
          expectedKeyPoints: [
            'Call stack execution',
            'Microtask queue priority over macrotasks',
            'Draining microtasks completely between task cycles',
            'Timers, I/O callbacks, and event triggers in macrotasks',
          ],
        },
        {
          question: 'Explain the internal mechanics of B-Trees versus LSM-Trees. When is an LSM-Tree preferable in high-throughput systems?',
          type: 'technical',
          topic: 'Database Systems',
          difficulty: 'hard',
          language: 'General',
          expectedKeyPoints: [
            'In-place page updates in B-Trees vs append-only writes in LSM-Trees',
            'MemTable, Write-Ahead Log (WAL), and SSTable compaction in LSM-Trees',
            'Write amplification trade-offs',
            'High write-ingest scenarios like time-series or logging',
          ],
        },
        {
          question: 'Describe the complete lifecycle of an HTTP/HTTPS request from browser URL input to page render (DNS, TCP, TLS handshake, HTTP/2 multiplexing).',
          type: 'technical',
          topic: 'Computer Networks',
          difficulty: 'medium',
          language: 'General',
          expectedKeyPoints: [
            'Recursive DNS lookup & caching',
            'TCP 3-way handshake (SYN, SYN-ACK, ACK)',
            'TLS 1.3 cryptographic key exchange',
            'HTTP/2 binary framing and multiplexed streams',
          ],
        },
        {
          question: 'Tell me about a time when you had a technical disagreement with a team member. How did you resolve it objectively?',
          type: 'hr',
          topic: 'Conflict Resolution & Teamwork',
          difficulty: 'medium',
          expectedKeyPoints: [
            'STAR framework (Situation, Task, Action, Result)',
            'Data-driven benchmarks rather than personal opinions',
            'Focusing on user value and operational maintainability',
          ],
        },
        {
          question: 'Describe a situation where a critical production bug occurred. How did you triage, resolve, and prevent recurrence?',
          type: 'hr',
          topic: 'Accountability & Problem Solving',
          difficulty: 'medium',
          expectedKeyPoints: [
            'Fast rollback and incident containment',
            'Transparent stakeholder communication',
            'Root Cause Analysis (RCA) and blameless post-mortem',
            'Automated regression tests to guard against regressions',
          ],
        },
      ];
      await Question.insertMany(questionsData);
      console.log(`[Seed] Seeded ${questionsData.length} core interview questions.`);
    }

    // 2. Seed Coding Problems
    const existingProblems = await CodingProblem.countDocuments();
    if (existingProblems === 0) {
      console.log('[Seed] Seeding Coding Problems...');
      const problemsData = [
        {
          title: 'Two Sum',
          slug: 'two-sum',
          description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
          difficulty: 'easy',
          topic: 'Arrays',
          supportedLanguages: ['python', 'javascript', 'java', 'cpp', 'c', 'csharp'],
          constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.',
          ],
          examples: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
            },
            {
              input: 'nums = [3,2,4], target = 6',
              output: '[1,2]',
              explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
            },
          ],
          starterCode: {},
          testCases: [
            {
              input: `[2,7,11,15]\n9`,
              expectedOutput: `[0,1]`,
              explanation: '2 + 7 = 9',
              isSample: true,
            },
            {
              input: `[3,2,4]\n6`,
              expectedOutput: `[1,2]`,
              explanation: '2 + 4 = 6',
              isSample: true,
            },
            {
              input: `[3,3]\n6`,
              expectedOutput: `[0,1]`,
              explanation: '3 + 3 = 6',
              isSample: true,
            },
          ],
          hiddenTestCases: [
            {
              input: `[-1,-2,-3,-4,-5]\n-8`,
              expectedOutput: `[2,4]`,
            },
            {
              input: `[0,4,3,0]\n0`,
              expectedOutput: `[0,3]`,
            },
          ],
        },
        {
          title: 'Valid Parentheses',
          slug: 'valid-parentheses',
          description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
          difficulty: 'easy',
          topic: 'Stacks',
          supportedLanguages: ['python', 'javascript', 'java', 'cpp', 'c', 'csharp'],
          constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only ()[]{}'],
          examples: [
            { input: 's = "()"', output: 'true', explanation: 'Matching pair' },
            { input: 's = "()[]{}"', output: 'true', explanation: 'All matching' },
            { input: 's = "(]"', output: 'false', explanation: 'Mismatched brackets' },
          ],
          starterCode: {},
          testCases: [
            { input: '()', expectedOutput: 'true', isSample: true },
            { input: '()[]{}', expectedOutput: 'true', isSample: true },
            { input: '(]', expectedOutput: 'false', isSample: true },
          ],
          hiddenTestCases: [
            { input: '([)]', expectedOutput: 'false' },
            { input: '{[]}', expectedOutput: 'true' },
          ],
        },
        {
          title: 'Maximum Subarray (Kadane)',
          slug: 'maximum-subarray',
          description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
          difficulty: 'medium',
          topic: 'Dynamic Programming',
          supportedLanguages: ['python', 'javascript', 'java', 'cpp'],
          constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
          examples: [
            {
              input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
              output: '6',
              explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
            },
          ],
          starterCode: {},
          testCases: [
            { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isSample: true },
            { input: '[1]', expectedOutput: '1', isSample: true },
            { input: '[5,4,-1,7,8]', expectedOutput: '23', isSample: true },
          ],
          hiddenTestCases: [{ input: '[-1]', expectedOutput: '-1' }],
        },
      ];
      await CodingProblem.insertMany(problemsData);
      console.log(`[Seed] Seeded ${problemsData.length} core coding problems.`);
    }

    await CodingProblem.updateMany(
      { slug: { $in: ['two-sum', 'valid-parentheses', 'maximum-subarray'] } },
      { $set: { starterCode: {} } }
    );
    await Answer.collection.updateMany(
      { improvedAnswer: { $exists: true } },
      { $unset: { improvedAnswer: 1 } }
    );

    // 3. Seed Demo User
    let demoUser = await User.findOne({ email: 'demo@interviewforge.ai' }).select('+demoDataCleanupVersion');
    if (!demoUser) {
      console.log('[Seed] Creating Demo Student user...');
      demoUser = await User.create({
        name: 'Kishore Kumar',
        email: 'demo@interviewforge.ai',
        password: 'password123',
        targetRole: 'Full Stack Software Engineer',
        experienceLevel: 'mid',
        interests: ['Full Stack Development', 'System Design', 'Database Systems', 'Algorithms'],
        languages: ['TypeScript', 'JavaScript', 'Python'],
      });
      console.log('[Seed] Demo User created: demo@interviewforge.ai / password123');
    }

    if (demoUser.demoDataCleanupVersion < 1) {
      await Promise.all([
        Interview.deleteMany({ userId: demoUser._id }),
        Answer.deleteMany({ userId: demoUser._id }),
        CodingSubmission.deleteMany({ userId: demoUser._id }),
        User.updateOne(
          { _id: demoUser._id },
          {
            $unset: {
              readinessScore: 1,
              technicalScore: 1,
              hrScore: 1,
              codingScore: 1,
              streak: 1,
            },
            $set: { weakTopics: [], strongTopics: [], demoDataCleanupVersion: 1 },
          }
        ),
      ]);
      console.log('[Seed] Removed legacy demo scores, answers, and submissions.');
    }

    console.log('[Seed] Database initialization complete.');
  } catch (error) {
    console.error('[Seed Error]', error);
  }
};

module.exports = seedDatabase;
