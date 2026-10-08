import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboards',
  template: `
    <div class="dashboard-page">
      <div class="breadcrumb">
        <span>Trang chủ</span> &gt; <strong>Ticket yêu cầu gần đây</strong>
      </div>

      <div class="page-title-row">
        <h3>Ticket yêu cầu gần đây (Màn hình nội bộ IPCC Host)</h3>
        <span class="badge-total">Tổng số: 10,000 kết quả</span>
      </div>

      <div class="cards-grid">
        <div class="ticket-card" *ngFor="let ticket of tickets">
          <div class="avatar" [style.background-color]="ticket.color">{{ ticket.avatar }}</div>
          <div class="ticket-info">
            <div class="title">{{ ticket.customer }}</div>
            <div class="sub">{{ ticket.message }}</div>
          </div>
          <div class="time">{{ ticket.time }}</div>
        </div>
      </div>

      <div class="guide-banner">
        <h4>💡 Bạn đang xem ứng dụng IPCC Host Shell (Port 4200)</h4>
        <p>Để kiểm tra nạp Remote App qua Module Federation, hãy click vào menu <strong>"Danh sách quy trình"</strong> trên thanh menu bên trái!</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 4px;
    }
    .breadcrumb {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .page-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h3 {
      margin: 0;
      color: #1e293b;
      font-size: 18px;
    }
    .badge-total {
      background: #e2e8f0;
      color: #475569;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .ticket-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
    }
    .ticket-info {
      flex: 1;
    }
    .ticket-info .title {
      font-weight: 600;
      color: #1e293b;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .ticket-info .sub {
      color: #64748b;
      font-size: 13px;
    }
    .time {
      font-size: 12px;
      color: #94a3b8;
    }
    .guide-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 16px 20px;
      border-radius: 8px;
      color: #166534;
    }
    .guide-banner h4 {
      margin: 0 0 6px 0;
    }
    .guide-banner p {
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class DashboardsComponent {
  tickets = [
    { avatar: 'A', customer: 'Avada Kedavra - 0988.123.456', message: 'Hệ thống: Cuộc gọi lỡ từ khách hàng VIP', time: '07:53', color: '#f59e0b' },
    { avatar: 'T', customer: 'Trần Văn Bình - 0912.456.789', message: 'Tin nhắn Fanpage: Cần tư vấn gói cước gia hạn', time: '08:15', color: '#3b82f6' },
    { avatar: 'N', customer: 'Nguyễn Thị Hoa - 0977.889.900', message: 'Khiếu nại cước thoại quốc tế', time: '08:42', color: '#10b981' },
  ];
}
