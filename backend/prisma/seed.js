import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Wipe existing tables in reverse order of dependencies
  await prisma.achievement.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.journal.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('deep123', 10);

  // 1. Create a demo user
  const user = await prisma.user.create({
    data: {
      username: 'deep',
      email: 'deep@gmail.com',
      password: hashedPassword,
      streak: 5,
      lastActive: new Date()
    }
  });

  console.log(`Created User: ${user.username} (${user.email})`);

  // 2. Create Topics
  await prisma.topic.createMany({
    data: [
      {
        title: 'React Hooks Deep Dive',
        category: 'Frontend',
        difficulty: 'INTERMEDIATE',
        status: 'COMPLETED',
        progress: 100,
        notes: 'Learned useEffect cleanup, custom hooks development, and useCallback memoization patterns.',
        userId: user.id
      },
      {
        title: 'PostgreSQL Advanced Joins',
        category: 'Database',
        difficulty: 'ADVANCED',
        status: 'IN_PROGRESS',
        progress: 60,
        notes: 'Studied INNER, LEFT, RIGHT, and FULL OUTER joins, as well as window functions and indexing.',
        userId: user.id
      },
      {
        title: 'Express REST APIs',
        category: 'Backend',
        difficulty: 'BEGINNER',
        status: 'COMPLETED',
        progress: 100,
        notes: 'Created routing architectures, configured global error-handler and CORS middleware.',
        userId: user.id
      },
      {
        title: 'TypeScript Interface Types',
        category: 'Language',
        difficulty: 'BEGINNER',
        status: 'NOT_STARTED',
        progress: 0,
        notes: 'Need to review interface vs type aliases, utility types, and generics syntax.',
        userId: user.id
      },
      {
        title: 'Prisma Client Querying',
        category: 'Database',
        difficulty: 'INTERMEDIATE',
        status: 'IN_PROGRESS',
        progress: 40,
        notes: 'Implementing transaction queries, database seeds, and cascading deletes.',
        userId: user.id
      }
    ]
  });

  console.log('Created learning topics.');

  // 3. Create Projects
  await prisma.project.create({
    data: {
      title: 'DevQuest App',
      description: 'An AI-powered developer learning roadmap planner and project progress dashboard.',
      techStack: 'React, Node, Express, Prisma, PostgreSQL, Gemini API',
      status: 'IN_PROGRESS',
      progress: 75,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      userId: user.id
    }
  });

  await prisma.project.create({
    data: {
      title: 'Portfolio Website',
      description: 'Minimalistic developer portfolio showcasing academic and startup build achievements.',
      techStack: 'HTML, CSS, Vanilla JS, ThreeJS',
      status: 'COMPLETED',
      progress: 100,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      userId: user.id
    }
  });

  console.log('Created project trackers.');

  // 4. Create Journal Entries
  await prisma.journal.createMany({
    data: [
      {
        title: 'Setting up PostgreSQL Connection',
        content: 'Configured a cloud database instance on Neon and connected it via Prisma. Ran database migrations successfully.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
        userId: user.id
      },
      {
        title: 'Completed App Shell Layout',
        content: 'Fleshed out the CSS styling using Tailwind. Integrated sidebars and glassmorphism. Responsive navigation works perfectly.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        userId: user.id
      }
    ]
  });

  console.log('Created journal logs.');

  // 5. Create Goals
  await prisma.goal.createMany({
    data: [
      {
        title: 'Review Prisma Relation documentation',
        type: 'DAILY',
        completed: true,
        userId: user.id
      },
      {
        title: 'Draft landing page design mockup',
        type: 'DAILY',
        completed: false,
        userId: user.id
      },
      {
        title: 'Complete 3 coding roadmap exercises',
        type: 'WEEKLY',
        completed: true,
        userId: user.id
      },
      {
        title: 'Integrate Recharts visualizations in Dashboard',
        type: 'WEEKLY',
        completed: false,
        userId: user.id
      },
      {
        title: 'Finish entire DevQuest app prototype',
        type: 'MONTHLY',
        completed: false,
        userId: user.id
      }
    ]
  });

  console.log('Created goals.');

  // 6. Create Resource Vault Items
  await prisma.resource.createMany({
    data: [
      {
        title: 'Prisma Client API Reference',
        type: 'DOCS',
        url: 'https://www.prisma.io/docs/concepts/components/prisma-client',
        notes: 'Official client documentation for CRUD, transactions, and relations.',
        userId: user.id
      },
      {
        title: 'Tailwind CSS Flexbox & Grid Guides',
        type: 'ARTICLE',
        url: 'https://tailwindcss.com/docs/flexbox-direction',
        notes: 'Handy cheatsheet for flex alignments and grid layout distributions.',
        userId: user.id
      },
      {
        title: 'Vite React App Quickstart Guide',
        type: 'YOUTUBE',
        url: 'https://www.youtube.com/watch?v=LdB_g1V9484',
        notes: 'Great video on building fast React web apps with Vite.',
        userId: user.id
      }
    ]
  });

  console.log('Created resources.');

  // 7. Create Unlock Achievements
  await prisma.achievement.createMany({
    data: [
      {
        type: 'FIRST_TOPIC',
        title: 'First Step',
        description: 'Created your first learning topic! The journey of a thousand miles begins with a single step.',
        userId: user.id
      },
      {
        type: 'FIRST_JOURNAL',
        title: 'Journalist',
        description: 'Wrote your first learning journal entry. Documenting is key to retention.',
        userId: user.id
      },
      {
        type: 'FIRST_PROJECT',
        title: 'Builder',
        description: 'Created your first project tracker! Moving from theory to practice.',
        userId: user.id
      }
    ]
  });

  console.log('Created achievements.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
