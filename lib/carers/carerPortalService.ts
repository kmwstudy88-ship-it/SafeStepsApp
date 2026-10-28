/**
 * SafeSteps Carer Portal Service (SS-CAR-001 - SS-CAR-030)
 *
 * Implements:
 * 1. Placement-scoped daily care logs, routines, and achievements.
 * 2. Pre- and post-contact visit observation tracking.
 * 3. Separation of verbatim child words from carer opinion (forensic criteria).
 * 4. Monitored messaging with parental sharing permissions.
 * 5. Strict adherence to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md.
 */

export type CareEntryKind =
  | 'daily_update'
  | 'achievement'
  | 'concern'
  | 'routine'
  | 'medical'
  | 'visit_observation';

export type RoutineType = 'sleep' | 'meal' | 'medication' | 'school';

export type VisitStage = 'pre_visit_prep' | 'post_visit_recovery';

export interface CarerJournalEntry {
  id: string;
  placementId: string;
  childId: string;
  childName: string;
  carerId: string;
  kind: CareEntryKind;
  title: string;
  detail: string;
  verbatimChildWords?: string; // Verbatim child quotes stored separately from carer observation
  routineType?: RoutineType;
  visitStage?: VisitStage;
  sharedWithParent: boolean;
  imageUri?: string;
  createdAt: string;
  verifiedByWorker: boolean;
}

export interface CarerMonitoredMessage {
  id: string;
  placementId: string;
  senderRole: 'carer' | 'parent';
  senderName: string;
  messageText: string;
  monitoredNoticeAcknowledged: boolean;
  createdAt: string;
}

// In-memory local cache
const localEntries = new Map<string, CarerJournalEntry>();
const localMessages = new Map<string, CarerMonitoredMessage[]>();

export const DEFAULT_MOCK_CARER_ENTRIES: CarerJournalEntry[] = [
  {
    id: 'entry_01',
    placementId: 'placement_leo_01',
    childId: 'child_leo',
    childName: 'Leo (Age 6)',
    carerId: 'carer_anne_lewis',
    kind: 'achievement',
    title: 'Independent Classroom Entry',
    detail: 'Leo walked into class independently without hesitation and proudly showed his teacher his completed reading badge.',
    verbatimChildWords: 'Look Miss Davis, I finished the kangaroo story with Mum!',
    sharedWithParent: true,
    createdAt: '2026-10-28T09:15:00Z',
    verifiedByWorker: true,
  },
  {
    id: 'entry_02',
    placementId: 'placement_leo_01',
    childId: 'child_leo',
    childName: 'Leo (Age 6)',
    carerId: 'carer_anne_lewis',
    kind: 'routine',
    routineType: 'sleep',
    title: 'Calm Evening Bedtime Routine',
    detail: 'Settled after two chapters of the co-reading storybook and used the 4-4-4-4 box breathing technique.',
    verbatimChildWords: 'My tummy feels soft now.',
    sharedWithParent: true,
    createdAt: '2026-10-27T20:24:00Z',
    verifiedByWorker: false,
  },
  {
    id: 'entry_03',
    placementId: 'placement_leo_01',
    childId: 'child_leo',
    childName: 'Leo (Age 6)',
    carerId: 'carer_anne_lewis',
    kind: 'visit_observation',
    visitStage: 'post_visit_recovery',
    title: 'Post-Contact Visit Transition',
    detail: 'Ate dinner enthusiastically. Spent 20 minutes quietly drawing LEGO spaceships before bedtime.',
    verbatimChildWords: 'Mum helped me build the big red rocket today.',
    sharedWithParent: true,
    createdAt: '2026-10-25T18:00:00Z',
    verifiedByWorker: true,
  },
];

export const DEFAULT_MOCK_MESSAGES: CarerMonitoredMessage[] = [
  {
    id: 'cmsg_01',
    placementId: 'placement_leo_01',
    senderRole: 'parent',
    senderName: 'Sarah (Parent)',
    messageText: "Hi Anne, just packed Leo's green sensory blanket and his favorite dinosaur book for Tuesday.",
    monitoredNoticeAcknowledged: true,
    createdAt: '2026-10-27T14:30:00Z',
  },
  {
    id: 'cmsg_02',
    placementId: 'placement_leo_01',
    senderRole: 'carer',
    senderName: 'Anne (Carer)',
    messageText: 'Thanks Sarah, he was talking about reading that book with you. He is having a calm, happy week.',
    monitoredNoticeAcknowledged: true,
    createdAt: '2026-10-27T16:00:00Z',
  },
];

// Initialize cache
DEFAULT_MOCK_CARER_ENTRIES.forEach((e) => localEntries.set(e.id, { ...e }));
localMessages.set('placement_leo_01', JSON.parse(JSON.stringify(DEFAULT_MOCK_MESSAGES)));

/**
 * Retrieves carer journal entries for a placement or child.
 */
export async function getCarerJournalEntries(
  childId?: string,
  kindFilter?: CareEntryKind
): Promise<CarerJournalEntry[]> {
  const result: CarerJournalEntry[] = [];
  localEntries.forEach((entry) => {
    if (!childId || entry.childId === childId || childId === 'all') {
      if (!kindFilter || entry.kind === kindFilter) {
        result.push({ ...entry });
      }
    }
  });

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export interface CreateCarerEntryInput {
  placementId: string;
  childId: string;
  childName: string;
  carerId: string;
  kind: CareEntryKind;
  title: string;
  detail: string;
  verbatimChildWords?: string;
  routineType?: RoutineType;
  visitStage?: VisitStage;
  sharedWithParent?: boolean;
  imageUri?: string;
}

/**
 * Creates a new carer journal entry with forensic separation of child words.
 */
export async function createCarerJournalEntry(
  input: CreateCarerEntryInput
): Promise<{ success: boolean; entry?: CarerJournalEntry; error?: string }> {
  if (!input.title.trim()) {
    return { success: false, error: 'Entry title cannot be empty' };
  }
  if (!input.detail.trim()) {
    return { success: false, error: 'Observation detail cannot be empty' };
  }

  const id = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newEntry: CarerJournalEntry = {
    id,
    placementId: input.placementId,
    childId: input.childId,
    childName: input.childName,
    carerId: input.carerId,
    kind: input.kind,
    title: input.title.trim(),
    detail: input.detail.trim(),
    verbatimChildWords: input.verbatimChildWords?.trim(),
    routineType: input.routineType,
    visitStage: input.visitStage,
    sharedWithParent: Boolean(input.sharedWithParent),
    imageUri: input.imageUri,
    createdAt: new Date().toISOString(),
    verifiedByWorker: false,
  };

  localEntries.set(id, newEntry);
  return { success: true, entry: { ...newEntry } };
}

/**
 * Toggles whether an entry is shared with the child's parents.
 */
export async function toggleEntryParentSharing(
  entryId: string
): Promise<{ success: boolean; entry?: CarerJournalEntry; error?: string }> {
  const entry = localEntries.get(entryId);
  if (!entry) {
    return { success: false, error: 'Entry not found' };
  }

  entry.sharedWithParent = !entry.sharedWithParent;
  localEntries.set(entryId, entry);
  return { success: true, entry: { ...entry } };
}

/**
 * Retrieves monitored carer-parent messages for a placement.
 */
export async function getCarerMessages(placementId: string): Promise<CarerMonitoredMessage[]> {
  const msgs = localMessages.get(placementId) || localMessages.get('placement_leo_01') || [];
  return JSON.parse(JSON.stringify(msgs));
}

export interface SendCarerMessageInput {
  placementId: string;
  senderRole: 'carer' | 'parent';
  senderName: string;
  messageText: string;
}

/**
 * Sends a monitored message between carer and parent with visible monitoring consent.
 */
export async function sendCarerMonitoredMessage(
  input: SendCarerMessageInput
): Promise<{ success: boolean; message?: CarerMonitoredMessage; error?: string }> {
  if (!input.messageText.trim()) {
    return { success: false, error: 'Message cannot be empty' };
  }

  const msgs = localMessages.get(input.placementId) || [];
  const id = `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newMsg: CarerMonitoredMessage = {
    id,
    placementId: input.placementId,
    senderRole: input.senderRole,
    senderName: input.senderName,
    messageText: input.messageText.trim(),
    monitoredNoticeAcknowledged: true,
    createdAt: new Date().toISOString(),
  };

  msgs.push(newMsg);
  localMessages.set(input.placementId, msgs);

  return { success: true, message: { ...newMsg } };
}
