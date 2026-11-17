import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService, DashboardData } from '../../services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page" *ngIf="dashboard; else loadingTpl">
      <!-- Top Editorial Banner -->
      <div class="editorial-hero">
        <div class="hero-left">
          <div class="greeting-pre tech-label">CANDIDATE INTELLIGENCE // WORKSTATION</div>
          <h1 class="greeting-title">GOOD MORNING, {{ dashboard.user.name.split(' ')[0].toUpperCase() }}</h1>
          <p class="greeting-subtitle">
            Metrics below reflect your recorded interview and coding activity.
          </p>
        </div>

        <div class="hero-actions">
          <a routerLink="/interview" class="btn btn-primary">LAUNCH MOCK INTERVIEW &rarr;</a>
          <a routerLink="/coding" class="btn btn-outline">OPEN CODING LAB</a>
        </div>
      </div>

      <!-- Main Score & Metrics Section -->
      <div class="metrics-grid">
        <!-- Readiness Score Card -->
        <div class="readiness-block editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">ASSESSMENT READINESS</span>
            <span class="badge">RECORDED DATA</span>
          </div>

          <div class="readiness-main">
            <div class="readiness-number-box">
              <span class="score-large font-mono">{{ dashboard.readiness.overallScore ?? '—' }}</span>
              <span class="score-denom font-mono">/ 100</span>
            </div>
            
            <div class="readiness-bar-track">
              <div class="readiness-bar-fill" [style.width.%]="dashboard.readiness.overallScore ?? 0"></div>
            </div>
          </div>

          <div class="subscore-breakdown">
            <div class="subscore-row">
              <span class="subscore-label tech-label">TECHNICAL DEPTH</span>
              <span class="subscore-value font-mono">{{ dashboard.readiness.technicalScore ?? '—' }}</span>
            </div>
            <div class="subscore-row">
              <span class="subscore-label tech-label">CODING & ALGORITHMS</span>
              <span class="subscore-value font-mono">{{ dashboard.readiness.codingScore ?? '—' }}</span>
            </div>
            <div class="subscore-row">
              <span class="subscore-label tech-label">BEHAVIORAL & HR</span>
              <span class="subscore-value font-mono">{{ dashboard.readiness.hrScore ?? '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Statistics Column -->
        <div class="stats-column">
          <div class="stat-card editorial-panel">
            <span class="tech-label">INTERVIEWS COMPLETED</span>
            <div class="stat-val font-mono">{{ dashboard.stats.completedInterviews }}</div>
            <span class="stat-note font-mono">Adaptive simulations</span>
          </div>

          <div class="stat-card editorial-panel">
            <span class="tech-label">PROBLEMS SOLVED</span>
            <div class="stat-val font-mono">{{ dashboard.stats.problemsSolved }}</div>
            <span class="stat-note font-mono">Accepted on Judge0</span>
          </div>

          <div class="stat-card editorial-panel">
            <span class="tech-label">PROBLEMS ATTEMPTED</span>
            <div class="stat-val font-mono">{{ dashboard.stats.problemsAttempted }}</div>
            <span class="stat-note font-mono">Recorded submissions</span>
          </div>
        </div>
      </div>

      <!-- Adaptive Learning Feedback: Next Best Practice & Weak Topics -->
      <div class="two-column-grid">
        <!-- Next Best Practice Recommendation -->
        <div class="recommendation-block editorial-panel" *ngIf="dashboard.nextBestPractice as nextPractice; else noPracticeRecommendation">
          <div class="editorial-panel-header">
            <span class="tech-label">ADAPTIVE ENGINE // NEXT BEST PRACTICE</span>
            <span class="badge badge-orange">{{ nextPractice.difficulty }}</span>
          </div>

          <div class="rec-body">
            <div class="rec-title">{{ nextPractice.topic }}</div>
            <p class="rec-reason">{{ nextPractice.reason }}</p>

            <div class="rec-meta">
              <span class="tech-label">ESTIMATED TIME:</span>
              <span class="font-mono text-bold">{{ nextPractice.estimatedTime }}</span>
            </div>

            <div class="rec-action-wrapper">
              <a routerLink="/interview" class="btn btn-accent">
                {{ nextPractice.actionLabel }} &rarr;
              </a>
            </div>
          </div>
        </div>
        <ng-template #noPracticeRecommendation>
          <div class="recommendation-block editorial-panel">
            <div class="editorial-panel-header">
              <span class="tech-label">NEXT BEST PRACTICE</span>
            </div>
            <p class="text-muted">Complete and score an interview to get recommendations based on your results.</p>
          </div>
        </ng-template>

        <!-- Areas to Work On (Weak Topics) -->
        <div class="weak-topics-block editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">AREAS TO WORK ON (DIAGNOSTIC)</span>
            <a routerLink="/recommendations" class="view-all-link tech-label">VIEW ALL &rarr;</a>
          </div>

          <div class="weak-list">
            <div *ngIf="dashboard.weakTopics.length === 0" class="text-muted">
              No scored interview answers yet.
            </div>
            <div *ngFor="let item of dashboard.weakTopics.slice(0, 3); let i = index" class="weak-item">
              <div class="weak-index font-mono">0{{ i + 1 }}</div>
              <div class="weak-info">
                <div class="weak-name">{{ item.topic }}</div>
                <div class="weak-recs tech-label">{{ item.recommendations[0] || 'Targeted drill available' }}</div>
              </div>
              <div class="weak-score font-mono badge badge-warning">
                {{ item.score }}%
              </div>
            </div>
          </div>

          <div class="strong-topics-preview" *ngIf="dashboard.strongTopics.length > 0">
            <div class="strong-label tech-label">STRONG TOPICS:</div>
            <div class="strong-tags">
              <span *ngFor="let s of dashboard.strongTopics" class="badge badge-forest font-mono">
                {{ s.topic }} ({{ s.score }}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="activity-section editorial-panel">
        <div class="editorial-panel-header">
          <span class="tech-label">RECENT INTERVIEW ASSESSMENTS</span>
          <a routerLink="/history" class="view-all-link tech-label">VIEW FULL HISTORY &rarr;</a>
        </div>

        <div class="table-responsive">
          <table class="editorial-table">
            <thead>
              <tr>
                <th>SESSION ID</th>
                <th>TYPE</th>
                <th>DIFFICULTY</th>
                <th>SCORE</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let session of dashboard.recentInterviews">
                <td class="font-mono session-id">#{{ session.id.slice(-6).toUpperCase() }}</td>
                <td>{{ session.type | titlecase }}</td>
                <td><span class="badge">{{ session.difficulty | uppercase }}</span></td>
                <td class="font-mono text-bold">{{ session.score != null ? session.score + '%' : 'Not scored' }}</td>
                <td><span class="badge badge-positive">{{ session.status | uppercase }}</span></td>
                <td class="font-mono text-muted">{{ session.date | date: 'dd MMM yyyy' }}</td>
              </tr>
              <tr *ngIf="dashboard.recentInterviews.length === 0">
                <td colspan="6" class="text-center text-muted">No recent interviews recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-state editorial-panel">
        <div *ngIf="loadError; else loadingMessage" class="tech-label" role="alert">
          {{ loadError }}
          <button type="button" class="btn btn-outline btn-sm" (click)="loadDashboard()">RETRY</button>
        </div>
        <ng-template #loadingMessage>
          <div class="tech-label">[TELEMETRY] LOADING CANDIDATE INTELLIGENCE WORKSTATION...</div>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .editorial-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 24px;
      gap: 20px;
    }

    .greeting-pre {
      margin-bottom: 6px;
    }

    .greeting-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .greeting-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 650px;
      line-height: 1.5;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 24px;
    }

    .readiness-block {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .readiness-main {
      padding: 16px 0 24px;
    }

    .readiness-number-box {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 16px;
    }

    .score-large {
      font-size: 64px;
      font-weight: 700;
      line-height: 1;
      color: var(--accent-forest);
      letter-spacing: -0.04em;
    }

    .score-denom {
      font-size: 20px;
      color: var(--text-muted);
    }

    .readiness-bar-track {
      width: 100%;
      height: 8px;
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xs);
      overflow: hidden;
    }

    .readiness-bar-fill {
      height: 100%;
      background: var(--accent-forest);
      transition: width 400ms ease;
    }

    .subscore-breakdown {
      border-top: 1px solid var(--border-color);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .subscore-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .subscore-value {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-main);
    }

    .stats-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .stat-card {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .stat-val {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      margin: 4px 0 2px;
    }

    .stat-note {
      font-size: 11px;
      color: var(--text-muted);
    }

    .two-column-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .rec-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rec-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-main);
    }

    .rec-reason {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .rec-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      padding: 6px 0;
    }

    .weak-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 20px;
    }

    .weak-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 12px;
      border-bottom: 1px dashed var(--border-color);
    }

    .weak-index {
      font-size: 13px;
      color: var(--accent-orange);
      font-weight: 600;
    }

    .weak-info {
      flex: 1;
    }

    .weak-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
    }

    .weak-recs {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .strong-topics-preview {
      border-top: 1px solid var(--border-color);
      padding-top: 14px;
    }

    .strong-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .view-all-link {
      color: var(--accent-forest);
      text-decoration: none;
      font-weight: 600;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .loading-state {
      padding: 60px 24px;
      text-align: center;
    }

    .text-bold {
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .metrics-grid,
      .two-column-grid {
        grid-template-columns: 1fr;
      }
      .editorial-hero {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private changeDetector = inject(ChangeDetectorRef);

  dashboard: DashboardData | null = null;
  loadError = '';

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.analyticsService.getDashboard().subscribe({
      next: (res) => {
        if (res && res.success && res.dashboard) {
          this.dashboard = res.dashboard;
          this.loadError = '';
        } else {
          this.loadError = 'Dashboard data was not returned by the server.';
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('[Dashboard Load Error]', err);
        this.loadError = err.error?.message || 'Unable to load dashboard data.';
        this.changeDetector.detectChanges();
      },
    });
  }
}
