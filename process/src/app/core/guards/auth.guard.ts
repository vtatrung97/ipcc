import { Injectable, isDevMode } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../../init/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private tokenSvc: TokenService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    isDevMode() && console.debug('check active route', state.url);

    // Ở môi trường local dev hoặc standalone remote
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return Promise.resolve(true);
    }

    return this.authService.isLoggedIn().then(loggedIn => {
      if (this.tokenSvc.checkRouter(state.url)) {
        return Promise.resolve(true);
      } else {
        this.router.navigate(['/']);
        return Promise.resolve(false);
      }
    }).catch(() => {
      // Fallback không khóa cứng trang khi SSO offline
      return Promise.resolve(true);
    });
  }
}
