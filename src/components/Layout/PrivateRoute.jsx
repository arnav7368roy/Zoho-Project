import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const hasToken = localStorage.getItem('access_token');

  // Always wait for auth resolution before making any redirect decision
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading session...
      </div>
    );
  }

  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
