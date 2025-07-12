-- AlterTable
ALTER TABLE "journal_entries" ADD COLUMN     "animation" TEXT NOT NULL DEFAULT 'calm-wave';

-- AlterTable
ALTER TABLE "mind_gardens" ADD COLUMN     "weather" TEXT NOT NULL DEFAULT 'sunny';

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
