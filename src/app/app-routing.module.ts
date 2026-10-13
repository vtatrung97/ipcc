import { NgModule } from '@angular/core';
import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { environment } from '@env/environment';
import { CustomReuseStrategy } from './route-reuse';
import { AuthGuard } from '@core/guards/auth.guard';

// ==========================================Cấu hình Route gốc IPCC==========================================
// Tất cả các trang nội bộ của IPCC nằm trong PagesModule (dashboards, role-menu, customers, reports...)
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
  },

  // ==========================================*Note thêm==========================================
  // Phần cấu hình bổ sung bên dưới để nạp động Remote Module (Process) theo chuẩn Micro Frontend
  {
    path: 'processX',
    canActivate: [AuthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.WEB_PROCESSX,
        exposedModule: './ProcessXModule'
      })
        .then(m => {
          console.log('[MFE] Nạp phân hệ ProcessX thành công:', m);
          return m.PagesModule;
        })
        .catch(err => {
          console.error('[MFE] Nạp phân hệ ProcessX thất bại:', err);
          throw err;
        })
  },

  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  ]
})
export class AppRoutingModule { }
