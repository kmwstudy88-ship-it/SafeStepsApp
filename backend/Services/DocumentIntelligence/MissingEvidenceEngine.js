import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function detectMissingEvidence(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Identify all allegations, concerns, or statements that lack supporting evidence, dates, observations, or factual basis. Return structured JSON listing each unsupported claim.'
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}
