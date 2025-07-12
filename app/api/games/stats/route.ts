// app/api/games/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

const validGames = [
  'breathing-exercise', 'progressive-relaxation', 'mindful-coloring',
  'memory-garden', 'emotion-regulation', 'gratitude-flow',
  'anxiety-tamer', 'focus-builder', 'stress-sculptor', 'mood-mixer'
];

// app/api/games/leaderboard/route.ts
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
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (gameId && validGames.includes(gameId)) {
      const sessions = await prisma.gameSession.findMany({
        where: { gameId },
        orderBy: { score: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: sessions.map(session => ({
          username: session.user?.username || '',
          score: session.score,
          duration: session.duration,
          difficulty: session.difficulty,
          date: session.createdAt
        }))
      });
    } else {
      // Overall leaderboard
      const topPlayers = await prisma.gameProgress.findMany({
        orderBy: { totalTime: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: topPlayers.map(progress => ({
          username: progress.user?.username || '',
          totalTime: progress.totalTime,
          gamesPlayed: progress.gamesPlayed,
          achievements: progress.achievements.length,
          streak: progress.streak
        }))
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}