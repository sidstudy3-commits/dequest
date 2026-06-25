import express from 'express';
import { getTopics, createTopic, updateTopic, deleteTopic } from '../controllers/topicController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTopics);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;
