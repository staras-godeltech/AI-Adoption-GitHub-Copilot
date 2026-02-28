import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ServiceList from '../../components/ServiceList';
import type { Service } from '../../services/serviceApi';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockServices: Service[] = [
  { id: 1, name: 'Manicure', durationMinutes: 30, price: 25, isActive: true },
  { id: 2, name: 'Pedicure', durationMinutes: 45, price: 35, isActive: true },
];

describe('ServiceList', () => {
  it('renders a grid of ServiceCards when services are provided', () => {
    render(
      <MemoryRouter>
        <ServiceList services={mockServices} />
      </MemoryRouter>
    );
    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('Pedicure')).toBeInTheDocument();
  });

  it('shows "No services available" message when empty', () => {
    render(
      <MemoryRouter>
        <ServiceList services={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/no services available/i)).toBeInTheDocument();
  });

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(
      <MemoryRouter>
        <ServiceList services={[]} loading={true} />
      </MemoryRouter>
    );
    // Loading skeleton creates animated divs
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders the correct number of service cards', () => {
    render(
      <MemoryRouter>
        <ServiceList services={mockServices} />
      </MemoryRouter>
    );
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    expect(viewDetailsButtons).toHaveLength(2);
  });
});
