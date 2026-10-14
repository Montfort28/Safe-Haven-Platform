'use client';

import { usePathname } from 'next/navigation';

const memberRoutes = [
  '/dashboard',
  '/games',
  '/journal',
  '/mind-garden',
  '/mood',
  '/profile',
  '/resources',
];

export default function MemberTheme({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMemberRoute = memberRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  return (
    <div className={isMemberRoute ? 'member-app' : undefined}>
      {children}
    </div>
  );
}
