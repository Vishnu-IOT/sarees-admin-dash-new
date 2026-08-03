import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);
const STORAGE_KEY = 'admin_data';
const TOKEN_KEY = 'authToken';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [session]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);

      // Store token and user data
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
      }

      const adminData = {
        name: response.name || response.email || email,
        email: response.email || email,
        role: response.role || 'Administrator',
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
      setSession(adminData);

      return { ok: true };
    } catch (err) {
      const message = err.message || 'Login failed. Please try again.';
      setError(message);
      return { ok: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setSession(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        login,
        logout,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
