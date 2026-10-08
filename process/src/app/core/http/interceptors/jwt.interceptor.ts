import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { TokenService } from '../../auth/token.service';
import { KEYCLOAK } from '@environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Bỏ qua các request đến Keycloak (OIDC discovery, token exchange, certs...)
    const isKeycloakUrl = request.url.includes('/.well-known/') ||
      request.url.includes('/protocol/openid-connect/') ||
      (KEYCLOAK?.endpoint && request.url.startsWith(KEYCLOAK.endpoint.replace(/\/+$/, '')));

    if (isKeycloakUrl) {
      return next.handle(request);
    }

    const setHeaders: { [name: string]: string } = {};

    // 2. Lấy Access Token thực tế từ Keycloak OAuthService hoặc Cookie / Storage
    const token = this.authService.getAccessToken() || TokenService.getAccessToken();

    // Chỉ đính kèm Authorization header nếu có token thật (bỏ mock token giả)
    if (token && token !== 'mock_ipcc2_jwt_token') {
      setHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 3. Đính kèm header x-ipcc2-realm với realm hiện tại
    const realm = this.authService.getRealm();
    if (realm) {
      setHeaders['x-ipcc2-realm'] = realm;
    }

    // 4. Clone request: Không ép withCredentials: true để tránh lỗi CORS Preflight (Access-Control-Allow-Credentials)
    const clonedRequest = request.clone({
      setHeaders
    });

    return next.handle(clonedRequest);
  }
}
