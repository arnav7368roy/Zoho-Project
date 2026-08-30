import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend uses HttpOnly cookies — check session via /me endpoint
    // credentials: 'include' sends the cookie automatically (set in api.js)
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await apiRequest('/api/v1/auth/me');
      if (res.ok && res.data) {
        const userData = res.data.data || res.data.user || res.data;
        if (userData && typeof userData === 'object') {
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await apiRequest('/api/v1/auth/login', 'POST', { email, password });
      if (res.ok && res.data && res.data.status) {
        // Backend sets HttpOnly cookie — now fetch user info
        const meRes = await apiRequest('/api/v1/auth/me');
        if (meRes.ok && meRes.data) {
          const userData = meRes.data.data || meRes.data.user || meRes.data;
          if (userData && typeof userData === 'object') {
            setUser(userData);
            return { success: true };
          }
        }
        // Fallback if /me fails
        setUser({ email, name: email.split('@')[0] });
        return { success: true };
      }
      return {
        success: false,
        message: res.data?.message || 'Login failed. Please check your credentials.',
      };
    } catch {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/v1/auth/logout', 'POST');
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
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
