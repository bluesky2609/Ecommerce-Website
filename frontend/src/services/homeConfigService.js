import api from './api.js'

export const homeConfigService = {
  // Public: get config for homepage
  getConfig: () => api.get('/home-config'),

  // Admin: get config
  adminGetConfig: () => api.get('/admin/home-config'),

  // Admin: update entire config
  adminUpdateConfig: (data) => api.put('/admin/home-config', data),
}
