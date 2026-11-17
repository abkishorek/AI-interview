import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InterviewSetupComponent } from './pages/interview/interview-setup.component';
import { InterviewSessionComponent } from './pages/interview/interview-session.component';
import { CodingLabComponent } from './pages/coding/coding-lab.component';
import { PerformanceComponent } from './pages/performance/performance.component';
import { HistoryComponent } from './pages/history/history.component';
import { RecommendationsComponent } from './pages/recommendations/recommendations.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'interview', component: InterviewSetupComponent },
      { path: 'interview/:id', component: InterviewSessionComponent },
      { path: 'coding', component: CodingLabComponent },
      { path: 'performance', component: PerformanceComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'recommendations', component: RecommendationsComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
