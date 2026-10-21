import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { isGardenActivityType } from '@/lib/mindGardenGrowth';
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
    const body = await request.json();
    const activityType = body?.activityType;
    if (typeof activityType !== 'string' || !isGardenActivityType(activityType)) {
      return NextResponse.json({ success: false, error: 'Invalid activity type' }, { status: 400 });
    }

    const result = await recordGardenActivity(payload.userId, activityType);
    return NextResponse.json({
      success: true,
      data: { garden: result.garden, pointsEarned: result.points },
      message: result.awarded
        ? `+${result.points} growth points added.`
        : 'You have already received growth for this activity today.',
    });
  } catch (error) {
    console.error('Error tracking Mind Garden activity:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
