import { Injectable, isDevMode } from "@angular/core";
import { Router } from "@angular/router";
import { interval, Observable, Subscriber } from "rxjs";
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { ResponseEnvelope } from "@core/models/response.model";
import { SERVICES } from "@env/environment";
import { OAuthService } from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})
export class CbAuthService {
  private _kzToken: any;
  private _kzRefreshToken: any;
  private _kzZone: any;
  private _kzSoftphoneRealm: string = '';
  private _impersonatedAid: any;

  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(
    private router: Router,
    private http: HttpClient,
    private authSvc: AuthService,
    private oauthSvc: OAuthService
  ) {
    this.init();
  }

  private init() {
    if (!this.authSvc.isAuthenticated()) return;

    try {
      const cachedKzZone = localStorage.getItem('kz_zone');
      const cachedKzToken = localStorage.getItem('kz_token');
      const cachedKzRefreshToken = localStorage.getItem('kz_refresh_token');
      const cachedKzSoftphoneRealm = localStorage.getItem('kz_softphone_realm');
      if (cachedKzZone && cachedKzToken && cachedKzRefreshToken && cachedKzSoftphoneRealm && !this.jwtHelper.isTokenExpired(cachedKzToken)
          && this.authSvc.kzUserId == this.jwtHelper.decodeToken(cachedKzToken)?.owner_id) {
        this._kzToken = cachedKzToken;
        this._kzRefreshToken = cachedKzRefreshToken;
        this._kzZone = JSON.parse(cachedKzZone);
        this._kzSoftphoneRealm = cachedKzSoftphoneRealm;
        isDevMode() && console.log('[CbAuthService] initialized', this);
      } else {
        localStorage.removeItem('kz_zone');
        localStorage.removeItem('kz_token');
        localStorage.removeItem('kz_refresh_token');
        localStorage.removeItem('kz_softphone_realm');
      }
    } catch (e) {
      console.log('[CbAuthService] Fail to decoding cached kz token', e);
    }
  }

  public maybeRequestKzToken(forceRequest?: boolean): Observable<string> {
    return new Observable((observer: Subscriber<string>) => {
      const onSuccess = (token: string) => {
        observer.next(token);
        observer.complete();
      };
      const onError = (error: any) => {
        console.log('[CbAuthService] Request kz token failed', error);
        observer.error(error);
        observer.complete();
      };

      if (forceRequest || !this._kzToken || this.jwtHelper.isTokenExpired(this._kzToken)) {
        const url = `${SERVICES?.ACCOUNT_API_URL || '/api/account'}/api/v1/realms/${this.authSvc.realmName}/users/${this.authSvc.userId}/zone/${this.authSvc.zoneAlias}/kz-token`;
        this.http.get<ResponseEnvelope<any>>(url).subscribe({
          next: (res: any) => {
            if (res.status == 'success' && res.data) {
              this._kzZone = res.data.kzZone;
              this._kzToken = res.data.kzToken;
              this._kzSoftphoneRealm = res.data.kzSoftphoneRealm;
              localStorage.setItem('kz_token', this._kzToken);
              localStorage.setItem('kz_zone', JSON.stringify(this._kzZone));
              localStorage.setItem('kz_softphone_realm', this._kzSoftphoneRealm);
              onSuccess(this._kzToken);
            } else {
              onError(res);
            }
          },
          error: (e) => {
            onError(e);
          }
        });
      } else {
        onSuccess(this._kzToken);
      }
    });
  }

  public logout() {
    this.oauthSvc.logOut({ id_token_hint: localStorage.getItem('id_token_hint') || undefined });
  }

  get kzToken(): string {
    return this._kzToken;
  }

  get kzRefreshToken(): string {
    return this._kzRefreshToken;
  }

  get softphoneRealm(): string {
    return this._kzSoftphoneRealm;
  }

  get crossbar(): string | undefined {
    return this._kzZone ? this._kzZone.crossbarPublic : undefined;
  }

  get proxies(): string[] | undefined {
    return this._kzZone?.wssProxiesPublic ? this._kzZone.wssProxiesPublic.split(',') : undefined;
  }

  get accountURI(): string {
    const aid = this._impersonatedAid ? this._impersonatedAid : this.authSvc.kzAccountId;
    return `${this.crossbar}/v2/accounts/${aid}`;
  }
}
