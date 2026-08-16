import api from './api';

export const storeService = {
  getAllStores: async (params = {}) => {
    return api.get('/stores', { params });
  },
};

export default storeService;
