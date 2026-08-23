import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicRoute — accessible only to unauthenticated users.
 * If the user is already logged in, redirect them to the dashboard.
 */
export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const hasToken = localStorage.getItem('access_token');

  if (loading && !hasToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading session...
      </div>
    );
  }

  if (user || hasToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}
