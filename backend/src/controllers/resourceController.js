import prisma from '../utils/db.js';

export const getResources = async (req, res) => {
  const userId = req.user.id;
  try {
    const resources = await prisma.resource.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching resources' });
  }
};

export const createResource = async (req, res) => {
  const userId = req.user.id;
  const { title, type, url, notes } = req.body;

  if (!title || !type || !url) {
    return res.status(400).json({ error: 'Title, type, and url are required' });
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        title,
        type, // "YOUTUBE", "DOCS", "ARTICLE"
        url,
        notes,
        userId
      }
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating resource' });
  }
};

export const deleteResource = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const resourceExists = await prisma.resource.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!resourceExists) {
      return res.status(404).json({ error: 'Resource not found or unauthorized' });
    }

    await prisma.resource.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting resource' });
  }
};
