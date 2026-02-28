import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { serviceApi } from '../../services/serviceApi';
import type { Service } from '../../services/serviceApi';

const mockServices: Service[] = [
  { id: 1, name: 'Manicure', durationMinutes: 30, price: 25, isActive: true },
  { id: 2, name: 'Pedicure', durationMinutes: 45, price: 35, isActive: true },
];

const server = setupServer(
  http.get('http://localhost:5000/api/services', () =>
    HttpResponse.json(mockServices)
  ),
  http.get('http://localhost:5000/api/services/1', () =>
    HttpResponse.json(mockServices[0])
  ),
  http.post('http://localhost:5000/api/services', () =>
    HttpResponse.json({ id: 3, name: 'Facial', durationMinutes: 60, price: 80, isActive: true }, { status: 201 })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('serviceApi', () => {
  it('getAll returns list of services', async () => {
    const response = await serviceApi.getAll();
    expect(response.data).toHaveLength(2);
    expect(response.data[0].name).toBe('Manicure');
  });

  it('getById returns the correct service', async () => {
    const response = await serviceApi.getById(1);
    expect(response.data.id).toBe(1);
    expect(response.data.name).toBe('Manicure');
  });

  it('getAll handles 500 server error', async () => {
    server.use(
      http.get('http://localhost:5000/api/services', () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    await expect(serviceApi.getAll()).rejects.toThrow();
  });

  it('create sends payload and returns created service', async () => {
    const dto = { name: 'Facial', durationMinutes: 60, price: 80 };
    const response = await serviceApi.create(dto);
    expect(response.data.id).toBe(3);
    expect(response.data.name).toBe('Facial');
  });
});
