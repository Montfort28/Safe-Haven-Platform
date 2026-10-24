'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaArrowRight as ArrowRight, FaEye as Eye, FaEyeSlash as EyeOff } from 'react-icons/fa6';
import AuthLayout from '@/components/AuthLayout';

const memberRoutes = new Set([
  '/dashboard',
  '/games',
  '/journal',
  '/mind-garden',
  '/mood',
  '/profile',
  '/resources',
]);

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page min-h-screen" role="status">Loading sign in…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const registerHref =
    nextPath?.startsWith('/') && !nextPath.startsWith('//')
      ? `/register?next=${encodeURIComponent(nextPath)}`
      : '/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(searchParams.get('email') ?? '');
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'We could not sign you in. Check your details and try again.');
        return;
      }

      document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=lax`;
      const requestedPath = nextPath?.split(/[?#]/, 1)[0];
      const safeNextPath =
        nextPath?.startsWith('/') &&
        !nextPath.startsWith('//') &&
        requestedPath &&
        memberRoutes.has(requestedPath)
          ? nextPath
          : '/dashboard';
      window.location.replace(safeNextPath);
    } catch {
      setError('We could not connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="A calmer way forward"
      description="Sign in to your private space for reflection, small steps and steady support."
      panelTitle="Welcome back"
      panelDescription="Continue your wellbeing journey."
      helpingHandImage="/images/hand%20to%20hand.png"
      helpingHandPlacement="login"
      footer={
        <>
          New to Safe Haven? <Link href={registerHref}>Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <p className="auth-feedback" role="alert">
            {error}
          </p>
        )}

        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(value => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign in'}
          {!isLoading && <ArrowRight aria-hidden="true" size={17} />}
        </button>
      </form>
    </AuthLayout>
  );
}
