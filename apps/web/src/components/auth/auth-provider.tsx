'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { CurrentUser } from '@/lib/api/types';

type AuthContextValue = {
  user: CurrentUser;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  user: CurrentUser;
  children: ReactNode;
};

export function AuthProvider({ user, children }: AuthProviderProps) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
