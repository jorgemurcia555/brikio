import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Get API URL from environment (build-time) or fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Log API URL in development to help debug
if (import.meta.env.DEV) {
  console.log('🔗 API URL configured:', API_URL);
  console.log('🔗 VITE_API_URL from env:', import.meta.env.VITE_API_URL);
}

// Log in production if URL is still localhost (indicates misconfiguration)
if (import.meta.env.PROD && API_URL.includes('localhost')) {
  console.error('⚠️ WARNING: API URL is still localhost in production!');
  console.error('⚠️ VITE_API_URL was not set during build.');
  console.error('⚠️ Please configure VITE_API_URL as a build argument in Railway.');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, user } = useAuthStore.getState();
        if (refreshToken && user) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            userId: user.id,
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          useAuthStore.getState().setAuth(user, newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

