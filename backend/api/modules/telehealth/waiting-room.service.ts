import { randomUUID } from 'node:crypto';

export class WaitingRoomService {
  createWaitingRoomEntry(sessionId: string, participantId: string): { id: string; sessionId: string; participantId: string; status: string } {
    return {
      id: randomUUID(),
      sessionId,
      participantId,
      status: 'waiting'
    };
  }
}

export const waitingRoomService = new WaitingRoomService();
