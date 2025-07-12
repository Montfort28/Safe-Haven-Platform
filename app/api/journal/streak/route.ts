import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Returns the user's current journal streak (consecutive days with at least one entry)
export async function GET(request: NextRequest) {
    // Get token from Authorization header
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    try {
        // Get all journal entries for user, sorted by date descending
        const entries = await prisma.journalEntry.findMany({
            where: { userId: decoded.userId },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        });
        if (!entries.length) {
            return NextResponse.json({ data: { streak: 0 } });
        }
        // Calculate streak
        let streak = 1;
        let prevDate = new Date(entries[0].createdAt);
        prevDate.setHours(0, 0, 0, 0);
        for (let i = 1; i < entries.length; i++) {
            const currDate = new Date(entries[i].createdAt);
            currDate.setHours(0, 0, 0, 0);
            // Calculate difference in days
            const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                streak++;
                prevDate = currDate;
            } else if (diff > 1) {
                break;
            }
        }
        return NextResponse.json({ data: { streak } });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get journal streak' }, { status: 500 });
    }
}
