import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { environment } from '@env/environment';

// ==========================================Cấu hình Route gốc IPCC==========================================
// Tất cả các trang nội bộ của IPCC nằm trong PagesModule (dashboards, role-menu, customers, reports...)
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
  },

  // ==========================================*Note thêm==========================================
  // Phần cấu hình bổ sung bên dưới để nạp động Remote Module (Process) theo chuẩn Micro Frontend
  {
    path: 'process',
    redirectTo: 'processX'
  },
  {
    path: 'processX',
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
  exports: [RouterModule]
})
export class AppRoutingModule { }
