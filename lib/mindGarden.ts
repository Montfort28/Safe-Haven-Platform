import { prisma } from '@/lib/db';

export async function recordGardenGrowth(userId: string, points: number, activityAt = new Date()) {
  const garden = await prisma.mindGarden.findUnique({ where: { userId } });
  const today = new Date(activityAt);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastActivityDay = garden ? new Date(garden.lastActivity) : null;
  lastActivityDay?.setHours(0, 0, 0, 0);
  const streak = !garden || !lastActivityDay
    ? 1
    : lastActivityDay.getTime() === today.getTime()
      ? Math.max(1, garden.streak)
      : lastActivityDay.getTime() === yesterday.getTime()
        ? garden.streak + 1
        : 1;

  return prisma.mindGarden.upsert({
    where: { userId },
    create: {
      userId,
      growthScore: points,
      streak: 1,
      totalInteractions: 1,
      lastActivity: activityAt,
    },
    update: {
      growthScore: { increment: points },
      streak,
      totalInteractions: { increment: 1 },
      lastActivity: activityAt,
    },
  });
}
