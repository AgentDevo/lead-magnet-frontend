'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuthStore } from '@/store/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    const oauthError = params.get('error_description') ?? params.get('error')
      ?? hashParams.get('error_description') ?? hashParams.get('error');
    if (oauthError) { setErrorMsg(oauthError); return; }

    function finishAuth(session: { access_token: string; user: { id: string; email?: string; user_metadata?: Record<string, string> } }) {
      setAuth(
        {
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
        },
        session.access_token
      );
      router.replace('/lead-magnets');
    }

    // Implicit flow — tokens in hash fragment
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');
    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
        if (error || !data.session) { setErrorMsg(error?.message ?? 'Failed to set session from tokens.'); return; }
        finishAuth(data.session);
      });
      return;
    }

    // PKCE flow — code in query params
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.href).then(({ data, error }) => {
        if (error || !data.session) { setErrorMsg(error?.message ?? 'Failed to exchange code for session.'); return; }
        finishAuth(data.session);
      });
      return;
    }

    setErrorMsg('No authentication data in callback URL. Please try again.');
  }, [router, setAuth]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <p className="text-xl font-bold text-destructive">Sign-in failed</p>
          <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4 font-mono break-words">{errorMsg}</p>
          <a href="/login" className="text-sm text-accent hover:underline">Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
