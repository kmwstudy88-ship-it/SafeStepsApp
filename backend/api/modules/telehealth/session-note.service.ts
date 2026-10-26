import { randomUUID } from 'node:crypto';
import { telehealthRepository } from './telehealth.repository';
import type { TelehealthSessionNote } from './telehealth.types';

export class SessionNoteService {
  createNote(input: Omit<TelehealthSessionNote, 'id' | 'createdAt'>): TelehealthSessionNote {
    const note: TelehealthSessionNote = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };

    return telehealthRepository.createNote(note);
  }
}

export const sessionNoteService = new SessionNoteService();
