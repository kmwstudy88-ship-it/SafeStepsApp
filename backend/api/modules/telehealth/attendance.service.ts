import { randomUUID } from 'node:crypto';

export class AttendanceService {
  recordAttendance(sessionId: string, participantId: string): { id: string; sessionId: string; participantId: string; status: string } {
    return {
      id: randomUUID(),
      sessionId,
      participantId,
      status: 'joined'
    };
  }
}

export const attendanceService = new AttendanceService();
