import { randomUUID } from 'node:crypto';
import type { TelehealthAppointment, TelehealthParticipant } from './telehealth.types';
import { telehealthRepository } from './telehealth.repository';

export class AppointmentService {
  createAppointment(input: Omit<TelehealthAppointment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: TelehealthAppointment['status'] }): TelehealthAppointment {
    const appointment: TelehealthAppointment = {
      id: randomUUID(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...input
    };

    return telehealthRepository.createAppointment(appointment);
  }

  listAppointments(): TelehealthAppointment[] {
    return telehealthRepository.listAppointments();
  }

  getAppointment(id: string): TelehealthAppointment | undefined {
    return telehealthRepository.getAppointment(id);
  }

  confirmAppointment(id: string): TelehealthAppointment | undefined {
    const appointment = telehealthRepository.getAppointment(id);
    if (!appointment) {
      return undefined;
    }

    appointment.status = 'confirmed';
    appointment.updatedAt = new Date().toISOString();
    return appointment;
  }

  cancelAppointment(id: string): TelehealthAppointment | undefined {
    const appointment = telehealthRepository.getAppointment(id);
    if (!appointment) {
      return undefined;
    }

    appointment.status = 'cancelled';
    appointment.updatedAt = new Date().toISOString();
    return appointment;
  }

  addParticipant(appointmentId: string, participant: TelehealthParticipant): TelehealthAppointment | undefined {
    const appointment = telehealthRepository.getAppointment(appointmentId);
    if (!appointment) {
      return undefined;
    }

    appointment.participants.push(participant);
    appointment.updatedAt = new Date().toISOString();
    return appointment;
  }
}

export const appointmentService = new AppointmentService();
