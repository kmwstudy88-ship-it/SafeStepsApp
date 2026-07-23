import 'dotenv/config';

if (!process.env.OPENAI_KEY && process.env.OPENAI_API_KEY) {
  process.env.OPENAI_KEY = process.env.OPENAI_API_KEY;
}

process.env.SAFESTEPS_OPENAI_CONFIGURED = process.env.OPENAI_KEY ? 'true' : 'false';

if (!process.env.OPENAI_KEY) {
  process.env.OPENAI_KEY = 'missing-openai-key';
}
