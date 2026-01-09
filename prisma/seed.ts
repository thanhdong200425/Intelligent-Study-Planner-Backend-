import { PrismaClient, TimerSessionType } from '@prisma/client';
import * as readline from 'readline';

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
  const types = [TimerSessionType.focus, TimerSessionType.break];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Ask user a yes/no question
 */
function askQuestion(query: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      const normalized = answer.toLowerCase().trim();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Seed timer sessions for user with id = 3
 */
async function seedTimerSessions() {
  console.log('🌱 Seeding timer sessions for user 3...');

  const userId = 3;

  // Ask user if they want to use today's date
  const useToday = await askQuestion(
    '📅 Generate timer sessions for today? (y/n): ',
  );

  const targetDate = useToday ? new Date() : new Date('2026-01-04');

  console.log(
    `📆 Using date: ${targetDate.toLocaleDateString()} (${targetDate.toDateString()})`,
  );

  // If using today, only create focus sessions; otherwise use mixed types
  const sessionCount = 10;
  const timerSessions = [];

  for (let i = 0; i < sessionCount; i++) {
    // Distribute sessions throughout the day (8 AM to 8 PM)
    const startHour = 8 + Math.floor(i * 1.2); // Spreads across ~12 hours
    const startMinute = Math.floor(Math.random() * 60);

    const startTime = new Date(targetDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const durationMinutes = getRandomDuration(20, 90);
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + durationMinutes);

    // Use focus type if today, otherwise random type
    const type = useToday ? TimerSessionType.focus : getRandomSessionType();

    timerSessions.push({
      userId,
      type,
      taskId: null,
      timeBlockId: null,
      startTime,
      endTime, // Set endTime for completed sessions
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
      `  ${index + 1}. ${session.type.padEnd(12)} | Duration: ${session.durationMinutes}min | Start: ${session.startTime.toLocaleTimeString()} - End: ${session.endTime?.toLocaleTimeString()}`,
    );
  });
}

/**
 * Clear all timer sessions for user with id = 3
 */
async function clearTimerSessions() {
  console.log('🧹 Clearing timer sessions for user 3...');

  const userId = 3;

  // Ask user if they want to clear only today's sessions or all
  const clearOnlyToday = await askQuestion(
    '📅 Clear only today\'s timer sessions? (y = today only, n = all sessions): ',
  );

  const whereClause: any = { userId };

  if (clearOnlyToday) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    whereClause.startTime = {
      gte: startOfDay,
      lte: endOfDay,
    };

    console.log(`📆 Clearing sessions for: ${today.toDateString()}`);
  } else {
    console.log('📆 Clearing ALL timer sessions for user 3...');
  }

  const deleted = await prisma.timerSession.deleteMany({
    where: whereClause,
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
