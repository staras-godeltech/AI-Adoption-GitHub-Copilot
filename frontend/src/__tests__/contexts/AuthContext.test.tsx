import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Create a JWT token with fake claims
function createFakeToken(claims: Record<string, string>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims));
  return `${header}.${payload}.fake-signature`;
}

const fakeToken = createFakeToken({
  sub: '42',
  email: 'user@test.com',
  name: 'Test User',
  role: 'Customer',
});

// MSW server to mock API calls
const server = setupServer(
  http.post('http://localhost:5000/api/auth/login', () =>
    HttpResponse.json({ token: fakeToken, userId: 42, email: 'user@test.com', name: 'Test User', role: 'Customer' })
  )
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

// Helper component to expose AuthContext value
function AuthConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useAuth>) => void }) {
  const ctx = useAuth();
  onRender(ctx);
  return null;
}

describe('AuthContext', () => {
  it('initializes with null user and token when no stored token', () => {
    let capturedCtx: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <AuthConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </AuthProvider>
    );
    expect(capturedCtx!.user).toBeNull();
    expect(capturedCtx!.token).toBeNull();
  });

  it('login updates user state and stores token in localStorage', async () => {
    let capturedCtx: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider>
        <AuthConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </AuthProvider>
    );

    await act(async () => {
      await capturedCtx!.login('user@test.com', 'Password123!');
    });

    expect(capturedCtx!.user).not.toBeNull();
    expect(capturedCtx!.user?.email).toBe('user@test.com');
    expect(capturedCtx!.user?.role).toBe('Customer');
    expect(localStorage.getItem('token')).not.toBeNull();
  });

  it('logout clears user state and removes token from localStorage', async () => {
    let capturedCtx: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider>
        <AuthConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </AuthProvider>
    );

    await act(async () => {
      await capturedCtx!.login('user@test.com', 'Password123!');
    });

    expect(capturedCtx!.user).not.toBeNull();

    act(() => {
      capturedCtx!.logout();
    });

    expect(capturedCtx!.user).toBeNull();
    expect(capturedCtx!.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('restores user from stored token on initialization', () => {
    localStorage.setItem('token', fakeToken);

    let capturedCtx: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <AuthConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </AuthProvider>
    );

    expect(capturedCtx!.user).not.toBeNull();
    expect(capturedCtx!.user?.email).toBe('user@test.com');
    expect(capturedCtx!.user?.role).toBe('Customer');
  });

  it('useAuth throws when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<AuthConsumer onRender={() => {}} />);
    }).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});
