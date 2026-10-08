import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/process-list/process-list.module').then(m => m.ProcessListModule)
  },
  {
    path: 'create',
    loadChildren: () => import('./features/process-create/process-create.module').then(m => m.ProcessCreateModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
