import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card editorial-panel">
        <div class="auth-header">
          <div class="auth-brand font-mono">INTERVIEWFORGE AI</div>
          <div class="auth-title">Candidate Authentication</div>
          <div class="auth-subtitle">Sign in to access your adaptive interview workstation and performance telemetry.</div>
        </div>

        <div *ngIf="errorMessage" class="auth-error font-mono">
          [!] {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">CANDIDATE EMAIL</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form-control"
              placeholder="e.g. candidate@interviewforge.ai"
            />
          </div>

          <div class="form-group">
            <label class="form-label">SECURITY PASSWORD</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="form-control"
              placeholder="••••••••••••"
            />
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="loading" class="btn btn-primary btn-block">
              {{ loading ? 'AUTHENTICATING...' : 'ACCESS WORKSTATION →' }}
            </button>
          </div>
        </form>

        <div class="demo-fill-box">
          <button (click)="fillDemoCredentials()" type="button" class="btn btn-outline btn-sm btn-block">
            FILL DEMO CREDENTIALS (KISHORE)
          </button>
        </div>

        <div class="auth-footer">
          <span class="tech-label">NEW CANDIDATE?</span>
          <a routerLink="/register" class="auth-link">REGISTER LAB PROFILE &rarr;</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-paper);
      padding: 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 36px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }

    .auth-header {
      margin-bottom: 28px;
    }

    .auth-brand {
      font-size: 12px;
      letter-spacing: 0.12em;
      color: var(--accent-forest);
      font-weight: 600;
      margin-bottom: 8px;
    }

    .auth-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .auth-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .auth-error {
      background-color: var(--color-error-light);
      border: 1px solid rgba(168, 68, 54, 0.3);
      color: var(--color-error);
      padding: 10px 12px;
      font-size: 12px;
      margin-bottom: 20px;
      border-radius: var(--radius-xs);
    }

    .btn-block {
      width: 100%;
    }

    .demo-fill-box {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px dashed var(--border-color);
    }

    .auth-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }

    .auth-link {
      color: var(--accent-forest);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-link:hover {
      text-decoration: underline;
    }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  fillDemoCredentials() {
    this.email = 'demo@interviewforge.ai';
    this.password = 'password123';
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please provide both email and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Authentication failed. Please verify credentials.';
      },
    });
  }
}
