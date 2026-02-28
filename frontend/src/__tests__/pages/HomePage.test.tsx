import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import AuthContext from '../../contexts/AuthContext';
import type { AuthUser } from '../../contexts/AuthContext';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();

function renderHomePage(user: AuthUser | null) {
  const contextValue = {
    user,
    token: user ? 'fake-token' : null,
    loading: false,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
  };

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={contextValue}>
        <HomePage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  describe('"View Services" button', () => {
    it('links to /services when user is not authenticated', () => {
      renderHomePage(null);
      const link = screen.getByRole('link', { name: /view services/i });
      expect(link).toHaveAttribute('href', '/services');
    });

    it('links to /services when user is authenticated', () => {
      const user: AuthUser = { id: '1', email: 'c@test.com', name: 'Customer', role: 'Customer' };
      renderHomePage(user);
      const link = screen.getByRole('link', { name: /view services/i });
      expect(link).toHaveAttribute('href', '/services');
    });
  });

  describe('"Book Now" button', () => {
    it('links to /login?redirect=/customer/book-appointment when not authenticated', () => {
      renderHomePage(null);
      const link = screen.getByRole('link', { name: /book now/i });
      expect(link).toHaveAttribute('href', '/login?redirect=/customer/book-appointment');
    });

    it('links directly to /customer/book-appointment when authenticated', () => {
      const user: AuthUser = { id: '1', email: 'c@test.com', name: 'Customer', role: 'Customer' };
      renderHomePage(user);
      const link = screen.getByRole('link', { name: /book now/i });
      expect(link).toHaveAttribute('href', '/customer/book-appointment');
    });
  });

  describe('page content', () => {
    it('renders the heading and tagline', () => {
      renderHomePage(null);
      expect(screen.getByText('Cosmetology Booking App')).toBeInTheDocument();
      expect(screen.getByText(/book your beauty appointments with ease/i)).toBeInTheDocument();
    });

    it('renders the three feature cards', () => {
      renderHomePage(null);
      expect(screen.getByText('Browse Services')).toBeInTheDocument();
      expect(screen.getByText('Easy Booking')).toBeInTheDocument();
      expect(screen.getByText('Expert Staff')).toBeInTheDocument();
    });
  });
});
