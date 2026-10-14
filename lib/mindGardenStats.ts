import { prisma } from '@/lib/db';

export async function getGrowthStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  try {
    const todayActivities = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: today } },
    });
    const todayPoints = todayActivities.reduce((sum, activity) => sum + activity.points, 0);

    const weekActivities = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: lastWeek } },
    });
    const weekPoints = weekActivities.reduce((sum, activity) => sum + activity.points, 0);

    const monthActivities = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: lastMonth } },
    });
    const monthPoints = monthActivities.reduce((sum, activity) => sum + activity.points, 0);

    const garden = await prisma.mindGarden.findUnique({
      where: { userId },
    });
    const nextMilestone = getNextMilestone(garden?.growthScore ?? 0);

    return {
      todayPoints,
      weekPoints,
      monthPoints,
      nextMilestone,
    };
  } catch (error) {
    console.error('Error getting growth stats:', error);
    return {
      todayPoints: 0,
      weekPoints: 0,
      monthPoints: 0,
      nextMilestone: { points: 50, reward: 'First Sprout' },
    };
  }
}

function getNextMilestone(currentPoints: number) {
  const milestones = [
    { points: 50, reward: 'First Sprout' },
    { points: 200, reward: 'Growing Strong' },
    { points: 600, reward: 'Flourishing Sapling' },
    { points: 1500, reward: 'Young Tree' },
    { points: 4000, reward: 'Mature Tree' },
    { points: 10000, reward: 'Ancient Wisdom' },
  ];

  return milestones.find(milestone => milestone.points > currentPoints) ||
    { points: 10000, reward: 'Legendary Master' };
}
