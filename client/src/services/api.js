import axios from 'axios';
import tokenStorage from '../utils/tokenStorage';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into Authorization header
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format responses & process authorization errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clearAuth();
    }
    const message = error.response?.data?.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
