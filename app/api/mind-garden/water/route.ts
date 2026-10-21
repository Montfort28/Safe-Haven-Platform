// /api/mind-garden/water/route.ts - Water Tree Action
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { recordGardenActivity } from '@/lib/mindGarden';

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
    const result = await recordGardenActivity(payload.userId, 'tree_watered');
    if (!result.awarded) {
      return NextResponse.json({
        success: true,
        data: { garden: result.garden, pointsEarned: 0 },
        message: 'You have already tended your garden today. There is no need to do it again.',
      });
    }

    return NextResponse.json({
      success: true,
      data: { garden: result.garden, pointsEarned: result.points },
      message: 'You spent a moment tending your garden. +5 growth points.',
    });
  } catch (error) {
    console.error('Error watering tree:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
