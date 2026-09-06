export type CrisisResource = {
  name: string;
  phone: string;
  description: string;
  category: 'emergency' | 'domestic_violence' | 'mental_health' | 'parenting';
};

export const NATIONAL_CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: 'Emergency Services (Police / Ambulance / Fire)',
    phone: '000',
    description: 'Immediate threat to life, child safety emergency, or active violence.',
    category: 'emergency',
  },
  {
    name: '1800RESPECT',
    phone: '1800 737 732',
    description: 'National domestic, family and sexual violence counselling service. 24/7, confidential.',
    category: 'domestic_violence',
  },
  {
    name: 'Lifeline Australia',
    phone: '13 11 14',
    description: '24/7 crisis support and suicide prevention services.',
    category: 'mental_health',
  },
  {
    name: 'Parentline',
    phone: '1300 30 1300',
    description: 'Confidential telephone counselling and support for parents and carers in QLD and NT.',
    category: 'parenting',
  },
];

const RISK_KEYWORDS = [
  'kill myself', 'suicide', 'end it all', 'hurt the baby', 'hurt my child',
  'threatened with a knife', 'he hit me', 'she hit me', 'choking me',
];

export function scanTextForCrisisRisk(text: string): { hasImmediateRisk: boolean; detectedPhrase?: string } {
  const lower = text.toLowerCase();
  for (const phrase of RISK_KEYWORDS) {
    if (lower.includes(phrase)) {
      return { hasImmediateRisk: true, detectedPhrase: phrase };
    }
  }
  return { hasImmediateRisk: false };
}
