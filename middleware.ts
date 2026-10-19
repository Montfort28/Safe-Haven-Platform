import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/journal',
  '/games',
  '/resources',
  '/profile',
  '/mood',
  '/mind-garden',
];

export function middleware(request: NextRequest) {
  const isAdminPage =
    request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/admin/login';
  if (isAdminPage) {
    if (!request.cookies.get('safehaven_admin')?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const isProtectedRoute = protectedRoutes.some(
    route =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !token) {
    const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/journal/:path*',
    '/games/:path*',
    '/resources/:path*',
    '/profile/:path*',
    '/mood/:path*',
    '/mind-garden/:path*',
    '/admin/:path*',
  ],
};