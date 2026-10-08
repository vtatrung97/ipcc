import { Component } from '@angular/core';

@Component({
  selector: 'app-process-list',
  template: `
    <div class="process-container">
      <div class="process-header">
        <div>
          <h2>⚡ Quản Lý Quy Trình (Process Module - Remote App)</h2>
          <p class="subtitle">Đường dẫn hiện tại: <code>/process</code> — Module này được lazy load động từ Remote App (Port 4201)</p>
        </div>
        <a routerLink="/process/create" class="btn-primary">➕ Tạo mới quy trình</a>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="label">Tổng số quy trình</span>
          <span class="value">12</span>
        </div>
        <div class="stat-card active">
          <span class="label">Đang kích hoạt</span>
          <span class="value">9</span>
        </div>
        <div class="stat-card draft">
          <span class="label">Bản nháp</span>
          <span class="value">3</span>
        </div>
      </div>

      <table class="process-table">
        <thead>
          <tr>
            <th>Mã quy trình</th>
            <th>Tên quy trình</th>
            <th>Trạng thái</th>
            <th>Cập nhật lần cuối</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of processes">
            <td><strong>{{ item.code }}</strong></td>
            <td>{{ item.name }}</td>
            <td>
              <span class="badge" [class.badge-active]="item.status === 'Đang hoạt động'">
                {{ item.status }}
              </span>
            </td>
            <td>{{ item.updatedAt }}</td>
            <td>
              <a [routerLink]="['/process/create']" class="action-link">Chi tiết</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .process-container {
      padding: 24px;
      border: 2px dashed #6366f1;
      border-radius: 12px;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .process-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h2 {
      margin: 0 0 6px 0;
      color: #312e81;
      font-size: 20px;
    }
    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 13px;
    }
    code {
      background: #e0e7ff;
      color: #3730a3;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .btn-primary {
      background: #4f46e5;
      color: white;
      text-decoration: none;
      padding: 9px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
    }
    .btn-primary:hover {
      background: #4338ca;
    }
    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 14px 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      flex: 1;
    }
    .stat-card .label {
      display: block;
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .stat-card .value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
    .process-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .process-table th {
      background: #f1f5f9;
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      color: #475569;
    }
    .process-table td {
      padding: 12px 16px;
      border-top: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #f1f5f9;
      color: #64748b;
    }
    .badge-active {
      background: #dcfce7;
      color: #166534;
    }
    .action-link {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class ProcessListComponent {
  processes = [
    { code: 'PROC-001', name: 'Quy trình tiếp nhận cuộc gọi VIP IPCC', status: 'Đang hoạt động', updatedAt: '08/10/2026' },
    { code: 'PROC-002', name: 'Tự động tạo Ticket từ tin nhắn Fanpage', status: 'Đang hoạt động', updatedAt: '07/10/2026' },
    { code: 'PROC-003', name: 'Xử lý khiếu nại cước gói doanh nghiệp', status: 'Đang hoạt động', updatedAt: '05/10/2026' },
    { code: 'PROC-004', name: 'Chấm điểm chất lượng điện thoại viên AI', status: 'Bản nháp', updatedAt: '02/10/2026' },
  ];
}

// Giữ lại alias PagesComponent để tương thích ngược
export { ProcessListComponent as PagesComponent };
