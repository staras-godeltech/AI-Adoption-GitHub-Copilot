import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ServiceCard from '../../components/ServiceCard';
import type { Service } from '../../services/serviceApi';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockService: Service = {
  id: 1,
  name: 'Facial Treatment',
  description: 'Deep cleansing facial',
  durationMinutes: 60,
  price: 89.99,
  isActive: true,
};

describe('ServiceCard', () => {
  it('displays service name', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={mockService} />
      </MemoryRouter>
    );
    expect(screen.getByText('Facial Treatment')).toBeInTheDocument();
  });

  it('displays service price formatted with $', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={mockService} />
      </MemoryRouter>
    );
    expect(screen.getByText('$89.99')).toBeInTheDocument();
  });

  it('displays service duration in minutes', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={mockService} />
      </MemoryRouter>
    );
    expect(screen.getByText('60 min')).toBeInTheDocument();
  });

  it('renders View Details button', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={mockService} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
  });

  it('displays service description when provided', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={mockService} />
      </MemoryRouter>
    );
    expect(screen.getByText('Deep cleansing facial')).toBeInTheDocument();
  });

  it('does not display description when not provided', () => {
    const serviceWithoutDesc = { ...mockService, description: undefined };
    render(
      <MemoryRouter>
        <ServiceCard service={serviceWithoutDesc} />
      </MemoryRouter>
    );
    expect(screen.queryByText('Deep cleansing facial')).not.toBeInTheDocument();
  });
});
