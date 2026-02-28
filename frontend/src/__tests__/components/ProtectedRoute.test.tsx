import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import AuthContext from '../../contexts/AuthContext';
import type { AuthUser } from '../../contexts/AuthContext';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();

function renderProtectedRoute(user: AuthUser | null, requiredRole?: 'Admin' | 'Customer' | 'Cosmetologist') {
  const contextValue = {
    user,
    token: user ? 'fake-token' : null,
    loading: false,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
  };

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthContext.Provider value={contextValue}>
        <Routes>
          <Route element={<ProtectedRoute role={requiredRole} />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when user is not authenticated', () => {
    renderProtectedRoute(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders outlet when user is authenticated and no role required', () => {
    const user: AuthUser = { id: '1', email: 'test@test.com', name: 'Test', role: 'Customer' };
    renderProtectedRoute(user);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /unauthorized when user has wrong role', () => {
    const user: AuthUser = { id: '1', email: 'test@test.com', name: 'Test', role: 'Customer' };
    renderProtectedRoute(user, 'Admin');
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows access when user has the correct role', () => {
    const user: AuthUser = { id: '2', email: 'admin@test.com', name: 'Admin', role: 'Admin' };
    renderProtectedRoute(user, 'Admin');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows Cosmetologist to access Admin routes', () => {
    const user: AuthUser = { id: '3', email: 'cosm@test.com', name: 'Cosm', role: 'Cosmetologist' };
    renderProtectedRoute(user, 'Admin');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
