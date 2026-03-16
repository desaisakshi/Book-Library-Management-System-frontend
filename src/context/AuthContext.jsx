import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await authAPI.login({ email, password });
      const data = res.data.data;

      // Handle unverified users
      if (data.requiresVerification) {
        return { success: false, requiresVerification: true, userId: data.userId, message: data.message };
      }

      // FIX: backend returns accessToken (not token)
      const { accessToken, refreshToken, user: userData } = data;
      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const res = await authAPI.register(userData);
      const data = res.data.data;
      // FIX: return userId so Register page can pass it to verifyOTP
      return { success: true, data, userId: data.userId || data.user?.id };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // FIX: takes userId (not email) — matches backend POST /auth/verify-otp { userId, otp }
  const verifyOTP = async (userId, otp) => {
    try {
      setError(null);
      await authAPI.verifyOTP({ userId, otp });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      isAuthenticated: !!user,
      isAdmin:  user?.role === 'admin',
      isAuthor: user?.role === 'author',
      login, register, verifyOTP, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
