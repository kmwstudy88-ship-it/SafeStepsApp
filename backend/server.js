import express from 'express';

import './env.js';
import { requireAuthenticatedUser } from './middleware/requireAuthenticatedUser.js';

const app = express();
const port = process.env.PORT ?? 3000;
const { default: documentRoutes } = await import('./routes/documents/documentRoutes.js');
const { default: userCurriculumRoutes } = await import('./routes/users/curriculumRoutes.js');
const { default: worksheetRoutes } = await import('./routes/worksheets/worksheetRoutes.js');

const allowedOrigins = (
  process.env.SAFESTEPS_ALLOWED_ORIGINS ??
  process.env.SAFESTEPS_ALLOWED_ORIGIN ??
  'http://localhost:8081,http://localhost:8099,http://localhost:19006'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    res.status(403).json({ error: 'This origin is not allowed to access the SafeSteps API.' });
    return;
  }

  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'safesteps-api' });
});

app.use('/documents', documentRoutes);
app.use('/worksheets', requireAuthenticatedUser, worksheetRoutes);
app.use('/users', requireAuthenticatedUser, userCurriculumRoutes);

app.use((error, _req, res, _next) => {
  console.error('SafeSteps API error:', error);
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;

  res.status(statusCode).json({
    error: error instanceof Error ? error.message : 'SafeSteps API request failed.',
  });
});

app.listen(port, () => {
  console.log(`SafeSteps API listening on http://localhost:${port}`);
});
