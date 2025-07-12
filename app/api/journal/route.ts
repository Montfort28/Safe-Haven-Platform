import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  const limit = z.number().optional().parse(Number(request.nextUrl.searchParams.get('limit')) || 10);

  if (request.nextUrl.pathname.endsWith('/streak')) {
    try {
      const entries = await prisma.journalEntry.findMany({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!entries.length) {
        return NextResponse.json({ success: true, data: { streak: 0 } });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let streak = 0;
      let currentDate = new Date(today);

      for (const entry of entries) {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);

        if (entryDate <= currentDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return NextResponse.json({ success: true, data: { streak } });
    } catch (error) {
      console.error('Error calculating streak:', error);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const schema = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
    });

    const { title, content } = schema.parse(body);

    const entry = await prisma.journalEntry.create({
      data: {
        userId: decoded.userId,
        title,
        content,
      },
    });

    // Add journal activity to Mind Garden
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        activityType: 'journal_written',
        points: 10,
      }
    });

    // Update Mind Garden growthScore
    const garden = await prisma.mindGarden.findUnique({ where: { userId: decoded.userId } });
    if (garden) {
      await prisma.mindGarden.update({
        where: { userId: decoded.userId },
        data: {
          growthScore: Math.min(100, garden.growthScore + 10),
          totalInteractions: garden.totalInteractions + 1,
          lastActivity: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Error creating journal entry:', error);
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
    const schema = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
    });

    const { title, content } = schema.parse(body);
    const entryId = request.nextUrl.pathname.split('/').pop();

    const entry = await prisma.journalEntry.update({
      where: { id: entryId, userId: decoded.userId },
      data: { title, content },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}