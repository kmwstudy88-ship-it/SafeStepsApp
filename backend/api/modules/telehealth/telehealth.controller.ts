import { appointmentService } from './appointment.service';
import { attendanceService } from './attendance.service';
import { consentService } from './consent.service';
import { recordingPolicyService } from './recording-policy.service';
import { sessionNoteService } from './session-note.service';
import { videoSessionService } from './video-session.service';
import { waitingRoomService } from './waiting-room.service';

export class TelehealthController {
  listAppointments() {
    return appointmentService.listAppointments();
  }

  createAppointment(input: any) {
    return appointmentService.createAppointment(input);
  }

  getAppointment(id: string) {
    return appointmentService.getAppointment(id);
  }

  confirmAppointment(id: string) {
    return appointmentService.confirmAppointment(id);
  }

  cancelAppointment(id: string) {
    return appointmentService.cancelAppointment(id);
  }

  createSession(input: any) {
    return videoSessionService.createSession(input);
  }

  getSession(id: string) {
    return videoSessionService.getSession(id);
  }

  joinWaitingRoom(sessionId: string, participantId: string) {
    return waitingRoomService.createWaitingRoomEntry(sessionId, participantId);
  }

  recordAttendance(sessionId: string, participantId: string) {
    return attendanceService.recordAttendance(sessionId, participantId);
  }

  createConsent(input: any) {
    return consentService.createConsent(input);
  }

  createNote(input: any) {
    return sessionNoteService.createNote(input);
  }

  evaluateRecordingPolicy(recordingRequested: boolean) {
    return recordingPolicyService.evaluatePolicy(recordingRequested);
  }
}

export const telehealthController = new TelehealthController();
