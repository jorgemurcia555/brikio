import api from './api';

export const estimatesService = {
  getAll: () => api.get('/estimates'),
  getByProject: (projectId: string) => api.get(`/estimates/project/${projectId}`),
  getOne: (id: string) => api.get(`/estimates/${id}`),
  getByPublicToken: (token: string) => api.get(`/estimates/public/${token}`),
  create: (data: any) => api.post('/estimates', data),
  update: (id: string, data: any) => api.put(`/estimates/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/estimates/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/estimates/${id}`),
  downloadPdf: (id: string) => api.get(`/pdf/estimate/${id}`, { responseType: 'blob' }),
};

