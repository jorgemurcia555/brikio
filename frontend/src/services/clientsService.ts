import api from './api';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  companyName?: string;
  notes?: string;
  projectsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  companyName?: string; // For backward compatibility
  notes?: string;
}

export const clientsService = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients');
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientData): Promise<Client> => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateClientData>): Promise<Client> => {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

