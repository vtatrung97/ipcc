import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProcessManagementComponent } from './process-management.component';
import { ProcessManagementRoutingModule } from './process-management-routing.module';

@NgModule({
  declarations: [
    ProcessManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProcessManagementRoutingModule
  ],
  exports: [
    ProcessManagementComponent
  ]
})
export class ProcessManagementModule { }
