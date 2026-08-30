import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Production Static File Serving
const distPath = path.resolve('dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.send('Skylark Intelligence Server is running. Frontend build pending.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Skylark Intelligence Server listening on port ${PORT}`);
  console.log(`=======================================================`);
});
