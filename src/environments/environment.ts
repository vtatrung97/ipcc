export const environment = {
  production: false,
  k8s: false,
  apiUrl: '/api',
  // ==========================================*Note thêm==========================================
  // TÁC DỤNG: Đường dẫn nạp động Remote Module (Process) qua Module Federation
  processRemoteUrl: '/process-mfe/remoteEntry.js'
  // ============================================================================================
};

export const KEYCLOAK = {
  endpoint: 'https://auth.ipcc.vn',
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false
};

export const ZONE_ALIAS = {
  hn: 'hanoi',
  hcm: 'hcm'
};

export const SERVICES = {
  ACCOUNT_API_URL: '/api/account',
  authJwt: true,
  url: '/api'
};
