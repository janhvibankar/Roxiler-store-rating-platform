import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import tokenStorage from '../utils/tokenStorage';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '1rem' }}>403 - Access Denied</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Your role (<strong>{user.role}</strong>) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
