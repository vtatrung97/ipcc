/**
 * Trạng thái quy trình thiết kế trên Canvas
 */
export type TicketCallFlowStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export const TicketCallFlowStatus = {
  DRAFT: 'DRAFT' as TicketCallFlowStatus,
  ACTIVE: 'ACTIVE' as TicketCallFlowStatus,
  INACTIVE: 'INACTIVE' as TicketCallFlowStatus
} as const;

/**
 * Trạng thái một phiên bản canvas của quy trình
 */
export type TicketCallFlowVersionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export const TicketCallFlowVersionStatus = {
  DRAFT: 'DRAFT' as TicketCallFlowVersionStatus,
  PUBLISHED: 'PUBLISHED' as TicketCallFlowVersionStatus,
  ARCHIVED: 'ARCHIVED' as TicketCallFlowVersionStatus
} as const;

/**
 * Thông tin tóm tắt một phiên bản (không kèm flowJson)
 */
export interface TicketCallFlowVersionSummaryResponse {
  versionNo: number;
  status: TicketCallFlowVersionStatus;
  versionName?: string;
  versionDescription?: string;
  publishedAt?: string | null;
  publishedBy?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

/**
 * Chi tiết một phiên bản quy trình, kèm chuỗi JSON canvas
 */
export interface TicketCallFlowVersionResponse {
  flowId: string;
  versionNo: number;
  status: TicketCallFlowVersionStatus;
  versionName?: string;
  versionDescription?: string;
  /** Chuỗi JSON canvas nguyên văn như FE đã gửi lên */
  flowJson: string;
  publishedAt?: string | null;
  publishedBy?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

/**
 * Một dòng trong danh sách quy trình (không kèm flowJson)
 */
export interface TicketCallFlowSummaryResponse {
  /** TSID (chuỗi an toàn cho JavaScript) */
  id: string;
  code: string;
  name: string;
  caseCodePrefix: string;
  description?: string;
  status: TicketCallFlowStatus;
  /** Số phiên bản đang hiệu lực (null nếu chưa publish lần nào) */
  publishedVersionNo?: number | null;
  publishedAt?: string | null;
  /** Số phiên bản nháp (null nếu không có bản nháp) */
  draftVersionNo?: number | null;
  draftUpdatedAt?: string | null;
  draftUpdatedBy?: string | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  /** Row version chống ghi đè đồng thời */
  rowVersion?: number;
}

/**
 * Chi tiết quy trình, kèm JSON canvas để FE vẽ lại
 */
export interface TicketCallFlowResponse {
  /** TSID (chuỗi an toàn cho JavaScript) */
  id: string;
  code: string;
  name: string;
  caseCodePrefix: string;
  description?: string;
  status: TicketCallFlowStatus;
  /** Chuỗi JSON canvas nguyên văn như FE đã gửi */
  flowJson: string;
  flowJsonVersionNo?: number;
  flowJsonVersionStatus?: TicketCallFlowVersionStatus;
  publishedVersion?: TicketCallFlowVersionSummaryResponse | null;
  draftVersion?: TicketCallFlowVersionSummaryResponse | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  /** Gửi lại khi cập nhật / publish / huỷ bản nháp để chống lưu đè (409) */
  rowVersion?: number;
}

/**
 * Số liệu thống kê đầu màn danh sách quy trình
 */
export interface TicketCallFlowStatsResponse {
  total: number;
  active: number;
  hasDraft: number;
}

/**
 * Request tạo quy trình mới từ canvas (POST /api/v1/ticket-call-flows)
 */
export interface TicketCallFlowCreateRequest {
  /** Mã quy trình (VD: KHIEU_NAI_DA_PHONG_BAN), không đổi sau khi tạo */
  code: string;
  /** Tên quy trình */
  name: string;
  /** Tiền tố mã hồ sơ: chữ in hoa không dấu và số (VD: PAKN) */
  caseCodePrefix: string;
  description?: string;
  /** Mặc định DRAFT nếu để trống */
  status?: TicketCallFlowStatus;
  /** Chuỗi JSON của canvas */
  flowJson: string;
}

/**
 * Request cập nhật / lưu lại quy trình (PUT /api/v1/ticket-call-flows/{id})
 */
export interface TicketCallFlowUpdateRequest {
  name: string;
  description?: string;
  /** Để trống giữ nguyên trạng thái hiện tại */
  status?: TicketCallFlowStatus;
  /** Chuỗi JSON của canvas */
  flowJson: string;
  /** Tên phiên bản nháp */
  versionName?: string;
  /** Mô tả thay đổi của phiên bản nháp */
  versionDescription?: string;
  /** rowVersion từ lần GET gần nhất */
  rowVersion?: number;
}

/**
 * Request nhân bản quy trình (POST /api/v1/ticket-call-flows/{id}/clone)
 */
export interface TicketCallFlowCloneRequest {
  code: string;
  name: string;
  caseCodePrefix: string;
  description?: string;
}

/**
 * Request publish bản nháp / huỷ bản nháp
 * (POST /api/v1/ticket-call-flows/{id}/publish, POST /api/v1/ticket-call-flows/{id}/discard-draft)
 */
export interface TicketCallFlowPublishRequest {
  rowVersion?: number;
  versionName?: string;
  versionDescription?: string;
}

/**
 * Tham số tìm kiếm / phân trang danh sách quy trình
 */
export interface TicketCallFlowSearchParams {
  keyword?: string;
  status?: TicketCallFlowStatus;
  hasDraft?: boolean;
  page?: number;
  size?: number;
}
