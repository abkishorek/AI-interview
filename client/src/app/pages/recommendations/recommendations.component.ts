import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="recommendations-page" *ngIf="recommendationsData; else loadingTpl">
      <div class="editorial-panel-header">
        <div>
          <span class="tech-label">ADAPTIVE CURRICULUM</span>
          <h1 class="editorial-title">Personalized Practice Plan</h1>
          <div class="editorial-subtitle">
            Heuristic intelligence synthesizing your weak topics, historical scores, and target role into high-leverage practice drills.
          </div>
        </div>
        <span class="badge badge-forest font-mono">DYNAMICALLY TUNED</span>
      </div>

      <!-- Central Next Best Practice Feature -->
      <div *ngIf="recommendationsData.nextBestPractice as nextPractice; else noPracticeTpl" class="next-practice-card editorial-panel">
        <div class="editorial-panel-header">
          <span class="tech-label">NEXT BEST PRACTICE DIRECTIVE</span>
          <span class="badge badge-orange font-mono">{{ nextPractice.difficulty | uppercase }}</span>
        </div>

        <div class="np-body">
          <div class="np-left">
            <h2 class="np-topic">{{ nextPractice.topic }}</h2>
            <p class="np-reason">{{ nextPractice.reason }}</p>
            <div class="np-meta">
              <span class="tech-label">ESTIMATED TIME:</span>
              <span class="font-mono">{{ nextPractice.estimatedTime }}</span>
              <span class="meta-sep">|</span>
              <span class="tech-label">ASSESSMENT TYPE:</span>
              <span class="font-mono">ADAPTIVE DRILL</span>
            </div>
          </div>

          <div class="np-right">
            <a routerLink="/interview" class="btn btn-primary btn-lg">
              {{ nextPractice.actionLabel }} &rarr;
            </a>
          </div>
        </div>
      </div>
      <ng-template #noPracticeTpl>
        <div class="next-practice-card editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">NEXT BEST PRACTICE DIRECTIVE</span>
          </div>
          <p class="text-muted">Complete and score an interview to get recommendations based on your results.</p>
        </div>
      </ng-template>

      <!-- Areas To Work On (Weak Topic Detection) -->
      <div class="weak-topics-section editorial-panel">
        <div class="editorial-panel-header">
          <span class="tech-label">AREAS TO WORK ON (DIAGNOSTIC DETECTION)</span>
          <span class="tech-label">DELTA &amp; TARGETED RECOMMENDATION</span>
        </div>

        <div class="weak-topics-matrix">
          <p *ngIf="weakTopics.length === 0" class="text-muted">
            No scored answers yet. Recommendations will appear after an interview evaluation.
          </p>
          <div *ngFor="let topic of weakTopics; let i = index" class="topic-row">
            <div class="topic-num font-mono">0{{ i + 1 }}</div>

            <div class="topic-core">
              <div class="topic-title">{{ topic.topic }}</div>
              <div class="topic-progression font-mono">
                <ng-container *ngIf="topic.previousScore != null">{{ topic.previousScore }}% &rarr; </ng-container>
                <span class="score-highlight">{{ topic.score }}%</span>
              </div>
            </div>

            <div class="topic-recommendations">
              <div class="rec-header tech-label">RECOMMENDED:</div>
              <ul class="rec-bullets font-mono">
                <li *ngFor="let r of topic.recommendations">&rarr; {{ r }}</li>
              </ul>
            </div>

            <div class="topic-action">
              <a routerLink="/interview" class="btn btn-outline btn-sm">
                PRACTICE TOPIC &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Strong Topics Verification -->
      <div class="strong-topics-section editorial-panel" *ngIf="strongTopics.length > 0">
        <div class="editorial-panel-header">
          <span class="tech-label">STRONG TOPICS (MASTERY VERIFIED)</span>
          <span class="badge badge-positive font-mono">&gt;= 75% BENCHMARK</span>
        </div>

        <div class="strong-grid">
          <div *ngFor="let s of strongTopics" class="strong-card">
            <span class="strong-title">{{ s.topic }}</span>
            <span class="strong-score font-mono badge badge-forest">{{ s.score }}%</span>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-panel editorial-panel">
        <div *ngIf="loadError; else loadingMessage" class="tech-label" role="alert">
          {{ loadError }}
          <button type="button" class="btn btn-outline btn-sm" (click)="loadRecommendations()">RETRY</button>
        </div>
        <ng-template #loadingMessage>
          <span class="tech-label">[DIAGNOSTICS] LOADING RECORDED PERFORMANCE...</span>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [`
    .recommendations-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .next-practice-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
    }

    .np-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      padding: 12px 0 6px;
    }

    .np-topic {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .np-reason {
      font-size: 14px;
      color: var(--text-muted);
      margin: 6px 0 12px;
      max-width: 650px;
      line-height: 1.5;
    }

    .np-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .meta-sep {
      color: var(--border-color);
    }

    .btn-lg {
      padding: 14px 24px;
      font-size: 13px;
    }

    .weak-topics-matrix {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 6px;
    }

    .topic-row {
      display: grid;
      grid-template-columns: 40px 1.5fr 2fr 140px;
      align-items: center;
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px dashed var(--border-color);
    }

    .topic-num {
      font-size: 14px;
      color: var(--accent-orange);
      font-weight: 600;
    }

    .topic-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .topic-progression {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .score-highlight {
      color: var(--accent-forest);
      font-weight: 600;
    }

    .rec-header {
      font-size: 10px;
      margin-bottom: 2px;
    }

    .rec-bullets {
      list-style-type: none;
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .strong-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding-top: 8px;
    }

    .strong-card {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: var(--radius-xs);
    }

    .strong-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-main);
    }

    .loading-panel {
      padding: 60px;
      text-align: center;
    }

    @media (max-width: 900px) {
      .np-body {
        flex-direction: column;
        align-items: flex-start;
      }
      .topic-row {
        grid-template-columns: 1fr;
      }
      .strong-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class RecommendationsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private changeDetector = inject(ChangeDetectorRef);

  recommendationsData: any = null;
  weakTopics: any[] = [];
  strongTopics: any[] = [];
  loadError = '';

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.loadError = '';
    this.analyticsService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.dashboard) {
          this.recommendationsData = res.dashboard;
          this.weakTopics = res.dashboard.weakTopics || [];
          this.strongTopics = res.dashboard.strongTopics || [];
        } else {
          this.loadError = 'Recommendation data was not returned by the server.';
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('[Recommendations Load Error]', err);
        this.loadError = err.error?.message || 'Unable to load recommendations.';
        this.changeDetector.detectChanges();
      },
    });
  }
}
