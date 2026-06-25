import express from 'express';
import { getGoals, createGoal, toggleGoal, deleteGoal } from '../controllers/goalController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:id/toggle', toggleGoal);
router.delete('/:id', deleteGoal);

export default router;
