import { Component } from '@angular/core';

@Component({
  selector: 'app-process-create',
  template: `
    <div class="process-create-card">
      <div class="header-section">
        <a routerLink="/process" class="btn-back">⬅ Quay lại danh sách quy trình</a>
        <h2>✨ Tạo Mới Quy Trình Nghiệp Vụ (Màn hình từ Remote App)</h2>
        <p class="subtitle">Đường dẫn hiện tại: <code>/process/create</code> — Được quản lý bởi ProcessCreateModule</p>
      </div>

      <div class="form-container">
        <div class="form-group">
          <label>Mã quy trình *</label>
          <input type="text" [(ngModel)]="processData.code" placeholder="VD: PROC-2026-001" />
        </div>

        <div class="form-group">
          <label>Tên quy trình *</label>
          <input type="text" [(ngModel)]="processData.name" placeholder="Nhập tên quy trình..." />
        </div>

        <div class="form-group">
          <label>Loại luồng xử lý</label>
          <select [(ngModel)]="processData.type">
            <option value="auto">Tự động phân phối (Auto-Dispatch)</option>
            <option value="approval">Duyệt đa cấp (Multi-level Approval)</option>
            <option value="urgent">Khẩn cấp (Priority SLA)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Mô tả chi tiết</label>
          <textarea rows="3" [(ngModel)]="processData.description" placeholder="Nhập mô tả quy trình..."></textarea>
        </div>

        <div class="actions">
          <button class="btn-save" (click)="onSave()">💾 Lưu quy trình</button>
          <a routerLink="/process" class="btn-cancel">Hủy bỏ</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .process-create-card {
      padding: 24px;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header-section {
      margin-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 16px;
    }
    .btn-back {
      display: inline-block;
      margin-bottom: 12px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-back:hover {
      text-decoration: underline;
    }
    h2 {
      margin: 0 0 6px 0;
      color: #1e293b;
      font-size: 20px;
    }
    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    code {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .form-container {
      max-width: 650px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-weight: 600;
      font-size: 13px;
      color: #334155;
      margin-bottom: 6px;
    }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    .btn-save {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save:hover {
      background: #1d4ed8;
    }
    .btn-cancel {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
    }
  `]
})
export class ProcessCreateComponent {
  processData = {
    code: 'PROC-TICKET-AUTO',
    name: 'Quy trình xử lý Ticket tự động từ tổng đài IPCC',
    type: 'auto',
    description: 'Module này chạy độc lập tại Remote App, được nạp trực tiếp vào Shell IPCC.'
  };

  onSave() {
    alert(`Đã lưu quy trình "${this.processData.name}" thành công từ ProcessCreateModule!`);
  }
}
