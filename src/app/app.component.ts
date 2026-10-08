import { Component } from '@angular/core';
import { Observable } from 'rxjs';
// ==========================================*Note thêm==========================================
// Inject MenuService để nạp và lắng nghe thay đổi danh sách menu từ LocalStorage
import { MenuService, MenuItem } from './services/menu.service';
// ============================================================================================

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ipcc-shell';

  // ==========================================*Note thêm==========================================
  // Danh sách menu được nạp động từ LocalStorage thông qua MenuService
  menus$: Observable<MenuItem[]> = this.menuService.menus$;

  constructor(private menuService: MenuService) {}
  // ============================================================================================
}

