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
    { id: 'journal-journey', name: 'Journal Journey', description: 'Write 10 journal entries', requirement: 10, category: 'self-care', rarity: 'rare' },
    { id: 'meditation-novice', name: 'Meditation Novice', description: 'Complete 5 meditation sessions', requirement: 5, category: 'self-care', rarity: 'common' },
    { id: 'gratitude-guardian', name: 'Gratitude Guardian', description: 'Record 30 gratitudes', requirement: 30, category: 'self-care', rarity: 'epic' },
    { id: 'mood-tracker', name: 'Mood Master', description: 'Track mood for 20 days', requirement: 20, category: 'progress', rarity: 'rare' },
    { id: 'achievement-hunter', name: 'Achievement Hunter', description: 'Unlock 10 achievements', requirement: 10, category: 'progress', rarity: 'epic' },
    { id: 'legend-status', name: 'Legend Status', description: 'Unlock 25 achievements', requirement: 25, category: 'progress', rarity: 'legendary' },
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
    const userId = payload.userId;
    try {
        // Use userId for all queries
        const [
            user,
            journalEntries,
            moodEntries,
            meditationEntries,
            checkIns,
            gratitudes,
            courses,
            crisis,
            garden,
            checkInDates
        ] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.journalEntry.count({ where: { userId: userId } }),
            prisma.moodEntry.count({ where: { userId: userId } }),
            prisma.meditation.count({ where: { userId: userId } }),
            prisma.checkIn.count({ where: { userId: userId } }),
            prisma.gratitude.count({ where: { userId: userId } }),
            prisma.courseCompletion.count({ where: { userId: userId } }),
            prisma.crisis.count({ where: { userId: userId } }),
            prisma.mindGarden.findUnique({ where: { userId: userId } }),
            prisma.checkIn.findMany({ where: { userId: userId }, select: { createdAt: true } })
        ]);

        // Calculate streak (consecutive days)
        let checkInStreak = 0;
        if (checkInDates.length > 0) {
            // Sort dates descending
            const dates = checkInDates.map(c => c.createdAt).sort((a, b) => b.getTime() - a.getTime());
            let streak = 1;
            for (let i = 1; i < dates.length; i++) {
                const diff = (dates[i - 1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24);
                if (diff <= 1.5) {
                    streak++;
                } else {
                    break;
                }
            }
            checkInStreak = streak;
        }

        const achievements = achievementTemplates.map(template => {
            let currentProgress = 0;
            switch (template.id) {
                case 'first-checkin':
                    currentProgress = checkIns;
                    break;
                case '3-day-streak':
                    currentProgress = checkInStreak;
                    break;
                case '7-day-streak':
                    currentProgress = checkInStreak;
                    break;
                case '14-day-streak':
                    currentProgress = checkInStreak;
                    break;
                case '30-day-streak':
                    currentProgress = checkInStreak;
                    break;
                case 'journal-journey':
                    currentProgress = journalEntries;
                    break;
                case 'meditation-novice':
                    currentProgress = meditationEntries;
                    break;
                case 'gratitude-guardian':
                    currentProgress = gratitudes;
                    break;
                case 'mood-tracker':
                    currentProgress = moodEntries;
                    break;
                case 'achievement-hunter':
                    currentProgress = achievementTemplates.filter(a => {
                        switch (a.id) {
                            case 'first-checkin': return checkIns >= a.requirement;
                            case '3-day-streak': return checkInStreak >= a.requirement;
                            case '7-day-streak': return checkInStreak >= a.requirement;
                            case '14-day-streak': return checkInStreak >= a.requirement;
                            case '30-day-streak': return checkInStreak >= a.requirement;
                            case 'journal-journey': return journalEntries >= a.requirement;
                            case 'meditation-novice': return meditationEntries >= a.requirement;
                            case 'gratitude-guardian': return gratitudes >= a.requirement;
                            case 'mood-tracker': return moodEntries >= a.requirement;
                            default: return false;
                        }
                    }).length;
                    break;
                case 'legend-status':
                    currentProgress = achievementTemplates.filter(a => {
                        switch (a.id) {
                            case 'first-checkin': return checkIns >= a.requirement;
                            case '3-day-streak': return checkInStreak >= a.requirement;
                            case '7-day-streak': return checkInStreak >= a.requirement;
                            case '14-day-streak': return checkInStreak >= a.requirement;
                            case '30-day-streak': return checkInStreak >= a.requirement;
                            case 'journal-journey': return journalEntries >= a.requirement;
                            case 'meditation-novice': return meditationEntries >= a.requirement;
                            case 'gratitude-guardian': return gratitudes >= a.requirement;
                            case 'mood-tracker': return moodEntries >= a.requirement;
                            default: return false;
                        }
                    }).length;
                    break;
                default:
                    currentProgress = 0;
            }
            const completed = currentProgress >= template.requirement;
            return {
                ...template,
                currentProgress: Math.min(currentProgress, template.requirement),
                completed,
                completedAt: completed ? new Date().toISOString() : undefined
            };
        });

        // Return quick stats as well
        const quickStats = {
            checkInStreak,
            totalCheckIns: checkIns,
            journalEntries,
            gratitudeCount: gratitudes,
            meditationSessions: meditationEntries,
            moodEntries,
            coursesCompleted: courses,
            crisisNavigated: crisis,
            garden,
        };

        return NextResponse.json({ achievements, quickStats });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
