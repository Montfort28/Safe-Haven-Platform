import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/db';

const querySchema = z.object({
  days: z.coerce.number().int().refine(value => [7, 30, 90].includes(value)).default(30),
});
const MINIMUM_GROUP_SIZE = 5;

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }

  const parsed = querySchema.safeParse({
    days: request.nextUrl.searchParams.get('days') ?? 30,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Choose a 7, 30, or 90 day reporting period.' }, { status: 400 });
  }

  const since = new Date(Date.now() - parsed.data.days * 24 * 60 * 60 * 1000);

  try {
    const [
      totalAccounts,
      newAccounts,
      moodCheckIns,
      journalEntries,
      completedActivities,
      resourceVisits,
      activeAffirmations,
      activeAccounts,
      database,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.moodEntry.count({ where: { createdAt: { gte: since } } }),
      prisma.journalEntry.count({ where: { createdAt: { gte: since } } }),
      prisma.gameSession.count({ where: { completed: true, createdAt: { gte: since } } }),
      prisma.activityLog.count({ where: { activityType: 'resource', createdAt: { gte: since } } }),
      prisma.affirmation.count({ where: { active: true } }),
      prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(DISTINCT user_id)::int AS count
        FROM (
          SELECT "userId" AS user_id FROM "mood_entries" WHERE "createdAt" >= ${since}
          UNION
          SELECT "userId" AS user_id FROM "journal_entries" WHERE "createdAt" >= ${since}
          UNION
          SELECT "userId" AS user_id FROM "game_sessions"
            WHERE "completed" = true AND "createdAt" >= ${since}
          UNION
          SELECT "userId" AS user_id FROM "MindGarden" WHERE "updatedAt" >= ${since}
          UNION
          SELECT "userId" AS user_id FROM "ActivityLog"
            WHERE "activityType" = 'resource' AND "createdAt" >= ${since}
        ) AS active_users
      `,
      prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 AS result`,
    ]);
    const activeAccountCount = activeAccounts[0]?.count ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        periodDays: parsed.data.days,
        totalAccounts,
        newAccounts: privateAggregate(newAccounts),
        activeAccounts: privateAggregate(activeAccountCount),
        featureUse: {
          moodCheckIns: privateAggregate(moodCheckIns),
          journalEntries: privateAggregate(journalEntries),
          completedActivities: privateAggregate(completedActivities),
          resourceVisits: privateAggregate(resourceVisits),
        },
        content: {
          activeAffirmations,
          resourceCatalog: 'Maintained in application code; admin editing is not enabled.',
        },
        operations: {
          database: database[0]?.result === 1 ? 'connected' : 'unavailable',
          apiErrorTracking: 'Not configured',
          backupMonitoring: 'Not configured',
          deploymentHistory: 'Not configured',
        },
      },
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Admin overview query failed:', error);
    return NextResponse.json({ error: 'Could not load the admin overview.' }, { status: 500 });
  }
}

function privateAggregate(value: number): number | null {
  return value < MINIMUM_GROUP_SIZE ? null : value;
}
