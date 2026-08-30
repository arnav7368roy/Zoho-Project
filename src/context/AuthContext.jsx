import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load / refresh: just read from localStorage — NO API call
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const savedUser = localStorage.getItem('user_info');
        setUser(savedUser ? JSON.parse(savedUser) : { name: 'User' });
      } catch {
        setUser({ name: 'User' });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiRequest('/api/v1/auth/login', 'POST', { email, password });
      if (res.ok && res.data && res.data.status) {
        const token = res.data.data?.access_token || res.data.access_token;
        if (token) {
          localStorage.setItem('access_token', token);
        }

        // Try to get user info
        const meRes = await apiRequest('/api/v1/auth/me');
        if (meRes.ok && meRes.data) {
          const userData = meRes.data.data || meRes.data.user || meRes.data;
          if (userData && typeof userData === 'object') {
            setUser(userData);
            localStorage.setItem('user_info', JSON.stringify(userData));
            return { success: true };
          }
        }

        // Fallback user if /me fails
        const fallback = { email, name: email.split('@')[0] };
        setUser(fallback);
        localStorage.setItem('user_info', JSON.stringify(fallback));
        return { success: true };
      }
      return {
        success: false,
        message: res.data?.message || 'Login failed. Please check your credentials.',
      };
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
