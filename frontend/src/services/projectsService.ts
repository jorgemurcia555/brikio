import api from './api';

export const projectsService = {
  getAll: () => api.get('/projects'),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addArea: (projectId: string, data: any) =>
    api.post(`/projects/${projectId}/areas`, data),
  updateArea: (areaId: string, data: any) =>
    api.put(`/projects/areas/${areaId}`, data),
  deleteArea: (areaId: string) => api.delete(`/projects/areas/${areaId}`),
};

