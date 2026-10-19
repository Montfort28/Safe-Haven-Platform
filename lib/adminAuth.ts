import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'safehaven_admin';
const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

type AdminToken = jwt.JwtPayload & { role: 'admin' };

export function adminSessionMaxAge(): number {
  return ADMIN_SESSION_SECONDS;
}

export function isAdminAuthenticationConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL?.trim() &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PASSWORD.length >= 20 &&
    process.env.JWT_SECRET
  );
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!isAdminAuthenticationConfigured() || !configuredEmail || !configuredPassword) return false;

  const emailMatches = safeEqual(email.trim().toLowerCase(), configuredEmail);
  const passwordMatches = safeEqual(password, configuredPassword);
  return emailMatches && passwordMatches;
}

export function createAdminToken(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ role: 'admin' }, secret, {
    subject: 'safe-haven-admin',
    expiresIn: ADMIN_SESSION_SECONDS,
  });
}

export function isAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;

  try {
    const payload = jwt.verify(token, secret);
    return (
      typeof payload !== 'string' &&
      payload.sub === 'safe-haven-admin' &&
      payload.role === 'admin'
    );
  } catch {
    return false;
  }
}

function safeEqual(candidate: string, expected: string): boolean {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return (
    candidateBytes.length === expectedBytes.length &&
    timingSafeEqual(candidateBytes, expectedBytes)
  );
}
