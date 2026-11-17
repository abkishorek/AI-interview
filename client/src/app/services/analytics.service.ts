import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    targetRole: string;
    experienceLevel: string;
  };
  readiness: {
    overallScore: number | null;
    maxScore: number;
    technicalScore: number | null;
    hrScore: number | null;
    codingScore: number | null;
  };
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    problemsSolved: number;
    problemsAttempted: number;
  };
  weakTopics: Array<{
    topic: string;
    score: number;
    previousScore: number | null;
    recommendations: string[];
  }>;
  strongTopics: Array<{
    topic: string;
    score: number;
  }>;
  nextBestPractice: {
    topic: string;
    reason: string;
    actionLabel: string;
    estimatedTime: string;
    difficulty: string;
    actionType: string;
  } | null;
  recentInterviews: Array<{
    id: string;
    type: string;
    difficulty: string;
    score: number | null;
    date: string;
    status: string;
  }>;
  recentSubmissions: Array<{
    id: string;
    problemTitle: string;
    language: string;
    status: string;
    passedTests: number;
    totalTests: number;
    runtime: string;
    date: string;
  }>;
}

export interface PerformanceData {
  progression: Array<{
    label: string;
    score: number;
    date: string;
    type: string;
    difficulty: string;
  }>;
  topics: Array<{
    topic: string;
    score: number;
    category: string;
  }>;
  coding: {
    attempted: number;
    solved: number;
    averageRuntime: string | null;
    averageScore: number | null;
    difficultyDistribution: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<{ success: boolean; dashboard: DashboardData }> {
    return this.http.get<{ success: boolean; dashboard: DashboardData }>(`${this.apiUrl}/dashboard`);
  }

  getPerformance(): Observable<{ success: boolean; performance: PerformanceData }> {
    return this.http.get<{ success: boolean; performance: PerformanceData }>(`${this.apiUrl}/performance`);
  }

  getTopics(): Observable<{ success: boolean; weakTopics: any[]; strongTopics: any[] }> {
    return this.http.get<{ success: boolean; weakTopics: any[]; strongTopics: any[] }>(`${this.apiUrl}/topics`);
  }
}
