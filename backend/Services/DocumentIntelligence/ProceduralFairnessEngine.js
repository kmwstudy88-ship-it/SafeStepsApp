import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeProceduralFairness(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Identify procedural fairness issues: unclear processes, missing notifications, lack of parent voice, inconsistent standards, missing follow-up, unclear timelines, or decisions made without evidence. Return structured JSON.'
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}
