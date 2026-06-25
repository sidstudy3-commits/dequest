import prisma from '../utils/db.js';

export const getAchievements = async (req, res) => {
  const userId = req.user.id;
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    });
    res.status(200).json(achievements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching achievements' });
  }
};
