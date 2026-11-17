import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TestCaseResult {
  testIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  status: string;
  executionTime: number;
  memory: number;
  error?: string;
  isSample?: boolean;
}

export interface ExecutionResponse {
  passedTests: number;
  totalTests: number;
  status: string;
  runtime: string;
  memory: string;
  results: TestCaseResult[];
}

export interface AiCodeReview {
  correctness: number;
  codeQuality: number;
  efficiency: number;
  timeComplexity: string;
  spaceComplexity: string;
  observation: string;
  possibleImprovement: string;
}

export interface CodingProblem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  supportedLanguages: string[];
  starterCode: Record<string, string>;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  testCases: Array<{ input: string; expectedOutput: string; isSample?: boolean }>;
}

@Injectable({
  providedIn: 'root',
})
export class CodingService {
  private apiUrl = `${environment.apiUrl}/coding`;

  constructor(private http: HttpClient) {}

  getProblems(filters?: { topic?: string; difficulty?: string }): Observable<{ success: boolean; count: number; problems: any[] }> {
    let params = new HttpParams();
    if (filters?.topic) params = params.set('topic', filters.topic);
    if (filters?.difficulty) params = params.set('difficulty', filters.difficulty);

    return this.http.get<{ success: boolean; count: number; problems: any[] }>(`${this.apiUrl}/problems`, { params });
  }

  getProblem(idOrSlug: string): Observable<{ success: boolean; problem: CodingProblem }> {
    return this.http.get<{ success: boolean; problem: CodingProblem }>(`${this.apiUrl}/problems/${idOrSlug}`);
  }

  runCode(payload: { problemId: string; language: string; code: string }): Observable<{ success: boolean; execution: ExecutionResponse }> {
    return this.http.post<{ success: boolean; execution: ExecutionResponse }>(`${this.apiUrl}/run`, payload);
  }

  submitCode(payload: {
    problemId: string;
    language: string;
    code: string;
  }): Observable<{
    success: boolean;
    submissionId: string;
    execution: ExecutionResponse;
    aiFeedback: AiCodeReview | null;
    aiReviewError?: string;
  }> {
    return this.http.post<{
      success: boolean;
      submissionId: string;
      execution: ExecutionResponse;
      aiFeedback: AiCodeReview | null;
      aiReviewError?: string;
    }>(
      `${this.apiUrl}/submit`,
      payload
    );
  }

  getSubmissions(): Observable<{ success: boolean; submissions: any[] }> {
    return this.http.get<{ success: boolean; submissions: any[] }>(`${this.apiUrl}/submissions`);
  }
}
