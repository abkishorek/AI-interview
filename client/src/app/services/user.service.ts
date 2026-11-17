import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<{ success: boolean; profile: any }> {
    return this.http.get<{ success: boolean; profile: any }>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<{ success: boolean; message: string; profile: any }> {
    return this.http.put<{ success: boolean; message: string; profile: any }>(`${this.apiUrl}/profile`, data);
  }
}
