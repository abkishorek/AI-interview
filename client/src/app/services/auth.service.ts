import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  experienceLevel: string;
  interests: string[];
  languages: string[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  constructor(private http: HttpClient) {
    // If no session exists, auto-authenticate with demo user for seamless instant evaluation
    if (!this.token()) {
      this.autoLoginDemo();
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('forge_token');
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('forge_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  autoLoginDemo(): void {
    this.loginDemo().pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  loginDemo(): Observable<AuthResponse> {
    const demoPayload = {
      email: 'demo@interviewforge.ai',
      password: 'password123',
    };

    return this.login(demoPayload);
  }

  isDemoSession(): boolean {
    return this.currentUser()?.email === 'demo@interviewforge.ai';
  }

  clearSession(): void {
    this.logout();
  }

  register(userData: Partial<User> & { password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  getMe(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.currentUser.set(res.user);
          localStorage.setItem('forge_user', JSON.stringify(res.user));
        }
      })
    );
  }

  setSession(token: string, user: User) {
    localStorage.setItem('forge_token', token);
    localStorage.setItem('forge_user', JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('forge_token');
    localStorage.removeItem('forge_user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return true; // Auto-auth enabled to ensure visitors can immediately evaluate all tools
  }
}
