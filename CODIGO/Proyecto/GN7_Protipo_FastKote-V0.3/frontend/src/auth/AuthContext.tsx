import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login, LoginResponse } from '../api/auth';

interface AuthContextValue {
  user: LoginResponse['user'] | null;
  isLoggedIn: boolean;
  loginUser: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(() => {
    const raw = localStorage.getItem('fastkote_user');
    return raw ? JSON.parse(raw) : null;
  });

  const hasRole = useCallback((role: string) => Boolean(user?.roles.includes(role)), [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoggedIn: Boolean(user),
    async loginUser(username, password) {
      const response = await login(username, password);
      localStorage.setItem('fastkote_token', response.token);
      localStorage.setItem('fastkote_user', JSON.stringify(response.user));
      setUser(response.user);
    },
    logout() {
      localStorage.removeItem('fastkote_token');
      localStorage.removeItem('fastkote_user');
      setUser(null);
    },
    hasRole,
  }), [hasRole, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
