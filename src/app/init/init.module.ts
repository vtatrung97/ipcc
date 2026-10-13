import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthService } from "@core/services/auth/auth.service";
import { TokenService } from "./token.service";
import { CbAuthService } from "@core/services/auth/cb-auth.service";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";

export function loadConfig(tokenSvc: TokenService, authService: AuthService, cbAuthSvc: CbAuthService) {
  return () => {
    return authService.isLoggedIn().then((loggedIn) => {
      if (loggedIn) {
        // Tạm thời comment các API chưa dùng/chưa có backend để tránh lỗi ERR_NAME_NOT_RESOLVED
        // const sources = [
        //   cbAuthSvc.maybeRequestKzToken(),
        //   tokenSvc.initAuthorizationList()
        // ];
        // return forkJoin(sources).pipe(map(() => (null))).toPromise();
        return Promise.resolve();
      } else {
        return Promise.resolve();
      }
    });
  };
}

@NgModule({
  providers: [
    TokenService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [TokenService, AuthService, CbAuthService],
      multi: true,
    }
  ]
})
export class InitModule {
}
