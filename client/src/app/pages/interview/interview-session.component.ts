import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  InterviewService,
  InterviewQuestion,
  AnswerEvaluation,
} from '../../services/interview.service';

@Component({
  selector: 'app-interview-session',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="interview-workstation" *ngIf="interviewData; else loadingTpl">
      <!-- Session Top Bar -->
      <div class="session-topbar editorial-panel">
        <div class="session-meta">
          <span class="session-badge font-mono">SESSION #{{ interviewId.slice(-6).toUpperCase() || 'LAB001' }}</span>
          <span class="session-divider">/</span>
          <span class="session-role tech-label">{{ interviewData.targetRole | uppercase }}</span>
        </div>

        <div *ngIf="actionError" class="tc-error font-mono" role="alert">{{ actionError }}</div>

        <div class="session-status">
          <span class="tech-label">DIFFICULTY:</span>
          <span class="badge" [ngClass]="getDifficultyBadgeClass(currentQuestion?.difficulty)">
            {{ currentQuestion?.difficulty | uppercase }}
          </span>

          <span class="session-divider">/</span>

          <span class="timer-display font-mono" [class.timer-warning]="timeRemainingSeconds < 120">
            {{ formatTime(timeRemainingSeconds) }} REMAINING
          </span>
        </div>
      </div>

      <!-- Main Two-Pane Assessment Interface -->
      <div class="assessment-grid" *ngIf="!isCompleted; else completedTpl">
        <!-- Left Pane: Technical Question -->
        <div class="question-pane editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">
              QUESTION {{ currentIndex + 1 }} / {{ interviewData.totalQuestions }}
            </span>
            <span class="badge badge-forest font-mono">{{ currentQuestion?.topic }}</span>
          </div>

          <div class="question-content">
            <h2 class="question-text">{{ currentQuestion?.questionText }}</h2>
          </div>

          <div class="question-meta-footer">
            <div class="meta-item">
              <span class="tech-label">ASSESSMENT MODE:</span>
              <span class="meta-val font-mono">{{ interviewData.type | uppercase }}</span>
            </div>
            <div class="meta-item" *ngIf="adaptiveNote">
              <span class="tech-label">ADAPTIVE FEEDBACK:</span>
              <span class="meta-val note-val font-mono">{{ adaptiveNote }}</span>
            </div>
          </div>
        </div>

        <!-- Right Pane: Candidate Answer Input OR Evaluation -->
        <div class="answer-pane editorial-panel">
          <!-- Step A: Type and Submit Answer -->
          <ng-container *ngIf="!currentEvaluation">
            <div class="editorial-panel-header">
              <span class="tech-label">CANDIDATE RESPONSE</span>
              <span class="word-counter tech-label">{{ getWordCount() }} WORDS</span>
            </div>

            <div class="answer-input-box">
              <textarea
                [(ngModel)]="answerText"
                placeholder="Formulate your response with precision. Address underlying principles, practical architecture, and trade-offs..."
                class="form-control answer-textarea font-sans"
                [disabled]="submitting"
              ></textarea>
            </div>

            <div class="answer-actions">
              <button
                (click)="submitCandidateAnswer()"
                [disabled]="submitting || !answerText.trim()"
                class="btn btn-primary"
              >
                {{ submitting ? 'EVALUATING WITH AI...' : 'SUBMIT ANSWER →' }}
              </button>
            </div>
          </ng-container>

          <!-- Step B: Live AI Assessment Feedback -->
          <ng-container *ngIf="currentEvaluation">
            <div class="editorial-panel-header">
              <span class="tech-label">AI ANSWER EVALUATION</span>
              <span class="badge badge-positive font-mono">SCORE: {{ currentEvaluation.score }}%</span>
            </div>

            <div class="evaluation-scroll-container">
              <!-- Score Metrics Grid -->
              <div class="quality-grid">
                <div class="quality-cell">
                  <span class="tech-label">TECHNICAL ACCURACY</span>
                  <div class="cell-val font-mono">{{ currentEvaluation.technicalAccuracy }} / 10</div>
                </div>
                <div class="quality-cell">
                  <span class="tech-label">RELEVANCE</span>
                  <div class="cell-val font-mono">{{ currentEvaluation.relevance }} / 10</div>
                </div>
                <div class="quality-cell">
                  <span class="tech-label">COMPLETENESS</span>
                  <div class="cell-val font-mono">{{ currentEvaluation.completeness }} / 10</div>
                </div>
                <div class="quality-cell">
                  <span class="tech-label">CLARITY</span>
                  <div class="cell-val font-mono">{{ currentEvaluation.clarity }} / 10</div>
                </div>
              </div>

              <!-- Strengths Section -->
              <div class="feedback-section" *ngIf="currentEvaluation.strengths.length > 0">
                <div class="section-heading tech-label">WHAT YOU DID WELL</div>
                <ul class="feedback-list">
                  <li *ngFor="let s of currentEvaluation.strengths">{{ s }}</li>
                </ul>
              </div>

              <!-- Areas to Improve -->
              <div class="feedback-section" *ngIf="currentEvaluation.weaknesses.length > 0">
                <div class="section-heading tech-label">AREAS TO IMPROVE</div>
                <ul class="feedback-list weaknesses-list">
                  <li *ngFor="let w of currentEvaluation.weaknesses">{{ w }}</li>
                </ul>
              </div>

            </div>

            <!-- Action: Next Adaptive Question or Finalize -->
            <div class="evaluation-actions">
              <button
                *ngIf="currentIndex + 1 < interviewData.totalQuestions"
                (click)="proceedToNextQuestion()"
                [disabled]="proceeding"
                class="btn btn-primary"
              >
                {{ proceeding ? 'ADAPTING NEXT QUESTION...' : 'PROCEED TO NEXT QUESTION →' }}
              </button>

              <button
                *ngIf="currentIndex + 1 >= interviewData.totalQuestions"
                (click)="finalizeInterview()"
                [disabled]="finalizing"
                class="btn btn-accent"
              >
                {{ finalizing ? 'COMPUTING FINAL REPORT...' : 'FINALIZE INTERVIEW & VIEW REPORT →' }}
              </button>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Completed Summary View -->
      <ng-template #completedTpl>
        <div class="completed-container editorial-panel">
          <div class="editorial-panel-header">
            <div>
              <span class="tech-label">ASSESSMENT COMPLETE</span>
              <h2 class="editorial-title">Interview Performance Dossier</h2>
            </div>
            <span class="badge badge-positive font-mono">STATUS: RECORDED</span>
          </div>

          <div class="final-score-cards">
            <div class="final-card editorial-panel">
              <span class="tech-label">OVERALL READINESS</span>
              <div class="final-score-val font-mono">{{ finalSummary?.overallScore != null ? finalSummary.overallScore + '%' : 'Not scored' }}</div>
            </div>
            <div class="final-card editorial-panel">
              <span class="tech-label">TECHNICAL DEPTH</span>
              <div class="final-score-val font-mono">{{ finalSummary?.technicalScore != null ? finalSummary.technicalScore + '%' : 'Not scored' }}</div>
            </div>
            <div class="final-card editorial-panel">
              <span class="tech-label">BEHAVIORAL RIGOR</span>
              <div class="final-score-val font-mono">{{ finalSummary?.hrScore != null ? finalSummary.hrScore + '%' : 'Not scored' }}</div>
            </div>
          </div>

          <div class="trajectory-section" *ngIf="finalSummary?.adaptiveNotes?.length">
            <div class="section-heading tech-label">ADAPTIVE TRAJECTORY LOG</div>
            <div class="trajectory-log font-mono">
              <div *ngFor="let note of finalSummary.adaptiveNotes" class="log-entry">
                &gt; {{ note }}
              </div>
            </div>
          </div>

          <div class="completed-actions">
            <a routerLink="/history" class="btn btn-outline">VIEW IN INTERVIEW HISTORY</a>
            <a routerLink="/dashboard" class="btn btn-primary">RETURN TO DASHBOARD &rarr;</a>
          </div>
        </div>
      </ng-template>
    </div>

    <ng-template #loadingTpl>
      <div class="editorial-panel" role="status">
        <p *ngIf="loadError; else loadingMessage" class="text-muted">
          {{ loadError }}
        </p>
        <ng-template #loadingMessage>
          <p class="text-muted">Loading interview session...</p>
        </ng-template>
        <a routerLink="/interview" class="btn btn-outline btn-sm">BACK TO INTERVIEW SETUP</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .interview-workstation {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .session-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
    }

    .session-meta,
    .session-status {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .session-badge {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
    }

    .session-divider {
      color: var(--border-color);
    }

    .timer-display {
      font-size: 13px;
      font-weight: 600;
      color: var(--accent-forest);
    }

    .timer-warning {
      color: var(--color-error);
    }

    .assessment-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 24px;
      min-height: 520px;
    }

    .question-pane,
    .answer-pane {
      display: flex;
      flex-direction: column;
    }

    .question-content {
      flex: 1;
      padding: 20px 0;
    }

    .question-text {
      font-size: 20px;
      font-weight: 600;
      line-height: 1.5;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .question-meta-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .meta-item {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 11px;
    }

    .meta-val {
      font-size: 11px;
      color: var(--text-main);
    }

    .note-val {
      color: var(--accent-forest);
    }

    .answer-input-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }

    .answer-textarea {
      flex: 1;
      min-height: 280px;
      font-size: 14px;
      line-height: 1.6;
      border-radius: var(--radius-xs);
    }

    .answer-actions,
    .evaluation-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 14px;
      border-top: 1px solid var(--border-color);
    }

    .evaluation-scroll-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding-right: 6px;
      margin-bottom: 16px;
    }

    .quality-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      background: var(--bg-paper);
      padding: 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xs);
    }

    .quality-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cell-val {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
    }

    .feedback-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .section-heading {
      font-size: 10px;
      letter-spacing: 0.08em;
    }

    .feedback-list {
      list-style-type: square;
      padding-left: 20px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-main);
    }

    .weaknesses-list li {
      color: var(--text-muted);
    }

    .completed-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .final-score-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }

    .final-card {
      padding: 20px;
      text-align: center;
    }

    .final-score-val {
      font-size: 36px;
      font-weight: 700;
      color: var(--accent-forest);
      margin-top: 8px;
    }

    .trajectory-section {
      margin-bottom: 24px;
    }

    .trajectory-log {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 14px;
      font-size: 12px;
      line-height: 1.8;
      color: var(--text-muted);
      border-radius: var(--radius-xs);
    }

    .completed-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
    }

    @media (max-width: 900px) {
      .assessment-grid {
        grid-template-columns: 1fr;
      }
      .final-score-cards {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class InterviewSessionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private interviewService = inject(InterviewService);
  private changeDetector = inject(ChangeDetectorRef);

  interviewId = '';
  interviewData: any = null;
  currentIndex = 0;
  currentQuestion: InterviewQuestion | null = null;
  currentEvaluation: AnswerEvaluation | null = null;
  adaptiveNote = '';

  answerText = '';
  loadError = '';
  actionError = '';
  submitting = false;
  proceeding = false;
  finalizing = false;
  isCompleted = false;
  finalSummary: any = null;

  timeRemainingSeconds = 900;
  timerInterval: any = null;

  ngOnInit() {
    this.interviewId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.interviewId) {
      this.router.navigate(['/interview']);
      return;
    }

    this.loadInterview();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadInterview() {
    this.loadError = '';
    this.interviewService.getInterviewById(this.interviewId).subscribe({
      next: (res) => {
        if (res.success && res.interview) {
          this.interviewData = res.interview;
          this.currentIndex = res.interview.currentQuestionIndex ?? 0;
          this.currentQuestion = res.interview.questions?.[this.currentIndex] || null;
          this.isCompleted = res.interview.status === 'completed';
          this.timeRemainingSeconds = res.interview.timeRemaining ?? res.interview.duration ?? 0;
          if (!this.isCompleted) this.startTimer();

          if (this.isCompleted) {
            this.finalSummary = {
              overallScore: res.interview.overallScore,
              technicalScore: res.interview.technicalScore,
              hrScore: res.interview.hrScore,
              adaptiveNotes: res.interview.adaptiveNotes,
            };
          }
        } else {
          this.loadError = 'Interview session was not found.';
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.loadError = err.error?.message || 'Unable to load interview session.';
        this.changeDetector.detectChanges();
      },
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeRemainingSeconds > 0 && !this.isCompleted) {
        this.timeRemainingSeconds--;
        this.changeDetector.detectChanges();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getWordCount(): number {
    return this.answerText.trim() ? this.answerText.trim().split(/\s+/).length : 0;
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

  submitCandidateAnswer() {
    if (!this.answerText.trim()) return;

    this.submitting = true;
    this.actionError = '';
    this.interviewService.submitAnswer(this.interviewId, this.answerText).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.currentEvaluation = res.evaluation;
        } else {
          this.actionError = 'The answer was not evaluated by the server.';
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        this.actionError =
          err.error?.message || 'Answer evaluation failed. Configure an AI provider and try again.';
        this.changeDetector.detectChanges();
      },
    });
  }

  proceedToNextQuestion() {
    this.proceeding = true;
    this.actionError = '';
    this.interviewService.nextQuestion(this.interviewId).subscribe({
      next: (res) => {
        this.proceeding = false;
        if (res.success) {
          this.currentIndex = res.currentQuestionIndex;
          this.currentQuestion = res.question;
          this.currentEvaluation = null;
          this.answerText = '';
          this.adaptiveNote = res.adaptiveNote;
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.proceeding = false;
        this.actionError = err.error?.message || 'Unable to load the next interview question.';
        this.changeDetector.detectChanges();
      },
    });
  }

  finalizeInterview() {
    this.finalizing = true;
    this.actionError = '';
    this.interviewService.completeInterview(this.interviewId).subscribe({
      next: (res) => {
        this.finalizing = false;
        if (res.success) {
          this.isCompleted = true;
          this.finalSummary = res.summary;
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.finalizing = false;
        this.actionError = err.error?.message || 'Unable to finalize this interview.';
        this.changeDetector.detectChanges();
      },
    });
  }
}
