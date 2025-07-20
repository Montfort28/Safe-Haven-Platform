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
    // Only return stats for the current user
    const stats = await prisma.gameProgress.findUnique({
      where: { userId: payload.userId },
    });
    // Calculate totalPoints from ActivityLog (sum of all 'game' activity points)
    const totalPoints = await prisma.activityLog.aggregate({
      where: { userId: payload.userId, activityType: 'game' },
      _sum: { points: true }
    });
    if (!stats) {
      return NextResponse.json({
        success: true, data: [{
          username: '',
          totalTime: 0,
          gamesPlayed: 0,
          totalPoints: 0,
          streak: 0
        }]
      });
    }
    // Remove achievements from stats, add totalPoints
    const { achievements, ...restStats } = stats;
    return NextResponse.json({
      success: true,
      data: [{
        username: '',
        totalTime: restStats.totalTime || 0,
        gamesPlayed: restStats.gamesPlayed || 0,
        totalPoints: totalPoints._sum.points || 0,
        streak: restStats.streak || 0
      }]
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}