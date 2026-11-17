import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, PerformanceData } from '../../services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-page" *ngIf="perfData; else loadingTpl">
      <!-- Top Editorial Banner -->
      <div class="editorial-panel-header">
        <div>
          <span class="tech-label">LONGITUDINAL TELEMETRY</span>
          <h1 class="editorial-title">Candidate Performance Intelligence</h1>
          <div class="editorial-subtitle">
            Longitudinal progression across adaptive mock assessments, topic mastery matrices, and algorithmic coding challenges.
          </div>
        </div>
        <span class="badge badge-forest font-mono">RECORDED ACTIVITY</span>
      </div>

      <!-- Main Progression Chart & Score Log -->
      <div class="chart-and-log-grid">
        <!-- Thin line chart panel -->
        <div class="chart-panel editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">INTERVIEW SCORE TRAJECTORY (OVER TIME)</span>
          </div>

          <div class="canvas-wrapper">
            <canvas *ngIf="perfData.progression.length > 0; else noProgression" #progressionCanvas></canvas>
            <ng-template #noProgression>
              <div class="text-muted">No scored interviews recorded yet.</div>
            </ng-template>
          </div>
        </div>

        <!-- Compact Progression Log Table -->
        <div class="log-panel editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">SESSION HISTOGRAM</span>
          </div>

          <div class="session-list">
            <div *ngIf="perfData.progression.length === 0" class="text-muted">
              No completed scored interviews.
            </div>
            <div *ngFor="let p of perfData.progression" class="session-item">
              <div class="session-info">
                <span class="session-lbl font-mono">{{ p.label }}</span>
                <span class="session-meta tech-label">{{ p.type | uppercase }} &bull; {{ p.difficulty | uppercase }}</span>
              </div>
              <div class="session-score font-mono">{{ p.score }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Two-Column Breakdown: Topic Mastery vs Coding Stats -->
      <div class="two-col-grid">
        <!-- Topic Performance Mastery Bars -->
        <div class="topic-mastery-panel editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">TOPIC PROFICIENCY MATRIX</span>
            <span class="tech-label">MASTERY</span>
          </div>

          <div class="topics-list">
            <div *ngIf="perfData.topics.length === 0" class="text-muted">
              Topic scores appear after scored interview answers.
            </div>
            <div *ngFor="let t of perfData.topics" class="topic-bar-row">
              <div class="topic-meta">
                <span class="topic-name">{{ t.topic }}</span>
                <span class="topic-score font-mono">{{ t.score }}%</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  [style.width.%]="t.score"
                  [ngClass]="getTopicBarClass(t.score)"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coding Performance Metrics -->
        <div class="coding-stats-panel editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">ALGORITHMIC CODING TELEMETRY</span>
            <span class="badge badge-forest font-mono">RECORDED RESULTS</span>
          </div>

          <div class="coding-metrics-grid">
            <div class="c-stat-box">
              <span class="tech-label">PROBLEMS SOLVED</span>
              <div class="c-stat-val font-mono">{{ perfData.coding.solved }} / {{ perfData.coding.attempted }}</div>
            </div>
            <div class="c-stat-box">
              <span class="tech-label">AVG RUNTIME</span>
              <div class="c-stat-val font-mono">{{ perfData.coding.averageRuntime ?? '—' }}</div>
            </div>
            <div class="c-stat-box">
              <span class="tech-label">ALGORITHM SCORE</span>
              <div class="c-stat-val font-mono">{{ perfData.coding.averageScore != null ? perfData.coding.averageScore + '%' : '—' }}</div>
            </div>
          </div>

          <div class="difficulty-distribution-section">
            <span class="tech-label">DIFFICULTY DISTRIBUTION SOLVED</span>
            <div class="diff-bars">
              <div class="diff-item">
                <span class="diff-label tech-label">EASY</span>
                <span class="diff-count font-mono">{{ perfData.coding.difficultyDistribution.easy }}</span>
              </div>
              <div class="diff-item">
                <span class="diff-label tech-label">MEDIUM</span>
                <span class="diff-count font-mono">{{ perfData.coding.difficultyDistribution.medium }}</span>
              </div>
              <div class="diff-item">
                <span class="diff-label tech-label">HARD</span>
                <span class="diff-count font-mono">{{ perfData.coding.difficultyDistribution.hard }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-panel editorial-panel">
        <div *ngIf="loadError; else loadingMessage" class="tech-label" role="alert">
          {{ loadError }}
          <button type="button" class="btn btn-outline btn-sm" (click)="loadPerformance()">RETRY</button>
        </div>
        <ng-template #loadingMessage>
          <span class="tech-label">[TELEMETRY] RETRIEVING LONGITUDINAL ASSESSMENT DATA...</span>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [`
    .performance-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .chart-and-log-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    .canvas-wrapper {
      height: 240px;
      position: relative;
    }

    .session-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .session-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--border-color);
    }

    .session-lbl {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
    }

    .session-meta {
      display: block;
      font-size: 10px;
      color: var(--text-subtle);
      margin-top: 2px;
    }

    .session-score {
      font-size: 16px;
      font-weight: 600;
      color: var(--accent-forest);
    }

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .topics-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .topic-meta {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 6px;
    }

    .topic-name {
      font-weight: 500;
      color: var(--text-main);
    }

    .topic-score {
      font-weight: 600;
      color: var(--text-muted);
    }

    .bar-track {
      height: 6px;
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xs);
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      transition: width 400ms ease;
    }

    .bar-forest {
      background-color: var(--accent-forest);
    }
    .bar-orange {
      background-color: var(--accent-orange);
    }
    .bar-error {
      background-color: var(--color-error);
    }

    .coding-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .c-stat-box {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 12px;
      border-radius: var(--radius-xs);
    }

    .c-stat-val {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin-top: 4px;
    }

    .diff-bars {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 10px;
    }

    .diff-item {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: var(--radius-xs);
    }

    .diff-count {
      font-weight: 600;
      color: var(--accent-forest);
    }

    .loading-panel {
      padding: 60px;
      text-align: center;
    }

    @media (max-width: 900px) {
      .chart-and-log-grid,
      .two-col-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PerformanceComponent implements OnInit, AfterViewInit {
  @ViewChild('progressionCanvas') progressionCanvas!: ElementRef<HTMLCanvasElement>;

  private analyticsService = inject(AnalyticsService);
  private changeDetector = inject(ChangeDetectorRef);

  perfData: PerformanceData | null = null;
  loadError = '';
  chartInstance: Chart | null = null;

  ngOnInit() {
    this.loadPerformance();
  }

  loadPerformance() {
    this.loadError = '';
    this.analyticsService.getPerformance().subscribe({
      next: (res) => {
        if (res && res.success && res.performance) {
          this.perfData = res.performance;
          this.changeDetector.detectChanges();
          setTimeout(() => this.renderChart(), 50);
        } else {
          this.loadError = 'Performance data was not returned by the server.';
          this.changeDetector.detectChanges();
        }
      },
      error: (err) => {
        console.error('[Performance Load Error]', err);
        this.loadError = err.error?.message || 'Unable to load performance data.';
        this.changeDetector.detectChanges();
      },
    });
  }

  ngAfterViewInit() {
    if (this.perfData) {
      this.renderChart();
    }
  }

  renderChart() {
    if (!this.progressionCanvas?.nativeElement || !this.perfData) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    if (this.perfData.progression.length === 0) return;

    const labels = this.perfData.progression.map((p) => p.label);
    const dataPoints = this.perfData.progression.map((p) => p.score);

    this.chartInstance = new Chart(this.progressionCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Readiness Score',
            data: dataPoints,
            borderColor: '#164A3A',
            borderWidth: 2,
            backgroundColor: 'transparent',
            pointBackgroundColor: '#164A3A',
            pointBorderColor: '#FBFAF7',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            min: 50,
            max: 100,
            grid: {
              color: '#E2DFD6',
            },
            ticks: {
              font: {
                family: "'IBM Plex Mono', monospace",
                size: 11,
              },
              color: '#66635D',
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              font: {
                family: "'IBM Plex Mono', monospace",
                size: 11,
              },
              color: '#66635D',
            },
          },
        },
      },
    });
  }

  getTopicBarClass(score: number): string {
    if (score >= 75) return 'bar-forest';
    if (score >= 65) return 'bar-orange';
    return 'bar-error';
  }
}
