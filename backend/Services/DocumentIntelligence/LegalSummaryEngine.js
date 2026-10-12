import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function generateLegalSummary(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Produce a professional legal summary: allegations, evidence, contradictions, fairness issues, unrealistic expectations, missing evidence, timeline inconsistencies, and challenge points.'
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}
