import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on app launch
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.data?.message || 'Login failed');
    } catch (err) {
      const msg = err.userMessage || 'Invalid email or password';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.data?.message || 'Registration failed');
    } catch (err) {
      const msg = err.userMessage || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Refresh user data (e.g. after subscribing or updating profile)
  const refreshUser = async () => {
    await checkAuth();
  };

  const hasActiveSubscription = Boolean(
    user?.activeSubscription &&
    user.activeSubscription.status === 'active' &&
    new Date(user.activeSubscription.endDate) > new Date()
  );

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        register,
        logout,
        refreshUser,
        hasActiveSubscription,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

