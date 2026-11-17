import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  const authorizedRequest = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        req.url.includes('/auth/login')
      ) {
        return throwError(() => error);
      }

      const mayRestoreDemo =
        authService.isDemoSession() ||
        (!authService.currentUser() && !authService.token());

      if (!mayRestoreDemo) {
        authService.clearSession();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      return authService.loginDemo().pipe(
        switchMap((response) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${response.token}` },
            })
          )
        ),
        catchError((loginError: unknown) => {
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => loginError);
        })
      );
    })
  );
};
