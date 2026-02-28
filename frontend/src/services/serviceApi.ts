import { apiClient } from './api';

export interface Service {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}

export interface UpdateServiceDto {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export const serviceApi = {
  getAll: () => apiClient.get<Service[]>('/api/services'),
  getById: (id: number) => apiClient.get<Service>(`/api/services/${id}`),
  create: (dto: CreateServiceDto) => apiClient.post<Service>('/api/services', dto),
  update: (id: number, dto: UpdateServiceDto) => apiClient.put<Service>(`/api/services/${id}`, dto),
  delete: (id: number) => apiClient.delete(`/api/services/${id}`),
};

export default serviceApi;
