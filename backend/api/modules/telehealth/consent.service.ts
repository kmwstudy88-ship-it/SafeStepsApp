import { randomUUID } from 'node:crypto';
import { telehealthRepository } from './telehealth.repository';
import type { TelehealthConsent } from './telehealth.types';

export class ConsentService {
  createConsent(input: Omit<TelehealthConsent, 'id' | 'createdAt'>): TelehealthConsent {
    const consent: TelehealthConsent = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };

    return telehealthRepository.createConsent(consent);
  }
}

export const consentService = new ConsentService();
