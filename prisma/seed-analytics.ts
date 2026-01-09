import { PrismaClient, TimerSessionType, TaskType } from '@prisma/client';
import { startOfWeek, addDays, subDays, getDay } from 'date-fns';
import * as readline from 'readline';

const prisma = new PrismaClient();

const userId = 3;

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
 * Seed courses for analytics testing
 */
async function seedCourses() {
  console.log('📚 Creating courses...');

  const courses = [
    {
      userId,
      name: 'Computer Science 101',
      color: '#3b82f6', // blue
    },
    {
      userId,
      name: 'Web Development',
      color: '#8b5cf6', // purple
    },
    {
      userId,
      name: 'Data Structures',
      color: '#10b981', // green
    },
    {
      userId,
      name: 'Mathematics for CS',
      color: '#f59e0b', // amber
    },
    {
      userId,
      name: 'Machine Learning',
      color: '#ef4444', // red
    },
  ];

  const createdCourses = [];
  for (const course of courses) {
    const created = await prisma.course.create({ data: course });
    createdCourses.push(created);
    console.log(`  ✓ Created: ${course.name}`);
  }

  return createdCourses;
}

/**
 * Seed tasks for analytics testing
 */
async function seedTasks(courses: any[]) {
  console.log('\n📝 Creating tasks...');

  const tasks = [
    // CS101 tasks
    {
      userId,
      courseId: courses[0].id,
      title: 'Read Chapter 3: Algorithms',
      type: TaskType.reading,
      completed: true,
      estimateMinutes: 60,
      actualMinutes: 65,
    },
    {
      userId,
      courseId: courses[0].id,
      title: 'Implement Binary Search',
      type: TaskType.coding,
      completed: true,
      estimateMinutes: 90,
      actualMinutes: 85,
    },
    {
      userId,
      courseId: courses[0].id,
      title: 'Problem Set 4',
      type: TaskType.pset,
      completed: true,
      estimateMinutes: 120,
      actualMinutes: 130,
    },
    // Web Development tasks
    {
      userId,
      courseId: courses[1].id,
      title: 'Read React Documentation',
      type: TaskType.reading,
      completed: true,
      estimateMinutes: 45,
      actualMinutes: 50,
    },
    {
      userId,
      courseId: courses[1].id,
      title: 'Build Todo App with React',
      type: TaskType.coding,
      completed: true,
      estimateMinutes: 180,
      actualMinutes: 200,
    },
    {
      userId,
      courseId: courses[1].id,
      title: 'Write Project Proposal',
      type: TaskType.writing,
      completed: false,
      estimateMinutes: 60,
      actualMinutes: 0,
    },
    // Data Structures tasks
    {
      userId,
      courseId: courses[2].id,
      title: 'Study Tree Traversal',
      type: TaskType.reading,
      completed: true,
      estimateMinutes: 75,
      actualMinutes: 80,
    },
    {
      userId,
      courseId: courses[2].id,
      title: 'Implement AVL Tree',
      type: TaskType.coding,
      completed: true,
      estimateMinutes: 150,
      actualMinutes: 160,
    },
    {
      userId,
      courseId: courses[2].id,
      title: 'Problem Set 6',
      type: TaskType.pset,
      completed: true,
      estimateMinutes: 90,
      actualMinutes: 95,
    },
    // Mathematics tasks
    {
      userId,
      courseId: courses[3].id,
      title: 'Read Linear Algebra Chapter',
      type: TaskType.reading,
      completed: true,
      estimateMinutes: 60,
      actualMinutes: 70,
    },
    {
      userId,
      courseId: courses[3].id,
      title: 'Practice Problem Set 8',
      type: TaskType.pset,
      completed: true,
      estimateMinutes: 120,
      actualMinutes: 110,
    },
    {
      userId,
      courseId: courses[3].id,
      title: 'Proof Homework',
      type: TaskType.writing,
      completed: false,
      estimateMinutes: 90,
      actualMinutes: 0,
    },
    // Machine Learning tasks
    {
      userId,
      courseId: courses[4].id,
      title: 'Read Neural Networks Paper',
      type: TaskType.reading,
      completed: true,
      estimateMinutes: 90,
      actualMinutes: 100,
    },
    {
      userId,
      courseId: courses[4].id,
      title: 'Train CNN Model',
      type: TaskType.coding,
      completed: true,
      estimateMinutes: 180,
      actualMinutes: 190,
    },
    {
      userId,
      courseId: courses[4].id,
      title: 'Lab Report',
      type: TaskType.writing,
      completed: true,
      estimateMinutes: 75,
      actualMinutes: 85,
    },
    // Additional tasks without courses
    {
      userId,
      courseId: null,
      title: 'Organize Study Materials',
      type: TaskType.other,
      completed: true,
      estimateMinutes: 30,
      actualMinutes: 35,
    },
    {
      userId,
      courseId: null,
      title: 'Plan Next Week',
      type: TaskType.other,
      completed: false,
      estimateMinutes: 20,
      actualMinutes: 0,
    },
  ];

  const createdTasks = [];
  for (const task of tasks) {
    const created = await prisma.task.create({ data: task });
    createdTasks.push(created);
    console.log(
      `  ✓ Created: ${task.title} (${task.type}) - ${task.completed ? '✓ Completed' : '○ Pending'}`,
    );
  }

  return createdTasks;
}

/**
 * Seed timer sessions spread across this week
 */
async function seedTimerSessions(tasks: any[]) {
  console.log('\n⏱️  Creating timer sessions for this week...');

  const now = new Date();
  const weekStart = startOfWeek(now); // Sunday

  // Create sessions for each day of this week
  const sessions = [
    // Sunday - 2 sessions (CS101, Web Dev)
    {
      day: 0,
      taskId: tasks[0].id, // CS101 Reading
      startHour: 10,
      startMinute: 0,
      durationMinutes: 65,
    },
    {
      day: 0,
      taskId: tasks[3].id, // Web Dev Reading
      startHour: 14,
      startMinute: 30,
      durationMinutes: 50,
    },

    // Monday - 4 sessions (CS101, Data Structures, Math)
    {
      day: 1,
      taskId: tasks[1].id, // CS101 Coding
      startHour: 9,
      startMinute: 0,
      durationMinutes: 85,
    },
    {
      day: 1,
      taskId: tasks[6].id, // Data Structures Reading
      startHour: 11,
      startMinute: 0,
      durationMinutes: 80,
    },
    {
      day: 1,
      taskId: tasks[9].id, // Math Reading
      startHour: 14,
      startMinute: 0,
      durationMinutes: 70,
    },
    {
      day: 1,
      taskId: tasks[2].id, // CS101 Pset
      startHour: 16,
      startMinute: 0,
      durationMinutes: 130,
    },

    // Tuesday - 3 sessions (Web Dev, ML)
    {
      day: 2,
      taskId: tasks[4].id, // Web Dev Coding
      startHour: 9,
      startMinute: 30,
      durationMinutes: 120, // First part of 200 min task
    },
    {
      day: 2,
      taskId: tasks[4].id, // Web Dev Coding (continued)
      startHour: 13,
      startMinute: 0,
      durationMinutes: 80, // Second part
    },
    {
      day: 2,
      taskId: tasks[12].id, // ML Reading
      startHour: 15,
      startMinute: 30,
      durationMinutes: 100,
    },

    // Wednesday - 5 sessions (Data Structures, Math, ML)
    {
      day: 3,
      taskId: tasks[7].id, // Data Structures Coding
      startHour: 8,
      startMinute: 30,
      durationMinutes: 90, // First part of 160 min task
    },
    {
      day: 3,
      taskId: tasks[7].id, // Data Structures Coding (continued)
      startHour: 10,
      startMinute: 30,
      durationMinutes: 70, // Second part
    },
    {
      day: 3,
      taskId: tasks[10].id, // Math Pset
      startHour: 13,
      startMinute: 0,
      durationMinutes: 110,
    },
    {
      day: 3,
      taskId: tasks[13].id, // ML Coding
      startHour: 15,
      startMinute: 30,
      durationMinutes: 100, // First part of 190 min task
    },
    {
      day: 3,
      taskId: tasks[13].id, // ML Coding (continued)
      startHour: 17,
      startMinute: 30,
      durationMinutes: 90, // Second part
    },

    // Thursday - 3 sessions (Data Structures, ML)
    {
      day: 4,
      taskId: tasks[8].id, // Data Structures Pset
      startHour: 10,
      startMinute: 0,
      durationMinutes: 95,
    },
    {
      day: 4,
      taskId: tasks[14].id, // ML Writing
      startHour: 14,
      startMinute: 0,
      durationMinutes: 85,
    },
    {
      day: 4,
      taskId: tasks[15].id, // Other task
      startHour: 16,
      startMinute: 30,
      durationMinutes: 35,
    },

    // Friday - 2 sessions (Math, CS101)
    {
      day: 5,
      taskId: tasks[10].id, // Math Pset (review)
      startHour: 9,
      startMinute: 0,
      durationMinutes: 45,
    },
    {
      day: 5,
      taskId: tasks[2].id, // CS101 Pset (review)
      startHour: 11,
      startMinute: 0,
      durationMinutes: 60,
    },

    // Saturday - 1 session (light study)
    {
      day: 6,
      taskId: tasks[12].id, // ML Reading (review)
      startHour: 10,
      startMinute: 30,
      durationMinutes: 40,
    },
  ];

  const timerSessions = [];

  for (const session of sessions) {
    const sessionDate = addDays(weekStart, session.day);
    const startTime = new Date(sessionDate);
    startTime.setHours(session.startHour, session.startMinute, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + session.durationMinutes);

    // Find the task to get course info
    const task = tasks.find((t) => t.id === session.taskId);

    timerSessions.push({
      userId,
      taskId: session.taskId,
      timeBlockId: null,
      type: TimerSessionType.focus,
      startTime,
      endTime,
      durationMinutes: session.durationMinutes,
      status: 'completed' as const,
    });

    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      session.day
    ];
    console.log(
      `  ✓ ${dayName} ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${task.title} (${session.durationMinutes}min)`,
    );
  }

  await prisma.timerSession.createMany({
    data: timerSessions,
  });

  console.log(`\n✅ Created ${timerSessions.length} timer sessions`);
}

/**
 * Seed timer sessions for a full year (365 days) with realistic patterns
 */
async function seedYearOfFocusSessions(tasks: any[]) {
  console.log('\n⏱️  Creating year-long focus sessions...');

  const now = new Date();
  const timerSessions = [];

  // Generate sessions for past 365 days
  for (let daysAgo = 364; daysAgo >= 0; daysAgo--) {
    const date = subDays(now, daysAgo);
    const dayOfWeek = getDay(date);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const month = date.getMonth();
    const isLightMonth = month === 6 || month === 7; // Summer

    // 10% chance of rest day (0 hours)
    const isRestDay = Math.random() < 0.1;
    if (isRestDay) continue;

    // Calculate base hours with realistic patterns
    let baseHours;
    if (isWeekend) {
      baseHours = Math.random() * 3 + 0.5; // 0.5-3.5h
    } else if (isLightMonth) {
      baseHours = Math.random() * 3 + 1; // 1-4h summer
    } else {
      baseHours = Math.random() * 5 + 2; // 2-7h weekdays
    }

    // 15% chance of intense study day
    const isIntenseDay = Math.random() < 0.15;
    if (isIntenseDay && !isWeekend) {
      baseHours += 1.5;
    }

    const totalHours = Math.min(baseHours, 8);

    // Split into 1-4 sessions
    const sessionCount = Math.ceil(Math.random() * 3) + 1;
    const minutesPerSession = Math.floor((totalHours * 60) / sessionCount);

    let currentHour = 8; // Start at 8 AM

    for (let i = 0; i < sessionCount; i++) {
      const task = tasks[Math.floor(Math.random() * Math.min(tasks.length, 14))];
      const variation = Math.floor(Math.random() * 10) - 5;
      const durationMinutes = Math.max(25, minutesPerSession + variation);

      const startTime = new Date(date);
      startTime.setHours(currentHour, Math.floor(Math.random() * 60), 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + durationMinutes);

      timerSessions.push({
        userId,
        taskId: task.id,
        timeBlockId: null,
        type: TimerSessionType.focus,
        startTime,
        endTime,
        durationMinutes,
        status: 'completed' as const,
      });

      currentHour += Math.ceil(durationMinutes / 60) + 1;
      if (currentHour >= 22) break; // Don't schedule past 10 PM
    }
  }

  await prisma.timerSession.createMany({ data: timerSessions });

  console.log(`✅ Created ${timerSessions.length} focus sessions over 365 days`);
  const totalHours = (
    timerSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60
  ).toFixed(1);
  const avgPerDay = (parseFloat(totalHours) / 365).toFixed(1);
  console.log(`  📊 Total: ${totalHours} hours`);
  console.log(`  📈 Average: ${avgPerDay} hours/day`);
}

/**
 * Display summary statistics
 */
async function displaySummary() {
  console.log('\n📊 Summary Statistics:');

  const courses = await prisma.course.count({ where: { userId } });
  const tasks = await prisma.task.count({ where: { userId } });
  const completedTasks = await prisma.task.count({
    where: { userId, completed: true },
  });
  const timerSessions = await prisma.timerSession.count({
    where: { userId, type: TimerSessionType.focus },
  });

  const totalMinutes = await prisma.timerSession
    .findMany({
      where: { userId, type: TimerSessionType.focus, endTime: { not: null } },
      select: { durationMinutes: true },
    })
    .then((sessions) =>
      sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    );

  const totalHours = (totalMinutes / 60).toFixed(1);

  console.log(`  📚 Courses: ${courses}`);
  console.log(`  📝 Tasks: ${tasks} (${completedTasks} completed)`);
  console.log(`  ⏱️  Focus Sessions: ${timerSessions}`);
  console.log(`  ⏰ Total Study Time: ${totalHours} hours (${totalMinutes} minutes)`);

  // Display hours per course
  console.log('\n  📈 Study Time by Course:');
  const coursesWithHours = await prisma.course.findMany({
    where: { userId },
    include: {
      tasks: {
        include: {
          timerSessions: {
            where: {
              type: TimerSessionType.focus,
              endTime: { not: null },
            },
          },
        },
      },
    },
  });

  coursesWithHours.forEach((course) => {
    const minutes = course.tasks.reduce(
      (sum, task) =>
        sum +
        task.timerSessions.reduce((s, session) => s + session.durationMinutes, 0),
      0,
    );
    const hours = (minutes / 60).toFixed(1);
    console.log(`    • ${course.name}: ${hours}h`);
  });

  // Display task distribution
  console.log('\n  📋 Task Distribution:');
  const tasksByType = await prisma.task.groupBy({
    by: ['type'],
    where: { userId },
    _count: { type: true },
  });

  tasksByType.forEach((group) => {
    console.log(`    • ${group.type}: ${group._count.type} tasks`);
  });
}

/**
 * Clear analytics data for user 3
 */
async function clearAnalyticsData() {
  console.log('🧹 Clearing analytics data for user 3...\n');

  try {
    // Ask user what they want to clear
    const clearAll = await askQuestion(
      '⚠️  Clear ALL data (courses, tasks, timer sessions)? (y/n): ',
    );

    if (!clearAll) {
      const clearSessions = await askQuestion(
        '📊 Clear only timer sessions? (y/n): ',
      );

      if (clearSessions) {
        const deleted = await prisma.timerSession.deleteMany({
          where: { userId },
        });
        console.log(`✅ Deleted ${deleted.count} timer sessions`);
      } else {
        console.log('❌ Nothing was cleared');
      }
      return;
    }

    // Clear all data
    console.log('🗑️  Deleting all analytics data...');
    const [deletedSessions, deletedTasks, deletedCourses] = await Promise.all([
      prisma.timerSession.deleteMany({ where: { userId } }),
      prisma.task.deleteMany({ where: { userId } }),
      prisma.course.deleteMany({ where: { userId } }),
    ]);

    console.log('\n✅ Successfully cleared:');
    console.log(`  • ${deletedSessions.count} timer sessions`);
    console.log(`  • ${deletedTasks.count} tasks`);
    console.log(`  • ${deletedCourses.count} courses`);
  } catch (error) {
    console.error('❌ Error during clearing:', error);
    throw error;
  }
}

/**
 * Seed all analytics data
 */
async function seedAllData() {
  console.log('🌱 Starting analytics data seed for user 3...\n');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.timerSession.deleteMany({ where: { userId } });
    await prisma.task.deleteMany({ where: { userId } });
    await prisma.course.deleteMany({ where: { userId } });
    console.log('  ✓ Cleared all existing data\n');

    // Seed new data
    const courses = await seedCourses();
    const tasks = await seedTasks(courses);

    // Prompt user for seed scope
    const seedFullYear = await askQuestion(
      '📅 Seed full year of focus sessions (365 days)? Otherwise seeds current week only. (y/n): ',
    );

    if (seedFullYear) {
      await seedYearOfFocusSessions(tasks);
    } else {
      await seedTimerSessions(tasks);
    }

    await displaySummary();

    console.log('\n✅ Analytics seed completed successfully!');
    console.log(
      '\n💡 Tip: Visit the analytics page to see your charts populated with real data!',
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--clear')) {
      await clearAnalyticsData();
    } else {
      await seedAllData();
    }
  } catch (error) {
    console.error('❌ Error:', error);
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
