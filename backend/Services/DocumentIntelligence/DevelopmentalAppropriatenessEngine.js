import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeDevelopmentalAppropriateness(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Assess developmental appropriateness: milestones, age-appropriate expectations, developmental delays, and strengths. Return structured JSON.' },
      { role: 'user', content: text }
    ]
  });
  return completion.choices[0].message.content;
}
