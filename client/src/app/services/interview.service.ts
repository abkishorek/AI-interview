import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InterviewQuestion {
  questionText: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'technical' | 'hr' | 'coding_theory';
  isAnswered: boolean;
  answerId?: string;
}

export interface AnswerEvaluation {
  score: number;
  technicalAccuracy: number;
  relevance: number;
  completeness: number;
  clarity: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface StartInterviewResponse {
  success: boolean;
  interview: {
    id: string;
    type: string;
    difficulty: string;
    targetRole: string;
    duration: number;
    timeRemaining: number;
    totalQuestions: number;
    currentQuestionIndex: number;
    currentQuestion: InterviewQuestion;
    adaptiveNotes: string[];
  };
}

export interface SubmitAnswerResponse {
  success: boolean;
  answerId: string;
  evaluation: AnswerEvaluation;
}

export interface NextQuestionResponse {
  success: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  question: InterviewQuestion;
  adaptiveNote: string;
}

export interface CompleteInterviewResponse {
  success: boolean;
  summary: {
    id: string;
    type: string;
    difficulty: string;
    overallScore: number | null;
    technicalScore: number | null;
    hrScore: number | null;
    totalQuestionsAnswered: number;
    adaptiveNotes: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  private apiUrl = `${environment.apiUrl}/interviews`;

  constructor(private http: HttpClient) {}

  startInterview(payload: {
    type: string;
    difficulty: string;
    targetRole?: string;
    topic?: string;
    totalQuestions?: number;
  }): Observable<StartInterviewResponse> {
    return this.http.post<StartInterviewResponse>(`${this.apiUrl}/start`, payload);
  }

  submitAnswer(interviewId: string, answerText: string): Observable<SubmitAnswerResponse> {
    return this.http.post<SubmitAnswerResponse>(`${this.apiUrl}/${interviewId}/answer`, { answerText });
  }

  nextQuestion(interviewId: string): Observable<NextQuestionResponse> {
    return this.http.post<NextQuestionResponse>(`${this.apiUrl}/${interviewId}/next-question`, {});
  }

  completeInterview(interviewId: string): Observable<CompleteInterviewResponse> {
    return this.http.post<CompleteInterviewResponse>(`${this.apiUrl}/${interviewId}/complete`, {});
  }

  getHistory(): Observable<{ success: boolean; history: any[] }> {
    return this.http.get<{ success: boolean; history: any[] }>(`${this.apiUrl}/history`);
  }

  getInterviewById(id: string): Observable<{ success: boolean; interview: any }> {
    return this.http.get<{ success: boolean; interview: any }>(`${this.apiUrl}/${id}`);
  }
}
