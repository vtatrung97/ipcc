import { Injectable, TemplateRef, Optional } from '@angular/core';
import { AudioService } from '@core/services/audio.service';

export type notificationType = 'info' | 'success' | 'danger' | 'warning' | 'NEW_TICKET' | 'TICKET_WARNING' |
  'ticket_expire_soon' | 'SLA_WARNING' | 'DISCONNECT_CHAT' | 'RECONNECT_CHAT' | 'TICKET_TRANSFER' | 'OTHER_AGENT_UPDATE_TICKET' |
  'INCOMING_CALL' | 'END_CALL' | 'DISCONNECT_AGENT_SRV' | 'RECONNECT_AGENT_SRV' | 'VOICE_CALL' | 'UNIT_STATUS' | 'SEAT_NUMBER' | 'CHAT_NOTIFI' | 'TICKET_CLOSE'
  | 'ALERT_TICKET_WARNING' | 'SOCIAL_ALERT_WARNING' | 'ALERT_ACCOUNT_WARNING';

export type Toast = {
  textOrTpl: string | TemplateRef<any>,
  delay?: number,
  type: notificationType,
  extraData?: any,
  createTime: number
};

export type NotificationOption = {
  delay?: number,
  type: notificationType,
  extraData?: any
};

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: Toast[] = [];

  constructor(@Optional() private audioService?: AudioService) {}

  show(textOrTpl: string | TemplateRef<any>, options: NotificationOption = { type: 'info' }): Toast {
    let toast: Toast = { textOrTpl, ...options, createTime: new Date().getTime() };
    for (let i = 0; i < this.toasts.length; i++) {
      if (this.checkDuplicateToast(this.toasts[i], toast)) {
        this.toasts.splice(i, 1);
      }
    }
    this.toasts.push(toast);
    return toast;
  }

  checkDuplicateToast(toast1: Toast, toast2: Toast): boolean {
    let a = JSON.stringify({ ...toast1, createTime: null });
    let b = JSON.stringify({ ...toast2, createTime: null });
    return a == b;
  }

  showInfo(content: string, delay: number = 20000): void {
    this.show(content, { delay, type: 'info' });
  }

  showInfoToNavigateToTicketDetail(content: string, ticket: any, delay: number = 20000): void {
    this.show(content, { delay, type: 'info', extraData: ticket });
  }

  showSuccess(content: string, delay: number = 20000): void {
    this.show(content, { delay, type: 'success' });
  }

  showDanger(content: string): void {
    this.show(content, { delay: 20000, type: 'danger' });
  }

  showWarning(content: string): void {
    this.show(content, { delay: 20000, type: 'warning' });
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  swipe(): void {
    this.toasts = [];
  }

  swipeIf(types: notificationType[]): void {
    this.toasts = this.toasts.filter(t => !types.includes(t.type));
  }
}
