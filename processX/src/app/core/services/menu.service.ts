import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MenuItem {
  id?: string;
  name: string;
  nameEn?: string;
  code: string;
  url: string;
  parent?: string;
  icon?: string;
  isRemote?: boolean;
}

const STORAGE_KEY = 'ipcc_custom_menus';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private defaultMenus: MenuItem[] = [
    { name: 'Dashboard', code: 'ipcc2-dashboard', url: '/dashboards', icon: '📊' },
    { name: 'Quản lý menu', code: 'ipcc2-role-menu', url: '/role-menu', icon: '⚙️' },
    { name: 'Quản lý gói cước', code: 'ipcc2-packages', url: '/dashboards', icon: '📦' },
    { name: 'Quản lý người dùng', code: 'ipcc2-users', url: '/dashboards', icon: '👥' },
    { name: 'Danh sách quy trình', code: 'proc-list', url: '/process', icon: '📑', isRemote: true },
    { name: 'Tạo mới quy trình', code: 'proc-create', url: '/process/create', icon: '➕', isRemote: true }
  ];

  private menusSubject = new BehaviorSubject<MenuItem[]>(this.loadMenus());
  menus$: Observable<MenuItem[]> = this.menusSubject.asObservable();

  constructor() {}

  private loadMenus(): MenuItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Lỗi khi đọc menu từ localStorage:', e);
    }
    // Lưu mặc định lần đầu nếu chưa có
    this.saveToStorage(this.defaultMenus);
    return this.defaultMenus;
  }

  private saveToStorage(menus: MenuItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
    } catch (e) {
      console.error('Lỗi khi lưu menu vào localStorage:', e);
    }
  }

  getMenus(): MenuItem[] {
    return this.menusSubject.value;
  }

  addMenu(newMenu: MenuItem): void {
    const current = this.menusSubject.value;
    const isRemote = newMenu.url.startsWith('/process');
    const updated = [...current, { ...newMenu, isRemote, id: Date.now().toString() }];
    this.saveToStorage(updated);
    this.menusSubject.next(updated);
  }

  deleteMenu(code: string): void {
    const current = this.menusSubject.value;
    const updated = current.filter(m => m.code !== code);
    this.saveToStorage(updated);
    this.menusSubject.next(updated);
  }

  resetDefault(): void {
    this.saveToStorage(this.defaultMenus);
    this.menusSubject.next(this.defaultMenus);
  }
}
