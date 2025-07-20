// /api/mind-garden/activity/route.ts - Track Activities
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
    const { activityType, points } = await request.json();

    // Validate activity types and points
    const validActivities = {
      'mood': 5,
      'journal': 10,
      'resource': 8,
      'game': 5,
      'checkin': 5,
      'tree_watered': 5
    };

    if (!validActivities[activityType as keyof typeof validActivities]) {
      return NextResponse.json({ success: false, error: 'Invalid activity type' }, { status: 400 });
    }

    const activityPoints = validActivities[activityType as keyof typeof validActivities];

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

    // Prevent point farming - limit points per activity type per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await prisma.activityLog.findMany({
      where: {
        userId: payload.userId,
        activityType,
        createdAt: { gte: today }
      }
    });

    // Set daily limits for each activity
    const dailyLimits = {
      'mood': 3,      // Max 3 mood logs per day
      'journal': 2,   // Max 2 journal entries per day
      'resource': 5,  // Max 5 resources per day
      'game': 3,      // Max 3 games per day
      'checkin': 1,   // Max 1 check-in per day
      'tree_watered': 1 // Max 1 watering per day
    };

    const dailyLimit = dailyLimits[activityType as keyof typeof dailyLimits];

    if (todayActivities.length >= dailyLimit) {
      return NextResponse.json({
        success: true,
        data: { garden, points: 0 },
        message: `Daily limit reached for ${activityType.replace('_', ' ')}`
      });
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: payload.userId,
        activityType,
        points: activityPoints,
      }
    });

    // Update garden
    const newGrowthScore = Math.min(100, garden.growthScore + activityPoints);
    const updatedGarden = await prisma.mindGarden.update({
      where: { userId: payload.userId },
      data: {
        growthScore: newGrowthScore,
        totalInteractions: garden.totalInteractions + 1,
        lastActivity: new Date(),
      },
    });

    // Check for achievements
    const newAchievements = await checkAndGrantAchievements(payload.userId, updatedGarden);

    return NextResponse.json({
      success: true,
      data: {
        garden: updatedGarden,
        pointsEarned: activityPoints,
        newAchievements,
      },
      message: `+${activityPoints} energy points earned!`
    });

  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

async function checkAndGrantAchievements(userId: string, garden: any): Promise<string[]> {
  try {
    let gameProgress = await prisma.gameProgress.findUnique({
      where: { userId },
    });

    if (!gameProgress) {
      gameProgress = await prisma.gameProgress.create({
        data: {
          userId,
          gamesPlayed: 0,
          totalTime: 0,
          achievements: [],
          streak: 0
        },
      });
    }

    const newAchievements: string[] = [];
    const currentAchievements = gameProgress.achievements || [];

    // Growth Score Achievements
    if (garden.growthScore >= 25 && !currentAchievements.includes('energy_emerging')) {
      newAchievements.push('energy_emerging');
    }
    if (garden.growthScore >= 50 && !currentAchievements.includes('energy_growing')) {
      newAchievements.push('energy_growing');
    }
    if (garden.growthScore >= 75 && !currentAchievements.includes('energy_flourishing')) {
      newAchievements.push('energy_flourishing');
    }
    if (garden.growthScore >= 100 && !currentAchievements.includes('energy_mastery')) {
      newAchievements.push('energy_mastery');
    }

    // Streak Achievements
    if (garden.streak >= 3 && !currentAchievements.includes('streak_starter')) {
      newAchievements.push('streak_starter');
    }
    if (garden.streak >= 7 && !currentAchievements.includes('week_warrior')) {
      newAchievements.push('week_warrior');
    }
    if (garden.streak >= 30 && !currentAchievements.includes('month_master')) {
      newAchievements.push('month_master');
    }

    // Interaction Achievements
    if (garden.totalInteractions >= 10 && !currentAchievements.includes('active_cultivator')) {
      newAchievements.push('active_cultivator');
    }
    if (garden.totalInteractions >= 50 && !currentAchievements.includes('dedicated_gardener')) {
      newAchievements.push('dedicated_gardener');
    }

    // Update achievements if there are new ones
    if (newAchievements.length > 0) {
      await prisma.gameProgress.update({
        where: { userId },
        data: {
          achievements: [...currentAchievements, ...newAchievements],
        },
      });
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}