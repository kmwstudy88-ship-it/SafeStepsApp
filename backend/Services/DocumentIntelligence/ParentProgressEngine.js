import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeParentProgress(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Identify parent progress: improvements, engagement, skill development, stability, and positive change. Return structured JSON.' },
      { role: 'user', content: text }
    ]
  });
  return completion.choices[0].message.content;
}
