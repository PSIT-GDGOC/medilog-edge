import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentStoredUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = authService.getToken();
      if (storedToken && navigator.onLine) {
        try {
          const res = await authService.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('medilog_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Verification failed, token may be invalid:', err.message);
          if (err.status === 401) {
            authService.logout();
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    }

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
