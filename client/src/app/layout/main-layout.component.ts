import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar></app-sidebar>
      <div class="layout-main">
        <app-header></app-header>
        <main class="content-canvas">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-paper);
    }

    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }

    .content-canvas {
      flex: 1;
      padding: 32px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 900px) {
      .layout-wrapper {
        flex-direction: column;
      }
      .content-canvas {
        padding: 16px;
      }
    }
  `],
})
export class MainLayoutComponent {}
