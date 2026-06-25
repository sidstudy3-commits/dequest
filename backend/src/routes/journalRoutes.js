import express from 'express';
import { getJournals, createJournal, updateJournal, deleteJournal } from '../controllers/journalController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getJournals);
router.post('/', createJournal);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

export default router;
