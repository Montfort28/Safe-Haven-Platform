import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
        const { duration, type } = body;
        // duration in seconds, type can be 'breathing', 'guided', etc.
        if (!duration || typeof duration !== 'number' || duration < 60) {
            return NextResponse.json({ success: false, error: 'Duration must be at least 60 seconds' }, { status: 400 });
        }
        const meditation = await prisma.meditation.create({
            data: {
                userId: decoded.userId,
                duration,
                type: type || 'meditation',
            },
        });
        return NextResponse.json({ success: true, data: meditation });
    } catch (error) {
        console.error('Error creating meditation:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
