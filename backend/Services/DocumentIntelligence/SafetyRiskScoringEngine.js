import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function scoreSafetyRisk(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Score safety risk: exposure to harm, supervision issues, environmental hazards, caregiver behaviour, and protective factors. Return structured JSON with a risk score.'
      },
      { role: 'user', content: text }
    ]
  });

  return completion.choices[0].message.content;
}
