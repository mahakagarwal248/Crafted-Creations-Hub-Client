import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from '../APIs/axiosClient';

const AUTH_KEY = 'cch_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_KEY);
      const storedToken = getStoredToken();
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
    } catch {
      localStorage.removeItem(AUTH_KEY);
      setStoredToken(null);
    }
    setIsHydrated(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_KEY);
    setStoredToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = (payload) => {
    if (!payload) return;
    const { token: nextToken, ...rest } = payload;
    setUser(rest);
    localStorage.setItem(AUTH_KEY, JSON.stringify(rest));
    if (nextToken) {
      setToken(nextToken);
      setStoredToken(nextToken);
    }
  };

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isHydrated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
