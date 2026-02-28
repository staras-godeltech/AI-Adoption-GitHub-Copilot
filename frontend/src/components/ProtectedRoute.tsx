import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  role?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Allow Cosmetologist to access Admin routes
    if (role === 'Admin' && user.role === 'Cosmetologist') {
      return <Outlet />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
