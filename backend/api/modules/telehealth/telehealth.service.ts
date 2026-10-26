import { appointmentService } from './appointment.service';
import { attendanceService } from './attendance.service';
import { consentService } from './consent.service';
import { recordingPolicyService } from './recording-policy.service';
import { sessionNoteService } from './session-note.service';
import { videoSessionService } from './video-session.service';
import { waitingRoomService } from './waiting-room.service';

export class TelehealthService {
  appointments = appointmentService;
  sessions = videoSessionService;
  waitingRoom = waitingRoomService;
  attendance = attendanceService;
  consents = consentService;
  notes = sessionNoteService;
  recordingPolicy = recordingPolicyService;
}

export const telehealthService = new TelehealthService();
