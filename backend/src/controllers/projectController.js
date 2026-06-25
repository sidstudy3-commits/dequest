import prisma from '../utils/db.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

export const getProjects = async (req, res) => {
  const userId = req.user.id;
  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

export const createProject = async (req, res) => {
  const userId = req.user.id;
  const { title, description, techStack, deadline, progress, status } = req.body;

  if (!title || !techStack) {
    return res.status(400).json({ error: 'Title and techStack are required' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        techStack,
        deadline: deadline ? new Date(deadline) : null,
        progress: progress ? parseInt(progress) : 0,
        status: status || 'PLANNING',
        userId
      }
    });

    const newAchievements = await checkAndUnlockAchievements(userId);

    res.status(201).json({ project, newAchievements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating project' });
  }
};

export const updateProject = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, description, techStack, deadline, progress, status } = req.body;

  try {
    const projectExists = await prisma.project.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!projectExists) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(techStack && { techStack }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(progress !== undefined && { progress: parseInt(progress) }),
        ...(status && { status })
      }
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating project' });
  }
};

export const deleteProject = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const projectExists = await prisma.project.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!projectExists) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting project' });
  }
};
