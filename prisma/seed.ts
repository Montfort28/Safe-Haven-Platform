import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Seed test user
  const hashedPassword = await hashPassword('password123');
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed journal entries
  await prisma.journalEntry.createMany({
    data: [
      {
        userId: user.id,
        title: 'First Reflection',
        content: 'Today was a calm day, feeling hopeful about my journey.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user.id,
        title: 'Evening Thoughts',
        content: 'Had some challenges today but managed to cope.',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000),
      },
    ],
    skipDuplicates: true,
  });

  // Seed mood entries
  await prisma.moodEntry.createMany({
    data: [
      {
        userId: user.id,
        mood: 7,
        notes: 'Feeling optimistic today.',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user.id,
        mood: 5,
        notes: 'A bit anxious but okay.',
        date: new Date(Date.now() - 86400000), // 1 day ago
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
    ],
    skipDuplicates: true,
  });

  // Seed affirmations
  const affirmations = [
    'You are enough just as you are.',
    'Every day is a new opportunity for growth.',
    'You are capable of overcoming challenges.',
    'Your feelings are valid and important.',
    'You deserve peace and happiness.',
  ];

  for (const content of affirmations) {
    await prisma.affirmation.upsert({
      where: { content },
      update: {},
      create: { content, active: true, createdAt: new Date() },
    });
  }

  // Seed game progress
  await prisma.gameProgress.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      gamesPlayed: 2,
      totalTime: 10,
      achievements: ['first_plant', 'consistent_care'],
      streak: 2,
    },
  });

  // Seed mind garden
  await prisma.mindGarden.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plants: 2,
      flowers: 1,
      health: 60,
      lastCare: new Date(),
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });