import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function weightEvidence(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Weight evidence: credibility, consistency, relevance, corroboration, and strength of supporting information. Return structured JSON.'
      },
      { role: 'user', content: text }
    ]
  });

  return completion.choices[0].message.content;
}
