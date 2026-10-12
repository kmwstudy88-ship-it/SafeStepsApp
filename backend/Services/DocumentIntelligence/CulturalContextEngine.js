import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeCulturalContext(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Assess cultural context: cultural strengths, cultural needs, cultural misunderstandings, and relevance to parenting and safety. Return structured JSON.'
      },
      { role: 'user', content: text }
    ]
  });

  return completion.choices[0].message.content;
}
