import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hfms_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('hfms_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = (payload) => {
    localStorage.setItem('hfms_token', payload.token);
    localStorage.setItem('hfms_user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem('hfms_token');
    localStorage.removeItem('hfms_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: Boolean(token) }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
