import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initDatabase } from './data/db.js';
import apiRouter from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize local JSON database
initDatabase();

// Mount all API endpoints
app.use('/api', apiRouter);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 TDC Matchmaker Server running on http://localhost:${config.port}`);
});
export default app;
