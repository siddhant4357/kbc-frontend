import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin route but user is not admin, redirect to dashboard
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
};