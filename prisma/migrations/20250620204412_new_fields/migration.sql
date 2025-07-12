-- AlterTable
ALTER TABLE "game_progress" ADD COLUMN     "currentWeekMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "favoriteGames" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "skillLevels" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "weeklyGoal" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "mood_entries" ADD COLUMN     "activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "energyLevel" INTEGER,
ADD COLUMN     "sleepHours" DOUBLE PRECISION,
ADD COLUMN     "triggers" TEXT[] DEFAULT ARRAY[]::TEXT[];
