import express from 'express';
import { register, login, getProfile, updateSettings, clearData } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.put('/settings', authenticateToken, updateSettings);
router.post('/clear', authenticateToken, clearData);

export default router;
