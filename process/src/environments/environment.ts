export const environment = {
  production: false,
  k8s: false,
  apiUrl: '/api'
};

export const AUTH_ENABLED = false;

export const KEYCLOAK = {
  endpoint: 'https://auth.ipcc.vn',
  realm: 'ticket-flow',
  clientId: 'ticket-flow',
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
