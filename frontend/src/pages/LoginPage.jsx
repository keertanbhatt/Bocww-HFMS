import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandEmblem from '../components/layout/BrandEmblem';
import { ASSETS, COLORS, ORG } from '../constants/theme';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../services/api';

function UserIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20c1.5-3.5 4.5-5.5 7-5.5s5.5 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@bocw.gujarat.gov.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (role !== 'admin') {
      setError('Accountant login will be available in a later phase.');
      return;
    }
    setLoading(true);
    try {
      const result = await api.login(email, password);
      login(result);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative hidden min-h-screen lg:flex lg:w-[58%] xl:w-[60%]">
        <img
          src={ASSETS.landingBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
          <div className="flex items-start gap-3">
            <BrandEmblem className="h-12 w-12" />
            <div>
              <p className="text-sm font-bold leading-snug text-[#1d3d7d]">{ORG.boardNameShort}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#d32f2f] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  HFMS
                </span>
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                  Finance &amp; Management Portal
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-lg">
            <h2 className="text-3xl font-bold leading-tight text-[#1d3d7d] xl:text-4xl">
              Every rupee for our workers, tracked with care.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 xl:text-base">
              Scheme budgets, expenditure, teams and leave in one secure place for the Board&apos;s
              officers.
            </p>
            <p className="mt-4 text-sm font-semibold text-[#d32f2f]">
              સુરક્ષા · કલ્યાણ · ઉજ્જવળ ભવિષ્ય
            </p>
          </div>

          <div className="h-8" />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col bg-white">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sm:px-8">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-[#1d3d7d]">
            ← Back
          </Link>
          <span className="text-xs font-medium text-slate-500">Government of Gujarat</span>
        </header>

        <main className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-6 rounded-full bg-[#d32f2f]" aria-hidden />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d32f2f]">
                Officer sign-in
              </p>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-[#1d3d7d] sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your HFMS dashboard.
            </p>

            <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                  role === 'admin'
                    ? 'bg-white text-[#1d3d7d] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserIcon />
                Admin
              </button>
              <button
                type="button"
                disabled
                className="relative flex flex-1 items-center justify-center gap-1 rounded-lg py-2.5 text-sm font-medium text-slate-400"
              >
                Accountant
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-orange-700">
                  Soon
                </span>
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="user-id" className="mb-1.5 block text-sm font-medium text-slate-700">
                  User ID
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-[#1d3d7d] focus-within:ring-2 focus-within:ring-[#1d3d7d]/10">
                  <UserIcon />
                  <input
                    id="user-id"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 text-sm outline-none"
                    placeholder="Enter user ID"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <span className="text-xs text-[#1d3d7d]/70">Forgot password?</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-[#1d3d7d] focus-within:ring-2 focus-within:ring-[#1d3d7d]/10">
                  <LockIcon />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 text-sm outline-none"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={remember}
                  onClick={() => setRemember((v) => !v)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    remember ? 'bg-[#1d3d7d]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      remember ? 'left-[1.35rem]' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-600">Keep me signed in on this device</span>
              </label>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                style={{ backgroundColor: COLORS.portalNavy }}
              >
                {loading ? 'Signing in…' : 'Sign in as Admin →'}
              </button>
            </form>

            <div className="mt-6 flex gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
              <span className="text-[#d32f2f]" aria-hidden>
                ℹ
              </span>
              Trouble signing in? Contact the Board&apos;s IT help desk to reset your access.
            </div>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 text-[11px] text-slate-500 sm:px-8">
          <span>
            © 2026 {ORG.boardNameShort} · {ORG.systemName}
          </span>
          <span className="flex items-center gap-1">
            <LockIcon />
            Authorised personnel only · Activity is logged
          </span>
        </footer>
      </div>
    </div>
  );
}
