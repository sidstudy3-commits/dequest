import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/chat', chatWithAI);

export default router;
