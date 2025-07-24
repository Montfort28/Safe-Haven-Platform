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
        const { content } = body;
        // content: gratitude text
        if (!content || typeof content !== 'string' || content.trim().length < 3) {
            return NextResponse.json({ success: false, error: 'Content must be at least 3 characters' }, { status: 400 });
        }
        const gratitude = await prisma.gratitude.create({
            data: {
                userId: decoded.userId,
                content,
            },
        });
        return NextResponse.json({ success: true, data: gratitude });
    } catch (error) {
        console.error('Error creating gratitude:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
