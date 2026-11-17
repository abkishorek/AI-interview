import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InterviewService } from '../../services/interview.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="history-page">
      <div class="editorial-panel-header">
        <div>
          <span class="tech-label">ASSESSMENT ARCHIVE</span>
          <h1 class="editorial-title">Interview Assessment History</h1>
          <div class="editorial-subtitle">Complete ledger of adaptive interview sessions, question transcripts, and AI evaluations.</div>
        </div>
        <a routerLink="/interview" class="btn btn-primary btn-sm">NEW SESSION &rarr;</a>
      </div>

      <!-- Main History Table -->
      <div class="editorial-panel">
        <div class="table-responsive">
          <table class="editorial-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>SESSION ID</th>
                <th>TYPE</th>
                <th>SCORE</th>
                <th>DIFFICULTY</th>
                <th>DURATION</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of historyList">
                <td class="font-mono">{{ item.date | date: 'dd MMM yyyy' }}</td>
                <td class="font-mono session-id">#{{ item.id.slice(-6).toUpperCase() }}</td>
                <td>{{ item.type }}</td>
                <td class="font-mono text-bold">{{ item.score != null ? item.score + '%' : 'Not scored' }}</td>
                <td>
                  <span class="badge" [ngClass]="getDifficultyBadge(item.difficulty)">
                    {{ item.difficulty }}
                  </span>
                </td>
                <td class="font-mono text-muted">{{ item.duration }}</td>
                <td>
                  <button (click)="viewSessionDetails(item.id)" class="btn btn-outline btn-sm">
                    INSPECT &rarr;
                  </button>
                </td>
              </tr>
              <tr *ngIf="historyList.length === 0 && !loading">
                <td colspan="7" class="text-center text-muted">No historical assessment sessions found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inspection Modal/Drawer -->
      <div class="modal-backdrop" *ngIf="selectedSession" (click)="closeDetails()">
        <div class="modal-card editorial-panel" (click)="$event.stopPropagation()">
          <div class="editorial-panel-header">
            <div>
              <span class="tech-label">SESSION DOSSIER // #{{ selectedSession.id.slice(-6).toUpperCase() }}</span>
              <h2 class="editorial-title">{{ selectedSession.targetRole }}</h2>
            </div>
            <button (click)="closeDetails()" class="btn btn-outline btn-sm font-mono">&times; CLOSE</button>
          </div>

          <div class="modal-scores-row">
            <div class="m-score-cell">
              <span class="tech-label">OVERALL READINESS</span>
              <div class="m-val font-mono">{{ selectedSession.overallScore != null ? selectedSession.overallScore + '%' : 'Not scored' }}</div>
            </div>
            <div class="m-score-cell">
              <span class="tech-label">TECHNICAL DEPTH</span>
              <div class="m-val font-mono">{{ selectedSession.technicalScore != null ? selectedSession.technicalScore + '%' : 'Not scored' }}</div>
            </div>
            <div class="m-score-cell">
              <span class="tech-label">BEHAVIORAL RIGOR</span>
              <div class="m-val font-mono">{{ selectedSession.hrScore != null ? selectedSession.hrScore + '%' : 'Not scored' }}</div>
            </div>
          </div>

          <div class="modal-questions-list">
            <div class="section-title tech-label">SESSION TRANSCRIPT & AI EVALUATIONS</div>

            <div *ngFor="let q of selectedSession.questions; let i = index" class="q-dossier-card">
              <div class="q-header">
                <span class="tech-label">QUESTION 0{{ i + 1 }} &bull; {{ q.topic }}</span>
                <span class="badge">{{ q.difficulty | uppercase }}</span>
              </div>
              <div class="q-body">{{ q.questionText }}</div>

              <!-- Answer finding -->
              <div *ngIf="getAnswerForQuestion(q.questionText) as ans" class="ans-dossier">
                <div class="ans-label tech-label">CANDIDATE RESPONSE:</div>
                <div class="ans-text font-sans">{{ ans.answer }}</div>

                <div class="ai-critique-grid">
                  <div class="critique-item">
                    <span class="tech-label">ACCURACY:</span>
                    <span class="font-mono">{{ ans.technicalAccuracy }}/10</span>
                  </div>
                  <div class="critique-item">
                    <span class="tech-label">RELEVANCE:</span>
                    <span class="font-mono">{{ ans.relevance }}/10</span>
                  </div>
                  <div class="critique-item">
                    <span class="tech-label">COMPLETENESS:</span>
                    <span class="font-mono">{{ ans.completeness }}/10</span>
                  </div>
                  <div class="critique-item">
                    <span class="tech-label">SCORE:</span>
                    <span class="font-mono text-bold">{{ ans.score }}%</span>
                  </div>
                </div>

                <div *ngIf="ans.strengths?.length" class="critique-list">
                  <span class="tech-label">WHAT WENT WELL:</span>
                  <ul>
                    <li *ngFor="let s of ans.strengths">{{ s }}</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .text-bold {
      font-weight: 600;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(18, 24, 21, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }

    .modal-card {
      width: 100%;
      max-width: 850px;
      max-height: 85vh;
      overflow-y: auto;
      background: var(--bg-surface);
    }

    .modal-scores-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }

    .m-score-cell {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 12px;
      border-radius: var(--radius-xs);
    }

    .m-val {
      font-size: 22px;
      font-weight: 700;
      color: var(--accent-forest);
      margin-top: 4px;
    }

    .modal-questions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .q-dossier-card {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 16px;
      border-radius: var(--radius-xs);
    }

    .q-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .q-body {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 14px;
    }

    .ans-dossier {
      border-top: 1px dashed var(--border-color);
      padding-top: 12px;
    }

    .ans-label {
      font-size: 10px;
      margin-bottom: 4px;
    }

    .ans-text {
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-main);
      margin-bottom: 12px;
    }

    .ai-critique-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: rgba(0, 0, 0, 0.02);
      padding: 8px 12px;
      margin-bottom: 12px;
    }

    .critique-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 12px;
    }

    .critique-list ul {
      list-style-type: square;
      padding-left: 20px;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    @media (max-width: 700px) {
      .modal-scores-row {
        grid-template-columns: 1fr;
      }
      .ai-critique-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `],
})
export class HistoryComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private changeDetector = inject(ChangeDetectorRef);

  historyList: any[] = [];
  loading = false;
  selectedSession: any = null;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.interviewService.getHistory().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.historyList = res.history;
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('[History Load Error]', err);
        this.changeDetector.detectChanges();
      },
    });
  }

  viewSessionDetails(id: string) {
    this.interviewService.getInterviewById(id).subscribe({
      next: (res) => {
        if (res.success && res.interview) {
          this.selectedSession = res.interview;
          this.changeDetector.detectChanges();
        }
      },
      error: (err) => console.error('[Load Session Details Error]', err),
    });
  }

  closeDetails() {
    this.selectedSession = null;
  }

  getAnswerForQuestion(questionText: string): any {
    if (!this.selectedSession?.answers) return null;
    return this.selectedSession.answers.find((a: any) => a.questionText === questionText) || null;
  }

  getDifficultyBadge(difficulty: string): string {
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
}
