import api from './api';

export const storeOwnerService = {
  getDashboard: async () => {
    return api.get('/owner/dashboard');
  },

  getStoreRatings: async (storeId) => {
    return api.get(`/owner/stores/${storeId}/ratings`);
  },
};

export default storeOwnerService;
