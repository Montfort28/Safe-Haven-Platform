export const GARDEN_STAGES = [
  { id: 'seedling', name: 'Seedling', threshold: 0 },
  { id: 'growing', name: 'Growing', threshold: 50 },
  { id: 'flourishing', name: 'Flourishing', threshold: 200 },
  { id: 'thriving', name: 'Thriving', threshold: 600 },
] as const;

export type GardenStageId = (typeof GARDEN_STAGES)[number]['id'];

export interface GardenGrowthProgress {
  stage: (typeof GARDEN_STAGES)[number];
  nextStage: (typeof GARDEN_STAGES)[number] | null;
  progressPercent: number;
  pointsToNextStage: number;
}

export function getGardenGrowthProgress(points: number): GardenGrowthProgress {
  const totalPoints = Number.isFinite(points) ? Math.max(0, Math.floor(points)) : 0;
  let stageIndex = 0;

  for (let index = 1; index < GARDEN_STAGES.length; index += 1) {
    if (totalPoints < GARDEN_STAGES[index].threshold) break;
    stageIndex = index;
  }

  const stage = GARDEN_STAGES[stageIndex];
  const nextStage = GARDEN_STAGES[stageIndex + 1] ?? null;

  if (!nextStage) {
    return { stage, nextStage, progressPercent: 100, pointsToNextStage: 0 };
  }

  const stageSpan = nextStage.threshold - stage.threshold;
  const stageProgress = totalPoints - stage.threshold;

  return {
    stage,
    nextStage,
    progressPercent: Math.min(100, Math.round((stageProgress / stageSpan) * 100)),
    pointsToNextStage: nextStage.threshold - totalPoints,
  };
}

export type GardenCondition = 'settled' | 'resting' | 'recovering';

export function getGardenCondition(
  lastActivity: Date | string,
  now = new Date(),
  previousActivity?: Date | string,
): GardenCondition {
  const lastActivityTime = new Date(lastActivity).getTime();
  if (!Number.isFinite(lastActivityTime)) return 'settled';

  const daysSinceActivity = Math.max(0, now.getTime() - lastActivityTime) / 86_400_000;
  if (daysSinceActivity >= 7) return 'resting';

  if (previousActivity) {
    const previousActivityTime = new Date(previousActivity).getTime();
    if (
      Number.isFinite(previousActivityTime)
      && lastActivityTime - previousActivityTime >= 7 * 86_400_000
      && daysSinceActivity < 2
    ) {
      return 'recovering';
    }
  }

  return 'settled';
}

export const GARDEN_ACTIVITY_REWARDS = {
  journal_written: { points: 10, dailyLimit: 2, aliases: ['journal_written', 'journal'] },
  journal: { points: 10, dailyLimit: 2, aliases: ['journal_written', 'journal'] },
  mood_logged: { points: 5, dailyLimit: 1, aliases: ['mood_logged', 'mood'] },
  mood: { points: 5, dailyLimit: 1, aliases: ['mood_logged', 'mood'] },
  game: { points: 5, dailyLimit: 3, aliases: ['game'] },
  resource: { points: 8, dailyLimit: 5, aliases: ['resource'] },
  tree_watered: { points: 5, dailyLimit: 1, aliases: ['tree_watered'] },
  checkin: { points: 5, dailyLimit: 1, aliases: ['checkin'] },
  gratitude: { points: 10, dailyLimit: 2, aliases: ['gratitude'] },
} as const;

export type GardenActivityType = keyof typeof GARDEN_ACTIVITY_REWARDS;

export function isGardenActivityType(value: string): value is GardenActivityType {
  return Object.prototype.hasOwnProperty.call(GARDEN_ACTIVITY_REWARDS, value);
}
