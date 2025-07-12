// /api/mind-garden/ambient/route.ts - Update Ambient Mode
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  try {
    const { ambientMode } = await request.json();

    if (!['forest', 'mountain', 'desert', 'ocean', 'space'].includes(ambientMode)) {
      return NextResponse.json({ success: false, error: 'Invalid ambient mode' }, { status: 400 });
    }

    const updatedGarden = await prisma.mindGarden.update({
      where: { userId: payload.userId },
      data: { ambientMode },
    });

    return NextResponse.json({
      success: true,
      data: updatedGarden,
      message: `Ambient mode changed to ${ambientMode}`
    });
  } catch (error) {
    console.error('Error updating ambient mode:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}