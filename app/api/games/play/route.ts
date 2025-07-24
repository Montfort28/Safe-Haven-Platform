import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

const gamePlaySchema = z.object({
  gameId: z.string(),
  duration: z.number().min(1).optional(),
  score: z.number().min(0).optional(),
  completed: z.boolean().optional(),
  difficulty: z.string().optional(),
});

const validGames = [
  'puzzle-game',
  'breathing-exercise',
  'progressive-relaxation',
  'mindful-coloring',
  'memory-garden',
  'emotion-regulation',
  'gratitude-flow',
  'anxiety-tamer',
  'focus-builder',
  'stress-sculptor',
  'mood-mixer',
  'positivity-puzzle',
  'anxiety-breather',
  'mindful-memory',
  'gratitude-builder'
];

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
    const { gameId, duration = 5, score = 0, completed = true, difficulty = 'medium' } = gamePlaySchema.parse(body);

    if (!validGames.includes(gameId)) {
      return NextResponse.json({ success: false, error: 'Invalid game' }, { status: 400 });
    }

    // Create game session
    const gameSession = await prisma.gameSession.create({
      data: {
        userId: payload.userId,
        gameId,
        duration,
        score,
        completed,
        difficulty,
        createdAt: new Date(),
      },
    });

    let gameProgress = await prisma.gameProgress.findUnique({
      where: { userId: payload.userId },
    });

    if (!gameProgress) {
      gameProgress = await prisma.gameProgress.create({
        data: {
          userId: payload.userId,
          gamesPlayed: 0,
          totalTime: 0,
          achievements: [],
          streak: 0,
          favoriteGames: [],
          skillLevels: {},
          weeklyGoal: 30,
          currentWeekMinutes: 0
        },
      });
    }

    // Calculate new achievements
    const newAchievements: string[] = [...gameProgress.achievements];
    // Safely parse skillLevels from JSON
    let skillLevels: Record<string, { level: number; experience: number }> = {};
    if (gameProgress.skillLevels && typeof gameProgress.skillLevels === 'object' && !Array.isArray(gameProgress.skillLevels)) {
      skillLevels = JSON.parse(JSON.stringify(gameProgress.skillLevels));
    }

    // First game achievement
    if (gameProgress.gamesPlayed === 0) {
      newAchievements.push('first_session');
    }

    // Milestone achievements
    const milestones = [5, 10, 25, 50, 100];
    milestones.forEach(milestone => {
      if (gameProgress.gamesPlayed + 1 === milestone && !newAchievements.includes(`${milestone}_games`)) {
        newAchievements.push(`${milestone}_games`);
      }
    });

    // Time-based achievements
    const newTotalTime = gameProgress.totalTime + duration;
    const timeAchievements = [60, 300, 600, 1200]; // 1hr, 5hrs, 10hrs, 20hrs
    timeAchievements.forEach(time => {
      if (newTotalTime >= time && gameProgress.totalTime < time) {
        newAchievements.push(`${time}min_played`);
      }
    });

    // Update skill levels
    if (!skillLevels[gameId]) {
      skillLevels[gameId] = { level: 1, experience: 0 };
    }
    skillLevels[gameId].experience += completed ? 10 : 5;
    if (skillLevels[gameId].experience >= skillLevels[gameId].level * 50) {
      skillLevels[gameId].level += 1;
      newAchievements.push(`${gameId}_level_${skillLevels[gameId].level}`);
    }

    // Update favorite games
    // Ensure favoriteGames is an array of objects
    let favoriteGames: Array<{ gameId: string; playCount: number; totalTime: number }> = [];
    if (Array.isArray(gameProgress.favoriteGames)) {
      favoriteGames = gameProgress.favoriteGames as any;
    } else if (typeof gameProgress.favoriteGames === 'object' && gameProgress.favoriteGames !== null) {
      favoriteGames = Object.values(gameProgress.favoriteGames) as any;
    }
    const gameIndex = favoriteGames.findIndex(g => g && typeof g === 'object' && 'gameId' in g && g.gameId === gameId);
    if (gameIndex >= 0) {
      favoriteGames[gameIndex].playCount = (favoriteGames[gameIndex].playCount || 0) + 1;
      favoriteGames[gameIndex].totalTime = (favoriteGames[gameIndex].totalTime || 0) + duration;
    } else {
      favoriteGames.push({ gameId, playCount: 1, totalTime: duration });
    }
    // Sort favorites by play count
    favoriteGames.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));

    const updatedProgress = await prisma.gameProgress.update({
      where: { userId: payload.userId },
      data: {
        gamesPlayed: completed ? gameProgress.gamesPlayed + 1 : gameProgress.gamesPlayed,
        totalTime: newTotalTime,
        achievements: [...new Set(newAchievements)],
        streak: completed ? gameProgress.streak + 1 : gameProgress.streak,
        favoriteGames: favoriteGames.slice(0, 5), // Keep top 5
        skillLevels,
        currentWeekMinutes: gameProgress.currentWeekMinutes + duration,
      },
    });
    if (completed) {
      await prisma.activityLog.create({
        data: {
          userId: payload.userId,
          activityType: 'game',
          points: 5,
        }
      });
    }

    // Update Mind Garden growthScore and lastActivity
    const garden = await prisma.mindGarden.findUnique({ where: { userId: payload.userId } });
    if (garden && completed) {
      await prisma.mindGarden.update({
        where: { userId: payload.userId },
        data: {
          growthScore: Math.min(100, garden.growthScore + 5),
          totalInteractions: garden.totalInteractions + 1,
          lastActivity: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedProgress,
      sessionData: gameSession,
      newAchievements: newAchievements.filter(a => !gameProgress.achievements.includes(a))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Game play error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}