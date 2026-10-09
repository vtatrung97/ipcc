import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <div class="layout-wrapper">
      <router-outlet></router-outlet>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
