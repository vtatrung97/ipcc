import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
      <header style="background: #1e293b; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="margin: 0 0 10px 0;">IPCC Host Shell Application</h1>
        <nav style="display: flex; gap: 16px;">
          <a routerLink="/" style="color: #60a5fa; text-decoration: none; font-weight: bold;">Home</a>
          <a routerLink="/process" style="color: #34d399; text-decoration: none; font-weight: bold;">Load Remote Process Module</a>
        </nav>
      </header>
      <main style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  title = 'ipcc';
}
