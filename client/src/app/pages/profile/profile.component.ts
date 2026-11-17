import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page" *ngIf="profile; else loadingTpl">
      <div class="editorial-panel-header">
        <div>
          <span class="tech-label">CANDIDATE DOSSIER</span>
          <h1 class="editorial-title">Candidate Profile &amp; Calibration</h1>
          <div class="editorial-subtitle">
            Configure your technical background, target engineering position, and primary languages to calibrate adaptive interview heuristics.
          </div>
        </div>
        <span class="badge badge-forest font-mono">CALIBRATION ACTIVE</span>
      </div>

      <div *ngIf="successMessage" class="feedback-msg badge-positive font-mono">
        [✓] {{ successMessage }}
      </div>
      <div *ngIf="saveError" class="feedback-msg badge-error font-mono" role="alert">
        {{ saveError }}
      </div>

      <div class="profile-layout">
        <!-- Main Form -->
        <div class="profile-form editorial-panel">
          <form (ngSubmit)="saveProfile()">
            <div class="form-group">
              <label class="form-label">FULL CANDIDATE NAME</label>
              <input type="text" [(ngModel)]="profile.name" name="name" class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">REGISTERED EMAIL</label>
              <input type="email" [value]="profile.email" disabled class="form-control disabled-input" />
            </div>

            <div class="two-col-grid">
              <div class="form-group">
                <label class="form-label">TARGET ROLE</label>
                <select [(ngModel)]="profile.targetRole" name="targetRole" class="form-control">
                  <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Backend Systems Engineer">Backend Systems Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Software Engineer - Entry/Grad">Software Engineer - Entry/Grad</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                  <option value="Data Engineer / ML Infra">Data Engineer / ML Infra</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">EXPERIENCE LEVEL</label>
                <select [(ngModel)]="profile.experienceLevel" name="experienceLevel" class="form-control">
                  <option value="entry">Entry / Student (&lt; 1 yr)</option>
                  <option value="mid">Mid-Level Engineer (1-3 yrs)</option>
                  <option value="senior">Senior Engineer (4+ yrs)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">INTERESTED TECHNICAL FIELDS</label>
              <div class="tags-container">
                <label *ngFor="let field of availableFields" class="tag-checkbox">
                  <input
                    type="checkbox"
                    [checked]="hasInterest(field)"
                    (change)="toggleInterest(field)"
                  />
                  <span>{{ field }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">PRIMARY CODING LANGUAGES</label>
              <div class="tags-container">
                <label *ngFor="let lang of availableLanguages" class="tag-checkbox">
                  <input
                    type="checkbox"
                    [checked]="hasLanguage(lang)"
                    (change)="toggleLanguage(lang)"
                  />
                  <span class="font-mono">{{ lang }}</span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="saving" class="btn btn-primary">
                {{ saving ? 'SAVING CALIBRATION...' : 'SAVE PROFILE CALIBRATION →' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Sidebar Summary -->
        <div class="profile-stats-card editorial-panel">
          <div class="editorial-panel-header">
            <span class="tech-label">ASSESSMENT SUMMARY</span>
          </div>

          <div class="summary-metrics">
            <div class="s-metric">
              <span class="tech-label">INTERESTED FIELDS</span>
              <div class="s-val font-mono">{{ profile.interests?.length || 0 }}</div>
            </div>
            <div class="s-metric">
              <span class="tech-label">CODING LANGUAGES</span>
              <div class="s-val font-mono">{{ profile.languages?.length || 0 }}</div>
            </div>
            <div class="s-metric">
              <span class="tech-label">ACCOUNT CREATED</span>
              <div class="s-val font-mono text-muted">{{ profile.createdAt | date: 'dd MMM yyyy' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-panel editorial-panel">
        <div *ngIf="loadError; else loadingMessage" class="tech-label" role="alert">
          {{ loadError }}
          <button type="button" class="btn btn-outline btn-sm" (click)="loadProfile()">RETRY</button>
        </div>
        <ng-template #loadingMessage>
          <span class="tech-label">[TELEMETRY] RETRIEVING CANDIDATE PROFILE...</span>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feedback-msg {
      padding: 10px 14px;
      font-size: 12px;
      border: 1px solid rgba(61, 118, 88, 0.3);
      border-radius: var(--radius-xs);
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .disabled-input {
      background-color: var(--bg-paper);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 0;
    }

    .tag-checkbox {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xs);
      font-size: 12px;
      cursor: pointer;
    }

    .form-actions {
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .summary-metrics {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .s-metric {
      background: var(--bg-paper);
      border: 1px solid var(--border-color);
      padding: 12px;
      border-radius: var(--radius-xs);
    }

    .s-val {
      font-size: 18px;
      font-weight: 700;
      color: var(--accent-forest);
      margin-top: 4px;
    }

    .loading-panel {
      padding: 60px;
      text-align: center;
    }

    @media (max-width: 900px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
      .two-col-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private changeDetector = inject(ChangeDetectorRef);

  profile: any = null;
  saving = false;
  successMessage = '';
  saveError = '';
  loadError = '';

  availableFields = [
    'Full Stack Development',
    'System Design',
    'Database Systems',
    'Algorithms & Data Structures',
    'Computer Networks',
    'Operating Systems',
    'Cloud & Distributed Systems',
    'Security & Authentication',
  ];

  availableLanguages = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'C',
    'C#',
    'Go',
    'SQL',
  ];

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loadError = '';
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.profile) {
          this.profile = res.profile;
        } else {
          this.loadError = 'Profile data was not returned by the server.';
        }
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('[Load Profile Error]', err);
        this.loadError = err.error?.message || 'Unable to load your profile.';
        this.changeDetector.detectChanges();
      },
    });
  }

  hasInterest(field: string): boolean {
    return this.getInterestValues(field).some((value) => this.profile?.interests?.includes(value));
  }

  toggleInterest(field: string) {
    if (!this.profile.interests) this.profile.interests = [];
    const storedValue = this.profile.interests.find((value: string) =>
      this.getInterestValues(field).includes(value)
    );
    if (storedValue) {
      this.profile.interests.splice(this.profile.interests.indexOf(storedValue), 1);
    } else {
      this.profile.interests.push(field);
    }
  }

  private getInterestValues(field: string): string[] {
    return field === 'Algorithms & Data Structures'
      ? [field, 'Algorithms']
      : [field];
  }

  hasLanguage(lang: string): boolean {
    return this.profile?.languages?.includes(lang) || false;
  }

  toggleLanguage(lang: string) {
    if (!this.profile.languages) this.profile.languages = [];
    const index = this.profile.languages.indexOf(lang);
    if (index > -1) {
      this.profile.languages.splice(index, 1);
    } else {
      this.profile.languages.push(lang);
    }
  }

  saveProfile() {
    this.saving = true;
    this.successMessage = '';
    this.saveError = '';

    this.userService
      .updateProfile({
        name: this.profile.name,
        targetRole: this.profile.targetRole,
        experienceLevel: this.profile.experienceLevel,
        interests: this.profile.interests,
        languages: this.profile.languages,
      })
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.profile = res.profile;
            this.successMessage = 'Profile calibration updated successfully';
            this.authService.getMe().subscribe();
            setTimeout(() => {
              this.successMessage = '';
              this.changeDetector.detectChanges();
            }, 3500);
          } else {
            this.saveError = 'The profile update was not confirmed by the server.';
          }
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          console.error('[Save Profile Error]', err);
          this.saveError = err.error?.message || 'Could not update profile.';
          this.changeDetector.detectChanges();
        },
      });
  }
}
