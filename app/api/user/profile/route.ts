// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  try {
    // Fetch user basic info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, name: true, email: true, createdAt: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Fetch stats for progress tab
    const [
      checkInStreak,
      totalCheckIns,
      journalEntries,
      gratitudeCount,
      meditationSessions,
      moodEntries,
      coursesCompleted,
      crisisNavigated
    ] = await Promise.all([
      // Calculate check-in streak
      (async () => {
        const checkIns = await prisma.checkIn.findMany({
          where: { userId: decoded.userId },
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' }
        });
        if (!checkIns.length) return 0;
        let streak = 1;
        for (let i = 1; i < checkIns.length; i++) {
          const prev = new Date(checkIns[i - 1].createdAt);
          const curr = new Date(checkIns[i].createdAt);
          const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
          if (diff <= 1.5) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      })(),
      prisma.checkIn.count({ where: { userId: decoded.userId } }),
      prisma.journalEntry.count({ where: { userId: decoded.userId } }),
      prisma.gratitude.count({ where: { userId: decoded.userId } }),
      prisma.meditation.count({ where: { userId: decoded.userId } }),
      prisma.moodEntry.count({ where: { userId: decoded.userId } }),
      prisma.courseCompletion.count({ where: { userId: decoded.userId } }),
      prisma.crisis.count({ where: { userId: decoded.userId } })
    ]);

    // Calculate wellness improvement (example: based on mood entries, meditation, gratitude, check-ins)
    let wellnessImprovement = 0;
    if (moodEntries > 0 || meditationSessions > 0 || gratitudeCount > 0 || totalCheckIns > 0) {
      // Simple formula: each activity type contributes up to 25% improvement
      const moodScore = Math.min(moodEntries / 20, 1) * 25;
      const meditationScore = Math.min(meditationSessions / 20, 1) * 25;
      const gratitudeScore = Math.min(gratitudeCount / 20, 1) * 25;
      const checkInScore = Math.min(totalCheckIns / 20, 1) * 25;
      wellnessImprovement = Math.round(moodScore + meditationScore + gratitudeScore + checkInScore);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        checkInStreak,
        totalCheckIns,
        journalEntries,
        gratitudeCount,
        meditationSessions,
        moodEntries,
        coursesCompleted,
        crisisNavigated,
        wellnessImprovement
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { name, email } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: { email, NOT: { id: decoded.userId } },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name, email },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}