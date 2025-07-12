import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const affirmations = await prisma.affirmation.findMany({
      where: { active: true },
    });

    if (affirmations.length === 0) {
      return NextResponse.json(
        { success: true, data: { content: 'You are enough just as you are.' } },
        { status: 200 }
      );
    }

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return NextResponse.json(
      { success: true, data: affirmations[randomIndex] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affirmation' },
      { status: 500 }
    );
  }
}