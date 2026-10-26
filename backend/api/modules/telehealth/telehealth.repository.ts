import type { TelehealthAction, TelehealthAppointment, TelehealthAuditEvent, TelehealthConsent, TelehealthIncident, TelehealthSession, TelehealthSessionNote } from './telehealth.types';

export class TelehealthRepository {
  private appointments: TelehealthAppointment[] = [];
  private sessions: TelehealthSession[] = [];
  private consents: TelehealthConsent[] = [];
  private notes: TelehealthSessionNote[] = [];
  private incidents: TelehealthIncident[] = [];
  private actions: TelehealthAction[] = [];
  private audits: TelehealthAuditEvent[] = [];

  listAppointments(): TelehealthAppointment[] {
    return this.appointments;
  }

  createAppointment(appointment: TelehealthAppointment): TelehealthAppointment {
    this.appointments.push(appointment);
    return appointment;
  }

  getAppointment(id: string): TelehealthAppointment | undefined {
    return this.appointments.find((appointment) => appointment.id === id);
  }

  createSession(session: TelehealthSession): TelehealthSession {
    this.sessions.push(session);
    return session;
  }

  getSession(id: string): TelehealthSession | undefined {
    return this.sessions.find((session) => session.id === id);
  }

  createConsent(consent: TelehealthConsent): TelehealthConsent {
    this.consents.push(consent);
    return consent;
  }

  createNote(note: TelehealthSessionNote): TelehealthSessionNote {
    this.notes.push(note);
    return note;
  }

  createIncident(incident: TelehealthIncident): TelehealthIncident {
    this.incidents.push(incident);
    return incident;
  }

  createAction(action: TelehealthAction): TelehealthAction {
    this.actions.push(action);
    return action;
  }

  createAuditEvent(event: TelehealthAuditEvent): TelehealthAuditEvent {
    this.audits.push(event);
    return event;
  }
}

export const telehealthRepository = new TelehealthRepository();
