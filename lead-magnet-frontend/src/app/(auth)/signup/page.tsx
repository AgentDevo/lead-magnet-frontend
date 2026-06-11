'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Lock, Mail, User, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase-browser';

const OAUTH_REDIRECT = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://192.168.1.241:3002'}/auth/callback`;

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) { setError('Please accept the Privacy Policy to continue.'); return; }
    if (!fullName || !email || !password) { setError('Please fill in all fields.'); return; }
    if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await signup(email, password, fullName);
      router.replace('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Signup failed. Please try again.';
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
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white rounded-xl z-1">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-blue-100 text-black">
        <Link href="/" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition" title="Back to home">
          <X className="w-5 h-5" />
        </Link>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg">
          <UserPlus className="w-7 h-7 text-black" />
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-center">Create your account</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Start generating lead magnets and capturing leads. For free
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-4 h-4" />
            </span>
            <input
              placeholder="Full name"
              type="text"
              value={fullName}
              required
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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
              placeholder="Password (min. 8 characters)"
              type="password"
              value={password}
              required
              minLength={8}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              id="privacyAccepted"
              type="checkbox"
              required
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-gray-800 cursor-pointer"
            />
            <label htmlFor="privacyAccepted" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
              I have read and accept the{' '}
              <Link href="/privacy" target="_blank" className="text-blue-500 hover:underline font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !privacyAccepted}
            className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 disabled:opacity-60 cursor-pointer transition mt-1"
          >
            {loading ? 'Creating account…' : 'Get Started'}
          </button>
        </form>

        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-dashed border-gray-200" />
          <span className="mx-2 text-xs text-gray-400">Or sign up with</span>
          <div className="flex-grow border-t border-dashed border-gray-200" />
        </div>

        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => handleOAuth('google')}
            disabled={oauthLoading !== null || !privacyAccepted}
            title="Sign up with Google"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-50 transition grow"
          >
            {oauthLoading === 'google'
              ? <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />}
          </button>
          <button
            onClick={() => handleOAuth('facebook')}
            disabled={oauthLoading !== null || !privacyAccepted}
            title="Sign up with Facebook"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-50 transition grow"
          >
            {oauthLoading === 'facebook'
              ? <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-6 h-6" />}
          </button>
          <button
            onClick={() => handleOAuth('apple')}
            disabled={oauthLoading !== null || !privacyAccepted}
            title="Sign up with Apple"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-50 transition grow"
          >
            {oauthLoading === 'apple'
              ? <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-6 h-6" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline font-medium">Sign in</a>
        </p>
      </div>
    </div>
  );
}
