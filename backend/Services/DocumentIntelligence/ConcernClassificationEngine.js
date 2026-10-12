import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function classifyConcerns(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Classify all concerns into categories: supervision, emotional regulation, routines, home safety, substance use, mental health, domestic violence, parenting capacity, environmental risks, and professional relationship concerns. Return structured JSON.'
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}
