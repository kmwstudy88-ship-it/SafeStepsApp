import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeDocumentQuality(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Assess document quality: clarity, accuracy, completeness, neutrality, structure, and evidence support. Return structured JSON.'
      },
      { role: 'user', content: text }
    ]
  });

  return completion.choices[0].message.content;
}
