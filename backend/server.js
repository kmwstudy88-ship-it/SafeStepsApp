import express from 'express';

import './env.js';

const app = express();
const port = process.env.PORT ?? 3000;
const { default: documentRoutes } = await import('./routes/documents/documentRoutes.js');
const { default: userCurriculumRoutes } = await import('./routes/users/curriculumRoutes.js');
const { default: worksheetRoutes } = await import('./routes/worksheets/worksheetRoutes.js');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.SAFESTEPS_ALLOWED_ORIGIN ?? '*');
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
app.use('/worksheets', worksheetRoutes);
app.use('/users', userCurriculumRoutes);

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
