import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setAuthUser } from '../services/api';

export interface AuthUser {
  username: string;
  roles: string[];
  token: string;
  expiresAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        const parsed: AuthUser = JSON.parse(raw);
        // Simple expiration check (optional)
        if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
          setUser(parsed);
          setAuthUser(parsed);
        } else {
          localStorage.removeItem('authUser');
        }
      } catch { /* ignore parse errors */ }
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post('/api/auth/login', { username, password });
    const data = res.data;
    const authUser: AuthUser = {
      username: data.username,
      roles: Array.from(data.roles || []),
      token: data.token,
      expiresAt: data.expiresAt
    };
    setUser(authUser);
    setAuthUser(authUser);
    localStorage.setItem('authUser', JSON.stringify(authUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthUser(null);
    localStorage.removeItem('authUser');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
