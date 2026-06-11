import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

// Resolve frontend static directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// Serve static assets in production if they exist
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // Catch-all route to serve Index.html for React SPA
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// Start server
app.listen(config.port, () => {
  console.log(`🚀 TDC Matchmaker Server running on http://localhost:${config.port}`);
});
export default app;
