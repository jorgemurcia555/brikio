import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/users/me'),
};

