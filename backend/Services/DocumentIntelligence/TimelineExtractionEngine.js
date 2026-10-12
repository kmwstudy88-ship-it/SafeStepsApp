import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function extractTimeline(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Extract a chronological timeline of events: dates, incidents, caseworker actions, parent actions, court orders, assessments, and any major milestones. Return structured JSON sorted by date.'
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}
