import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagesRoutingModule } from './pages-routing.module';
import { DashboardsComponent } from './dashboards/dashboards.component';
import { RoleMenuComponent } from './role-menu/role-menu.component';

@NgModule({
  declarations: [
    DashboardsComponent,
    RoleMenuComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
