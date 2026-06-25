import prisma from '../utils/db.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

export const getGoals = async (req, res) => {
  const userId = req.user.id;
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching goals' });
  }
};

export const createGoal = async (req, res) => {
  const userId = req.user.id;
  const { title, type, date } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'Title and type are required' });
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        title,
        type, // "DAILY", "WEEKLY", "MONTHLY"
        date: date ? new Date(date) : new Date(),
        completed: false,
        userId
      }
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating goal' });
  }
};

export const toggleGoal = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const goalExists = await prisma.goal.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!goalExists) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: {
        completed: !goalExists.completed
      }
    });

    // Check achievement unlock if it was set to completed
    let newAchievements = [];
    if (updatedGoal.completed) {
      newAchievements = await checkAndUnlockAchievements(userId);
    }

    res.status(200).json({ goal: updatedGoal, newAchievements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error toggling goal' });
  }
};

export const deleteGoal = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const goalExists = await prisma.goal.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!goalExists) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' });
    }

    await prisma.goal.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting goal' });
  }
};
