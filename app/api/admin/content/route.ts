import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/db';

const createSchema = z.object({
  content: z.string().trim().min(3).max(500),
});
const updateSchema = z.object({
  id: z.string().min(1),
  active: z.boolean(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }

  try {
    const affirmations = await prisma.affirmation.findMany({
      select: { id: true, content: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
      { success: true, data: affirmations },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Admin affirmation query failed:', error);
    return NextResponse.json({ error: 'Could not load affirmations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Affirmation must be 3 to 500 characters.' }, { status: 400 });
  }

  try {
    const affirmation = await prisma.affirmation.create({
      data: { content: parsed.data.content },
      select: { id: true, content: true, active: true, createdAt: true },
    });
    return NextResponse.json(
      { success: true, data: affirmation },
      { status: 201, headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'That affirmation already exists.' }, { status: 409 });
    }
    console.error('Admin affirmation create failed:', error);
    return NextResponse.json({ error: 'Could not create the affirmation.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid affirmation update.' }, { status: 400 });
  }

  try {
    const affirmation = await prisma.affirmation.update({
      where: { id: parsed.data.id },
      data: { active: parsed.data.active },
      select: { id: true, content: true, active: true, createdAt: true },
    });
    return NextResponse.json(
      { success: true, data: affirmation },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ error: 'Affirmation not found.' }, { status: 404 });
    }
    console.error('Admin affirmation update failed:', error);
    return NextResponse.json({ error: 'Could not update the affirmation.' }, { status: 500 });
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaErrorCode(error, 'P2002');
}

function isRecordNotFoundError(error: unknown): boolean {
  return isPrismaErrorCode(error, 'P2025');
}

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}
