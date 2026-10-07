import { Component } from '@angular/core';

@Component({
  selector: 'app-pages',
  template: `
    <div class="process-container">
      <h2>Process Remote Module Loaded!</h2>
      <p>Module này được load động từ Remote App (process) vào Host App (ipcc).</p>
    </div>
  `,
  styles: [`
    .process-container {
      padding: 24px;
      border: 2px dashed #6366f1;
      border-radius: 12px;
      background-color: #f0fdf4;
      color: #1e293b;
    }
  `]
})
export class PagesComponent {}
