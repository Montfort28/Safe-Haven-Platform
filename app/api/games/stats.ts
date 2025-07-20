// /api/games/stats.ts - Returns persistent game stats for the current user
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
        const stats = await prisma.gameProgress.findUnique({
            where: { userId: payload.userId },
        });
        if (!stats) {
            return NextResponse.json({
                success: true, data: {
                    gamesPlayed: 0,
                    totalTime: 0,
                    achievements: [],
                    streak: 0,
                    favoriteGames: [],
                    skillLevels: {},
                    weeklyGoal: 30,
                    currentWeekMinutes: 0
                }
            });
        }
        return NextResponse.json({ success: true, data: stats });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
