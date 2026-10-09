import { Component, OnInit } from '@angular/core';
import { MenuService, MenuItem } from '../../core/services/menu.service';

@Component({
  selector: 'app-role-menu',
  template: `
    <div class="role-menu-page">
      <div class="breadcrumb">
        <span>Trang chủ</span> &gt; <strong>Quản lý menu (Được lưu trong LocalStorage)</strong>
      </div>

      <div class="tab-header">
        <button class="tab-btn active">Danh sách menu</button>
        <button class="tab-btn" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '❌ Đóng form thêm' : '➕ Thêm menu mới' }}
        </button>
        <button class="tab-btn reset" (click)="onReset()">🔄 Khôi phục mặc định</button>
      </div>

      <!-- FORM THÊM MENU (Mô phỏng form thêm menu trong IPCC) -->
      <div class="add-menu-card" *ngIf="showAddForm">
        <h4>📝 Thêm Menu Mới (Tự động cập nhật Sidebar & LocalStorage)</h4>
        
        <div class="presets-bar">
          <span class="preset-label">💡 Chọn mẫu nhanh:</span>
          <button type="button" class="btn-preset" (click)="setPreset('Báo cáo quy trình', 'proc-reports', '/process', '📊')">
            ⚡ Báo cáo quy trình (Remote)
          </button>
          <button type="button" class="btn-preset" (click)="setPreset('Soạn thảo quy trình', 'proc-editor', '/process/create', '✍️')">
            ⚡ Soạn thảo quy trình (Remote)
          </button>
          <button type="button" class="btn-preset" (click)="setPreset('Quản lý báo cáo IPCC', 'ipcc2-stats', '/dashboards', '📈')">
            🏢 Báo cáo IPCC (Host)
          </button>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>Tên menu tiếng Việt *</label>
            <input type="text" [(ngModel)]="newMenu.name" placeholder="VD: Báo cáo quy trình" />
          </div>
          <div class="field">
            <label>Mã menu *</label>
            <input type="text" [(ngModel)]="newMenu.code" placeholder="VD: proc-report" />
          </div>
          <div class="field">
            <label>Đường dẫn Url *</label>
            <input type="text" [(ngModel)]="newMenu.url" placeholder="VD: /process hoặc /process/create" />
          </div>
          <div class="field">
            <label>Biểu tượng (Icon / Emoji)</label>
            <input type="text" [(ngModel)]="newMenu.icon" placeholder="VD: 📈, 🚀, 📋" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" (click)="onSaveMenu()">💾 Lưu vào LocalStorage</button>
          <button class="btn-cancel" (click)="showAddForm = false">Hủy</button>
        </div>
      </div>

      <!-- DANH SÁCH MENU HIỆN TẠI -->
      <div class="table-card">
        <div class="table-header">
          <span class="table-title">Danh sách menu hiện có trên Sidebar ({{ (menus$ | async)?.length }} menu)</span>
          <button class="btn-toggle-add" (click)="showAddForm = true" *ngIf="!showAddForm">➕ Thêm menu</button>
        </div>
        <table class="menu-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Icon</th>
              <th>Tên menu</th>
              <th>Mã menu</th>
              <th>Url điều hướng</th>
              <th>Loại module</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of (menus$ | async); let i = index">
              <td>{{ i + 1 }}</td>
              <td class="icon-cell">{{ item.icon || '📌' }}</td>
              <td><strong>{{ item.name }}</strong></td>
              <td><code>{{ item.code }}</code></td>
              <td>
                <span class="url-badge" [class.remote-badge]="item.isRemote">{{ item.url }}</span>
              </td>
              <td>
                <span class="tag" [class.tag-remote]="item.isRemote">
                  {{ item.isRemote ? '⚡ Remote MicroFE' : '🏢 Host IPCC' }}
                </span>
              </td>
              <td>
                <button class="btn-del" (click)="onDelete(item.code)" title="Xóa menu">🗑️ Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .role-menu-page {
      padding: 4px;
    }
    .breadcrumb {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .tab-header {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 20px;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
    }
    .tab-btn.active {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      margin-bottom: -2px;
    }
    .tab-btn.reset {
      margin-left: auto;
      color: #94a3b8;
    }
    .tab-btn.reset:hover {
      color: #ef4444;
    }
    .add-menu-card {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      animation: fadeIn 0.2s ease;
    }
    .add-menu-card h4 {
      margin: 0 0 16px 0;
      color: #1e40af;
      font-size: 16px;
    }
    .presets-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .preset-label {
      font-size: 12px;
      color: #475569;
      font-weight: 600;
    }
    .btn-preset {
      background: white;
      border: 1px dashed #93c5fd;
      color: #1d4ed8;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-preset:hover {
      background: #dbeafe;
      border-color: #2563eb;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    .field label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    .field input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 13px;
      box-sizing: border-box;
      background: white;
    }
    .field input:focus {
      outline: none;
      border-color: #2563eb;
    }
    .form-actions {
      display: flex;
      gap: 10px;
    }
    .btn-save {
      background: #2563eb;
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save:hover {
      background: #1d4ed8;
    }
    .btn-cancel {
      background: white;
      border: 1px solid #cbd5e1;
      padding: 9px 16px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }
    .table-card {
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .table-header {
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      background: #fafafa;
    }
    .table-title {
      font-weight: 600;
      color: #334155;
      font-size: 14px;
    }
    .btn-toggle-add {
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .menu-table {
      width: 100%;
      border-collapse: collapse;
    }
    .menu-table th {
      background: #f8fafc;
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }
    .menu-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }
    .icon-cell {
      font-size: 16px;
    }
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      color: #334155;
    }
    .url-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 12px;
    }
    .url-badge.remote-badge {
      background: #dbeafe;
      color: #1d4ed8;
      font-weight: 600;
    }
    .tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      background: #f1f5f9;
      color: #64748b;
    }
    .tag-remote {
      background: #fef3c7;
      color: #92400e;
    }
    .btn-del {
      background: none;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-del:hover {
      background: #fee2e2;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RoleMenuComponent implements OnInit {
  menus$ = this.menuService.menus$;
  showAddForm = false;

  newMenu: MenuItem = {
    name: '',
    code: '',
    url: '',
    icon: '🚀'
  };

  constructor(private menuService: MenuService) { }

  ngOnInit(): void { }

  setPreset(name: string, code: string, url: string, icon: string): void {
    this.newMenu = { name, code, url, icon };
  }

  onSaveMenu(): void {
    if (!this.newMenu.name || !this.newMenu.code || !this.newMenu.url) {
      alert('Vui lòng nhập đầy đủ: Tên menu, Mã menu và Đường dẫn Url!');
      return;
    }

    this.menuService.addMenu(this.newMenu);

    alert(`Đã lưu menu "${this.newMenu.name}" vào LocalStorage thành công! Thanh menu bên trái đã được cập nhật.`);

    // Reset form
    this.newMenu = { name: '', code: '', url: '', icon: '🚀' };
    this.showAddForm = false;
  }

  onDelete(code: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa menu [${code}] khỏi LocalStorage?`)) {
      this.menuService.deleteMenu(code);
    }
  }

  onReset(): void {
    if (confirm('Khôi phục danh sách menu về cấu hình mặc định?')) {
      this.menuService.resetDefault();
    }
  }
}
