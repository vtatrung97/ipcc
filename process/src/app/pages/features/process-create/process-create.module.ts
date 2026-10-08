import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProcessCreateComponent } from './process-create.component';
import { ProcessCreateRoutingModule } from './process-create-routing.module';

@NgModule({
  declarations: [
    ProcessCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProcessCreateRoutingModule
  ],
  exports: [
    ProcessCreateComponent
  ]
})
export class ProcessCreateModule { }
