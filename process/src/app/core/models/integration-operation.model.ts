/**
 * Trạng thái cấu hình tích hợp (DRAFT: Đang soạn; ACTIVE: Cho phép dùng trong Flow; INACTIVE: Tạm ngưng)
 */
export type IntegrationStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export const IntegrationStatus = {
  DRAFT: 'DRAFT' as IntegrationStatus,
  ACTIVE: 'ACTIVE' as IntegrationStatus,
  INACTIVE: 'INACTIVE' as IntegrationStatus
} as const;

/**
 * Một dòng trong danh sách API (operation), kèm hệ thống và kết nối chứa nó
 * (GET /api/v1/integrations/operations)
 */
export interface OperationSummaryResponse {
  /** TSID (chuỗi an toàn cho JavaScript) */
  id: string;
  code: string;
  versionNo?: number;
  name: string;
  description?: string;
  httpMethod: string;
  path: string;
  status: IntegrationStatus;

  /** Kết nối chứa operation */
  connectionId?: string;
  connectionCode?: string;
  connectionName?: string;

  /** Hệ thống chứa kết nối */
  systemId?: string;
  systemCode?: string;
  systemName?: string;

  /** Thời gian cập nhật (UTC, ISO-8601) */
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Tham số tìm kiếm danh sách operations
 */
export interface OperationSearchParams {
  keyword?: string;
}
