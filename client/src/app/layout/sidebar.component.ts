import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-container">
      <div class="sidebar-header">
        <div class="brand-title font-mono">INTERVIEWFORGE AI</div>
        <div class="brand-subtitle tech-label">ADAPTIVE INTERVIEW LAB</div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label tech-label">CORE WORKSTATION</div>
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-indicator"></span>
          <span class="nav-text">Dashboard</span>
        </a>
        <a routerLink="/interview" routerLinkActive="active" class="nav-item">
          <span class="nav-indicator"></span>
          <span class="nav-text">Mock Interview</span>
        </a>
        <a routerLink="/coding" routerLinkActive="active" class="nav-item">
          <span class="nav-indicator"></span>
          <span class="nav-text">Coding Lab</span>
        </a>
        <a routerLink="/performance" routerLinkActive="active" class="nav-item">
          <span class="nav-indicator"></span>
          <span class="nav-text">Performance</span>
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-item">
          <span class="nav-indicator"></span>
          <span class="nav-text">Interview History</span>
        </a>
        <a routerLink="/recommendations" routerLinkActive="active" class="nav-item">
          <span class="nav-indicator"></span>
          <span class="nav-text">Recommendations</span>
        </a>

        <div class="nav-divider"></div>

        <div class="nav-section-label tech-label">ACCOUNT</div>
        <a routerLink="/profile" routerLinkActive="active" class="nav-item">
          <span class="nav-indicator"></span>
          <span class="nav-text">Candidate Profile</span>
        </a>
        <button (click)="logout()" class="nav-item nav-button">
          <span class="nav-indicator"></span>
          <span class="nav-text">Sign Out</span>
        </button>
      </nav>

      <div class="sidebar-footer" *ngIf="authService.currentUser() as user">
        <div class="user-meta">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-role tech-label">{{ user.targetRole || 'Full Stack Engineer' }}</div>
        </div>
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text font-mono">READY</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 250px;
      min-width: 250px;
      height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
    }

    .sidebar-header {
      padding: 24px 20px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .brand-title {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: var(--text-main);
    }

    .brand-subtitle {
      font-size: 10px;
      margin-top: 4px;
      color: var(--accent-forest);
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-section-label {
      padding: 8px 20px 6px;
      font-size: 10px;
      color: var(--text-subtle);
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: background-color 150ms ease, color 150ms ease;
      position: relative;
    }

    .nav-item:hover {
      background-color: var(--bg-surface-hover);
      color: var(--text-main);
    }

    .nav-item.active {
      color: var(--accent-forest);
      background-color: var(--accent-forest-light);
      font-weight: 600;
    }

    .nav-indicator {
      width: 4px;
      height: 4px;
      background-color: transparent;
      border-radius: 50%;
      margin-right: 12px;
    }

    .nav-item.active .nav-indicator {
      background-color: var(--accent-forest);
    }

    .nav-button {
      width: 100%;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
    }

    .nav-divider {
      height: 1px;
      background: var(--border-color);
      margin: 16px 20px;
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--border-color);
      background: var(--bg-paper);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
    }

    .user-role {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: var(--color-positive);
      border-radius: 50%;
    }

    .status-text {
      font-size: 10px;
      color: var(--color-positive);
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .sidebar-container {
        width: 100%;
        min-width: 0;
        height: auto;
        position: relative;
      }

      .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
      }

      .brand-subtitle {
        margin-top: 0;
      }

      .sidebar-nav {
        display: flex;
        gap: 4px;
        padding: 8px;
        overflow-x: auto;
      }

      .nav-section-label,
      .nav-divider,
      .sidebar-footer {
        display: none;
      }

      .nav-item {
        flex: 0 0 auto;
        padding: 9px 10px;
        white-space: nowrap;
      }

      .nav-indicator {
        margin-right: 8px;
      }
    }
  `],
})
export class SidebarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
