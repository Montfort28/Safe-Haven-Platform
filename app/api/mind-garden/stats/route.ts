// /api/mind-garden/stats/route.ts - Get Growth Statistics

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { GET as getGardenRoute } from '../route';

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
    // Get stats
    const stats = await getGrowthStats(payload.userId);

    // Get garden (call the logic from /api/mind-garden/route.ts directly)
    // Inline the logic here to avoid Next.js route handler issues
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

    // Calculate tree properties - let growth score grow unlimited
    const growthScore = garden.growthScore;
    // Health is percent progress toward 10,000 points (Legendary Tree)
    const treeHealth = Math.min(100, Math.floor((growthScore / 10000) * 100));
    const treeStage = getTreeStage(growthScore); // Use new stage system
    const soilQuality = Math.min(100, garden.totalInteractions * 2);
    const sunlightHours = Math.min(24, garden.streak * 2);

    // Get weekly growth data
    const weeklyGrowth = await getWeeklyGrowthData(payload.userId);

    // Updated milestone achievements for new point system
    const milestoneAchievements = [];
    if (growthScore >= 50) milestoneAchievements.push('energy_emerging');
    if (growthScore >= 200) milestoneAchievements.push('energy_growing');
    if (growthScore >= 600) milestoneAchievements.push('energy_flourishing');
    if (growthScore >= 1500) milestoneAchievements.push('energy_mastery');
    if (growthScore >= 4000) milestoneAchievements.push('energy_ancient');
    if (growthScore >= 10000) milestoneAchievements.push('energy_legendary');
    if (garden.streak >= 3) milestoneAchievements.push('streak_starter');
    if (garden.streak >= 7) milestoneAchievements.push('week_warrior');
    if (garden.streak >= 30) milestoneAchievements.push('month_master');
    if (garden.totalInteractions >= 10) milestoneAchievements.push('active_cultivator');
    if (garden.totalInteractions >= 50) milestoneAchievements.push('dedicated_gardener');

    // Map activities to show type and points
    const activities = recentActivities.map(activity => ({
      type: activity.activityType,
      points: activity.points,
      timestamp: activity.createdAt.toISOString()
    }));

    const formattedGarden = {
      id: garden.id,
      treeHealth, // for health bar (0-100)
      treeStage,  // for stage (seed, sprout, etc.)
      streak: garden.streak,
      totalPoints: growthScore, // show real points from DB
      lastWatered: garden.lastActivity.toISOString(),
      soilQuality,
      sunlightHours,
      achievements: formatAchievements(milestoneAchievements),
      weeklyGrowth,
      activities // show all recent activities with type and points
    };

    return NextResponse.json({ success: true, data: { garden: formattedGarden, stats } });
  } catch (error) {
    console.error('Error fetching growth stats:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// --- Helper functions updated for new tree stage system ---
function getTreeStage(points: number): string {
  if (points < 50) return 'seed';
  if (points < 200) return 'sprout';
  if (points < 600) return 'sapling';
  if (points < 1500) return 'youngTree';
  if (points < 4000) return 'matureTree';
  if (points < 10000) return 'ancientTree';
  return 'legendaryTree';
}

function formatAchievements(achievementCodes: string[]) {
  const achievementData: Record<string, any> = {
    'energy_emerging': {
      title: 'Energy Emerging',
      description: 'Reached 50 growth points',
      icon: '🌱',
      rarity: 'common'
    },
    'energy_growing': {
      title: 'Energy Growing',
      description: 'Reached 200 growth points',
      icon: '🌿',
      rarity: 'rare'
    },
    'energy_flourishing': {
      title: 'Energy Flourishing',
      description: 'Reached 600 growth points',
      icon: '🌳',
      rarity: 'epic'
    },
    'energy_mastery': {
      title: 'Energy Mastery',
      description: 'Reached 1,500 growth points',
      icon: '✨',
      rarity: 'legendary'
    },
    'energy_ancient': {
      title: 'Energy Ancient',
      description: 'Reached 4,000 growth points',
      icon: '🏛️',
      rarity: 'mythic'
    },
    'energy_legendary': {
      title: 'Energy Legendary',
      description: 'Reached 10,000 growth points',
      icon: '👑',
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
      nextMilestone: { points: 50, reward: 'First Sprout' }
    };
  }
}

function getNextMilestone(currentPoints: number) {
  const milestones = [
    { points: 50, reward: 'First Sprout' },
    { points: 200, reward: 'Growing Strong' },
    { points: 600, reward: 'Flourishing Sapling' },
    { points: 1500, reward: 'Young Tree' },
    { points: 4000, reward: 'Mature Tree' },
    { points: 10000, reward: 'Ancient Wisdom' },
  ];

  return milestones.find(milestone => milestone.points > currentPoints) ||
    { points: 10000, reward: 'Legendary Master' };
}