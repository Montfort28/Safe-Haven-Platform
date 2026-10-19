import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ADMIN_SESSION_COOKIE,
  adminSessionMaxAge,
  createAdminToken,
  isAdminAuthenticationConfigured,
  verifyAdminCredentials,
} from '@/lib/adminAuth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
  }

  if (!isAdminAuthenticationConfigured()) {
    return NextResponse.json(
      { error: 'Admin sign-in is not configured on this server.' },
      { status: 503 }
    );
  }

  if (!verifyAdminCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: adminSessionMaxAge(),
  });
  return response;
}
