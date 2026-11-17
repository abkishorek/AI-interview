import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InterviewService } from '../../services/interview.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-interview-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="setup-container editorial-panel">
      <div class="editorial-panel-header">
        <div>
          <span class="tech-label">ASSESSMENT WORKSTATION</span>
          <h2 class="editorial-title">Configure Mock Interview</h2>
          <div class="editorial-subtitle">Calibrate session parameters. The AI interviewer adapts dynamically based on your live responses.</div>
        </div>
        <span class="badge badge-forest font-mono">ADAPTIVE ENGINE V2</span>
      </div>

      <div class="setup-form">
        <div class="form-group">
          <label class="form-label">INTERVIEW TYPE</label>
          <div class="toggle-group">
            <button
              type="button"
              [class.active]="type === 'technical'"
              (click)="type = 'technical'"
              class="toggle-btn"
            >
              TECHNICAL IN-DEPTH
            </button>
            <button
              type="button"
              [class.active]="type === 'hr'"
              (click)="type = 'hr'"
              class="toggle-btn"
            >
              BEHAVIORAL / HR
            </button>
            <button
              type="button"
              [class.active]="type === 'mixed'"
              (click)="type = 'mixed'"
              class="toggle-btn"
            >
              MIXED RIGOR
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">BASELINE DIFFICULTY</label>
          <div class="toggle-group">
            <button
              type="button"
              [class.active]="difficulty === 'easy'"
              (click)="difficulty = 'easy'"
              class="toggle-btn"
            >
              EASY (FOUNDATIONAL)
            </button>
            <button
              type="button"
              [class.active]="difficulty === 'medium'"
              (click)="difficulty = 'medium'"
              class="toggle-btn"
            >
              MEDIUM (STANDARD SDE)
            </button>
            <button
              type="button"
              [class.active]="difficulty === 'hard'"
              (click)="difficulty = 'hard'"
              class="toggle-btn"
            >
              HARD (STAFF / ARCHITECTURE)
            </button>
          </div>
        </div>

        <div class="two-col-form" *ngIf="type !== 'hr'">
          <div class="form-group">
            <label class="form-label">FOCUS TOPIC</label>
            <select [(ngModel)]="topic" class="form-control font-mono">
              <option value="Authentication">Authentication & Security</option>
              <option value="DBMS Normalization">DBMS & SQL Normalization</option>
              <option value="Database Systems">Database Architecture & Indexing</option>
              <option value="Async JavaScript">Async JS & Event Loop</option>
              <option value="Computer Networks">Computer Networks & HTTP</option>
              <option value="System Design">System Design & Scalability</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">TOTAL QUESTIONS</label>
            <select [(ngModel)]="totalQuestions" class="form-control font-mono">
              <option [ngValue]="3">3 Questions (Rapid Drill - 10m)</option>
              <option [ngValue]="5">5 Questions (Standard Assessment - 15m)</option>
              <option [ngValue]="8">8 Questions (Exhaustive Lab - 25m)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">TARGET ROLE CONTEXT</label>
          <input
            type="text"
            [(ngModel)]="targetRole"
            class="form-control"
            placeholder="e.g. Senior Full Stack Engineer"
          />
        </div>

        <div class="setup-actions">
          <div *ngIf="startError" class="tc-error font-mono" role="alert">{{ startError }}</div>
          <button (click)="startSession()" [disabled]="starting" class="btn btn-primary btn-lg">
            {{ starting ? 'INITIALIZING AI SESSION...' : 'COMMENCE INTERVIEW SESSION →' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .setup-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 10px;
    }

    .toggle-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .toggle-btn {
      flex: 1;
      padding: 12px 14px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.05em;
      border: 1px solid var(--border-color);
      background: var(--bg-paper);
      color: var(--text-muted);
      cursor: pointer;
      border-radius: var(--radius-xs);
      transition: all 150ms ease;
    }

    .toggle-btn:hover {
      background: var(--bg-surface-hover);
      color: var(--text-main);
    }

    .toggle-btn.active {
      background: var(--accent-forest);
      color: #FFFFFF;
      border-color: var(--accent-forest);
      font-weight: 600;
    }

    .two-col-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .setup-actions {
      margin-top: 16px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    .btn-lg {
      padding: 12px 24px;
      font-size: 13px;
      width: 100%;
    }

    @media (max-width: 650px) {
      .two-col-form {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class InterviewSetupComponent {
  private interviewService = inject(InterviewService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);

  type = 'technical';
  difficulty = 'medium';
  topic = 'Authentication';
  totalQuestions = 5;
  targetRole = this.authService.currentUser()?.targetRole || 'Full Stack Engineer';
  starting = false;
  startError = '';

  startSession() {
    this.starting = true;
    this.startError = '';
    this.interviewService
      .startInterview({
        type: this.type,
        difficulty: this.difficulty,
        topic: this.topic,
        totalQuestions: this.totalQuestions,
        targetRole: this.targetRole,
      })
      .subscribe({
        next: (res) => {
          this.starting = false;
          if (res.success && res.interview) {
            this.router.navigate(['/interview', res.interview.id]);
          } else {
            this.startError = 'The server did not create an interview session.';
            this.changeDetector.detectChanges();
          }
        },
        error: (err) => {
          this.starting = false;
          this.startError = err.error?.message || 'Unable to start an interview. Check the server and AI provider configuration.';
          this.changeDetector.detectChanges();
        },
      });
  }
}
