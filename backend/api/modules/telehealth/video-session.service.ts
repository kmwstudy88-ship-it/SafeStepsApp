import { randomUUID } from 'node:crypto';
import type { TelehealthSession } from './telehealth.types';
import { telehealthRepository } from './telehealth.repository';

export class VideoSessionService {
  createSession(input: Omit<TelehealthSession, 'id' | 'createdAt' | 'status'>): TelehealthSession {
    const session: TelehealthSession = {
      id: randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...input
    };

    return telehealthRepository.createSession(session);
  }

  getSession(id: string): TelehealthSession | undefined {
    return telehealthRepository.getSession(id);
  }

  startSession(id: string): TelehealthSession | undefined {
    const session = telehealthRepository.getSession(id);
    if (!session) {
      return undefined;
    }

    session.status = 'active';
    session.startedAt = new Date().toISOString();
    return session;
  }

  endSession(id: string): TelehealthSession | undefined {
    const session = telehealthRepository.getSession(id);
    if (!session) {
      return undefined;
    }

    session.status = 'ended';
    session.endedAt = new Date().toISOString();
    return session;
  }
}

export const videoSessionService = new VideoSessionService();
