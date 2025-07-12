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
        // Get all mood entries for the user
        const moods = await prisma.moodEntry.findMany({
            where: { userId: payload.userId },
            orderBy: { date: 'desc' },
            take: 30,
        });

        // Calculate analytics
        const moodFrequency: Record<number, number> = {};
        moods.forEach((entry) => {
            moodFrequency[entry.mood] = (moodFrequency[entry.mood] || 0) + 1;
        });
        const averageMood = moods.length > 0 ? moods.reduce((sum, e) => sum + e.mood, 0) / moods.length : 0;

        // Find most common triggers and best activities
        const triggerCounts: Record<string, number> = {};
        const activityCounts: Record<string, number> = {};
        moods.forEach((entry) => {
            if (Array.isArray(entry.triggers)) {
                entry.triggers.forEach((t: string) => {
                    triggerCounts[t] = (triggerCounts[t] || 0) + 1;
                });
            }
            if (Array.isArray(entry.activities)) {
                entry.activities.forEach((a: string) => {
                    activityCounts[a] = (activityCounts[a] || 0) + 1;
                });
            }
        });
        const commonTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);
        const bestActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);

        return NextResponse.json({
            success: true,
            data: {
                moodData: moods.map((m) => ({
                    date: m.date,
                    mood: m.mood,
                    energyLevel: m.energyLevel,
                    sleepHours: m.sleepHours,
                })),
                insights: {
                    moodFrequency,
                    commonTriggers,
                    bestActivities,
                    averageMood,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching mood analytics:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
