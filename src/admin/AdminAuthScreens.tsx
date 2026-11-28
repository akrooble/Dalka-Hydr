import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Gavel,
  MailCheck,
  RefreshCw,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { ThemeToggle } from '../components/ThemeToggle';
import { ADMIN_EMAIL } from '../lib/adminFirestore';
import { getPublicSiteHref, isAdminHost } from '../lib/domainRouting';
import { auth } from '../lib/firebase';

export type AdminAuthMode = 'login' | 'signup' | 'forgot';

const ADMIN_CAPABILITIES = [
  {
    icon: Briefcase,
    title: 'Jobs & Direct Employer Routing',
    desc: 'Publish openings with salaries, deadlines, and official application URLs or emails.',
  },
  {
    icon: Gavel,
    title: 'Institutional Tenders',
    desc: 'Manage procurement RFPs, reference numbers, budgets, and bid statuses.',
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace & Editorial Guides',
    desc: 'Update digital toolkits, books, stock availability, and career insights.',
  },
  {
    icon: Users,
    title: 'Role-Based Team Access',
    desc: 'Invite staff members, assign module permissions, and track visitor & newsletter leads.',
  },
];

function getFriendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const message = err instanceof Error ? err.message : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Double-check your details or reset your password.';
    case 'auth/email-already-in-use':
      return 'An account already exists for this email. Sign in or use Forgot Password.';
    case 'auth/weak-password':
      return 'Please choose a stronger password (at least 6 characters).';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Authentication yet. Enable it under Firebase Console → Authentication → Sign-in method, or sign in with Google below.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/unauthorized-domain': {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain "${host}" is not authorized in Firebase Authentication. Add it under Firebase Console → Authentication → Settings → Authorized domains.`;
    }
    default:
      if (message.includes('auth/unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        return `Domain "${host}" is not authorized in Firebase Authentication. Add it under Firebase Console → Authentication → Settings → Authorized domains.`;
      }
      return message || 'Authentication failed. Please try again.';
  }
}

export function AdminAuthShell({ children }: { children: ReactNode }) {
  const publicSiteHref = getPublicSiteHref();
  const isExternalPublic = publicSiteHref !== '/';

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Editorial Scope Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0B1C30] dark:bg-[#111622] text-white p-12 flex-col justify-between border-r border-slate-800">
        <div className="space-y-10">
          <BrandMark label="dalkajobs Admin" size="md" forceDark />

          <div>
            <p className="text-xs font-semibold tracking-wide text-[#A5B4FC]">
              Unified Operations Console
            </p>
            <h1 className="mt-2.5 text-3xl font-bold tracking-tight leading-tight text-white text-balance">
              Manage every listing, resource, and visitor lead in one place.
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md">
              Changes published here sync instantaneously across the public Dalka Jobs website and installable mobile PWA.
            </p>
          </div>

          <div className="space-y-5 pt-4 border-t border-slate-800">
            {ADMIN_CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-lg bg-[#1B2A42] border border-slate-700/80 flex items-center justify-center shrink-0 text-[#A5B4FC]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{cap.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Protected by Firebase Authentication &amp; Role-Based Security Rules.
        </p>
      </div>

      {/* Right Auth Workspace */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between gap-4">
          {isExternalPublic ? (
            <a
              href={publicSiteHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Public Website</span>
            </a>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Public Website</span>
            </Link>
          )}
          <ThemeToggle iconOnly />
        </div>

        <div className="mx-auto w-full max-w-md my-8 sm:my-10 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="lg:hidden">
            <BrandMark label="dalkajobs Admin" size="md" />
          </div>
          {children}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B] dark:text-slate-500">
          <span>Dalka Jobs Administration</span>
          <a
            href="/Dalka-Jobs-QA-Guide.pdf"
            download="Dalka-Jobs-QA-Guide.pdf"
            className="inline-flex items-center gap-1.5 font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download QA Guide (PDF)</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function AdminAuthView() {
  const location = useLocation();
  const navigate = useNavigate();
  const basePrefix = isAdminHost() ? '' : '/admin';

  const mode: AdminAuthMode = location.pathname.endsWith('/signup')
    ? 'signup'
    : location.pathname.endsWith('/forgot-password')
      ? 'forgot'
      : 'login';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyExistsPrompt, setAlreadyExistsPrompt] = useState(false);
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);

  function goToMode(next: AdminAuthMode) {
    setError(null);
    setAlreadyExistsPrompt(false);
    setResetSentTo(null);
    if (next === 'signup') {
      navigate(`${basePrefix}/signup`);
    } else if (next === 'forgot') {
      navigate(`${basePrefix}/forgot-password`);
    } else {
      navigate(basePrefix || '/');
    }
  }

  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignupSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAlreadyExistsPrompt(false);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both password fields.');
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      if (fullName.trim()) {
        await updateProfile(credential.user, { displayName: fullName.trim() });
      }
      await sendEmailVerification(credential.user);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/email-already-in-use') {
        setAlreadyExistsPrompt(true);
      }
      setError(getFriendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResetSentTo(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your team email address.');
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetSentTo(trimmedEmail);
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setAlreadyExistsPrompt(false);
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]';

  return (
    <AdminAuthShell>
      {mode !== 'forgot' ? (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => goToMode('login')}
            className={`h-9 rounded-md text-xs font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-white dark:bg-[#161B22] text-[#0B1C30] dark:text-[#F8FAFC] shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => goToMode('signup')}
            className={`h-9 rounded-md text-xs font-semibold transition-colors ${
              mode === 'signup'
                ? 'bg-white dark:bg-[#161B22] text-[#0B1C30] dark:text-[#F8FAFC] shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Create Account
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => goToMode('login')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </button>
      )}

      {mode === 'login' && (
        <>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
              Team &amp; Admin Sign In
            </h2>
            <p className="mt-1.5 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
              Sign in with your Dalka Jobs team credentials or authorized Google account.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-xs text-[#93000A] dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5"
              >
                Work Email
              </label>
              <input
                id="admin-login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="admin-login-password"
                  className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => goToMode('forgot')}
                  className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative flex items-center py-0.5">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="mx-3 shrink-0 text-[11px] font-medium text-[#64748B] dark:text-slate-400">
              or continue with
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          <button
            type="button"
            disabled={googleLoading || submitting}
            onClick={handleGoogleSignIn}
            className="w-full h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] disabled:opacity-60 transition-colors"
          >
            {googleLoading ? 'Connecting Google...' : 'Sign in with Google'}
          </button>

          <p className="text-xs text-center text-[#64748B] dark:text-slate-400">
            New team member?{' '}
            <button
              type="button"
              onClick={() => goToMode('signup')}
              className="font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
            >
              Create account once
            </button>
          </p>
        </>
      )}

      {mode === 'signup' && (
        <>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
              Create Team Account
            </h2>
            <p className="mt-1.5 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
              Register your account once. If a Super Admin already invited your email, your role activates immediately; otherwise an admin will assign your role.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-xs text-[#93000A] dark:text-red-300 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {alreadyExistsPrompt && (
                <div className="flex flex-wrap gap-3 pl-6">
                  <button
                    type="button"
                    onClick={() => goToMode('login')}
                    className="font-semibold underline"
                  >
                    Go to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => goToMode('forgot')}
                    className="font-semibold underline"
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-signup-name"
                className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="admin-signup-name"
                type="text"
                required
                autoComplete="name"
                maxLength={80}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Amina Hassan"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="admin-signup-email"
                className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5"
              >
                Work Email *
              </label>
              <input
                id="admin-signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dalkajobs.com"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="admin-signup-password"
                className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5"
              >
                Create Password * (min 8 chars)
              </label>
              <div className="relative">
                <input
                  id="admin-signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-signup-confirm"
                className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="admin-signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-center text-[#64748B] dark:text-slate-400">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => goToMode('login')}
              className="font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
            >
              Sign in instead
            </button>
          </p>
        </>
      )}

      {mode === 'forgot' && (
        <>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
              Forgot Password
            </h2>
            <p className="mt-1.5 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
              Enter your email address and we&apos;ll send a password reset link right away.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-xs text-[#93000A] dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSentTo ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#4648D4]/25 dark:border-[#6366F1]/40 bg-[#EFF4FF] dark:bg-[#1E2430] p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Reset Link Sent</span>
                </div>
                <p className="text-xs text-[#0B1C30] dark:text-slate-300 leading-relaxed">
                  Password reset instructions have been sent to{' '}
                  <span className="font-mono font-semibold">{resetSentTo}</span>. Check your inbox or spam folder, set your new password, then sign in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToMode('login')}
                className="w-full h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-forgot-email"
                  className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5"
                >
                  Work Email
                </label>
                <input
                  id="admin-forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ADMIN_EMAIL}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </>
      )}

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
        <span>Role-Based Access Control</span>
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          <span>Live Firestore Sync</span>
        </span>
      </div>
    </AdminAuthShell>
  );
}

interface AdminVerifyEmailViewProps {
  user: User;
  onRefreshStatus: () => Promise<boolean>;
  onSignOut: () => Promise<void>;
}

export function AdminVerifyEmailView({
  user,
  onRefreshStatus,
  onSignOut,
}: AdminVerifyEmailViewProps) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckVerified() {
    setError(null);
    setNotice(null);
    setChecking(true);
    try {
      const isNowVerified = await onRefreshStatus();
      if (!isNowVerified) {
        setNotice('Email is not verified yet. Please click the link in your inbox, then check again.');
      }
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      await sendEmailVerification(user);
      setNotice(`Verification link re-sent to ${user.email}.`);
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <AdminAuthShell>
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#EFF4FF] dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8]">
        <MailCheck className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
          Verify Your Email
        </h2>
        <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
          Your account was created. Please open the verification link sent to{' '}
          <span className="font-mono text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
            {user.email}
          </span>{' '}
          before continuing.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-xs text-[#93000A] dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0D1117] px-3.5 py-2.5 text-xs text-[#0B1C30] dark:text-slate-300">
          {notice}
        </div>
      )}

      <div className="space-y-2.5">
        <button
          type="button"
          disabled={checking}
          onClick={handleCheckVerified}
          className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking Status...' : "I've Verified — Continue"}</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] disabled:opacity-60 transition-colors"
          >
            {resending ? 'Sending...' : 'Resend Link'}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-xs font-semibold text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </AdminAuthShell>
  );
}

interface AdminAccessNoticeViewProps {
  user: User;
  variant: 'pending_approval' | 'rejected' | 'suspended';
  onSignOut: () => Promise<void>;
}

export function AdminAccessNoticeView({
  user,
  variant,
  onSignOut,
}: AdminAccessNoticeViewProps) {
  const isPending = variant === 'pending_approval';
  const isSuspended = variant === 'suspended';

  return (
    <AdminAuthShell>
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${
          isPending
            ? 'bg-[#EFF4FF] dark:bg-[#1E2430] text-[#4648D4] dark:text-[#818CF8]'
            : 'bg-red-50 dark:bg-red-950/50 text-[#BA1A1A] dark:text-red-400'
        }`}
      >
        {isPending ? <Clock className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
          {isPending
            ? 'Awaiting Role Assignment'
            : isSuspended
              ? 'Account Suspended'
              : 'Access Not Approved'}
        </h2>
        <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 leading-relaxed">
          {isPending ? (
            <>
              Your verified account{' '}
              <span className="font-mono text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                {user.email}
              </span>{' '}
              has been registered and sent to the Dalka Jobs Super Admin. Once a role and permissions are assigned to you, this screen updates automatically.
            </>
          ) : isSuspended ? (
            <>
              Your team account{' '}
              <span className="font-mono text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                {user.email}
              </span>{' '}
              is currently suspended. Contact your Workspace Owner ({ADMIN_EMAIL}) to restore access.
            </>
          ) : (
            <>
              Your access request for{' '}
              <span className="font-mono text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                {user.email}
              </span>{' '}
              was not approved for admin access.
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="w-full h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors"
      >
        Sign Out &amp; Switch Account
      </button>
    </AdminAuthShell>
  );
}
