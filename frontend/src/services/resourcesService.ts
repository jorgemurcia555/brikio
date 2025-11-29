import api from './api';

export interface Resource {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
    abbreviation: string;
  };
  basePrice: number;
  taxRate: number;
  performanceFactor: number;
  supplier?: string;
  supplierUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface CreateResourceData {
  name: string;
  description?: string;
  sku?: string;
  basePrice: number;
  taxRate: number;
  performanceFactor: number;
  supplier?: string;
  supplierUrl?: string;
}

export const resourcesService = {
  getAll: async (search?: string): Promise<Resource[]> => {
    const response = await api.get(`/materials${search ? `?search=${search}` : ''}`);
    return response.data;
  },

  getById: async (id: string): Promise<Resource> => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  create: async (data: CreateResourceData): Promise<Resource> => {
    const response = await api.post('/materials', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateResourceData>): Promise<Resource> => {
    const response = await api.patch(`/materials/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/materials/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/materials/categories');
    return response.data;
  },

  getUnits: async (): Promise<Unit[]> => {
    const response = await api.get('/materials/units');
    return response.data;
  },
};

