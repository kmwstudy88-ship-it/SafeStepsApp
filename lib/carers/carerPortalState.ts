export type EntryKind = 'Daily update' | 'Achievement' | 'Worry or concern';

export type JournalEntry = {
  id: string;
  kind: EntryKind;
  title: string;
  detail: string;
  time: string;
  shared: boolean;
  imageUri?: string;
};

const entryTitles: Record<EntryKind, string> = {
  'Daily update': 'Daily care update',
  Achievement: 'A new achievement',
  'Worry or concern': 'New concern recorded',
};

export function createJournalEntry(
  kind: EntryKind,
  text: string,
  imageUri?: string,
  id = String(Date.now()),
): JournalEntry | null {
  const detail = text.trim();
  if (!detail) return null;

  return {
    id,
    kind,
    title: entryTitles[kind],
    detail,
    time: 'Just now',
    shared: false,
    imageUri,
  };
}
