// /api/mind-garden/route.ts - GET Garden State
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
    let garden = await prisma.mindGarden.findUnique({
      where: { userId: payload.userId },
    });

    if (!garden) {
      // Create default garden for new users
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

    // Get achievements
    const gameProgress = await prisma.gameProgress.findUnique({
      where: { userId: payload.userId },
    });

    // Get recent activity logs for the frontend
    const recentActivities = await prisma.activityLog.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate tree properties based on growth score
    const treeHealth = Math.min(100, garden.growthScore);
    const treeStage = getTreeStage(garden.growthScore);
    const soilQuality = Math.min(100, garden.totalInteractions * 2);
    const sunlightHours = Math.min(24, garden.streak * 2);

    // Get weekly growth data
    const weeklyGrowth = await getWeeklyGrowthData(payload.userId);

    const formattedGarden = {
      id: garden.id,
      treeHealth,
      treeStage,
      streak: garden.streak,
      totalPoints: garden.growthScore,
      lastWatered: garden.lastActivity.toISOString(),
      soilQuality,
      sunlightHours,
      achievements: formatAchievements(gameProgress?.achievements || []),
      weeklyGrowth,
      activities: recentActivities.map(activity => ({
        type: activity.activityType,
        points: activity.points,
        timestamp: activity.createdAt.toISOString()
      }))
    };

    return NextResponse.json({ success: true, data: formattedGarden });
  } catch (error) {
    console.error('Error fetching Mind Garden:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

function getTreeStage(growthScore: number): string {
  if (growthScore < 10) return 'seed';
  if (growthScore < 30) return 'sprout';
  if (growthScore < 60) return 'sapling';
  if (growthScore < 90) return 'tree';
  return 'ancient';
}

function formatAchievements(achievementCodes: string[]) {
  const achievementData: Record<string, any> = {
    'energy_emerging': {
      title: 'Energy Emerging',
      description: 'Reached 25 growth points',
      icon: '🌱',
      rarity: 'common'
    },
    'energy_growing': {
      title: 'Energy Growing',
      description: 'Reached 50 growth points',
      icon: '🌿',
      rarity: 'rare'
    },
    'energy_flourishing': {
      title: 'Energy Flourishing',
      description: 'Reached 75 growth points',
      icon: '🌳',
      rarity: 'epic'
    },
    'energy_mastery': {
      title: 'Energy Mastery',
      description: 'Reached 100 growth points',
      icon: '✨',
      rarity: 'legendary'
    },
    'streak_starter': {
      title: 'Streak Starter',
      description: 'Maintained 3-day streak',
      icon: '🔥',
      rarity: 'common'
    },
    'week_warrior': {
      title: 'Week Warrior',
      description: 'Maintained 7-day streak',
      icon: '⚡',
      rarity: 'rare'
    },
    'month_master': {
      title: 'Month Master',
      description: 'Maintained 30-day streak',
      icon: '👑',
      rarity: 'legendary'
    },
    'active_cultivator': {
      title: 'Active Cultivator',
      description: '10 total interactions',
      icon: '🏃',
      rarity: 'common'
    },
    'dedicated_gardener': {
      title: 'Dedicated Gardener',
      description: '50 total interactions',
      icon: '💪',
      rarity: 'epic'
    }
  };

  return achievementCodes.map((code, index) => ({
    id: code,
    ...achievementData[code],
    unlockedAt: new Date().toISOString() // You might want to track actual unlock dates
  }));
}

async function getWeeklyGrowthData(userId: string): Promise<number[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  try {
    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: { gte: weekAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by day and sum points
    const dailyPoints = new Array(7).fill(0);
    activities.forEach(activity => {
      const dayIndex = Math.floor((new Date().getTime() - new Date(activity.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyPoints[6 - dayIndex] += activity.points;
      }
    });

    return dailyPoints;
  } catch (error) {
    console.error('Error getting weekly growth data:', error);
    return new Array(7).fill(0);
  }
}