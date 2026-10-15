'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowRight as ArrowRight, FaEye as Eye, FaEyeSlash as EyeOff } from 'react-icons/fa6';
import AuthLayout from '@/components/AuthLayout';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="auth-page min-h-screen" role="status">Loading registration…</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const loginHref =
    nextPath?.startsWith('/') && !nextPath.startsWith('//')
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : '/login';
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Your password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'We could not create your account. Please try again.');
        return;
      }

      const loginUrl = new URLSearchParams({ email });
      const nextPath = searchParams.get('next');
      if (nextPath?.startsWith('/') && !nextPath.startsWith('//')) {
        loginUrl.set('next', nextPath);
      }
      router.replace(`/login?${loginUrl.toString()}`);
    } catch {
      setError('We could not connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Make room for wellbeing"
      description="Create a Safe Haven account to check in with your mood, write in your journal, and explore calming activities. Take things one step at a time."
      panelTitle="Create your account"
      panelDescription="Build a personal space for reflection, gentle routines, and noticing your progress over time."
      footer={
        <>
          Already have an account? <Link href={loginHref}>Sign in</Link>
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
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Your name"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={event => setUsername(event.target.value)}
            placeholder="Choose a username"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <div className="auth-password-wrap">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
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
          {password && (
            <div className="auth-strength" aria-live="polite">
              <span>
                {['Getting started', 'Fair', 'Good', 'Strong', 'Very strong'][passwordStrength]}
              </span>
              <span className="auth-strength-track">
                <span
                  className="auth-strength-fill"
                  style={{ display: 'block', width: `${passwordStrength * 25}%` }}
                />
              </span>
            </div>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <div className="auth-password-wrap">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              minLength={6}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowConfirmPassword(value => !value)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Create account'}
          {!isLoading && <ArrowRight aria-hidden="true" size={17} />}
        </button>
      </form>
    </AuthLayout>
  );
}
