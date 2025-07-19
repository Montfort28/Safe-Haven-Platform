// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const schema = z.object({
      username: z.string().min(1),
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { username, name, email, password } = schema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email or username already in use' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
      },
    });

    await prisma.gameProgress.create({
      data: {
        userId: user.id,
        gamesPlayed: 0,
        totalTime: 0,
        achievements: [],
        streak: 0,
      },
    });

    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}