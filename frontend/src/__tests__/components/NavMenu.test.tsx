import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NavMenu from '../../components/NavMenu';
import type { AuthUser } from '../../contexts/AuthContext';
import AuthContext from '../../contexts/AuthContext';
import React from 'react';

const mockLogout = vi.fn();
const mockLogin = vi.fn();
const mockRegister = vi.fn();

function renderNavMenu(user: AuthUser | null) {
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
        <NavMenu />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('NavMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Home and Services links for unauthenticated users', () => {
    renderNavMenu(null);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Services').length).toBeGreaterThan(0);
  });

  it('renders Login and Register links when not authenticated', () => {
    renderNavMenu(null);
    expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Register').length).toBeGreaterThan(0);
  });

  it('does not render Login/Register when user is authenticated', () => {
    const user: AuthUser = { id: '1', email: 'test@test.com', name: 'Test', role: 'Customer' };
    renderNavMenu(user);
    // In desktop view, Login should not appear
    expect(screen.queryAllByText('Login')).toHaveLength(0);
  });

  it('renders Customer-specific links when role is Customer', () => {
    const user: AuthUser = { id: '1', email: 'c@test.com', name: 'Customer', role: 'Customer' };
    renderNavMenu(user);
    expect(screen.getAllByText('My Appointments').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Book Appointment').length).toBeGreaterThan(0);
  });

  it('renders Admin-specific links when role is Admin', () => {
    const user: AuthUser = { id: '2', email: 'a@test.com', name: 'Admin', role: 'Admin' };
    renderNavMenu(user);
    expect(screen.getAllByText('Manage Appointments').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Manage Services').length).toBeGreaterThan(0);
  });

  it('renders Logout button when user is authenticated', () => {
    const user: AuthUser = { id: '1', email: 'test@test.com', name: 'Test', role: 'Customer' };
    renderNavMenu(user);
    expect(screen.getAllByText('Logout').length).toBeGreaterThan(0);
  });
});
