'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuthStore } from '@/store/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href)
      .then(({ data, error }) => {
        if (error || !data.session) {
          router.replace('/login');
          return;
        }
        const { session } = data;
        setAuth(
          {
            id: session.user.id,
            email: session.user.email!,
            fullName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
          },
          session.access_token
        );
        router.replace('/lead-magnets');
      });
  }, [router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
