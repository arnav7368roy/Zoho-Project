import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await apiRequest('/api/v1/auth/me');
      if (res.ok && res.data && res.data.status) {
        setUser(res.data.data);
      } else {
        localStorage.removeItem('access_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to check user session:', err);
      setUser(null);
    } finally {
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
          setUser(meRes.data.data);
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
        setUser(meRes.data.data);
        return { success: true };
      } else {
        localStorage.removeItem('access_token');
        return { success: false, message: 'Invalid Keycloak Session Token.' };
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
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
