import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card editorial-panel">
        <div class="auth-header">
          <div class="auth-brand font-mono">INTERVIEWFORGE AI</div>
          <div class="auth-title">Candidate Onboarding</div>
          <div class="auth-subtitle">Configure your technical profile to calibrate adaptive mock interviews.</div>
        </div>

        <div *ngIf="errorMessage" class="auth-error font-mono">
          [!] {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">FULL NAME</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              class="form-control"
              placeholder="e.g. Alex Chen"
            />
          </div>

          <div class="form-group">
            <label class="form-label">EMAIL ADDRESS</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form-control"
              placeholder="alex@university.edu"
            />
          </div>

          <div class="form-group">
            <label class="form-label">PASSWORD (MIN 6 CHARACTERS)</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="6"
              class="form-control"
              placeholder="••••••••••••"
            />
          </div>

          <div class="form-group">
            <label class="form-label">TARGET ROLE</label>
            <select [(ngModel)]="targetRole" name="targetRole" class="form-control">
              <option value="Full Stack Engineer">Full Stack Engineer</option>
              <option value="Backend Systems Engineer">Backend Systems Engineer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Software Engineer - Entry/Grad">Software Engineer - Entry/Grad</option>
              <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">EXPERIENCE LEVEL</label>
            <div class="radio-row">
              <label class="radio-option">
                <input type="radio" [(ngModel)]="experienceLevel" name="experienceLevel" value="entry" />
                <span>Entry / Student</span>
              </label>
              <label class="radio-option">
                <input type="radio" [(ngModel)]="experienceLevel" name="experienceLevel" value="mid" />
                <span>Mid-Level (1-3 yrs)</span>
              </label>
              <label class="radio-option">
                <input type="radio" [(ngModel)]="experienceLevel" name="experienceLevel" value="senior" />
                <span>Senior (4+ yrs)</span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="loading" class="btn btn-primary btn-block">
              {{ loading ? 'CREATING PROFILE...' : 'INITIALIZE LAB ACCOUNT →' }}
            </button>
          </div>
        </form>

        <div class="auth-footer">
          <span class="tech-label">ALREADY REGISTERED?</span>
          <a routerLink="/login" class="auth-link">ACCESS SIGN IN &rarr;</a>
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
      padding: 32px 16px;
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 36px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }

    .auth-header {
      margin-bottom: 24px;
    }

    .auth-brand {
      font-size: 12px;
      letter-spacing: 0.12em;
      color: var(--accent-forest);
      font-weight: 600;
      margin-bottom: 6px;
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

    .radio-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      cursor: pointer;
      color: var(--text-main);
    }

    .btn-block {
      width: 100%;
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
  `],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  targetRole = 'Full Stack Engineer';
  experienceLevel = 'entry';
  loading = false;
  errorMessage = '';

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please complete all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        targetRole: this.targetRole,
        experienceLevel: this.experienceLevel,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        },
      });
  }
}
