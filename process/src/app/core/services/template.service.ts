import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from '@core/http/api.service';

/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - TEMPLATE MANAGEMENT SERVICE
 * ============================================================================
 * Quản lý vòng đời và dữ liệu của các Process Template (US-01, US-02, FR-07 -> FR-10, FR-25)
 * Kết nối tương tác trực tiếp giữa:
 * - Trang 1: Danh sách Template & Vòng đời (/templates/templates-management)
 * - Trang 2: Canvas Builder độc lập (/templates/graph)
 * ============================================================================
 */

export interface TemplateVersionItem {
  version_id: string;
  version_no: string; // e.g. "V1.0", "V1.1", "V2.1"
  status: 'Published' | 'Draft' | 'Archived' | 'Inactive';
  published_at: string;
  created_by: string;
  changelog: string;
  is_active: boolean;
  graphData?: any;
}

export interface TemplateExperimentConfig {
  experiment_id: string;
  template_code: string;
  template_name: string;
  version_a_id: string;
  version_a_no: string;
  version_b_id: string;
  version_b_no: string;
  ratio_a: number; // e.g. 50 (%) -> Version B gets 100 - ratio_a
  status: 'running' | 'paused' | 'draft';
  target_metric: string; // 'CSAT Score' | 'FCR (Giải quyết lần đầu)' | 'AHT (Thời gian xử lý)'
  started_at: string;
  description?: string;
}

export interface ProcessTemplateItem {
  id?: string;
  code: string; // e.g. "PRC_COMPLAINT_BILLING"
  name: string;
  category?: string; // 'Xử lý khiếu nại' | 'Cảnh báo chỉ số' | 'Chăm sóc sau tương tác' | 'Happy Call / Telesales' | 'Khảo sát CSAT'
  version: string; // e.g. "V2.1"
  active_version_id?: string;
  owner_org_id?: string; // e.g. "ORG_CSKH_MB"
  owner_org_name?: string; // e.g. "TT CSKH Miền Bắc"
  sla: string;
  slaStatus: 'normal' | 'warning' | 'danger' | 'overdue' | 'success';
  status: 'Published' | 'Draft' | 'Inactive';
  description: string;
  caseCodePrefix?: string;
  trigger?: any;
  slaValue?: number;
  slaUnit?: string;
  flowJson?: any;
  published_at?: string; // DD/MM/YYYY HH:mm
  updatedAt?: string;
  active_instances_count?: number; // Dành cho FR-09: Kiểm tra chặn xóa nếu còn instance chạy dở
  versions?: TemplateVersionItem[];
  graphData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly endpoint = '/api/v1/ticket-call-flows';
  private readonly STORAGE_KEY = 'ipcc_process_templates_store';
  private readonly EXPERIMENT_KEY = 'ipcc_template_experiments_store';

  private templatesSubject = new BehaviorSubject<ProcessTemplateItem[]>([]);
  public templates$: Observable<ProcessTemplateItem[]> = this.templatesSubject.asObservable();

  private experimentsSubject = new BehaviorSubject<TemplateExperimentConfig[]>([]);
  public experiments$: Observable<TemplateExperimentConfig[]> = this.experimentsSubject.asObservable();

  constructor(
    private apiService: ApiService
  ) {
    this.loadFromStorage();
  }

  /**
   * Chuyển đổi dữ liệu từ BE /api/v1/ticket-call-flows sang ProcessTemplateItem cho UI
   */
  public mapApiItemToProcessTemplate(item: any): ProcessTemplateItem {
    const rawStatus = (item.status || 'DRAFT').toUpperCase();
    const statusMap: Record<string, 'Published' | 'Draft' | 'Inactive'> = {
      PUBLISHED: 'Published',
      DRAFT: 'Draft',
      INACTIVE: 'Inactive'
    };

    let slaText = '2h SLA';
    if (item.slaValue) {
      const unit = item.slaUnit === 'MINUTE' ? 'phút' : (item.slaUnit === 'HOUR' ? 'giờ' : (item.slaUnit === 'DAY' ? 'ngày' : item.slaUnit));
      slaText = `${item.slaValue} ${unit}`;
    }

    let parsedFlowJson = item.flowJson;
    if (typeof item.flowJson === 'string') {
      try {
        parsedFlowJson = JSON.parse(item.flowJson);
      } catch (e) {
        console.warn('[TemplateService] Không thể parse flowJson:', e);
      }
    }

    return {
      id: item.id ? String(item.id) : undefined,
      code: item.code || 'KHIEU_NAI_DA_PHONG_BAN',
      name: item.name || 'Quy trình xử lý nghiệp vụ',
      caseCodePrefix: item.caseCodePrefix || 'PAKN',
      category: item.category || 'Xử lý khiếu nại',
      version: item.version || 'V1.0',
      owner_org_id: item.owner_org_id || 'ORG_CSKH_MB',
      owner_org_name: item.owner_org_name || 'TT CSKH Miền Bắc',
      sla: slaText,
      slaStatus: item.slaStatus || 'normal',
      status: statusMap[rawStatus] || 'Draft',
      description: item.description || '',
      published_at: item.published_at || item.createdAt || '',
      updatedAt: item.updatedAt || '',
      active_instances_count: item.active_instances_count || 0,
      trigger: item.trigger,
      slaValue: item.slaValue,
      slaUnit: item.slaUnit,
      flowJson: item.flowJson,
      graphData: parsedFlowJson || item.graphData
    };
  }

  /**
   * Gọi API lấy danh sách Template: GET /api/v1/ticket-call-flows
   */
  public fetchTemplatesFromApi(): Observable<ProcessTemplateItem[]> {
    return this.apiService.get<any>(this.endpoint).pipe(
      map(res => {
        let rawList: any[] = [];
        if (Array.isArray(res)) {
          rawList = res;
        } else if (res && Array.isArray(res.result)) {
          rawList = res.result;
        } else if (res && Array.isArray(res.data)) {
          rawList = res.data;
        } else if (res && Array.isArray(res.content)) {
          rawList = res.content;
        } else if (res && Array.isArray(res.templates)) {
          rawList = res.templates;
        }

        if (rawList && rawList.length > 0) {
          return rawList.map(item => this.mapApiItemToProcessTemplate(item));
        }

        return [];
      }),
      catchError(err => {
        console.warn('[TemplateService] Lỗi gọi GET /api/v1/ticket-call-flows:', err);
        return of([] as ProcessTemplateItem[]);
      }),
      tap(templates => {
        this.templatesSubject.next(templates);
        this.saveToStorage();
      })
    );
  }

  /**
   * Gọi API lưu Template: POST /api/v1/ticket-call-flows
   */
  public saveTemplateApi(payload: any): Observable<any> {
    const body = { ...payload };
    if (body.flowJson && typeof body.flowJson !== 'string') {
      body.flowJson = JSON.stringify(body.flowJson);
    }
    return this.apiService.post<any>(this.endpoint, body).pipe(
      tap(res => {
        console.log('[TemplateService] POST /api/v1/ticket-call-flows thành công:', res);
        this.fetchTemplatesFromApi().subscribe();
      })
    );
  }

  private loadFromStorage(): void {
    // Xóa bỏ mock data cũ trong localStorage để dữ liệu thuần túy lấy từ API
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
    this.templatesSubject.next([]);

    try {
      const expRaw = localStorage.getItem(this.EXPERIMENT_KEY);
      if (expRaw) {
        const parsedExp = JSON.parse(expRaw);
        if (Array.isArray(parsedExp) && parsedExp.length > 0) {
          this.experimentsSubject.next(parsedExp);
          return;
        }
      }
    } catch {}
    this.experimentsSubject.next([]);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.templatesSubject.value));
    } catch {}
  }

  private saveExperimentsToStorage(): void {
    try {
      localStorage.setItem(this.EXPERIMENT_KEY, JSON.stringify(this.experimentsSubject.value));
    } catch {}
  }

  public getTemplates(): ProcessTemplateItem[] {
    return this.templatesSubject.value;
  }

  public getTemplateByCode(code: string): ProcessTemplateItem | undefined {
    return this.templatesSubject.value.find(t => t.code.toUpperCase() === code.toUpperCase());
  }

  public createTemplate(item: Partial<ProcessTemplateItem>): ProcessTemplateItem {
    const current = this.templatesSubject.value;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newCode = (item.code || `PRC_${String(current.length + 1).padStart(3, '0')}`).toUpperCase();
    const initialVersion: TemplateVersionItem = {
      version_id: `ver-${Date.now()}`,
      version_no: item.version || 'V1.0',
      status: (item.status as any) || 'Draft',
      published_at: formattedDate,
      created_by: 'Admin Người dùng',
      changelog: 'Khởi tạo quy trình mới',
      is_active: true
    };

    const newTemplate: ProcessTemplateItem = {
      code: newCode,
      name: item.name || 'Quy trình mới',
      category: item.category || 'Xử lý khiếu nại',
      version: item.version || 'V1.0',
      owner_org_id: item.owner_org_id || 'ORG_CSKH_MB',
      owner_org_name: item.owner_org_name || 'TT CSKH Miền Bắc',
      sla: item.sla || '4h SLA',
      slaStatus: item.slaStatus || 'normal',
      status: item.status || 'Draft',
      description: item.description || '',
      published_at: formattedDate,
      updatedAt: formattedDate,
      active_instances_count: 0,
      versions: [initialVersion],
      graphData: item.graphData || null
    };

    const updated = [newTemplate, ...current.filter(t => t.code !== newCode)];
    this.templatesSubject.next(updated);
    this.saveToStorage();
    return newTemplate;
  }

  public updateTemplate(code: string, updates: Partial<ProcessTemplateItem>): void {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = this.templatesSubject.value.map(t => {
      if (t.code.toUpperCase() === code.toUpperCase()) {
        return {
          ...t,
          ...updates,
          updatedAt: formattedDate,
          published_at: updates.status === 'Published' ? formattedDate : t.published_at
        };
      }
      return t;
    });
    this.templatesSubject.next(updated);
    this.saveToStorage();
  }

  /**
   * FR-10: Nhân bản quy trình
   */
  public cloneTemplate(sourceCode: string, newCode?: string, newName?: string, description?: string): ProcessTemplateItem | null {
    const original = this.getTemplateByCode(sourceCode);
    if (!original) return null;

    const finalCode = (newCode || `${original.code}_CLONE_${Math.floor(100 + Math.random() * 900)}`).toUpperCase();
    const finalName = newName || `${original.name} (Bản sao)`;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const cloned = this.createTemplate({
      code: finalCode,
      name: finalName,
      category: original.category,
      version: 'V1.0-draft',
      owner_org_id: original.owner_org_id,
      owner_org_name: original.owner_org_name,
      sla: original.sla,
      slaStatus: original.slaStatus,
      status: 'Draft',
      description: description || `Nhân bản từ ${original.code}: ${original.description}`,
      graphData: original.graphData ? JSON.parse(JSON.stringify(original.graphData)) : null,
      published_at: formattedDate,
      active_instances_count: 0
    });
    return cloned;
  }

  /**
   * FR-08: Bật / Tắt quy trình
   */
  public toggleStatus(code: string): { success: boolean; newStatus: 'Published' | 'Inactive'; message: string } {
    const template = this.getTemplateByCode(code);
    if (!template) {
      return { success: false, newStatus: 'Inactive', message: 'Không tìm thấy quy trình.' };
    }
    const nextStatus = template.status === 'Published' ? 'Inactive' : 'Published';
    this.updateTemplate(code, { status: nextStatus });

    const message = nextStatus === 'Inactive'
      ? `Đã tạm dừng quy trình [${template.code}]. Hệ thống tạm ngưng nhận yêu cầu mới, các Flow Instance đang chạy vẫn tiếp tục xử lý bình thường (FR-08).`
      : `Đã kích hoạt vận hành quy trình [${template.code}] (Published).`;

    return { success: true, newStatus: nextStatus, message };
  }

  /**
   * FR-09: Xóa quy trình
   */
  public deleteTemplate(code: string): { success: boolean; message: string; activeInstances?: number } {
    const template = this.getTemplateByCode(code);
    if (!template) {
      return { success: false, message: 'Quy trình không tồn tại.' };
    }

    if (template.active_instances_count && template.active_instances_count > 0) {
      return {
        success: false,
        activeInstances: template.active_instances_count,
        message: `Không thể xóa quy trình [${template.code}]! Hiện tại đang có ${template.active_instances_count} tiến trình (Flow Instance) đang chạy dở chưa kết thúc theo quy định BR-TMP-09.`
      };
    }

    const updated = this.templatesSubject.value.filter(t => t.code.toUpperCase() !== code.toUpperCase());
    this.templatesSubject.next(updated);
    this.saveToStorage();
    return {
      success: true,
      message: `Đã xóa thành công quy trình [${template.code} - ${template.name}].`
    };
  }

  public saveGraphData(code: string, graphData: any): void {
    this.updateTemplate(code, { graphData });
  }

  // ============================================================================
  // FR-25: A/B TESTING CONFIGURATION
  // ============================================================================
  public getExperiments(): TemplateExperimentConfig[] {
    return this.experimentsSubject.value;
  }

  public saveExperiment(exp: TemplateExperimentConfig): void {
    const current = this.experimentsSubject.value;
    const exists = current.some(e => e.experiment_id === exp.experiment_id);
    let updated: TemplateExperimentConfig[];
    if (exists) {
      updated = current.map(e => e.experiment_id === exp.experiment_id ? exp : e);
    } else {
      updated = [exp, ...current];
    }
    this.experimentsSubject.next(updated);
    this.saveExperimentsToStorage();
  }

  public toggleExperimentStatus(experimentId: string): void {
    const current = this.experimentsSubject.value;
    const updated = current.map(e => {
      if (e.experiment_id === experimentId) {
        return {
          ...e,
          status: (e.status === 'running' ? 'paused' : 'running') as 'running' | 'paused'
        };
      }
      return e;
    });
    this.experimentsSubject.next(updated);
    this.saveExperimentsToStorage();
  }
}
