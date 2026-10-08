import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { AUTH_ENABLED, environment } from '@environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('[ErrorInterceptor] 401 Unauthorized từ API:', error.url);
          // Chỉ chuyển hướng đăng nhập Keycloak nếu ở Production thực sự và bật Auth
          if (AUTH_ENABLED && environment.production) {
            this.authService.login();
          }
          // Tuyệt đối KHÔNG router.navigate(['/login']) vì hệ thống dùng Keycloak (không có trang /login),
          // tránh bị Angular router rơi vào wildcard '**' rồi văng sang /not-found.
        } else if (error.status === 403) {
          console.warn('[ErrorInterceptor] 403 Forbidden từ API:', error.url);
        } else if (error.status >= 500) {
          console.error('[ErrorInterceptor] 500 Server Error:', error.message);
        }

        return throwError(() => error);
      })
    );
  }
}
