/**
 * Thông tin người dùng đăng nhập từ Keycloak OIDC
 */
export interface KeycloakUserProfile {
  sub?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  roles?: string[];
  [key: string]: any;
}

/**
 * Thông tin tài khoản người dùng đồng bộ từ Keycloak sang DB (AccountUserDto)
 */
export interface AccountUserDto {
  id?: string;
  username: string;
  realm?: string;
  realm_id?: string;
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  enabled?: boolean;
  kz_account_id?: string;
  kz_user_id?: string;
  group_id?: string;
}

/**
 * Cấu hình quyền hạn theo resource và scopes
 */
export interface RequiredPermission {
  resourceServer: string;
  rsname: string;
  scopes?: string[];
}

export interface PermissionConfig {
  permissions: RequiredPermission[];
  mode?: 'AND' | 'OR';
}
