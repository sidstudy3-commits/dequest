import express from 'express';
import { getResources, createResource, deleteResource } from '../controllers/resourceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getResources);
router.post('/', createResource);
router.delete('/:id', deleteResource);

export default router;
