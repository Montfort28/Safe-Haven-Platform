// /api/mind-garden/water/route.ts - Water Tree Action
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
    let garden = await prisma.mindGarden.findUnique({
      where: { userId: payload.userId },
    });

    if (!garden) {
      garden = await prisma.mindGarden.create({
        data: {
          userId: payload.userId,
          growthScore: 0,
          streak: 0,
          ambientMode: 'forest',
          totalInteractions: 0,
          lastActivity: new Date()
        },
      });
    }

    // Check if already watered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWater = await prisma.activityLog.findFirst({
      where: {
        userId: payload.userId,
        activityType: 'tree_watered',
        createdAt: { gte: today }
      }
    });

    if (todayWater) {
      return NextResponse.json({
        success: true,
        data: { garden },
        message: 'Tree already watered today. Come back tomorrow!'
      });
    }

    // Add watering activity
    await prisma.activityLog.create({
      data: {
        userId: payload.userId,
        activityType: 'tree_watered',
        points: 5,
      }
    });

    // Update garden (remove artificial cap, allow unlimited growth)
    const newGrowthScore = garden.growthScore + 5;
    const updatedGarden = await prisma.mindGarden.update({
      where: { userId: payload.userId },
      data: {
        growthScore: newGrowthScore,
        totalInteractions: garden.totalInteractions + 1,
        lastActivity: new Date(),
      },
    });

    // Get updated stats
    // Import getGrowthStats from stats route
    const { getGrowthStats } = await import('../stats/route');
    const stats = await getGrowthStats(payload.userId);

    return NextResponse.json({
      success: true,
      data: { garden: updatedGarden, stats },
      message: 'Tree watered successfully! +5 health points'
    });

  } catch (error) {
    console.error('Error watering tree:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// getGrowthStats is imported from stats/route
