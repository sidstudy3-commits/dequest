import prisma from '../utils/db.js';

const ACHIEVEMENTS_LIST = {
  FIRST_TOPIC: {
    title: 'First Step',
    description: 'Created your first learning topic! The journey of a thousand miles begins with a single step.',
  },
  FIVE_TOPICS: {
    title: 'Dedicated Learner',
    description: 'Created five learning topics! You are building momentum.',
  },
  FIRST_JOURNAL: {
    title: 'Journalist',
    description: 'Wrote your first learning journal entry. Documenting is key to retention.',
  },
  FIRST_PROJECT: {
    title: 'Builder',
    description: 'Created your first project tracker! Moving from theory to practice.',
  },
  GOAL_CRUSHER: {
    title: 'Goal Crusher',
    description: 'Completed five learning or productivity goals. Stay focused!',
  }
};

export const checkAndUnlockAchievements = async (userId) => {
  try {
    const unlocked = await prisma.achievement.findMany({
      where: { userId }
    });
    
    const unlockedTypes = new Set(unlocked.map(a => a.type));
    const newUnlocks = [];

    const topicCount = await prisma.topic.count({ where: { userId } });
    const journalCount = await prisma.journal.count({ where: { userId } });
    const projectCount = await prisma.project.count({ where: { userId } });
    const completedGoalsCount = await prisma.goal.count({ 
      where: { userId, completed: true } 
    });

    const checkUnlock = async (type, condition) => {
      if (!unlockedTypes.has(type) && condition) {
        const details = ACHIEVEMENTS_LIST[type];
        const achievement = await prisma.achievement.create({
          data: {
            type,
            title: details.title,
            description: details.description,
            userId
          }
        });
        newUnlocks.push(achievement);
      }
    };

    await checkUnlock('FIRST_TOPIC', topicCount >= 1);
    await checkUnlock('FIVE_TOPICS', topicCount >= 5);
    await checkUnlock('FIRST_JOURNAL', journalCount >= 1);
    await checkUnlock('FIRST_PROJECT', projectCount >= 1);
    await checkUnlock('GOAL_CRUSHER', completedGoalsCount >= 5);

    return newUnlocks;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};
