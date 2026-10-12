import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeSafetyPlanQuality(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Assess safety plan quality: clarity, feasibility, roles, monitoring, contingency steps, and protective effectiveness. Return structured JSON.'
      },
      { role: 'user', content: text }
    ]
  });

  return completion.choices[0].message.content;
}
