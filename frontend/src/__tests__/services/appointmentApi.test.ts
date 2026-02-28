import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { appointmentApi } from '../../services/appointmentApi';
import type { AppointmentDto, CreateAppointmentDto } from '../../services/appointmentApi';

const mockAppointment: AppointmentDto = {
  id: 1,
  customerId: 10,
  customerName: 'Alice',
  serviceId: 2,
  serviceName: 'Facial',
  appointmentDate: '2026-08-01T10:00:00Z',
  duration: 60,
  status: 'Pending',
  createdAt: '2026-07-01T10:00:00Z',
};

const server = setupServer(
  http.post('http://localhost:5000/api/appointments', () =>
    HttpResponse.json(mockAppointment, { status: 201 })
  ),
  http.get('http://localhost:5000/api/appointments/my', () =>
    HttpResponse.json([mockAppointment])
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('appointmentApi', () => {
  it('create sends correct payload and returns created appointment', async () => {
    const dto: CreateAppointmentDto = {
      serviceId: 2,
      cosmetologistId: 3,
      appointmentDate: '2026-08-01T10:00:00Z',
    };
    const response = await appointmentApi.create(dto);
    expect(response.data.id).toBe(1);
    expect(response.data.status).toBe('Pending');
  });

  it('create handles 409 conflict error', async () => {
    server.use(
      http.post('http://localhost:5000/api/appointments', () =>
        HttpResponse.json({ message: 'Time slot unavailable' }, { status: 409 })
      )
    );

    const dto: CreateAppointmentDto = {
      serviceId: 2,
      appointmentDate: '2026-08-01T10:00:00Z',
    };
    await expect(appointmentApi.create(dto)).rejects.toThrow();
  });

  it('getMy returns list of appointments for current user', async () => {
    const response = await appointmentApi.getMy();
    expect(response.data).toHaveLength(1);
    expect(response.data[0].customerName).toBe('Alice');
  });
});
