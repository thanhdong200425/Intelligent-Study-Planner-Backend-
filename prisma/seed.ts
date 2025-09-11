import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Basic seed with a single user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', name: 'Demo User' },
  });

  // Ensure at least one course exists
  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Algorithms', color: '#10b981', user: { connect: { id: user.id } } },
  });

  // A deadline
  await prisma.deadline.create({
    data: {
      title: 'Project 1',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'HIGH',
      user: { connect: { id: user.id } },
      course: { connect: { id: course.id } },
    },
  }).catch(() => void 0);

  // A task
  await prisma.task.create({
    data: {
      title: 'Read chapter 2',
      type: 'READING',
      estimateMinutes: 90,
      user: { connect: { id: user.id } },
      course: { connect: { id: course.id } },
    },
  }).catch(() => void 0);

  // Availability
  await prisma.availabilityWindow.create({
    data: { dayOfWeek: 1, startTime: '09:00', endTime: '11:00', user: { connect: { id: user.id } } },
  }).catch(() => void 0);

  // Habit
  await prisma.habit.create({
    data: { name: 'Practice Leetcode', targetMinutes: 30, user: { connect: { id: user.id } } },
  }).catch(() => void 0);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });