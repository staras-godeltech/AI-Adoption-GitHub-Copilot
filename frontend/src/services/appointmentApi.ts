import { apiClient } from './api';

export interface AppointmentDto {
  id: number;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  cosmetologistId?: number;
  cosmetologistName?: string;
  appointmentDate: string;
  duration: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentDto {
  serviceId: number;
  cosmetologistId?: number;
  appointmentDate: string;
  notes?: string;
}

export interface UpdateAppointmentStatusDto {
  status: string;
}

export interface AvailableSlotDto {
  startTime: string;
  endTime: string;
  available: boolean;
}

export const appointmentApi = {
  getAll: (params?: { from?: string; to?: string; status?: number; cosmetologistId?: number }) =>
    apiClient.get<AppointmentDto[]>('/api/appointments', { params }),

  getMy: () => apiClient.get<AppointmentDto[]>('/api/appointments/my'),

  getById: (id: number) => apiClient.get<AppointmentDto>(`/api/appointments/${id}`),

  create: (dto: CreateAppointmentDto) =>
    apiClient.post<AppointmentDto>('/api/appointments', dto),

  updateStatus: (id: number, dto: UpdateAppointmentStatusDto) =>
    apiClient.put<AppointmentDto>(`/api/appointments/${id}/status`, dto),

  cancel: (id: number) => apiClient.delete(`/api/appointments/${id}`),

  getAvailableSlots: (date: string, serviceId: number, cosmetologistId?: number) =>
    apiClient.get<AvailableSlotDto[]>('/api/availability', {
      params: { date, serviceId, cosmetologistId },
    }),
};

export default appointmentApi;
