const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Standard Judge0 Language IDs
const LANGUAGE_IDS = {
  javascript: 63, // JavaScript (Node.js 12.14.0 or 18)
  python: 71,     // Python (3.8.1 or 3.10)
  java: 62,       // Java (OpenJDK 13/17)
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  csharp: 51,     // C# (Mono 6.6.0.161)
};

class Judge0Service {
  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY || '';
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey && this.apiKey.trim() !== '') {
      headers['X-RapidAPI-Key'] = this.apiKey;
      headers['X-RapidAPI-Host'] = new URL(this.apiUrl).host;
    }
    return headers;
  }

  async runTestCases({ code, language, testCases }) {
    const results = [];
    const languageLower = (language || 'javascript').toLowerCase();
    const langId = LANGUAGE_IDS[languageLower] || 63;

    // Check if we should call external Judge0
    const hasExternalJudge0 = Boolean(this.apiKey && this.apiKey.trim() !== '');

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let executionResult = null;

      if (hasExternalJudge0) {
        try {
          executionResult = await this.executeOnJudge0({
            source_code: code,
            language_id: langId,
            stdin: tc.input,
          });
        } catch (err) {
          console.error(`[Judge0] External execution failed for test ${i + 1}: ${err.message}`);
          executionResult = {
            stdout: '',
            stderr: '',
            compile_output: `Judge0 execution failed: ${err.message}`,
            time: 0,
            memory: 0,
            statusId: 13,
            statusDescription: 'Runner Error',
          };
        }
      } else {
        executionResult = await this.executeLocally({ code, language: languageLower, stdin: tc.input });
      }

      const expectedRaw = (tc.expectedOutput || '').trim();
      const actualRaw = (executionResult.stdout || '').trim();
      
      let passed = false;
      if (executionResult.statusId === 3) {
        try {
          passed = JSON.stringify(JSON.parse(actualRaw)) === JSON.stringify(JSON.parse(expectedRaw));
        } catch (_) {
          passed = actualRaw.replace(/\s+/g, '') === expectedRaw.replace(/\s+/g, '');
        }
      }

      results.push({
        testIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actualRaw,
        passed,
        status: executionResult.statusDescription || (passed ? 'Accepted' : 'Wrong Answer'),
        executionTime: executionResult.time,
        memory: executionResult.memory,
        error: executionResult.compile_output || executionResult.stderr || null,
        isSample: Boolean(tc.isSample),
      });
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    let overallStatus = 'Accepted';

    if (results.some((r) => r.status === 'Compilation Error')) {
      overallStatus = 'Compilation Error';
    } else if (results.some((r) => r.status === 'Runtime Error')) {
      overallStatus = 'Runtime Error';
    } else if (results.some((r) => r.status === 'Time Limit Exceeded')) {
      overallStatus = 'Time Limit Exceeded';
    } else if (results.some((r) => r.status === 'Runner Error' || r.status === 'Runner Unavailable')) {
      overallStatus = 'Runner Unavailable';
    } else if (passedCount < totalCount) {
      overallStatus = 'Wrong Answer';
    }

    const avgTime = results.reduce((acc, r) => acc + (parseFloat(r.executionTime) || 0), 0) / (totalCount || 1);
    const avgMemory = results.reduce((acc, r) => acc + (parseFloat(r.memory) || 0), 0) / (totalCount || 1);

    return {
      passedTests: passedCount,
      totalTests: totalCount,
      status: overallStatus,
      runtime: `${Math.round(avgTime * 1000)} ms`,
      memory: `${(avgMemory / 1024).toFixed(1)} MB`,
      results,
    };
  }

  async executeOnJudge0({ source_code, language_id, stdin }) {
    const payload = {
      source_code: Buffer.from(source_code).toString('base64'),
      language_id,
      stdin: Buffer.from(stdin || '').toString('base64'),
    };

    const response = await axios.post(
      `${this.apiUrl}/submissions?base64_encoded=true&wait=true`,
      payload,
      {
        headers: this.getHeaders(),
        timeout: 10000,
      }
    );

    const data = response.data;
    const decode = (str) => (str ? Buffer.from(str, 'base64').toString('utf8') : '');

    return {
      stdout: decode(data.stdout),
      stderr: decode(data.stderr),
      compile_output: decode(data.compile_output),
      time: data.time == null ? 0 : parseFloat(data.time) || 0,
      memory: data.memory == null ? 0 : parseInt(data.memory, 10) || 0,
      statusId: data.status?.id ?? 0,
      statusDescription: data.status?.description || 'Unknown Status',
    };
  }

  async executeLocally({ code, language, stdin }) {
    return new Promise((resolve) => {
      const tempDir = os.tmpdir();
      const randomId = Math.random().toString(36).substring(7);

      let runnerCmd = '';
      let runnerArgs = [];
      let filePath = '';

      if (language === 'python') {
        filePath = path.join(tempDir, `solution_${randomId}.py`);
        fs.writeFileSync(filePath, code);
        runnerCmd = process.platform === 'win32' ? 'py' : 'python';
        runnerArgs = process.platform === 'win32' ? ['-3', filePath] : [filePath];
      } else if (language === 'javascript') {
        filePath = path.join(tempDir, `solution_${randomId}.js`);
        fs.writeFileSync(filePath, code);
        runnerCmd = 'node';
        runnerArgs = [filePath];
      } else {
        return resolve({
          stdout: '',
          stderr: '',
          compile_output: `Local execution is not configured for ${language}. Configure Judge0 to run this language.`,
          time: 0,
          memory: 0,
          statusId: 13,
          statusDescription: 'Runner Unavailable',
        });
      }

      const startTime = Date.now();
      let stdout = '';
      let stderr = '';
      let isTimedOut = false;

      const proc = spawn(runnerCmd, runnerArgs);

      const timer = setTimeout(() => {
        isTimedOut = true;
        proc.kill('SIGKILL');
      }, 4000);

      proc.stdin.end(stdin || '');

      proc.stdout.on('data', (d) => {
        stdout += d.toString();
      });

      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      proc.on('close', (codeExit) => {
        clearTimeout(timer);
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (_) {}

        const duration = (Date.now() - startTime) / 1000;

        if (isTimedOut) {
          return resolve({
            stdout: '',
            stderr: 'Time Limit Exceeded (4000ms)',
            compile_output: '',
            time: 4.0,
            memory: 24000,
            statusId: 5,
            statusDescription: 'Time Limit Exceeded',
          });
        }

        if (codeExit !== 0) {
          return resolve({
            stdout,
            stderr,
            compile_output: stderr,
            time: duration,
            memory: 14500,
            statusId: 11,
            statusDescription: 'Runtime Error',
          });
        }

        resolve({
          stdout,
          stderr: '',
          compile_output: '',
          time: duration,
          memory: 14200,
          statusId: 3,
          statusDescription: 'Accepted',
        });
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (_) {}
        const runnerUnavailable = err.code === 'ENOENT';
        resolve({
          stdout: '',
          stderr: err.message,
          compile_output: runnerUnavailable
            ? `Local execution could not find "${runnerCmd}". Install the runtime or configure Judge0.`
            : err.message,
          time: 0.01,
          memory: 8000,
          statusId: runnerUnavailable ? 13 : 11,
          statusDescription: runnerUnavailable ? 'Runner Unavailable' : 'Runtime Error',
        });
      });
    });
  }
}

module.exports = new Judge0Service();
