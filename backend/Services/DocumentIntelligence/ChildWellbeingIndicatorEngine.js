import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeChildWellbeing(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Assess child wellbeing: safety, stability, emotional health, physical health, and developmental progress. Return structured JSON.' },
      { role: 'user', content: text }
    ]
  });
  return completion.choices[0].message.content;
}
