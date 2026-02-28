import { apiClient } from './api';

export interface AppointmentDto {
  id: number;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  cosmetologistId?: number;
  cosmetologistName?: string;
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
}

export interface CreateAppointmentDto {
  serviceId: number;
  cosmetologistId?: number;
  startDateTime: string;
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
  // Admin/Cosmetologist: get all appointments with optional filters
  getAll: (params?: { from?: string; to?: string; status?: string; cosmetologistId?: number }) =>
    apiClient.get<AppointmentDto[]>('/api/appointments', { params }),

  // Customer: get own appointments
  getMy: () => apiClient.get<AppointmentDto[]>('/api/appointments/my'),

  // Get single appointment by id
  getById: (id: number) => apiClient.get<AppointmentDto>(`/api/appointments/${id}`),

  // Customer: create a new appointment
  create: (dto: CreateAppointmentDto) => apiClient.post<AppointmentDto>('/api/appointments', dto),

  // Admin/Cosmetologist: update appointment status
  updateStatus: (id: number, dto: UpdateAppointmentStatusDto) =>
    apiClient.put<AppointmentDto>(`/api/appointments/${id}/status`, dto),

  // Customer: cancel (delete) pending appointment
  cancel: (id: number) => apiClient.delete(`/api/appointments/${id}`),
};

export const availabilityApi = {
  // Get available time slots for a date, service, and optionally a cosmetologist
  getSlots: (date: string, serviceId: number, cosmetologistId?: number) =>
    apiClient.get<AvailableSlotDto[]>('/api/availability', {
      params: { date, serviceId, cosmetologistId },
    }),
};

export default appointmentApi;
