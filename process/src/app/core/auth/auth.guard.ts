import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';
import { environment, AUTH_ENABLED } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    // 1. Tắt auth (env.js: AUTH_ENABLED = false) hoặc đã có token hợp lệ → cho vào thẳng
    if (!AUTH_ENABLED || this.authService.isLoggedIn()) {
      try {
        sessionStorage.removeItem('last_login_attempt');
      } catch {}
      return true;
    }

    // 2. Chặn vòng lặp: Nếu URL đang chứa param callback từ Keycloak (code, state)
    // nghĩa là vừa được Keycloak redirect về, chờ xử lý token, không gọi login() lặp lại
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      if (search.includes('code=') || search.includes('state=')) {
        console.warn('[AuthGuard] Đang nhận OAuth callback từ Keycloak, dừng redirect lặp lại.');
        return true;
      }
    }

    // 3. Chặn triệt để nháy màn hình: Nếu vừa gọi login() trong vòng 10 giây trước mà vẫn chưa có token
    // (do request /token bị lỗi CORS hoặc cấu hình Keycloak), DỪNG redirect ngay để xem console
    if (typeof window !== 'undefined') {
      try {
        const lastLogin = Number(sessionStorage.getItem('last_login_attempt') || '0');
        if (Date.now() - lastLogin < 10000) {
          console.warn('[AuthGuard] Đã thử đăng nhập Keycloak trong 10s qua nhưng chưa có token. Dừng redirect để tránh nháy màn hình.');
          return true;
        }
        sessionStorage.setItem('last_login_attempt', String(Date.now()));
      } catch {}
    }

    // 4. Kích hoạt chuyển hướng sang Keycloak để đăng nhập và lấy Access Token
    console.log('[AuthGuard] Chưa có token, chuyển hướng sang Keycloak Login...');
    this.authService.login();
    return false;
  }
}
