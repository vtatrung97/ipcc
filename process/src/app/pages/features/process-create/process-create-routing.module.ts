import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessCreateComponent } from './process-create.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessCreateRoutingModule { }
