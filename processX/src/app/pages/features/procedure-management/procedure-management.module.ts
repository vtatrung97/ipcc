import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcedureManagementComponent } from './procedure-management.component';
import { ProcedureManagementRoutingModule } from './procedure-management-routing.module';

@NgModule({
  declarations: [
    ProcedureManagementComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ProcedureManagementRoutingModule
  ],
  exports: [
    ProcedureManagementComponent
  ]
})
export class ProcedureManagementModule { }
