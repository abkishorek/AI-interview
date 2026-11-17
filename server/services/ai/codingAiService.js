const aiProvider = require('./aiProvider');

class CodingAiService {
  async evaluateCode({ problemTitle, problemDescription, language, code, testResults }) {
    const passedCount = testResults.filter((t) => t.passed).length;
    const totalCount = testResults.length;

    const prompt = `Review the following student code submission for a programming problem.
PROBLEM TITLE: ${problemTitle}
DESCRIPTION: ${problemDescription}
LANGUAGE: ${language}
ACTUAL TEST RESULTS FROM JUDGE0: ${passedCount} / ${totalCount} tests passed. (Do not contradict these test results).

CODE SUBMITTED:
\`\`\`${language}
${code}
\`\`\`

Perform an architectural and algorithmic code review.
Provide strictly valid JSON in this schema:
{
  "correctness": number (1 to 10 based on actual test pass rate),
  "codeQuality": number (1 to 10 based on idiomatic style, clean variable naming, readability),
  "efficiency": number (1 to 10 based on optimal algorithmic time and space complexity),
  "timeComplexity": "string e.g. O(n^2) or O(n)",
  "spaceComplexity": "string e.g. O(1) or O(n)",
  "observation": "string - precise technical observation describing algorithm behavior, nested loops, memory allocations, or anti-patterns",
  "possibleImprovement": "string - actionable algorithmic improvement e.g. 'Use a single-pass hash map to reduce time complexity to O(n)'"
}`;

    return await aiProvider.callAI({
      systemInstruction: 'You are an elite code reviewer and algorithm specialist. Provide rigorous algorithmic reviews without boilerplate.',
      prompt,
    });
  }

  async generateCodingProblem({ topic = 'Arrays', difficulty = 'medium' }) {
    const prompt = `Generate a programming challenge on ${topic} with ${difficulty} difficulty.
Return pure JSON conforming to:
{
  "title": "string",
  "slug": "string-slug-format",
  "description": "markdown text with problem statement",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "constraints": ["constraint 1", "constraint 2"],
  "examples": [
    { "input": "string", "output": "string", "explanation": "string" }
  ],
  "starterCode": {
    "javascript": "function solution(input) {\\n  // Code here\\n}",
    "python": "def solution(input):\\n    # Code here\\n    pass"
  },
  "testCases": [
    { "input": "example input", "expectedOutput": "expected output", "isSample": true }
  ]
}`;

    const fallbackHandler = () => ({
      title: `${topic} Optimization Challenge`,
      slug: `${topic.toLowerCase()}-optimization-${difficulty}`,
      description: `Given a collection of records related to **${topic}**, implement an optimal function that returns the desired computed outcome according to the problem constraints.`,
      difficulty,
      topic,
      constraints: ['1 <= n <= 10^5', 'Memory limit: 256MB'],
      examples: [{ input: '[1, 2, 3]', output: '6', explanation: 'Sum of elements' }],
      starterCode: {
        javascript: 'function solution(nums) {\n  // Implement solution\n  return 0;\n}',
        python: 'def solution(nums):\n    # Implement solution\n    return 0',
      },
      testCases: [
        { input: '[1, 2, 3]', expectedOutput: '6', isSample: true },
        { input: '[4, 5, 6]', expectedOutput: '15', isSample: false },
      ],
    });

    return await aiProvider.callAI({
      systemInstruction: 'You are a competitive programming problem creator.',
      prompt,
      fallbackHandler,
    });
  }
}

module.exports = new CodingAiService();
