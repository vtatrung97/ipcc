import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'procedure-management',
    pathMatch: 'full'
  },
  {
    path: 'procedure-management',
    loadChildren: () => import('./features/procedure-management/procedure-management.module').then(m => m.ProcedureManagementModule)
  },
  {
    path: 'process-management',
    loadChildren: () => import('./features/process-management/process-management.module').then(m => m.ProcessManagementModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
