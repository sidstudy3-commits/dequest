import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // We can restrict this to the frontend URL later if needed
  credentials: true
}));

// Body parser
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/achievements', achievementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`[DevQuest Backend] Server running on port ${PORT}`);
});
