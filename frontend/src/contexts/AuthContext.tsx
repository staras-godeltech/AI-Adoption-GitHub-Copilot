import React, { createContext, useContext, useState } from 'react';
import apiClient from '../services/api';

export type UserRole = 'Admin' | 'Customer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): Record<string, string> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function buildUser(claims: Record<string, string>): AuthUser {
  return {
    id: claims['sub'] || claims['nameid'] || '',
    email: claims['email'] || '',
    name: claims['name'] || claims['email'] || '',
    role: (claims['role'] || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Customer') as UserRole,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return null;
    const claims = parseJwt(storedToken);
    if (!claims) return null;
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    return buildUser(claims);
  });

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ token: string }>('/api/auth/login', { email, password });
    const { token: newToken } = response.data;
    const claims = parseJwt(newToken);
    if (!claims) throw new Error('Invalid token received');

    localStorage.setItem('token', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(buildUser(claims));
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'Customer') => {
    await apiClient.post('/api/auth/register', { name, email, password, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;

