import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CodingService,
  CodingProblem,
  ExecutionResponse,
  AiCodeReview,
} from '../../services/coding.service';
import { timeout } from 'rxjs';

const DEFAULT_TWO_SUM: CodingProblem = {
  _id: '6abde9ba6b3ee01c601aa55d',
  title: 'Two Sum',
  slug: 'two-sum',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
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
    { input: '[2,7,11,15]\\n9', expectedOutput: '[0,1]', isSample: true },
    { input: '[3,2,4]\\n6', expectedOutput: '[1,2]', isSample: true },
  ],
};

@Component({
  selector: 'app-coding-lab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="coding-lab-container">
      <!-- Top Problem Header -->
      <div class="lab-topbar editorial-panel">
        <div class="problem-title-section">
          <select [(ngModel)]="selectedSlug" (change)="onProblemChange()" class="problem-selector font-mono">
            <option *ngFor="let p of problemsList" [value]="p.slug">
              {{ p.title }} [{{ p.difficulty | uppercase }}]
            </option>
          </select>
          <span class="badge" [ngClass]="getDifficultyBadgeClass(problem.difficulty)">
            {{ problem.difficulty | uppercase }}
          </span>
          <span class="badge badge-forest font-mono">{{ problem.topic }}</span>
        </div>

        <div class="topbar-actions">
          <select [(ngModel)]="selectedLanguage" (change)="onLanguageChange()" class="language-selector font-mono">
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="java">Java (OpenJDK)</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="c">C (GCC)</option>
            <option value="csharp">C# (.NET)</option>
          </select>

          <button (click)="runCode()" [disabled]="running || submitting" class="btn btn-outline btn-sm">
            {{ running ? 'RUNNING...' : 'RUN TESTS' }}
          </button>

          <button (click)="submitCode()" [disabled]="running || submitting" class="btn btn-primary btn-sm">
            {{ submitting ? 'SUBMITTING...' : 'SUBMIT SOLUTION →' }}
          </button>
        </div>
      </div>

      <!-- Main Workspace: Problem Spec (Left) vs Monaco IDE (Right) -->
      <div class="ide-grid">
        <!-- Left: Problem Description & Test Cases -->
        <div class="problem-pane editorial-panel">
          <div class="problem-scroll-content">
            <h1 class="problem-h1">{{ problem.title }}</h1>

            <div class="description-body">
              <p class="description-text">{{ problem.description }}</p>
            </div>

            <!-- Examples -->
            <div class="examples-section" *ngIf="problem.examples?.length">
              <div class="section-title tech-label">EXAMPLES</div>
              <div *ngFor="let ex of problem.examples; let idx = index" class="example-card">
                <div class="example-num tech-label">EXAMPLE {{ idx + 1 }}</div>
                <div class="example-row">
                  <span class="ex-label tech-label">INPUT:</span>
                  <code class="ex-code font-mono">{{ ex.input }}</code>
                </div>
                <div class="example-row">
                  <span class="ex-label tech-label">OUTPUT:</span>
                  <code class="ex-code font-mono">{{ ex.output }}</code>
                </div>
                <div class="example-row" *ngIf="ex.explanation">
                  <span class="ex-label tech-label">EXPLANATION:</span>
                  <span class="ex-expl">{{ ex.explanation }}</span>
                </div>
              </div>
            </div>

            <!-- Constraints -->
            <div class="constraints-section" *ngIf="problem.constraints?.length">
              <div class="section-title tech-label">CONSTRAINTS</div>
              <ul class="constraints-list font-mono">
                <li *ngFor="let c of problem.constraints">{{ c }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Right: Editor & Execution Results -->
        <div class="editor-pane">
          <!-- Monaco / Fallback Container -->
          <div class="monaco-wrapper">
            <div #monacoContainer class="monaco-host" [style.display]="monacoReady ? 'block' : 'none'"></div>
            <textarea
              *ngIf="!monacoReady"
              [(ngModel)]="currentCode"
              class="fallback-code-area font-mono"
              placeholder="// Write your code here..."
              spellcheck="false"
            ></textarea>
          </div>

          <!-- Bottom Results & AI Review Panel -->
          <div class="results-panel editorial-panel">
            <div class="results-header">
              <div class="tabs-nav">
                <button
                  type="button"
                  [class.active]="activeTab === 'tests'"
                  (click)="activeTab = 'tests'"
                  class="tab-btn tech-label"
                >
                  TEST RESULTS
                  <span *ngIf="executionResult" class="tab-badge font-mono">
                    {{ executionResult.passedTests }} / {{ executionResult.totalTests }} PASSED
                  </span>
                </button>

                <button
                  *ngIf="aiFeedback || reviewError"
                  type="button"
                  [class.active]="activeTab === 'review'"
                  (click)="activeTab = 'review'"
                  class="tab-btn tech-label"
                >
                  CODE REVIEW
                  <span *ngIf="aiFeedback" class="badge badge-positive font-mono">NEW</span>
                </button>
              </div>

              <div class="execution-telemetry font-mono" *ngIf="executionResult">
                <span class="telemetry-item">STATUS: <strong [ngClass]="executionResult.status === 'Accepted' ? 'text-pos' : 'text-err'">{{ executionResult.status }}</strong></span>
                <span class="telemetry-item">RUNTIME: {{ executionResult.runtime }}</span>
                <span class="telemetry-item">MEMORY: {{ executionResult.memory }}</span>
              </div>
            </div>

            <div class="results-body">
              <!-- Tests Tab -->
              <div *ngIf="activeTab === 'tests'" class="tests-view">
                <div *ngIf="!executionResult && !running" class="no-runs tech-label">
                  Ready. Click 'RUN TESTS' to execute code against sample cases via Judge0.
                </div>

                <div *ngIf="running" class="no-runs tech-label font-mono">
                  [JUDGE0] DISPATCHING SUBMISSION TO COMPILER WORKERS...
                </div>

                <div *ngIf="executionError && !running" class="tc-error font-mono" role="alert">
                  {{ executionError }}
                </div>

                <div *ngIf="executionResult" class="testcases-list">
                  <div *ngFor="let t of executionResult.results" class="testcase-card" [class.tc-failed]="!t.passed">
                    <div class="tc-header">
                      <span class="tc-title tech-label">CASE {{ t.testIndex }}</span>
                      <span class="badge" [ngClass]="t.passed ? 'badge-positive' : 'badge-error'">
                        {{ t.passed ? 'PASSED' : 'FAILED' }}
                      </span>
                    </div>

                    <div class="tc-io-grid font-mono">
                      <div class="tc-io-item">
                        <span class="io-label tech-label">INPUT:</span>
                        <div class="io-val">{{ t.input }}</div>
                      </div>
                      <div class="tc-io-item">
                        <span class="io-label tech-label">EXPECTED:</span>
                        <div class="io-val">{{ t.expectedOutput }}</div>
                      </div>
                      <div class="tc-io-item">
                        <span class="io-label tech-label">ACTUAL:</span>
                        <div class="io-val" [class.text-err]="!t.passed">{{ t.actualOutput || '(Empty)' }}</div>
                      </div>
                    </div>

                    <div *ngIf="t.error" class="tc-error font-mono">
                      {{ t.error }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI Code Review Tab -->
              <div *ngIf="activeTab === 'review' && aiFeedback" class="review-view">
                <div class="review-scores-grid">
                  <div class="r-cell">
                    <span class="tech-label">CORRECTNESS</span>
                    <div class="r-val font-mono">{{ aiFeedback.correctness }} / 10</div>
                  </div>

                  <div *ngIf="activeTab === 'review' && reviewError" class="tc-error font-mono" role="status">
                    {{ reviewError }}
                  </div>
                  <div class="r-cell">
                    <span class="tech-label">CODE QUALITY</span>
                    <div class="r-val font-mono">{{ aiFeedback.codeQuality }} / 10</div>
                  </div>
                  <div class="r-cell">
                    <span class="tech-label">EFFICIENCY</span>
                    <div class="r-val font-mono">{{ aiFeedback.efficiency }} / 10</div>
                  </div>
                </div>

                <div class="complexity-row">
                  <div class="comp-box">
                    <span class="tech-label">TIME COMPLEXITY</span>
                    <div class="comp-val font-mono">{{ aiFeedback.timeComplexity }}</div>
                  </div>
                  <div class="comp-box">
                    <span class="tech-label">SPACE COMPLEXITY</span>
                    <div class="comp-val font-mono">{{ aiFeedback.spaceComplexity }}</div>
                  </div>
                </div>

                <div class="review-comment">
                  <div class="section-title tech-label">OBSERVATION</div>
                  <p class="review-text">{{ aiFeedback.observation }}</p>
                </div>

                <div class="review-comment improvement-box">
                  <div class="section-title tech-label">POSSIBLE IMPROVEMENT</div>
                  <p class="review-text font-mono">{{ aiFeedback.possibleImprovement }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coding-lab-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .lab-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
    }

    .problem-title-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .problem-selector {
      font-size: 14px;
      font-weight: 600;
      padding: 6px 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-paper);
      color: var(--text-main);
      border-radius: var(--radius-xs);
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .language-selector {
      font-size: 12px;
      padding: 6px 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-paper);
      color: var(--text-main);
      border-radius: var(--radius-xs);
    }

    .ide-grid {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 16px;
      height: calc(100vh - 180px);
      min-height: 600px;
    }

    .problem-pane {
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }

    .problem-scroll-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .problem-h1 {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .description-text {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-main);
      white-space: pre-wrap;
    }

    .section-title {
      font-size: 10px;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }

    .example-card {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 12px 14px;
      margin-bottom: 10px;
      border-radius: var(--radius-xs);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .example-num {
      font-size: 10px;
      color: var(--accent-orange);
    }

    .example-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 12px;
    }

    .ex-code {
      font-size: 12px;
      color: var(--text-main);
      background: rgba(0, 0, 0, 0.04);
      padding: 2px 6px;
      border-radius: 2px;
    }

    .constraints-list {
      list-style-type: square;
      padding-left: 20px;
      font-size: 12px;
      line-height: 1.8;
      color: var(--text-muted);
    }

    .editor-pane {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
    }

    .monaco-wrapper {
      flex: 1.2;
      border: 1px solid var(--border-color);
      background: #FFFFFF;
      border-radius: var(--radius-xs);
      overflow: hidden;
      min-height: 280px;
      position: relative;
    }

    .monaco-host {
      width: 100%;
      height: 100%;
    }

    .fallback-code-area {
      width: 100%;
      height: 100%;
      padding: 16px;
      border: none;
      outline: none;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.6;
      background: #FFFFFF;
      color: #171717;
      resize: none;
      tab-size: 4;
    }

    .results-panel {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
      margin-bottom: 12px;
    }

    .tabs-nav {
      display: flex;
      gap: 12px;
    }

    .tab-btn {
      background: transparent;
      border: none;
      font-size: 11px;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding-bottom: 4px;
      border-bottom: 2px solid transparent;
    }

    .tab-btn.active {
      color: var(--accent-forest);
      border-bottom-color: var(--accent-forest);
      font-weight: 600;
    }

    .execution-telemetry {
      display: flex;
      gap: 14px;
      font-size: 11px;
      color: var(--text-muted);
    }

    .results-body {
      flex: 1;
      overflow-y: auto;
    }

    .no-runs {
      padding: 24px;
      text-align: center;
      color: var(--text-subtle);
    }

    .testcases-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .testcase-card {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 10px 12px;
      border-radius: var(--radius-xs);
    }

    .testcase-card.tc-failed {
      border-color: rgba(168, 68, 54, 0.4);
    }

    .tc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .tc-io-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      font-size: 12px;
    }

    .tc-io-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .io-val {
      background: rgba(0, 0, 0, 0.03);
      padding: 4px 6px;
      border-radius: 2px;
      word-break: break-all;
    }

    .tc-error {
      margin-top: 8px;
      padding: 6px 8px;
      background: var(--color-error-light);
      color: var(--color-error);
      font-size: 11px;
      border-radius: 2px;
    }

    .review-scores-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }

    .r-cell {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 10px;
      border-radius: var(--radius-xs);
    }

    .r-val {
      font-size: 16px;
      font-weight: 600;
      color: var(--accent-forest);
      margin-top: 4px;
    }

    .complexity-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .comp-box {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      border-radius: var(--radius-xs);
    }

    .comp-val {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      margin-top: 2px;
    }

    .review-text {
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-main);
    }

    .improvement-box {
      margin-top: 10px;
      background: var(--accent-forest-light);
      border-left: 3px solid var(--accent-forest);
      padding: 10px 12px;
    }

    .text-pos {
      color: var(--color-positive);
    }
    .text-err {
      color: var(--color-error);
    }

    @media (max-width: 900px) {
      .ide-grid {
        grid-template-columns: 1fr;
        height: auto;
      }
    }
  `],
})
export class CodingLabComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('monacoContainer') monacoContainer!: ElementRef;

  private codingService = inject(CodingService);
  private changeDetector = inject(ChangeDetectorRef);

  problemsList: any[] = [
    { title: 'Two Sum', slug: 'two-sum', difficulty: 'easy', topic: 'Arrays' },
    { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'easy', topic: 'Stacks' },
    { title: 'Maximum Subarray (Kadane)', slug: 'maximum-subarray', difficulty: 'medium', topic: 'Dynamic Programming' },
  ];
  selectedSlug = 'two-sum';
  problem: CodingProblem = DEFAULT_TWO_SUM;
  selectedLanguage = 'python';
  currentCode = DEFAULT_TWO_SUM.starterCode['python'] || '';

  monacoReady = false;
  editorInstance: any = null;
  activeTab: 'tests' | 'review' = 'tests';

  running = false;
  submitting = false;
  executionResult: ExecutionResponse | null = null;
  executionError = '';
  aiFeedback: AiCodeReview | null = null;
  reviewError = '';

  ngOnInit() {
    this.currentCode = this.getCodeForLanguage();
    this.loadProblems();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMonaco();
    }, 50);
  }

  ngOnDestroy() {
    if (this.editorInstance) {
      this.editorInstance.dispose();
    }
  }

  loadProblems() {
    this.codingService.getProblems().subscribe({
      next: (res) => {
        if (res.success && res.problems.length > 0) {
          this.problemsList = res.problems;
          this.loadProblemDetails(this.selectedSlug);
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.warn('[Load Problems Warning] Using cached problems:', err);
        this.changeDetector.detectChanges();
      },
    });
  }

  loadProblemDetails(slug: string) {
    this.codingService.getProblem(slug).subscribe({
      next: (res) => {
        if (res.success && res.problem) {
          this.problem = res.problem;
          this.updateEditorCode();
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.warn('[Load Problem Warning] Retaining active problem:', err);
        this.changeDetector.detectChanges();
      },
    });
  }

  onProblemChange() {
    this.executionResult = null;
    this.aiFeedback = null;
    this.activeTab = 'tests';
    this.loadProblemDetails(this.selectedSlug);
  }

  onLanguageChange() {
    this.updateEditorCode();
  }

  initMonaco() {
    let retries = 0;
    const checkMonaco = () => {
      const win = window as any;
      if (win.monaco) {
        this.createEditor(win.monaco);
      } else if (win.require) {
        try {
          win.require(['vs/editor/editor.main'], () => {
            this.createEditor(win.monaco);
          });
        } catch (_) {
          this.monacoReady = false;
        }
      } else if (retries < 15) {
        retries++;
        setTimeout(checkMonaco, 200);
      } else {
        // Fallback to high-performance textarea editor
        this.monacoReady = false;
      }
    };
    checkMonaco();
  }

  createEditor(monaco: any) {
    if (!this.monacoContainer?.nativeElement || this.editorInstance) return;

    this.currentCode = this.getCodeForLanguage();

    try {
      this.editorInstance = monaco.editor.create(this.monacoContainer.nativeElement, {
        value: this.currentCode,
        language: this.mapMonacoLanguage(this.selectedLanguage),
        theme: 'vs',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
      });

      this.editorInstance.onDidChangeModelContent(() => {
        this.currentCode = this.editorInstance.getValue();
      });

      this.monacoReady = true;
      this.changeDetector.detectChanges();
    } catch (e) {
      console.warn('[Monaco Init Warning] Using textarea fallback', e);
      this.monacoReady = false;
      this.changeDetector.detectChanges();
    }
  }

  updateEditorCode() {
    this.currentCode = this.getCodeForLanguage();
    if (this.editorInstance) {
      const win = window as any;
      this.editorInstance.setValue(this.currentCode);
      if (win.monaco) {
        win.monaco.editor.setModelLanguage(
          this.editorInstance.getModel(),
          this.mapMonacoLanguage(this.selectedLanguage)
        );
      }
    }
  }

  getCodeForLanguage(): string {
    if (!this.problem || !this.problem.starterCode) return this.currentCode;
    return this.problem.starterCode[this.selectedLanguage] || '';
  }

  getActiveCode(): string {
    if (this.editorInstance) {
      return this.editorInstance.getValue();
    }
    return this.currentCode;
  }

  mapMonacoLanguage(lang: string): string {
    switch (lang) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'cpp':
      case 'c':
        return 'cpp';
      case 'csharp':
        return 'csharp';
      default:
        return 'plaintext';
    }
  }

  getDifficultyBadgeClass(difficulty?: string): string {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'badge-positive';
      case 'medium':
        return 'badge-warning';
      case 'hard':
        return 'badge-error';
      default:
        return '';
    }
  }

  runCode() {
    const code = this.getActiveCode();
    this.executionResult = null;
    this.executionError = '';
    this.aiFeedback = null;
    this.reviewError = '';
    if (!code.trim()) {
      this.executionError = 'Enter your solution before running tests.';
      return;
    }

    this.running = true;
    this.activeTab = 'tests';

    const pId = this.problem?.slug || this.problem?._id || this.selectedSlug || 'two-sum';

    this.codingService
      .runCode({
        problemId: pId,
        language: this.selectedLanguage,
        code,
      })
      .pipe(timeout(30000))
      .subscribe({
        next: (res) => {
          this.running = false;
          if (res.success) {
            this.executionResult = res.execution;
            this.activeTab = 'tests';
          } else {
            this.executionError = 'The execution service did not return test results.';
          }
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.running = false;
          this.executionError =
            err.name === 'TimeoutError'
              ? 'Code execution timed out. Please try again.'
              : err.error?.message || 'Code execution failed. Check the server and runner configuration.';
          this.changeDetector.detectChanges();
        },
      });
  }

  submitCode() {
    const code = this.getActiveCode();
    this.executionResult = null;
    this.executionError = '';
    this.aiFeedback = null;
    this.reviewError = '';
    if (!code.trim()) {
      this.executionError = 'Enter your solution before submitting.';
      this.activeTab = 'tests';
      return;
    }

    this.submitting = true;

    const pId = this.problem?.slug || this.problem?._id || this.selectedSlug || 'two-sum';

    this.codingService
      .submitCode({
        problemId: pId,
        language: this.selectedLanguage,
        code,
      })
      .pipe(timeout(60000))
      .subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.executionResult = res.execution;
            this.aiFeedback = res.aiFeedback || null;
            this.reviewError = res.aiReviewError || '';
            this.activeTab = 'review';
          } else {
            this.executionError = 'The submission service did not return test results.';
            this.activeTab = 'tests';
          }
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.submitting = false;
          this.executionError =
            err.name === 'TimeoutError'
              ? 'Submission timed out. Please try again.'
              : err.error?.message || 'Submission failed. Check the server and runner configuration.';
          this.activeTab = 'tests';
          this.changeDetector.detectChanges();
        },
      });
  }
}
