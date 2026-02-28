import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import AuthContext from '../../contexts/AuthContext';
import type { AuthUser } from '../../contexts/AuthContext';

const mockRegister = vi.fn();
const mockLogout = vi.fn();

const customerUser: AuthUser = { id: '1', email: 'c@test.com', name: 'Customer', role: 'Customer' };
const adminUser: AuthUser = { id: '2', email: 'a@test.com', name: 'Admin', role: 'Admin' };
const cosmetologistUser: AuthUser = { id: '3', email: 'co@test.com', name: 'Cosm', role: 'Cosmetologist' };

/** Render LoginPage inside a router, wiring up all destination routes as mock pages. */
function renderLoginPage(
  loginResult: AuthUser | 'error',
  initialPath = '/login'
) {
  const mockLogin = loginResult === 'error'
    ? vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    : vi.fn().mockResolvedValue(loginResult);

  const contextValue = {
    user: null,
    token: null,
    loading: false,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
  };

  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={contextValue}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/customer/book-appointment" element={<div>Booking Form</div>} />
          <Route path="/customer/dashboard" element={<div>Customer Dashboard</div>} />
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );

  return { mockLogin };
}

/** Fill and submit the login form. */
function submitForm(email = 'test@test.com', password = 'Password123!') {
  fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/••••••••/i),          { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('form rendering', () => {
    it('renders the Sign In form', () => {
      renderLoginPage(customerUser);
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders a Register link', () => {
      renderLoginPage(customerUser);
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });
  });

  describe('redirect query param', () => {
    it('after successful login navigates to the redirect URL when param is present', async () => {
      renderLoginPage(customerUser, '/login?redirect=/customer/book-appointment');
      submitForm();
      await waitFor(() => {
        expect(screen.getByText('Booking Form')).toBeInTheDocument();
      });
    });

    it('redirect works for any arbitrary path in the param', async () => {
      // Extend routes so the test destination exists
      const mockLogin = vi.fn().mockResolvedValue(customerUser);
      render(
        <MemoryRouter initialEntries={['/login?redirect=/customer/book-appointment']}>
          <AuthContext.Provider value={{ user: null, token: null, loading: false, login: mockLogin, register: mockRegister, logout: mockLogout }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/customer/book-appointment" element={<div>Booking Form</div>} />
            </Routes>
          </AuthContext.Provider>
        </MemoryRouter>
      );
      submitForm();
      await waitFor(() => {
        expect(screen.getByText('Booking Form')).toBeInTheDocument();
      });
    });
  });

  describe('role-based navigation (no redirect param)', () => {
    it('redirects Customer to /customer/dashboard', async () => {
      renderLoginPage(customerUser);
      submitForm();
      await waitFor(() => {
        expect(screen.getByText('Customer Dashboard')).toBeInTheDocument();
      });
    });

    it('redirects Admin to /admin/dashboard', async () => {
      renderLoginPage(adminUser);
      submitForm();
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('redirects Cosmetologist to /admin/dashboard', async () => {
      renderLoginPage(cosmetologistUser);
      submitForm();
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('shows an error message on failed login', async () => {
      renderLoginPage('error');
      submitForm();
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('stays on login page after a failed attempt', async () => {
      renderLoginPage('error');
      submitForm();
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      });
    });
  });
});
