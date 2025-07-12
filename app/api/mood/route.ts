// app/api/mood/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

const moodSchema = z.object({
  mood: z.number().min(1).max(10),
  notes: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
});

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '30');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const moods = await prisma.moodEntry.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    // Calculate mood trends
    const last7Days = moods.slice(0, 7);
    const previous7Days = moods.slice(7, 14);

    const currentAvg = last7Days.length > 0
      ? last7Days.reduce((sum, entry) => sum + entry.mood, 0) / last7Days.length
      : 0;
    const previousAvg = previous7Days.length > 0
      ? previous7Days.reduce((sum, entry) => sum + entry.mood, 0) / previous7Days.length
      : 0;

    const trend = currentAvg > previousAvg ? 'improving' : currentAvg < previousAvg ? 'declining' : 'stable';

    return NextResponse.json({
      success: true,
      data: moods,
      analytics: {
        currentAverage: Math.round(currentAvg * 10) / 10,
        previousAverage: Math.round(previousAvg * 10) / 10,
        trend,
        totalEntries: moods.length
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

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
    const { mood, notes, triggers, activities, sleepHours, energyLevel } = moodSchema.parse(body);

    // Check if user already submitted a mood today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingMood = await prisma.moodEntry.findFirst({
      where: {
        userId: payload.userId,
        date: { gte: today },
      },
    });

    if (existingMood) {
      // Update existing entry instead of creating new one
      const updatedMood = await prisma.moodEntry.update({
        where: { id: existingMood.id },
        data: {
          mood,
          notes,
          triggers: triggers || [],
          activities: activities || [],
          sleepHours,
          energyLevel,
        },
      });
      return NextResponse.json({ success: true, data: updatedMood, updated: true });
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: payload.userId,
        mood,
        notes,
        triggers: triggers || [],
        activities: activities || [],
        sleepHours,
        energyLevel,
        date: new Date(),
      },
    });

    // Add mood activity to Mind Garden
    await prisma.activityLog.create({
      data: {
        userId: payload.userId,
        activityType: 'mood_logged',
        points: 5,
      }
    });

    // Update Mind Garden growthScore
    const garden = await prisma.mindGarden.findUnique({ where: { userId: payload.userId } });
    if (garden) {
      await prisma.mindGarden.update({
        where: { userId: payload.userId },
        data: {
          growthScore: Math.min(100, garden.growthScore + 5),
          totalInteractions: garden.totalInteractions + 1,
          lastActivity: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, data: moodEntry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
