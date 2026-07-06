import { createApp } from '../backend/app';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = await createApp();

  app.listen(PORT, () => {
    console.log(`SafeSteps API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
