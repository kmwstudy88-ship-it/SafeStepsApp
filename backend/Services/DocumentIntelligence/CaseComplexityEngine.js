import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeCaseComplexity(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Assess case complexity: number of concerns, severity, intersecting risks, multi-agency involvement, and systemic barriers. Return structured JSON.'
      },
      { role: 'user', content: text }
    ]
  });

  return completion.choices[0].message.content;
}
