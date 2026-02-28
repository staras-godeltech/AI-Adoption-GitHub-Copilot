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

export interface AppointmentStatisticsDto {
  todayTotal: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface CalendarAppointmentDto {
  id: number;
  title: string;
  start: string;
  end: string;
  status: string;
  customerName: string;
  serviceName: string;
  cosmetologistName?: string;
}

export interface BulkStatusUpdateDto {
  appointmentIds: number[];
  newStatus: string;
}

export const appointmentApi = {
  getAll: (params?: { from?: string; to?: string; status?: string; cosmetologistId?: number; customerId?: number }) =>
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

  getStatistics: () =>
    apiClient.get<AppointmentStatisticsDto>('/api/appointments/statistics'),

  getCalendarAppointments: (startDate: string, endDate: string) =>
    apiClient.get<CalendarAppointmentDto[]>('/api/appointments/calendar', {
      params: { startDate, endDate },
    }),

  bulkUpdateStatus: (dto: BulkStatusUpdateDto) =>
    apiClient.put<{ updated: number }>('/api/appointments/bulk-status', dto),

  exportAppointments: (params?: { startDate?: string; endDate?: string; format?: string }) =>
    apiClient.get('/api/appointments/export', {
      params,
      responseType: 'blob',
    }),
};

export default appointmentApi;
