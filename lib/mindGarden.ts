import { prisma } from '@/lib/db';
import {
  GARDEN_ACTIVITY_REWARDS,
  isGardenActivityType,
  type GardenActivityType,
} from '@/lib/mindGardenGrowth';

export async function recordGardenActivity(
  userId: string,
  activityType: GardenActivityType,
  activityAt = new Date(),
) {
  if (!isGardenActivityType(activityType)) {
    throw new Error(`Unsupported Mind Garden activity: ${activityType}`);
  }

  const reward = GARDEN_ACTIVITY_REWARDS[activityType];
  const dayStart = new Date(activityAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const lockKey = `${userId}:${reward.aliases[0]}:${dayStart.toISOString().slice(0, 10)}`;

  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;

    const activityCount = await transaction.activityLog.count({
      where: {
        userId,
        activityType: { in: [...reward.aliases] },
        createdAt: { gte: dayStart, lt: dayEnd },
      },
    });

    if (activityCount >= reward.dailyLimit) {
      return {
        awarded: false,
        points: 0,
        garden: await transaction.mindGarden.findUnique({ where: { userId } }),
      };
    }

    const garden = await transaction.mindGarden.upsert({
      where: { userId },
      create: {
        userId,
        growthScore: reward.points,
        streak: 0,
        totalInteractions: 1,
        lastActivity: activityAt,
      },
      update: {
        growthScore: { increment: reward.points },
        totalInteractions: { increment: 1 },
        lastActivity: activityAt,
      },
    });

    await transaction.activityLog.create({
      data: {
        userId,
        activityType,
        points: reward.points,
        createdAt: activityAt,
      },
    });

    return { awarded: true, points: reward.points, garden };
  });
}
