import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/auth/me.js';
import { login as apiLogin } from '../api/auth/login.js';
import { register as apiRegister } from '../api/auth/register.js';
import { logout as apiLogout } from '../api/auth/logout.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getMe();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      await apiLogin(credentials);
      await checkAuth();
      return true;
    } catch {
      return false;
    }
  }, [checkAuth]);

  const register = useCallback(async (data) => {
    try {
      await apiRegister(data);
      await checkAuth();
      return true;
    } catch {
      return false;
    }
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
