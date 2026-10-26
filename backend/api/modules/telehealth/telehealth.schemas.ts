export const appointmentCreateSchema = {
  type: 'object',
  required: ['caseId', 'appointmentType', 'scheduledStart', 'scheduledEnd', 'hostId', 'participants'],
  properties: {
    caseId: { type: 'string', format: 'uuid' },
    familyId: { type: 'string', format: 'uuid' },
    appointmentType: { type: 'string' },
    purpose: { type: 'string' },
    hostId: { type: 'string', format: 'uuid' },
    scheduledStart: { type: 'string', format: 'date-time' },
    scheduledEnd: { type: 'string', format: 'date-time' },
    timezone: { type: 'string' },
    meetingMethod: { type: 'string' },
    consentRequirements: { type: 'array' },
    recordingPolicy: { type: 'string' },
    participants: { type: 'array' }
  }
};

export const consentSchema = {
  type: 'object',
  required: ['consentType', 'participantId', 'decision'],
  properties: {
    consentType: { type: 'string' },
    participantId: { type: 'string', format: 'uuid' },
    decision: { type: 'string', enum: ['granted', 'declined', 'withdrawn', 'pending'] },
    version: { type: 'string' },
    method: { type: 'string' }
  }
};

export const noteSchema = {
  type: 'object',
  required: ['noteType', 'body'],
  properties: {
    noteType: { type: 'string' },
    body: { type: 'string', minLength: 1 },
    visibilityLevel: { type: 'string' }
  }
};

export const incidentSchema = {
  type: 'object',
  required: ['incidentType', 'summary'],
  properties: {
    incidentType: { type: 'string' },
    summary: { type: 'string', minLength: 1 },
    severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
  }
};
