/**
 * Chuẩn hóa định dạng phản hồi API từ Backend (ApiResponse wrapper)
 */
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  result: T;
  requestId?: string;
}

/**
 * Phản hồi phân trang (PageResponse) từ Backend
 * Lưu ý: page bắt đầu từ 1 theo quy ước của Backend
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
