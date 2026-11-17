import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="header-container">
      <div class="header-left">
        <span class="session-path tech-label">INTERVIEWFORGE AI // LAB PLATFORM</span>
      </div>

      <div class="header-right">
        <div class="diagnostic-separator">|</div>

        <div class="diagnostic-item">
          <span class="diagnostic-label tech-label">ENGINE:</span>
          <span class="diagnostic-value font-mono badge badge-forest">ONLINE</span>
        </div>

        <div class="diagnostic-separator">|</div>

        <div class="action-item">
          <a routerLink="/interview" class="btn btn-primary btn-sm">
            START SESSION &rarr;
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-container {
      height: 56px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .session-path {
      font-size: 11px;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .diagnostic-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .diagnostic-label {
      font-size: 10px;
    }

    .diagnostic-value {
      font-size: 12px;
      font-weight: 500;
    }

    .diagnostic-separator {
      color: var(--border-color);
      font-size: 12px;
    }
  `],
})
export class HeaderComponent {
}
