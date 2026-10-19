import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { supabase } from '../supabaseClient';
import { createCarerPortalApi, type CarerCase, type CarerJournalEntry, type JournalKind, type OperationalCaseId } from './carerPortalApi';

const kinds: { value: JournalKind; label: string }[] = [
  { value: 'daily_update', label: 'Behaviour / daily update' },
  { value: 'achievement', label: 'Achievement' }, { value: 'concern', label: 'Worry or concern' },
];
const message = (error: unknown) => error instanceof Error ? error.message : 'Unable to load your carer records.';
export function submissionUuid() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function usePortalActor() {
  const [actor, setActor] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    let revision = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      revision += 1;
      if (alive) setActor(session?.user.id ?? null);
    });
    const initialRevision = revision;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && revision === initialRevision) setActor(data.session?.user.id ?? null);
    }).catch(() => { if (alive && revision === initialRevision) setActor(null); });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  return actor;
}

export default function ConnectedCarerPortalScreen() {
  const actor = usePortalActor();
  if (!actor) return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <Text style={styles.heading}>Carer Portal</Text>
    {actor === undefined ? <ActivityIndicator accessibilityLabel="Checking sign-in" /> :
      <Text style={styles.body}>Sign in to SafeSteps to view cases assigned to you as a carer.</Text>}
  </View></SafeAreaView>;
  return <CarerWorkspace key={actor} userId={actor} />;
}

function CarerWorkspace({ userId }: { userId: string }) {
  const api = useMemo(() => createCarerPortalApi(userId), [userId]);
  const [cases, setCases] = useState<CarerCase[]>([]);
  const [selected, setSelected] = useState<OperationalCaseId | ''>('');
  const selection = useRef<OperationalCaseId | ''>('');
  const [entries, setEntries] = useState<CarerJournalEntry[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [kind, setKind] = useState<JournalKind>('daily_update');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [saving, setSaving] = useState(false);
  const alive = useRef(true);
  const caseLoad = useRef(0);
  const journalLoad = useRef(0);
  const saveLock = useRef(false);
  const submission = useRef<string | null>(null);
  const currentCase = cases.find(c => c.id === selected);

  async function loadCases() {
    const version = ++caseLoad.current;
    ++journalLoad.current;
    setLoadingCases(true); setCases([]); setEntries([]); setError('');
    try {
      const result = await api.listCases();
      if (alive.current && version === caseLoad.current) {
        setCases(result.cases);
        if (selection.current && result.cases.some(c => c.id === selection.current)) void loadJournal(selection.current);
      }
    } catch (e) { if (alive.current && version === caseLoad.current) setError(message(e)); }
    finally { if (alive.current && version === caseLoad.current) setLoadingCases(false); }
  }
  async function loadJournal(caseId: OperationalCaseId) {
    const version = ++journalLoad.current;
    setLoadingJournal(true); setEntries([]); setError('');
    try {
      const result = await api.listJournal(caseId);
      if (alive.current && version === journalLoad.current) setEntries(result.entries);
    } catch (e) { if (alive.current && version === journalLoad.current) setError(message(e)); }
    finally { if (alive.current && version === journalLoad.current) setLoadingJournal(false); }
  }
  useEffect(() => {
    alive.current = true;
    void loadCases();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && !saveLock.current) void loadCases();
    });
    return () => { alive.current = false; ++caseLoad.current; ++journalLoad.current; subscription.remove(); };
  }, [api]);

  function selectCase(caseId: OperationalCaseId) {
    if (saveLock.current) return;
    if (caseId !== selected && (title.trim() || detail.trim())) {
      setError('Submit your current draft or clear it before changing cases.'); return;
    }
    if (caseId !== selected) submission.current = null;
    selection.current = caseId;
    setSelected(caseId); setNotice(''); void loadJournal(caseId);
  }
  async function save() {
    if (saveLock.current || !currentCase) return;
    if (!title.trim() || !detail.trim()) { setError('Add a title and factual details before submitting.'); return; }
    saveLock.current = true; setSaving(true); setError(''); setNotice('');
    try {
      submission.current ??= submissionUuid();
      await api.createJournal(currentCase.id, { kind, title: title.trim(), detail: detail.trim(), submissionId: submission.current });
      if (!alive.current) return;
      setTitle(''); setDetail('');
      submission.current = null;
      setNotice('Submitted to the case record for care-team review. Parent sharing is off. Your care team may need to grant permission before it appears below.');
      await loadJournal(currentCase.id);
    } catch (e) { if (alive.current) setError(`${message(e)} Your draft has been kept.${submission.current ? ` Submission reference: ${submission.current}` : ''}`); }
    finally { saveLock.current = false; if (alive.current) setSaving(false); }
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.brand}>SAFESTEPS · CARER PORTAL</Text>
    <Text style={styles.heading}>Your assigned cases</Text>
    <Text style={styles.body}>Record the child or children’s behaviour, achievements and concerns for the care team.</Text>
    <TouchableOpacity style={styles.secondary} disabled={saving || loadingCases} onPress={() => void loadCases()}>
      <Text style={styles.link}>Refresh case access</Text>
    </TouchableOpacity>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {notice ? <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text> : null}
    {loadingCases ? <ActivityIndicator accessibilityLabel="Loading assigned cases" /> : cases.length === 0 && !error ?
      <Text style={styles.body}>No active carer assignments are available. Ask your care team to confirm your case and tenant access.</Text> : null}
    {cases.map(c => <TouchableOpacity key={c.id} disabled={saving} onPress={() => selectCase(c.id)}
      accessibilityRole="button" accessibilityState={{ selected: selected === c.id, disabled: saving }}
      style={[styles.card, selected === c.id && styles.selected]}>
      <Text style={styles.title}>{c.title}</Text><Text style={styles.body}>{c.status}{c.stage ? ` · ${c.stage}` : ''}</Text>
      {c.reviewAt ? <Text style={styles.body}>Review: {new Date(c.reviewAt).toLocaleDateString()}</Text> : null}
    </TouchableOpacity>)}
    {currentCase ? <>
      <View style={styles.card}>
        <Text style={styles.title}>Add a care update</Text>
        <View style={styles.row}>{kinds.map(item => <TouchableOpacity key={item.value} disabled={saving}
          accessibilityRole="button" accessibilityState={{ selected: kind === item.value }} onPress={() => setKind(item.value)}
          style={[styles.chip, kind === item.value && styles.selected]}><Text style={styles.link}>{item.label}</Text></TouchableOpacity>)}</View>
        <TextInput accessibilityLabel="Update title" placeholder="Update title" value={title} onChangeText={setTitle}
          maxLength={160} editable={!saving} style={styles.input} />
        <TextInput accessibilityLabel="Care update details" placeholder="Identify the child or children, when it happened, what you observed and how you responded."
          value={detail} onChangeText={setDetail} maxLength={10000} editable={!saving} multiline style={[styles.input, styles.details]} />
        <Text style={styles.body}>Submitted privately as a draft for care-team review. Parent sharing requires a separate approved workflow.</Text>
        <TouchableOpacity accessibilityRole="button" disabled={saving} style={styles.primary} onPress={() => void save()}>
          <Text style={styles.primaryText}>{saving ? 'Submitting…' : 'Submit care update'}</Text></TouchableOpacity>
      </View>
      <Text style={styles.title}>Your submitted updates</Text>
      <Text style={styles.body}>The latest 100 of your updates that current case-note permissions allow you to read.</Text>
      {loadingJournal ? <ActivityIndicator accessibilityLabel="Loading journal" /> : entries.length === 0 ?
        <Text style={styles.body}>No readable updates were returned.</Text> : entries.map(entry => <View key={entry.id} style={styles.card}>
          <Text style={styles.title}>{entry.title}</Text><Text style={styles.body}>{entry.detail}</Text>
          <Text style={styles.body}>{new Date(entry.createdAt).toLocaleString()}</Text>
          <Text style={styles.body}>{entry.familyShared ? 'Family sharing enabled on the case note' : 'Parent sharing off'}</Text>
        </View>)}
    </> : null}
    {title || detail ? <TouchableOpacity disabled={saving} onPress={() => { setTitle(''); setDetail(''); setError(''); submission.current = null; }}>
      <Text style={styles.link}>Clear draft</Text></TouchableOpacity> : null}
    <View style={styles.card}><Text style={styles.title}>Media & parent communication</Text>
      <Link href="/carers/messages" style={styles.link}>Open monitored messages</Link>
      <Link href="/carers/media" style={styles.link}>Open private photos & videos</Link>
      <Text style={styles.body}>Your care team must establish the conversation before it appears. Parent access to media requires a separate worker review.</Text>
    </View>
    <Text style={styles.body}>Unsaved drafts remain on this screen only. For immediate danger, use emergency services.</Text>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F7F6' }, content: { padding: 20, gap: 16, width: '100%', maxWidth: 760, alignSelf: 'center' },
  brand: { color: '#08766D', fontSize: 12, fontWeight: '800' }, heading: { color: '#193E3C', fontSize: 27, fontWeight: '800' },
  title: { color: '#193E3C', fontSize: 18, fontWeight: '700' }, body: { color: '#536D69', fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D8E3E1', borderRadius: 14, padding: 16, gap: 12 },
  selected: { borderColor: '#08766D', backgroundColor: '#E8F5F2' }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#D8E3E1' }, input: { borderWidth: 1, borderColor: '#CFDCDA',
    borderRadius: 10, padding: 12, color: '#203F3D', backgroundColor: '#FFFFFF' }, details: { minHeight: 150, textAlignVertical: 'top' },
  primary: { backgroundColor: '#08766D', borderRadius: 10, padding: 14, alignItems: 'center' }, primaryText: { color: '#FFFFFF', fontWeight: '700' },
  secondary: { paddingVertical: 8 }, link: { color: '#08766D', fontWeight: '700' }, error: { color: '#9D2836', lineHeight: 21 },
  notice: { color: '#08766D', lineHeight: 21 },
});
