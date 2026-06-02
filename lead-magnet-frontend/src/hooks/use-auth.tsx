'use client';
import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user, token } = res.data.data;
    setAuth(user, token);
    return user;
  }, [setAuth]);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await authApi.signup(email, password, fullName);
    return res.data.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  return { user, token, isAuthenticated, login, signup, logout };
}
