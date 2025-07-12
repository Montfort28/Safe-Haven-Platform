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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const moods = await prisma.moodEntry.findMany({
      where: {
        userId: payload.userId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate insights
    const moodFrequency = moods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const commonTriggers = moods
      .flatMap(entry => entry.triggers || [])
      .reduce((acc, trigger) => {
        acc[trigger] = (acc[trigger] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const bestActivities = moods
      .filter(entry => entry.mood >= 7)
      .flatMap(entry => entry.activities || [])
      .reduce((acc, activity) => {
        acc[activity] = (acc[activity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        moodData: moods.map(entry => ({
          date: entry.date,
          mood: entry.mood,
          energyLevel: entry.energyLevel,
          sleepHours: entry.sleepHours
        })),
        insights: {
          moodFrequency,
          commonTriggers: Object.entries(commonTriggers)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5),
          bestActivities: Object.entries(bestActivities)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5),
          averageMood: moods.length > 0 
            ? Math.round((moods.reduce((sum, entry) => sum + entry.mood, 0) / moods.length) * 10) / 10
            : 0
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}