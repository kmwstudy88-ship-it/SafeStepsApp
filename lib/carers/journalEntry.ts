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

export function createJournalEntry(
  kind: EntryKind,
  text: string,
  imageUri?: string,
  id?: string,
): JournalEntry | null {
  const detail = text.trim();
  if (!detail) return null;

  return {
    id: id ?? String(Date.now()),
    kind,
    title: kind === 'Achievement' ? 'A new achievement' : kind === 'Worry or concern' ? 'New concern recorded' : 'Daily care update',
    detail,
    time: 'Just now',
    shared: false,
    imageUri,
  };
}
