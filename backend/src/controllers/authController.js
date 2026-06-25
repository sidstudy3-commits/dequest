import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_devquest_13579';

// Streak Update Utility
const updateStreak = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!user.lastActive) {
    return prisma.user.update({
      where: { id: user.id },
      data: { streak: 1, lastActive: new Date() }
    });
  }

  const lastActiveDate = new Date(user.lastActive);
  lastActiveDate.setHours(0, 0, 0, 0);

  const diffTime = today - lastActiveDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Active on consecutive day
    return prisma.user.update({
      where: { id: user.id },
      data: { streak: user.streak + 1, lastActive: new Date() }
    });
  } else if (diffDays > 1) {
    // Streak broken
    return prisma.user.update({
      where: { id: user.id },
      data: { streak: 1, lastActive: new Date() }
    });
  } else {
    // Already active today, update active time only
    return prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });
  }
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        streak: 1,
        lastActive: new Date()
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        streak: user.streak,
        darkMode: user.darkMode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update streak on login
    const updatedUser = await updateStreak(user);

    const token = jwt.sign({ userId: updatedUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        streak: updatedUser.streak,
        darkMode: updatedUser.darkMode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Profile is fetched through middleware which attaches user to req.user
    const updatedUser = await updateStreak(req.user);
    res.status(200).json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        streak: updatedUser.streak,
        darkMode: updatedUser.darkMode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateSettings = async (req, res) => {
  const { username, darkMode } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(darkMode !== undefined && { darkMode })
      }
    });

    res.status(200).json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        streak: updatedUser.streak,
        darkMode: updatedUser.darkMode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating settings' });
  }
};

export const clearData = async (req, res) => {
  const userId = req.user.id;
  try {
    await prisma.$transaction([
      prisma.topic.deleteMany({ where: { userId } }),
      prisma.project.deleteMany({ where: { userId } }),
      prisma.journal.deleteMany({ where: { userId } }),
      prisma.goal.deleteMany({ where: { userId } }),
      prisma.resource.deleteMany({ where: { userId } }),
      prisma.achievement.deleteMany({ where: { userId } })
    ]);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastActive: new Date() }
    });

    res.status(200).json({
      message: 'All developer data cleared successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        streak: updatedUser.streak,
        darkMode: updatedUser.darkMode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error clearing developer data' });
  }
};
