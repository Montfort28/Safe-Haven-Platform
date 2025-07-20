// /api/mind-garden/decay.ts - Endpoint to decay plant health for inactivity
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// This endpoint can be called by a cron job or manually to decay health for inactive users
export async function POST(request: NextRequest) {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(now.getDate() - 1);

        // Find all gardens where lastActivity is more than 1 day ago
        const inactiveGardens = await prisma.mindGarden.findMany({
            where: {
                lastActivity: { lt: oneDayAgo },
                growthScore: { gt: 0 },
            },
        });

        let updated = 0;
        for (const garden of inactiveGardens) {
            // Decay logic: lose 10 points per day of inactivity
            const daysInactive = Math.floor((now.getTime() - garden.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            const decay = daysInactive * 10;
            const newScore = Math.max(0, garden.growthScore - decay);
            await prisma.mindGarden.update({
                where: { userId: garden.userId },
                data: {
                    growthScore: newScore,
                    lastActivity: garden.lastActivity, // don't update lastActivity
                },
            });
            updated++;
        }

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error('Error decaying mind garden:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
