import { Router } from 'express';
import { telehealthController } from './telehealth.controller';

export const telehealthRouter = Router();

telehealthRouter.get('/api/v1/telehealth/appointments', (req, res) => {
  res.json(telehealthController.listAppointments());
});

telehealthRouter.post('/api/v1/telehealth/appointments', (req, res) => {
  res.status(201).json(telehealthController.createAppointment(req.body));
});

telehealthRouter.get('/api/v1/telehealth/appointments/:appointmentId', (req, res) => {
  const appointment = telehealthController.getAppointment(req.params.appointmentId);
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }
  res.json(appointment);
});

telehealthRouter.post('/api/v1/telehealth/appointments/:appointmentId/confirm', (req, res) => {
  const appointment = telehealthController.confirmAppointment(req.params.appointmentId);
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }
  res.json(appointment);
});

telehealthRouter.post('/api/v1/telehealth/appointments/:appointmentId/cancel', (req, res) => {
  const appointment = telehealthController.cancelAppointment(req.params.appointmentId);
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }
  res.json(appointment);
});

telehealthRouter.post('/api/v1/telehealth/appointments/:appointmentId/session', (req, res) => {
  res.status(201).json(telehealthController.createSession(req.body));
});

telehealthRouter.get('/api/v1/telehealth/sessions/:sessionId', (req, res) => {
  const session = telehealthController.getSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

telehealthRouter.post('/api/v1/telehealth/sessions/:sessionId/waiting-room', (req, res) => {
  res.json(telehealthController.joinWaitingRoom(req.params.sessionId, req.body.participantId));
});

telehealthRouter.get('/api/v1/telehealth/sessions/:sessionId/attendance', (req, res) => {
  res.json(telehealthController.recordAttendance(req.params.sessionId, req.query.participantId as string));
});

telehealthRouter.post('/api/v1/telehealth/sessions/:sessionId/consents', (req, res) => {
  res.status(201).json(telehealthController.createConsent(req.body));
});

telehealthRouter.post('/api/v1/telehealth/sessions/:sessionId/notes', (req, res) => {
  res.status(201).json(telehealthController.createNote(req.body));
});
