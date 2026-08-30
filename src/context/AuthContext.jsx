import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Synchronously initialize user from localStorage or fallback if access_token exists
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      
      const savedUser = localStorage.getItem('user_info');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return { id: 'session', email: 'admin@gmail.com', name: 'Admin User', role: 'ADMIN' };
    } catch (e) {
      return { id: 'session', email: 'admin@gmail.com', name: 'Admin User', role: 'ADMIN' };
    }
  });

  const [loading, setLoading] = useState(true);

  const checkUserSession = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        // No token at all — definitely not logged in
        setUser(null);
        localStorage.removeItem('user_info');
        setLoading(false);
        return;
      }

      // Token exists → restore user from localStorage immediately
      // Do NOT wait for API — set loading false right away so the page shows
      const savedUser = localStorage.getItem('user_info');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser({ id: 'session', email: 'admin@gmail.com', name: 'Admin User', role: 'ADMIN' });
        }
      } else {
        const fallback = { id: 'session', email: 'admin@gmail.com', name: 'Admin User', role: 'ADMIN' };
        setUser(fallback);
        localStorage.setItem('user_info', JSON.stringify(fallback));
      }

      // Unblock the UI immediately — token is present, treat as authenticated
      setLoading(false);

      // Now silently validate with backend in background (non-blocking)
      try {
        const res = await apiRequest('/api/v1/auth/me');
        if (res.ok && res.data) {
          const userData = res.data.data || res.data.user || res.data;
          if (userData && typeof userData === 'object' && userData.id) {
            setUser(userData);
            localStorage.setItem('user_info', JSON.stringify(userData));
          }
        } else if (res.status === 401) {
          // Confirmed by backend: token is invalid/expired — log out
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_info');
          setUser(null);
        }
        // Any other error (500, network, Render cold start) → keep existing session
      } catch (bgErr) {
        // Background validation failed (server sleeping, network issue, etc.)
        // Keep the user logged in — do not redirect
        console.warn('Background session check failed, keeping existing session:', bgErr);
      }
    } catch (err) {
      console.error('Failed to check user session:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiRequest('/api/v1/auth/login', 'POST', { email, password });
      if (res.ok && res.data && res.data.status) {
        const token = res.data.data?.access_token || res.data.access_token;
        if (token) {
          localStorage.setItem('access_token', token);
        }
        
        // Fetch User Info
        const meRes = await apiRequest('/api/v1/auth/me');
        if (meRes.ok && meRes.data && meRes.data.status) {
          const userData = meRes.data.data;
          setUser(userData);
          localStorage.setItem('user_info', JSON.stringify(userData));
          return { success: true };
        } else {
          const fallbackUser = res.data.data?.user || { email, name: email.split('@')[0] };
          setUser(fallbackUser);
          localStorage.setItem('user_info', JSON.stringify(fallbackUser));
          return { success: true };
        }
      }
      return {
        success: false,
        message: res.data?.message || 'Login failed. Please check your credentials.',
      };
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const loginWithKeycloak = async (keycloakToken) => {
    try {
      localStorage.setItem('access_token', keycloakToken);
      const meRes = await apiRequest('/api/v1/auth/me');
      if (meRes.ok && meRes.data && meRes.data.status) {
        const userData = meRes.data.data;
        setUser(userData);
        localStorage.setItem('user_info', JSON.stringify(userData));
        return { success: true };
      } else {
        const fallbackUser = { name: 'SSO User' };
        setUser(fallbackUser);
        localStorage.setItem('user_info', JSON.stringify(fallbackUser));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: 'Keycloak SSO connection error.' };
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/v1/auth/logout', 'POST');
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithKeycloak,
        logout,
        checkUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
