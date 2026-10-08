import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcessListComponent } from './process-list.component';
import { ProcessListRoutingModule } from './process-list-routing.module';

@NgModule({
  declarations: [
    ProcessListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ProcessListRoutingModule
  ],
  exports: [
    ProcessListComponent
  ]
})
export class ProcessListModule { }
