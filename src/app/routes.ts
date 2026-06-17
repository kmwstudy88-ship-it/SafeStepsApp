import { Application } from 'express';
import { healthRouter } from '../modules/health/health.routes';

export function registerRoutes(app: Application) {
  app.use('/health', healthRouter);

  // later:
  // app.use('/users', userRouter);
  // app.use('/programs', programRouter);
  // app.use('/short-courses', shortCourseRouter);
  // app.use('/tasks', taskRouter);
}
