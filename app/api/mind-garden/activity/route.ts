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
      'tree_watered': 5,
      'gratitude': 10 // Added support for gratitude activity
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

    // --- Streak logic ---
    let newStreak = garden.streak;
    // Support streak for checkin, journal, journal_written, mood, mood_logged
    const streakEligible = ['checkin', 'journal', 'journal_written', 'mood', 'mood_logged'];
    if (streakEligible.includes(activityType)) {
      // Improved streak logic: increment if last activity was yesterday, keep streak if today, reset if not consecutive
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActivityDate = garden.lastActivity ? new Date(garden.lastActivity) : null;
      if (lastActivityDate) {
        lastActivityDate.setHours(0, 0, 0, 0);
        if (lastActivityDate.getTime() === yesterday.getTime()) {
          newStreak = garden.streak + 1;
        } else if (lastActivityDate.getTime() === today.getTime()) {
          newStreak = garden.streak;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    // Update garden - Remove artificial cap, let growth score grow unlimited
    const newGrowthScore = garden.growthScore + activityPoints;
    const updatedGarden = await prisma.mindGarden.update({
      where: { userId: payload.userId },
      data: {
        growthScore: newGrowthScore,
        totalInteractions: garden.totalInteractions + 1,
        lastActivity: new Date(),
        streak: newStreak,
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

    // Updated Growth Score Achievements for new point system
    if (garden.growthScore >= 50 && !currentAchievements.includes('energy_emerging')) {
      newAchievements.push('energy_emerging');
    }
    if (garden.growthScore >= 200 && !currentAchievements.includes('energy_growing')) {
      newAchievements.push('energy_growing');
    }
    if (garden.growthScore >= 600 && !currentAchievements.includes('energy_flourishing')) {
      newAchievements.push('energy_flourishing');
    }
    if (garden.growthScore >= 1500 && !currentAchievements.includes('energy_mastery')) {
      newAchievements.push('energy_mastery');
    }
    if (garden.growthScore >= 4000 && !currentAchievements.includes('energy_ancient')) {
      newAchievements.push('energy_ancient');
    }
    if (garden.growthScore >= 10000 && !currentAchievements.includes('energy_legendary')) {
      newAchievements.push('energy_legendary');
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