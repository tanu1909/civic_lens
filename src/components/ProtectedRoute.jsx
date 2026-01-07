import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children, requiredRole }) => {
  // 1. If user isn't logged in, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If a specific role is required but doesn't match, send to home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;