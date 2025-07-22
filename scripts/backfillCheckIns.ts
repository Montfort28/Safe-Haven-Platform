// scripts/backfillCheckIns.ts
// Run with: npx tsx scripts/backfillCheckIns.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ select: { id: true, createdAt: true } });
    const today = new Date();
    let totalCreated = 0;

    for (const user of users) {
        const start = new Date(user.createdAt);
        start.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setHours(0, 0, 0, 0);
        let current = new Date(start);
        while (current <= end) {
            // Check if a check-in already exists for this user and day (by createdAt date only)
            const startOfDay = new Date(current);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(current);
            endOfDay.setHours(23, 59, 59, 999);
            const exists = await prisma.checkIn.findFirst({
                where: {
                    userId: user.id,
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });
            if (!exists) {
                await prisma.checkIn.create({
                    data: {
                        userId: user.id,
                        createdAt: new Date(current),
                        type: 'auto-backfill',
                    },
                });
                totalCreated++;
            }
            current.setDate(current.getDate() + 1);
        }
    }
    console.log(`Backfill complete. Total check-ins created: ${totalCreated}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
