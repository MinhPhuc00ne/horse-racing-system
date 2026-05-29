import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated || !user) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Authenticated but does not have the required role, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Permitted, render the child route component
  return <Outlet />;
}
