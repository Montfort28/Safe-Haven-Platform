import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// Achievement templates (should match frontend/profile page)
const achievementTemplates = [
    { id: 'first-checkin', name: 'First Steps', description: 'Complete your first check-in', requirement: 1, category: 'daily', rarity: 'common' },
    { id: '3-day-streak', name: 'Getting Started', description: 'Check in for 3 days straight', requirement: 3, category: 'daily', rarity: 'common' },
    { id: '7-day-streak', name: '7-Day Warrior', description: 'Check in for 7 days straight', requirement: 7, category: 'daily', rarity: 'rare' },
    { id: '14-day-streak', name: 'Fortnight Fighter', description: 'Maintain a 14-day check-in streak', requirement: 14, category: 'daily', rarity: 'rare' },
    { id: '30-day-streak', name: 'Consistency Master', description: 'Maintain a 30-day check-in streak', requirement: 30, category: 'daily', rarity: 'legendary' },
    { id: '100-day-streak', name: 'Century Champion', description: 'Check in for 100 days', requirement: 100, category: 'daily', rarity: 'legendary' },
    { id: 'morning-ritual', name: 'Morning Ritual Master', description: 'Complete 10 morning check-ins', requirement: 10, category: 'daily', rarity: 'rare' },
    { id: 'evening-wind-down', name: 'Evening Wind-Down', description: 'Complete 10 evening check-ins', requirement: 10, category: 'daily', rarity: 'rare' },
    { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Check in on 10 weekends', requirement: 10, category: 'daily', rarity: 'common' },
    { id: 'journal-journey', name: 'Journal Journey', description: 'Write 10 journal entries', requirement: 10, category: 'self-care', rarity: 'rare' },
    { id: 'story-teller', name: 'Story Teller', description: 'Write 25 journal entries', requirement: 25, category: 'self-care', rarity: 'epic' },
    { id: 'life-chronicler', name: 'Life Chronicler', description: 'Write 100 journal entries', requirement: 100, category: 'self-care', rarity: 'legendary' },
    { id: 'gratitude-guardian', name: 'Gratitude Guardian', description: 'Record 30 gratitudes', requirement: 30, category: 'self-care', rarity: 'epic' },
    { id: 'thankfulness-sage', name: 'Thankfulness Sage', description: 'Record 100 gratitudes', requirement: 100, category: 'self-care', rarity: 'legendary' },
    { id: 'emotion-explorer', name: 'Emotion Explorer', description: 'Express 50 different emotions', requirement: 50, category: 'self-care', rarity: 'epic' },
    { id: 'mindful-moment', name: 'Mindful Moment', description: 'Complete your first meditation', requirement: 1, category: 'self-care', rarity: 'common' },
    { id: 'meditation-novice', name: 'Meditation Novice', description: 'Complete 5 meditation sessions', requirement: 5, category: 'self-care', rarity: 'common' },
    { id: 'zen-master', name: 'Zen Master', description: 'Complete 15 meditation sessions', requirement: 15, category: 'self-care', rarity: 'epic' },
    { id: 'meditation-guru', name: 'Meditation Guru', description: 'Complete 50 meditation sessions', requirement: 50, category: 'self-care', rarity: 'legendary' },
    { id: 'breathing-expert', name: 'Breathing Expert', description: 'Master 20 breathing exercises', requirement: 20, category: 'self-care', rarity: 'rare' },
    { id: 'mood-tracker', name: 'Mood Master', description: 'Track mood for 20 days', requirement: 20, category: 'progress', rarity: 'rare' },
    { id: 'wellness-warrior', name: 'Wellness Warrior', description: 'Improve wellness score by 25%', requirement: 25, category: 'progress', rarity: 'epic' },
    { id: 'transformation-titan', name: 'Transformation Titan', description: 'Improve wellness score by 50%', requirement: 50, category: 'progress', rarity: 'legendary' },
    { id: 'goal-getter', name: 'Goal Getter', description: 'Complete 5 personal goals', requirement: 5, category: 'progress', rarity: 'rare' },
    { id: 'achievement-hunter', name: 'Achievement Hunter', description: 'Unlock 10 achievements', requirement: 10, category: 'progress', rarity: 'epic' },
    { id: 'legend-status', name: 'Legend Status', description: 'Unlock 25 achievements', requirement: 25, category: 'progress', rarity: 'legendary' },
    { id: 'explorer', name: 'Explorer', description: 'Try every feature at least once', requirement: 10, category: 'learning', rarity: 'rare' },
    { id: 'early-bird', name: 'Early Bird', description: 'Check in before 7 AM for 7 days', requirement: 7, category: 'daily', rarity: 'rare' },
    { id: 'night-owl', name: 'Night Owl', description: 'Check in after 10 PM for 7 days', requirement: 7, category: 'daily', rarity: 'rare' },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Complete all daily activities for 7 days', requirement: 7, category: 'daily', rarity: 'epic' },
    { id: 'social-butterfly', name: 'Social Butterfly', description: 'Share your progress with friends', requirement: 5, category: 'progress', rarity: 'common' },
    // ...add more as needed to match frontend...
];

export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const userId = payload.userId;

        // Fetch all relevant user stats for achievements
        const [
            journalCount,
            moodCount,
            gratitudeCount,
            meditationCount,
            checkInCount,
            morningCheckIns,
            eveningCheckIns,
            weekendCheckIns,
            breathingCount,
            courseCount,
            crisisCount,
            activityLogs,
            achievementsFromDb
        ] = await Promise.all([
            prisma.journalEntry.count({ where: { userId } }),
            prisma.moodEntry.count({ where: { userId } }),
            prisma.gratitude.count({ where: { userId } }),
            prisma.meditation.count({ where: { userId } }),
            prisma.checkIn.count({ where: { userId } }),
            prisma.checkIn.count({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date('1970-01-01T00:00:00.000Z'),
                    },
                    // 5am-9am as morning
                    AND: [
                        { createdAt: { gte: new Date(new Date().setHours(5, 0, 0, 0)) } },
                        { createdAt: { lte: new Date(new Date().setHours(9, 0, 0, 0)) } }
                    ]
                }
            }),
            prisma.checkIn.count({
                where: {
                    userId,
                    // 8pm-12am as evening
                    AND: [
                        { createdAt: { gte: new Date(new Date().setHours(20, 0, 0, 0)) } },
                        { createdAt: { lte: new Date(new Date().setHours(23, 59, 59, 999)) } }
                    ]
                }
            }),
            prisma.checkIn.count({
                where: {
                    userId,
                    // Saturday or Sunday
                    createdAt: {
                        gte: new Date('1970-01-01T00:00:00.000Z'),
                    },
                    // Use raw query for day of week if needed
                }
            }),
            prisma.activityLog.count({ where: { userId, activityType: 'breathing' } }),
            prisma.courseCompletion.count({ where: { userId } }),
            prisma.crisis.count({ where: { userId } }),
            prisma.activityLog.findMany({ where: { userId } }),
            prisma.userAchievement.findMany({ where: { userId } })
        ]);

        // Calculate streaks
        const checkIns = await prisma.checkIn.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        let streak = 0;
        let lastDate: Date | null = null;
        for (const c of checkIns) {
            const d = new Date(c.createdAt);
            if (lastDate) {
                const diff = (d.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    streak++;
                } else if (diff > 1) {
                    streak = 1;
                }
            } else {
                streak = 1;
            }
            lastDate = d;
        }

        // Mood improvement (dummy, replace with real logic)
        const moodImprovement = 0;

        // Calculate progress for each achievement
        const achievements = achievementTemplates.map(template => {
            let currentProgress = 0;
            let completed = false;
            let completedAt: string | undefined = undefined;
            switch (template.id) {
                case 'first-checkin':
                    currentProgress = checkInCount;
                    break;
                case '3-day-streak':
                    currentProgress = streak;
                    break;
                case '7-day-streak':
                    currentProgress = streak;
                    break;
                case '14-day-streak':
                    currentProgress = streak;
                    break;
                case '30-day-streak':
                    currentProgress = streak;
                    break;
                case '100-day-streak':
                    currentProgress = streak;
                    break;
                case 'morning-ritual':
                    currentProgress = morningCheckIns;
                    break;
                case 'evening-wind-down':
                    currentProgress = eveningCheckIns;
                    break;
                case 'weekend-warrior':
                    currentProgress = weekendCheckIns;
                    break;
                case 'journal-journey':
                    currentProgress = journalCount;
                    break;
                case 'story-teller':
                    currentProgress = journalCount;
                    break;
                case 'life-chronicler':
                    currentProgress = journalCount;
                    break;
                case 'gratitude-guardian':
                    currentProgress = gratitudeCount;
                    break;
                case 'thankfulness-sage':
                    currentProgress = gratitudeCount;
                    break;
                case 'emotion-explorer':
                    currentProgress = moodCount;
                    break;
                case 'mindful-moment':
                    currentProgress = meditationCount;
                    break;
                case 'meditation-novice':
                    currentProgress = meditationCount;
                    break;
                case 'zen-master':
                    currentProgress = meditationCount;
                    break;
                case 'meditation-guru':
                    currentProgress = meditationCount;
                    break;
                case 'breathing-expert':
                    currentProgress = breathingCount;
                    break;
                case 'mood-tracker':
                    currentProgress = moodCount;
                    break;
                case 'wellness-warrior':
                    currentProgress = moodImprovement;
                    break;
                case 'transformation-titan':
                    currentProgress = moodImprovement;
                    break;
                case 'goal-getter':
                    currentProgress = 0; // TODO: implement
                    break;
                case 'achievement-hunter':
                    // Count completed achievements
                    currentProgress = 0; // Will be set after all are calculated
                    break;
                case 'legend-status':
                    currentProgress = 0; // Will be set after all are calculated
                    break;
                case 'explorer':
                    // Count unique activity types
                    currentProgress = Array.from(new Set(activityLogs.map(a => a.activityType))).length;
                    break;
                case 'early-bird':
                    currentProgress = 0; // TODO: implement
                    break;
                case 'night-owl':
                    currentProgress = 0; // TODO: implement
                    break;
                case 'perfectionist':
                    currentProgress = 0; // TODO: implement
                    break;
                case 'social-butterfly':
                    currentProgress = 0; // TODO: implement
                    break;
                default:
                    currentProgress = 0;
            }
            completed = currentProgress >= template.requirement;
            // If completed, try to get completedAt from DB
            if (completed) {
                const dbAch = achievementsFromDb.find(a => a.achievementId === template.id && a.completedAt);
                if (dbAch && dbAch.completedAt) completedAt = dbAch.completedAt.toISOString();
            }
            return {
                ...template,
                currentProgress,
                completed,
                completedAt
            };
        });
        // Set progress for achievement-hunter and legend-status
        const completedCount = achievements.filter(a => a.completed).length;
        achievements.forEach(a => {
            if (a.id === 'achievement-hunter') a.currentProgress = completedCount;
            if (a.id === 'legend-status') a.currentProgress = completedCount;
        });

        return NextResponse.json({ achievements });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
    }
}
