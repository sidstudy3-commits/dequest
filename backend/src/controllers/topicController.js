import prisma from '../utils/db.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

export const getTopics = async (req, res) => {
  const userId = req.user.id;
  try {
    const topics = await prisma.topic.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching topics' });
  }
};

export const createTopic = async (req, res) => {
  const userId = req.user.id;
  const { title, status, difficulty, category, progress, notes } = req.body;

  if (!title || !status || !difficulty || !category) {
    return res.status(400).json({ error: 'Title, status, difficulty, and category are required' });
  }

  try {
    const topic = await prisma.topic.create({
      data: {
        title,
        status,
        difficulty,
        category,
        progress: progress || 0,
        notes,
        userId
      }
    });

    // Check achievement unlock
    const newAchievements = await checkAndUnlockAchievements(userId);

    res.status(201).json({ topic, newAchievements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating topic' });
  }
};

export const updateTopic = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, status, difficulty, category, progress, notes } = req.body;

  try {
    const topicExists = await prisma.topic.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!topicExists) {
      return res.status(404).json({ error: 'Topic not found or unauthorized' });
    }

    const updatedTopic = await prisma.topic.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(difficulty && { difficulty }),
        ...(category && { category }),
        ...(progress !== undefined && { progress: parseInt(progress) }),
        ...(notes !== undefined && { notes })
      }
    });

    res.status(200).json(updatedTopic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating topic' });
  }
};

export const deleteTopic = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const topicExists = await prisma.topic.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!topicExists) {
      return res.status(404).json({ error: 'Topic not found or unauthorized' });
    }

    await prisma.topic.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting topic' });
  }
};
