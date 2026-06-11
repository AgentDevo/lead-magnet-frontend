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
    let done = false;

    function finishAuth(session: { access_token: string; user: { id: string; email?: string; user_metadata?: Record<string, string> } }) {
      if (done) return;
      done = true;
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

    // Check for OAuth error passed back in query params
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error_description') ?? params.get('error');
    if (oauthError) {
      setErrorMsg(oauthError);
      return;
    }

    // onAuthStateChange fires for both PKCE (after exchangeCodeForSession)
    // and implicit flow (after Supabase processes the hash automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        finishAuth(session);
      }
    });

    // PKCE flow: exchange the code for a session
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(({ error }) => {
          if (error && !done) setErrorMsg(error.message);
        });
    }

    // Timeout fallback — if nothing fires within 12s show error
    const timer = setTimeout(() => {
      if (!done) setErrorMsg('Sign-in timed out. Please try again.');
    }, 12000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router, setAuth]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <p className="text-2xl font-bold text-destructive">Sign-in failed</p>
          <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4 font-mono break-words">{errorMsg}</p>
          <a href="/login" className="text-sm text-accent hover:underline">Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
