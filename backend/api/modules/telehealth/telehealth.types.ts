export type AppointmentType =
  | 'caseworker_appointment'
  | 'family_support_session'
  | 'parenting_coaching'
  | 'psychological_assessment'
  | 'mental_health_consultation'
  | 'drug_and_alcohol_appointment'
  | 'domestic_family_violence_support'
  | 'legal_consultation'
  | 'court_preparation'
  | 'parent_child_contact'
  | 'family_conference'
  | 'child_consultation'
  | 'supervisor_review'
  | 'custom_professional_session';

export type AppointmentStatus =
  | 'draft'
  | 'scheduled'
  | 'confirmed'
  | 'rescheduled'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'participant_absent'
  | 'provider_absent'
  | 'technical_failure'
  | 'abandoned';

export type ParticipantRole =
  | 'host'
  | 'co_host'
  | 'parent'
  | 'child'
  | 'caseworker'
  | 'family_support_worker'
  | 'clinician'
  | 'lawyer'
  | 'court_officer'
  | 'interpreter'
  | 'support_person'
  | 'observer'
  | 'external_professional';

export type NoteType =
  | 'general_session_note'
  | 'clinical_note'
  | 'case_note'
  | 'contact_observation'
  | 'parenting_coaching_note'
  | 'child_voice_note'
  | 'legal_preparation_note'
  | 'technical_incident_note'
  | 'private_professional_note';

export interface TelehealthParticipant {
  id: string;
  userId: string;
  role: ParticipantRole;
  displayName: string;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  fileShareEnabled: boolean;
  canAdmit: boolean;
  canRecord: boolean;
  canWriteNotes: boolean;
}

export interface TelehealthAppointment {
  id: string;
  caseId: string;
  familyId?: string;
  organisationId?: string;
  appointmentType: AppointmentType;
  purpose?: string;
  hostId: string;
  participants: TelehealthParticipant[];
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  meetingMethod: string;
  locationOrSessionId?: string;
  accessibilityRequirements?: string[];
  interpreterRequired: boolean;
  consentRequirements: string[];
  recordingPolicy: 'disabled' | 'conditional' | 'allowed';
  reminderConfiguration?: Record<string, unknown>;
  status: AppointmentStatus;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelehealthSession {
  id: string;
  appointmentId: string;
  status: 'pending' | 'active' | 'ended' | 'abandoned';
  secureSessionId?: string;
  hostId: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface TelehealthConsent {
  id: string;
  sessionId: string;
  participantId: string;
  consentType: string;
  version: string;
  decision: 'granted' | 'declined' | 'withdrawn' | 'pending';
  method: string;
  witnessedBy?: string;
  createdAt: string;
}

export interface TelehealthSessionNote {
  id: string;
  sessionId: string;
  authorId: string;
  noteType: NoteType;
  body: string;
  visibilityLevel: string;
  actions?: string[];
  followUpDate?: string;
  linkedEvidenceIds?: string[];
  approvalStatus?: 'draft' | 'approved' | 'review_required';
  createdAt: string;
}

export interface TelehealthIncident {
  id: string;
  sessionId: string;
  incidentType: string;
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface TelehealthAction {
  id: string;
  sessionId: string;
  actionType: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface TelehealthAuditEvent {
  id: string;
  entityType: 'appointment' | 'session' | 'consent' | 'note' | 'incident';
  entityId: string;
  actorId: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
