import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { OAuthResourceServerErrorHandler, OAuthStorage } from 'angular-oauth2-oidc';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { SERVICES, KEYCLOAK } from '@env/environment';
import { CookieService } from 'ngx-cookie-service';
import { CbAuthService } from '@core/services/auth/cb-auth.service';
import { from } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authSvc: AuthService,
    private authStorage: OAuthStorage,
    private cookieService: CookieService,
    private cbAuthService: CbAuthService,
    private toastSvc?: any,
    private errorHandler?: OAuthResourceServerErrorHandler
  ) {}

  private shouldTokenBeInjectedIntoRequest(url: string): boolean {
    let found = false;

    if (KEYCLOAK?.endpoint && url.startsWith(KEYCLOAK.endpoint)) {
      found = true;
    }

    if (this.cbAuthService?.crossbar && url.startsWith(this.cbAuthService.crossbar)) {
      found = false;
      return found;
    }

    for (let service of Object.values(SERVICES || {})) {
      if ((service as any)?.authJwt && url.startsWith((service as any)?.url)) {
        found = true;
        break;
      }
    }

    return found;
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let url = req.url.toLowerCase();
    let groupId = localStorage.getItem('selectedServiceOwner');

    if (!this.shouldTokenBeInjectedIntoRequest(url)) {
      return next.handle(req);
    }

    if (isDevMode()) console.debug('Injecting auth token for:', url);

    const token = this.authStorage?.getItem('access_token') || localStorage.getItem('access_token');
    const lang = this.cookieService?.get('lang') || 'vi';

    let headers = req.headers
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Language', lang);

    if (KEYCLOAK?.endpoint && !url.startsWith(KEYCLOAK.endpoint)) {
      headers = headers.set('x-ipcc2-realm', this.authSvc.tenant);
      if (groupId) {
        headers = headers.set('groupId', groupId);
      }
    }

    req = req.clone({ headers });
    return next.handle(req);
  }
}
