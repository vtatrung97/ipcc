import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RoleListComponent } from './role-list.component';

const routes: Routes = [
  { path: '', component: RoleListComponent }
];

@NgModule({
  declarations: [RoleListComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
  exports: [RoleListComponent]
})
export class RoleListModule {}
