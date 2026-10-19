'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Admin sign-in failed.');
        return;
      }
      router.replace('/admin');
    } catch {
      setError('Could not connect to the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-shell">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="admin-eyebrow">Safe Haven · Restricted access</span>
        <h1>Admin sign in</h1>
        <p>This area contains aggregate service information, not private user reflections.</p>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <label htmlFor="admin-email">Admin email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in securely'}</button>
      </form>
    </main>
  );
}
