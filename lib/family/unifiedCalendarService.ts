/**
 * SafeSteps Unified Family Calendar Service (SS-PAR-014, SS-VIS-001)
 *
 * Consolidates contact visits, court hearings, practitioner appointments,
 * and case plan milestone deadlines into a single trauma-informed calendar.
 *
 * Prevents missed visits and provides pre-visit preparation reminders.
 */

export type CalendarEventType =
  | 'contact_visit'
  | 'court_hearing'
  | 'practitioner_appointment'
  | 'task_deadline';

export type EventLocationType =
  | 'in_person'
  | 'contact_centre'
  | 'community'
  | 'video_telehealth';

export interface CalendarAttendee {
  name: string;
  role: 'parent' | 'child' | 'caseworker' | 'carer' | 'magistrate' | 'specialist';
}

export interface CalendarEvent {
  id: string;
  caseId: string;
  title: string;
  eventType: CalendarEventType;
  startTime: string; // ISO 8601
  endTime?: string;
  location?: string;
  locationType: EventLocationType;
  attendees: CalendarAttendee[];
  prepInstructions?: string;
  reminderMinutesBefore: number;
  isCompleted: boolean;
  linkedRoute?: string;
}

// In-memory store
const localEventsCache = new Map<string, CalendarEvent>();

export const DEFAULT_MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_visit_01',
    caseId: 'demo_case',
    title: 'Supervised Contact Visit with Leo & Maya',
    eventType: 'contact_visit',
    startTime: '2026-11-03T10:00:00Z',
    endTime: '2026-11-03T12:00:00Z',
    location: 'Community Family Centre, Room 4',
    locationType: 'contact_centre',
    attendees: [
      { name: 'Parent User', role: 'parent' },
      { name: 'Leo', role: 'child' },
      { name: 'Maya', role: 'child' },
      { name: 'Sarah Jenkins (CSO)', role: 'caseworker' },
    ],
    prepInstructions: 'Pack sensory drawing materials, fruit snacks, and comfort blanket for Maya.',
    reminderMinutesBefore: 120,
    isCompleted: false,
    linkedRoute: '/contact-visit',
  },
  {
    id: 'evt_court_01',
    caseId: 'demo_case',
    title: 'Childrens Court Directions Hearing',
    eventType: 'court_hearing',
    startTime: '2026-11-12T09:30:00Z',
    endTime: '2026-11-12T11:00:00Z',
    location: 'Brisbane Childrens Court, Court 2',
    locationType: 'in_person',
    attendees: [
      { name: 'Parent User', role: 'parent' },
      { name: 'Legal Representative', role: 'specialist' },
      { name: 'Sarah Jenkins (CSO)', role: 'caseworker' },
    ],
    prepInstructions: 'Arrive 30 minutes early with Court-Ready Progress Summary PDF.',
    reminderMinutesBefore: 1440, // 24 hours
    isCompleted: false,
    linkedRoute: '/reports',
  },
  {
    id: 'evt_ther_01',
    caseId: 'demo_case',
    title: 'Leo Speech Therapy & Developmental Review',
    eventType: 'practitioner_appointment',
    startTime: '2026-11-06T14:00:00Z',
    endTime: '2026-11-06T15:00:00Z',
    location: 'Telehealth Secure Room',
    locationType: 'video_telehealth',
    attendees: [
      { name: 'Parent User', role: 'parent' },
      { name: 'Leo', role: 'child' },
      { name: 'Dr. Evans (Speech Pathologist)', role: 'specialist' },
    ],
    prepInstructions: 'Have speech practice logbook open and quiet space ready.',
    reminderMinutesBefore: 60,
    isCompleted: false,
  },
  {
    id: 'evt_task_01',
    caseId: 'demo_case',
    title: 'Safe Sleeping Space Milestone Proof Deadline',
    eventType: 'task_deadline',
    startTime: '2026-11-01T17:00:00Z',
    locationType: 'in_person',
    attendees: [{ name: 'Parent User', role: 'parent' }],
    prepInstructions: 'Ensure photo is uploaded to Evidence Vault before 5:00 PM.',
    reminderMinutesBefore: 360,
    isCompleted: false,
    linkedRoute: '/evidence',
  },
];

DEFAULT_MOCK_EVENTS.forEach((e) => localEventsCache.set(e.id, { ...e }));

/**
 * Retrieves all events for a given case within an optional date range.
 */
export async function getCalendarEvents(
  caseId: string,
  startDate?: string,
  endDate?: string
): Promise<CalendarEvent[]> {
  const result: CalendarEvent[] = [];
  localEventsCache.forEach((e) => {
    if (e.caseId === caseId || caseId === 'demo_case') {
      if (startDate && new Date(e.startTime) < new Date(startDate)) return;
      if (endDate && new Date(e.startTime) > new Date(endDate)) return;
      result.push({ ...e });
    }
  });

  return result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

/**
 * Retrieves immediate upcoming events sorted chronologically.
 */
export async function getUpcomingEvents(caseId: string, limit = 5): Promise<CalendarEvent[]> {
  const all = await getCalendarEvents(caseId);
  const now = new Date().toISOString();
  return all
    .filter((e) => !e.isCompleted && e.startTime >= now.split('T')[0])
    .slice(0, limit);
}

export interface CreateCalendarEventInput {
  caseId: string;
  title: string;
  eventType: CalendarEventType;
  startTime: string;
  endTime?: string;
  location?: string;
  locationType: EventLocationType;
  attendees?: CalendarAttendee[];
  prepInstructions?: string;
  reminderMinutesBefore?: number;
  linkedRoute?: string;
}

/**
 * Creates a new calendar event with validation.
 */
export async function createCalendarEvent(
  input: CreateCalendarEventInput
): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> {
  if (!input.title.trim()) {
    return { success: false, error: 'Event title cannot be empty' };
  }
  if (!input.startTime) {
    return { success: false, error: 'Event start time is required' };
  }

  const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newEvent: CalendarEvent = {
    id,
    caseId: input.caseId,
    title: input.title.trim(),
    eventType: input.eventType,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location?.trim(),
    locationType: input.locationType,
    attendees: input.attendees || [{ name: 'Parent User', role: 'parent' }],
    prepInstructions: input.prepInstructions?.trim(),
    reminderMinutesBefore: input.reminderMinutesBefore ?? 60,
    isCompleted: false,
    linkedRoute: input.linkedRoute,
  };

  localEventsCache.set(id, newEvent);
  return { success: true, event: { ...newEvent } };
}

/**
 * Marks a calendar event as completed.
 */
export async function markEventCompleted(
  eventId: string
): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> {
  const evt = localEventsCache.get(eventId);
  if (!evt) {
    return { success: false, error: 'Calendar event not found' };
  }

  evt.isCompleted = true;
  localEventsCache.set(eventId, evt);
  return { success: true, event: { ...evt } };
}
