import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeLearningEngagement(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Assess learning engagement: parent involvement in child education, support for learning, and encouragement of development. Return structured JSON.' },
      { role: 'user', content: text }
    ]
  });
  return completion.choices[0].message.content;
}
