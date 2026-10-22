'use client';

import { useRouter } from 'next/navigation';

export default function HomeSignInButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="home-nav-cta home-nav-button"
      onClick={() => router.push('/login')}
    >
      Sign in
      <span className="signin-icon" aria-hidden="true" />
    </button>
  );
}
