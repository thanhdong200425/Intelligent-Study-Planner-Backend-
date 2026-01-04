import { PrismaClient, TimerSessionType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get a random duration in minutes (between 20 and 90 minutes)
 */
function getRandomDuration(min = 20, max = 90): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random TimerSessionType
 */
function getRandomSessionType(): TimerSessionType {
  const types = [
    TimerSessionType.focus,
    TimerSessionType.break,
  ];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Seed timer sessions for user with id = 3
 */
async function seedTimerSessions() {
  console.log('🌱 Seeding timer sessions for user 3...');

  const userId = 3;
  const today = new Date('2026-01-04'); // January 4, 2026

  // Create 10 timer sessions with different start times throughout the day
  const timerSessions = [];

  for (let i = 0; i < 10; i++) {
    // Distribute sessions throughout the day (8 AM to 8 PM)
    const startHour = 8 + Math.floor(i * 1.2); // Spreads across ~12 hours
    const startMinute = Math.floor(Math.random() * 60);

    const startTime = new Date(today);
    startTime.setHours(startHour, startMinute, 0, 0);

    const durationMinutes = getRandomDuration(20, 90);
    const type = getRandomSessionType();

    timerSessions.push({
      userId,
      type,
      taskId: null,
      timeBlockId: null,
      startTime,
      endTime: null,
      durationMinutes,
      status: 'completed' as const,
    });
  }

  // Insert all timer sessions
  const created = await prisma.timerSession.createMany({
    data: timerSessions,
  });

  console.log(`✅ Successfully created ${created.count} timer sessions`);

  // Display summary
  console.log('\n📊 Timer Sessions Summary:');
  timerSessions.forEach((session, index) => {
    console.log(
      `  ${index + 1}. ${session.type.padEnd(12)} | Duration: ${session.durationMinutes}min | Start: ${session.startTime.toLocaleTimeString()}`,
    );
  });
}

/**
 * Clear all timer sessions for user with id = 3
 */
async function clearTimerSessions() {
  console.log('🧹 Clearing timer sessions for user 3...');

  const userId = 3;

  const deleted = await prisma.timerSession.deleteMany({
    where: {
      userId,
      // Optional: only delete sessions from today
      startTime: {
        gte: new Date('2026-01-04T00:00:00.000Z'),
        lt: new Date('2026-01-05T00:00:00.000Z'),
      },
    },
  });

  console.log(`✅ Successfully deleted ${deleted.count} timer sessions`);
}

/**
 * Main seed function
 */
async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--clear')) {
      await clearTimerSessions();
    } else {
      await seedTimerSessions();
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
