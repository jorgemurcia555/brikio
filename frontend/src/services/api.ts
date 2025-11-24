import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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

