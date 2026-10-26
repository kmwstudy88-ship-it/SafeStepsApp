'use strict';

const crypto = require('node:crypto');

class TelehealthService {
  constructor() {
    this.appointments = new Map();
    this.sessions = new Map();
    this.waitingRooms = new Map();
    this.attendanceRecords = new Map();
    this.consents = new Map();
    this.notes = new Map();
  }

  createAppointment(input = {}) {
    const appointment = {
      id: crypto.randomUUID(),
      caseId: input.caseId || null,
      scheduledStartTime: input.scheduledStartTime || new Date().toISOString(),
      scheduledEndTime: input.scheduledEndTime || new Date(Date.now() + 3600000).toISOString(),
      status: input.status || 'scheduled',
      participants: Array.isArray(input.participants) ? input.participants : [],
      sessionType: input.sessionType || 'video',
      notes: input.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  listAppointments() {
    return Array.from(this.appointments.values());
  }

  getAppointment(id) {
    return this.appointments.get(id);
  }

  confirmAppointment(id) {
    const appointment = this.appointments.get(id);
    if (!appointment) return null;
    appointment.status = 'confirmed';
    appointment.updatedAt = new Date().toISOString();
    return appointment;
  }

  cancelAppointment(id) {
    const appointment = this.appointments.get(id);
    if (!appointment) return null;
    appointment.status = 'cancelled';
    appointment.updatedAt = new Date().toISOString();
    return appointment;
  }

  createSession(input = {}) {
    const session = {
      id: crypto.randomUUID(),
      appointmentId: input.appointmentId || null,
      roomName: input.roomName || `safesteps-${crypto.randomUUID().slice(0, 8)}`,
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null,
      recordingEnabled: Boolean(input.recordingEnabled),
      metadata: input.metadata || {},
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id) {
    return this.sessions.get(id);
  }

  joinWaitingRoom(sessionId, participantId) {
    const entry = {
      id: crypto.randomUUID(),
      sessionId,
      participantId: participantId || 'guest',
      joinedAt: new Date().toISOString(),
      status: 'waiting',
    };
    const list = this.waitingRooms.get(sessionId) || [];
    list.push(entry);
    this.waitingRooms.set(sessionId, list);
    return entry;
  }

  recordAttendance(sessionId, participantId) {
    const record = {
      id: crypto.randomUUID(),
      sessionId,
      participantId: participantId || 'attendee',
      recordedAt: new Date().toISOString(),
      present: true,
    };
    const list = this.attendanceRecords.get(sessionId) || [];
    list.push(record);
    this.attendanceRecords.set(sessionId, list);
    return record;
  }

  createConsent(input = {}) {
    const consent = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId || null,
      participantId: input.participantId || null,
      consentType: input.consentType || 'telehealth_participation',
      granted: Boolean(input.granted),
      timestamp: new Date().toISOString(),
    };
    this.consents.set(consent.id, consent);
    return consent;
  }

  createNote(input = {}) {
    const note = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId || null,
      authorId: input.authorId || null,
      noteText: input.noteText || input.text || '',
      createdAt: new Date().toISOString(),
      humanReviewRequired: true,
    };
    this.notes.set(note.id, note);
    return note;
  }

  evaluateRecordingPolicy(recordingRequested) {
    return {
      allowed: false, // SafeSteps default: recording prohibited without tripartite explicit consent
      reason: 'Telehealth recordings require explicit judicial or multi-party consent and are disabled by default.',
      requested: Boolean(recordingRequested),
    };
  }
}

const telehealthService = new TelehealthService();

module.exports = {
  TelehealthService,
  telehealthService,
};
