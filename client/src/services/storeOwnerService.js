import api from './api';

export const storeOwnerService = {
  getDashboard: async () => {
    return api.get('/owner/dashboard');
  },

  getStoreRatings: async (storeId, params = {}) => {
    return api.get(`/owner/stores/${storeId}/ratings`, { params });
  },
};

export default storeOwnerService;
