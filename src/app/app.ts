import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

export async function createApp(): Promise<Application> {
  const app = express();

  // Security + core middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));

  // Health check route
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'safesteps-api',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

