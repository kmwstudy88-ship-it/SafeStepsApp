import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function generateActionPlan(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Generate a clear, step-by-step action plan for the parent based on the document: required tasks, recommended tasks, timelines, safety steps, communication steps, and service engagement steps. Return structured JSON.'
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}
