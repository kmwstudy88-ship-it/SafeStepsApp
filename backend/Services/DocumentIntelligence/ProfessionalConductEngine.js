import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeProfessionalConduct(text) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Identify issues related to professional conduct: inappropriate tone, lack of neutrality, overreach, unclear instructions, procedural errors, missing follow-up, or inconsistent application of standards. Return structured JSON.'
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return completion.choices[0].message.content;
}
