'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, Mail, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase-browser';

const OAUTH_REDIRECT = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://192.168.1.241:3002'}/auth/callback`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/lead-magnets');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: OAUTH_REDIRECT },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
    // On success Supabase redirects the browser — no further action needed here
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white rounded-xl z-1">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-blue-100 text-black">
        <Link href="/" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition" title="Back to home">
          <X className="w-5 h-5" />
        </Link>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg">
          <LogIn className="w-7 h-7 text-black" />
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-center">Sign in with email</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Make a new doc to bring your words, data, and teams together. For free
        </p>

        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder="Email"
              type="email"
              value={email}
              required
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder="Password"
              type="password"
              value={password}
              required
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="w-full flex items-center justify-between">
            {error
              ? <p className="text-sm text-red-500">{error}</p>
              : <span />}
            <button type="button" className="text-xs hover:underline font-medium text-gray-600 shrink-0">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 disabled:opacity-60 cursor-pointer transition mt-1"
          >
            {loading ? 'Signing in…' : 'Get Started'}
          </button>
        </form>

        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-dashed border-gray-200" />
          <span className="mx-2 text-xs text-gray-400">Or sign in with</span>
          <div className="flex-grow border-t border-dashed border-gray-200" />
        </div>

        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => handleOAuth('google')}
            disabled={oauthLoading !== null}
            title="Sign in with Google"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-50 transition grow"
          >
            {oauthLoading === 'google'
              ? <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />}
          </button>
          <button
            onClick={() => handleOAuth('facebook')}
            disabled={oauthLoading !== null}
            title="Sign in with Facebook"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-50 transition grow"
          >
            {oauthLoading === 'facebook'
              ? <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-6 h-6" />}
          </button>
          <button
            onClick={() => handleOAuth('apple')}
            disabled={oauthLoading !== null}
            title="Sign in with Apple"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-50 transition grow"
          >
            {oauthLoading === 'apple'
              ? <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-6 h-6" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          No account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline font-medium">Sign up free</a>
        </p>
      </div>
    </div>
  );
}
