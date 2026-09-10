import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Github
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export default function AuthCard({ initialMode = 'signin', onSuccess }: AuthCardProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split('@')[0],
        });

        if (signUpError) {
          setError(signUpError.message || 'Failed to create account. Please check credentials.');
          setLoading(false);
          return;
        }

        setSuccessMsg(t('auth.authenticating', 'Account created successfully! Redirecting...'));
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push('/admin');
        }, 800);
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        setSuccessMsg(t('auth.authenticating', 'Signed in successfully! Redirecting to Command Center...'));
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push('/admin');
        }, 600);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    setError(null);
    setOauthLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to initiate ${provider} sign-in.`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-slate-200 dark:border-gray-800 shadow-2xl relative overflow-hidden transition-colors">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {mode === 'signin' ? t('auth.signInTitle', 'Sign In to InfraTrack') : t('auth.signUpTitle', 'Create Official Account')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 font-medium">
          {t('auth.subtitle', 'Smart India Hackathon 2026 • Infrastructure Monitoring Portal')}
        </p>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1 mt-6 rounded-lg bg-slate-100 dark:bg-gray-950/60 border border-slate-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('auth.signInTab', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('auth.signUpTab', 'Register')}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1.5">
              {t('auth.fullNameLabel', 'Full Name / Officer Designation')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Er. Rajesh Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1.5">
            {t('auth.emailLabel', 'Official Email Address')}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@infra.gov.in"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1.5">
            {t('auth.passwordLabel', 'Password')}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-3" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>
          {mode === 'signup' && (
            <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">
              {t('auth.passwordHint', 'Minimum 8 characters with scrypt DB hashing.')}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('auth.authenticating', 'Authenticating...')}</span>
            </>
          ) : (
            <>
              <span>{mode === 'signin' ? t('auth.signInBtn', 'Sign In with Credentials') : t('auth.signUpBtn', 'Register Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Social OAuth Section */}
      <div className="mt-6">
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-gray-800 w-full" />
          <span className="bg-white dark:bg-gray-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-gray-500 font-semibold absolute">
            {t('auth.orSso', 'or single sign-on')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => handleSocialSignIn('github')}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-gray-950/70 hover:bg-slate-100 dark:hover:bg-gray-800/80 border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-xs font-semibold text-slate-700 dark:text-gray-200 transition-colors disabled:opacity-50"
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Github className="w-4 h-4 text-slate-900 dark:text-white" />
            )}
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignIn('google')}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-gray-950/70 hover:bg-slate-100 dark:hover:bg-gray-800/80 border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-xs font-semibold text-slate-700 dark:text-gray-200 transition-colors disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14.1s.6 4.9 1.6 6.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.8 7.4 23 12 23z"
                />
              </svg>
            )}
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
