import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/journal', '/games', '/resources', '/profile', '/mood'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/journal/:path*', '/games/:path*', '/resources/:path*', '/profile/:path*', '/mood/:path*'],
};