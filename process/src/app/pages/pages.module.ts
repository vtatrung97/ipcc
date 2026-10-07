import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { TokenInterceptor } from '../token.interceptor';

@NgModule({
  declarations: [
    PagesComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PagesRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
})
export class PagesModule { }
