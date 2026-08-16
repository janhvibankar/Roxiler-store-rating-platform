import api from './api';
import tokenStorage from '../utils/tokenStorage';

export const authService = {
  signup: async (userData) => {
    return api.post('/auth/signup', userData);
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response?.data?.token) {
      tokenStorage.setToken(response.data.token);
      tokenStorage.setUser(response.data.user);
    }
    return response;
  },

  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  changePassword: async (passwordData) => {
    return api.patch('/auth/password', passwordData);
  },

  logout: () => {
    tokenStorage.clearAuth();
  },
};

export default authService;
