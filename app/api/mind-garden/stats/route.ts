import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { getGardenCondition, getGardenGrowthProgress } from '@/lib/mindGardenGrowth';

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  try {
    const garden = await prisma.mindGarden.upsert({
      where: { userId: payload.userId },
      create: {
        userId: payload.userId,
        growthScore: 0,
        streak: 0,
        ambientMode: 'forest',
        totalInteractions: 0,
        lastActivity: new Date(),
      },
      update: {},
    });

    const recentActivities = await prisma.activityLog.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { activityType: true, points: true, createdAt: true },
    });

    const growth = getGardenGrowthProgress(garden.growthScore);

    return NextResponse.json({
      success: true,
      data: {
        garden: {
          treeStage: growth.stage.id,
          condition: getGardenCondition(garden.lastActivity, new Date(), recentActivities[1]?.createdAt),
          totalPoints: garden.growthScore,
          lastNurturedAt: garden.lastActivity.toISOString(),
          activities: recentActivities.map((activity) => ({
            type: activity.activityType,
            points: activity.points,
            timestamp: activity.createdAt.toISOString(),
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching Mind Garden:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
