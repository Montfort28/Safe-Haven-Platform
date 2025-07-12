// /api/mind-garden/stats/route.ts - Get Growth Statistics
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

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
    const stats = await getGrowthStats(payload.userId);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching growth stats:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function getGrowthStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  try {
    // Today's points
    const todayActivities = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: today } },
    });
    const todayPoints = todayActivities.reduce((sum, activity) => sum + activity.points, 0);

    // Week's points
    const weekActivities = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: lastWeek } },
    });
    const weekPoints = weekActivities.reduce((sum, activity) => sum + activity.points, 0);

    // Month's points
    const monthActivities = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: lastMonth } },
    });
    const monthPoints = monthActivities.reduce((sum, activity) => sum + activity.points, 0);

    // Get current garden state for total points
    const garden = await prisma.mindGarden.findUnique({
      where: { userId },
    });

    const currentPoints = garden?.growthScore || 0;

    // Calculate next milestone
    const nextMilestone = getNextMilestone(currentPoints);

    return {
      todayPoints,
      weekPoints,
      monthPoints,
      nextMilestone
    };
  } catch (error) {
    console.error('Error getting growth stats:', error);
    return {
      todayPoints: 0,
      weekPoints: 0,
      monthPoints: 0,
      nextMilestone: { points: 25, reward: 'First Sprout' }
    };
  }
}

function getNextMilestone(currentPoints: number) {
  const milestones = [
    { points: 25, reward: 'First Sprout' },
    { points: 50, reward: 'Growing Strong' },
    { points: 75, reward: 'Flourishing Tree' },
    { points: 100, reward: 'Ancient Wisdom' },
  ];

  return milestones.find(milestone => milestone.points > currentPoints) || 
         { points: 100, reward: 'Master Gardener' };
}
