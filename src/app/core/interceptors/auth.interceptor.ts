import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, isDevMode, Optional } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { OAuthResourceServerErrorHandler, OAuthStorage } from 'angular-oauth2-oidc';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { SERVICES, KEYCLOAK } from '@env/environment';
import { CookieService } from 'ngx-cookie-service';
import { CbAuthService } from '@core/services/auth/cb-auth.service';
import { ToastService } from '@core/services/toast-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authSvc: AuthService,
    private authStorage: OAuthStorage,
    @Optional() private toastSvc?: ToastService,
    @Optional() private errorHandler?: OAuthResourceServerErrorHandler,
    @Optional() private cookieService?: CookieService,
    @Optional() private cbAuthService?: CbAuthService
  ) { }

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
      if ((service as any)?.authJwt && (service as any)?.url && url.startsWith((service as any).url)) {
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

    let token = this.authStorage?.getItem('access_token') || localStorage.getItem('access_token');
    let lang = this.cookieService?.get('lang') ? this.cookieService.get('lang') : 'vi';

    let headers = req.headers
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Language', lang);

    if (KEYCLOAK?.endpoint && !url.startsWith(KEYCLOAK.endpoint)) { // không inject 'x-ipcc2-realm' khi request tới keycloak
      headers = headers.set('x-ipcc2-realm', this.authSvc.tenant);
      if (groupId) {
        headers = headers.set('groupId', groupId);
      }
    }

    req = req.clone({ headers });

    /* pyc 1355: 21/08/2026: check them loi 401 de dieu huong logout khi het phien */
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // if (error.status === 401 || error.status === 403) {
        //   return from(this.authSvc.tryRefreshToken()).pipe(
        //     switchMap(refreshed => {
        //       if (!refreshed) {
        //         this.authSvc.logout();
        //       } else {
        //         this.errorHandler.handleError(error as any);
        //       }
        //       return throwError(error);
        //     }),
        //   );
        // }
        return throwError(error);
      })
    );
  }
}
