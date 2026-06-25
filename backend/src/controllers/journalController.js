import prisma from '../utils/db.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

export const getJournals = async (req, res) => {
  const userId = req.user.id;
  try {
    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    res.status(200).json(journals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching journal entries' });
  }
};

export const createJournal = async (req, res) => {
  const userId = req.user.id;
  const { title, content, date } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const journal = await prisma.journal.create({
      data: {
        title,
        content,
        date: date ? new Date(date) : new Date(),
        userId
      }
    });

    const newAchievements = await checkAndUnlockAchievements(userId);

    res.status(201).json({ journal, newAchievements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating journal entry' });
  }
};

export const updateJournal = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, content, date } = req.body;

  try {
    const journalExists = await prisma.journal.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!journalExists) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }

    const updatedJournal = await prisma.journal.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(date && { date: new Date(date) })
      }
    });

    res.status(200).json(updatedJournal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating journal entry' });
  }
};

export const deleteJournal = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const journalExists = await prisma.journal.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!journalExists) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }

    await prisma.journal.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting journal entry' });
  }
};
