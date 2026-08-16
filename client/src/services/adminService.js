import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    return api.get('/admin/dashboard');
  },

  getUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },

  getUserDetails: async (id) => {
    return api.get(`/admin/users/${id}`);
  },

  createUser: async (userData) => {
    return api.post('/admin/users', userData);
  },

  getStores: async (params = {}) => {
    return api.get('/admin/stores', { params });
  },

  createStore: async (storeData) => {
    return api.post('/admin/stores', storeData);
  },

  getStoreOwners: async () => {
    return api.get('/admin/store-owners');
  },
};

export default adminService;
