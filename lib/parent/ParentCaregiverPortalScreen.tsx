import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

type WorkflowId =
  | 'companion'
  | 'messages'
  | 'calendar'
  | 'notifications'
  | 'legal'
  | 'evidence'
  | 'recovery'
  | 'community'
  | 'onboarding'
  | 'grievance'
  | 'crisis'
  | 'rights';

type Workflow = {
  id: WorkflowId;
  label: string;
  detail: string;
  readiness: 'Local guidance' | 'Draft only' | 'Approval required';
  tone: string;
};

const workflowGroups: { title: string; items: Workflow[] }[] = [
  {
    title: 'Care coordination',
    items: [
      { id: 'companion', label: 'AI companion', detail: 'Trusted parent support and next-step coaching', readiness: 'Approval required', tone: '#E6F4FE' },
      { id: 'messages', label: 'Message my caseworker', detail: 'Prepare a message for review; nothing is sent from this preview', readiness: 'Draft only', tone: '#EEF2FF' },
      { id: 'calendar', label: 'Family calendar', detail: 'Prepare a session-only agenda item for visits or appointments', readiness: 'Draft only', tone: '#FEF3C7' },
      { id: 'notifications', label: 'Notification preferences', detail: 'Review reminder preferences for this session', readiness: 'Draft only', tone: '#F3E8FF' },
      { id: 'evidence', label: 'Evidence & documents', detail: 'Open the existing evidence and document tools', readiness: 'Local guidance', tone: '#DBEAFE' },
    ],
  },
  {
    title: 'Support and rights',
    items: [
      { id: 'legal', label: 'Court & legal literacy', detail: 'General hearing-preparation prompts, not legal advice', readiness: 'Local guidance', tone: '#DCFCE7' },
      { id: 'recovery', label: 'Recovery check-in', detail: 'Private, session-only wellbeing check-in; no clinical record', readiness: 'Draft only', tone: '#FCE7F3' },
      { id: 'community', label: 'Peer & community support', detail: 'Prepare questions for a trusted worker or verified local service', readiness: 'Local guidance', tone: '#EDE9FE' },
      { id: 'onboarding', label: 'Onboarding & consent', detail: 'Review the status of identity and consent setup', readiness: 'Approval required', tone: '#E2E8F0' },
      { id: 'grievance', label: 'Grievance & review request', detail: 'Prepare an unsent draft for an authorized review channel', readiness: 'Draft only', tone: '#E0F2FE' },
      { id: 'crisis', label: 'Urgent safety support', detail: 'Open existing safety resources; this app cannot dispatch help', readiness: 'Local guidance', tone: '#FEE2E2' },
      { id: 'rights', label: 'Data rights', detail: 'Review what is and is not available for export or access history', readiness: 'Approval required', tone: '#ECFCCB' },
    ],
  },
];

const workflowDetails: Record<WorkflowId, { title: string; body: string[] }> = {
  companion: {
    title: 'AI companion is not enabled',
    body: [
      'Live chat is blocked until trusted consent and catalog adapters are reviewed and launch approval is granted.',
      'This screen does not collect consent or send prompts to an AI service. Use the existing learning and support tools while this gate remains closed.',
    ],
  },
  messages: {
    title: 'Prepare a message',
    body: [
      'This creates an in-memory draft only. It is not delivered, saved to your case, or visible to your caseworker.',
      'Do not use this for emergencies or include highly sensitive details in this local preview.',
    ],
  },
  calendar: {
    title: 'Prepare a calendar note',
    body: [
      'Add a temporary agenda note for this screen session. It is not synced, saved to your case, or sent as a reminder.',
      'Confirm official visit and hearing dates with your caseworker or the court.',
    ],
  },
  notifications: {
    title: 'Reminder preferences preview',
    body: [
      'These switches change only this screen session. They do not alter device settings, account preferences, or send notifications.',
    ],
  },
  legal: {
    title: 'Prepare for a court date',
    body: [
      'Write down the date, time, location, and how you will get there. Confirm these details with your lawyer or the court.',
      'Ask your lawyer or advocate what documents to bring, what the hearing will cover, and how to request an interpreter or accessibility support.',
      'Keep copies of notices and documents, and ask your legal representative to explain any deadlines. This is general preparation information, not legal advice.',
    ],
  },
  evidence: {
    title: 'Evidence tools',
    body: [
      'The evidence and document routes are existing app tools. Check their privacy and storage status before adding sensitive information.',
    ],
  },
  recovery: {
    title: 'A brief wellbeing check-in',
    body: [
      'Choose a check-in for yourself. Your selection stays in memory for this screen session and is not a sobriety, treatment, or clinical record.',
      'If you need support, consider contacting your recovery provider or a trusted support person.',
    ],
  },
  community: {
    title: 'Finding support safely',
    body: [
      'Ask your caseworker, advocate, or recovery provider for verified local parent groups, peer mentors, and practical support services.',
      'Before sharing personal information in a group, check who can see it, how membership is moderated, and whether participation is confidential.',
    ],
  },
  onboarding: {
    title: 'Identity and consent setup is not connected',
    body: [
      'No identity verification or consent is collected here. Do not enter identity documents or sensitive personal information into this screen.',
      'A reviewed identity and consent workflow must be connected before onboarding can be completed in the app.',
    ],
  },
  grievance: {
    title: 'Prepare a review request',
    body: [
      'This is an unsent, in-memory draft. It is not filed, shared with a supervisor, or attached to a case.',
      'Use the official agency or court process for time-sensitive complaints, appeals, or review deadlines.',
    ],
  },
  crisis: {
    title: 'If someone is in immediate danger',
    body: [
      'Call your local emergency number now. This app cannot contact emergency services, dispatch help, or monitor your safety.',
      'For non-immediate support, contact your caseworker, local crisis service, or a trusted person. Check that a resource is appropriate for your location.',
    ],
  },
  rights: {
    title: 'Data export and access history are not connected',
    body: [
      'This app does not currently provide a verified parent export or access-audit workflow. Nothing can be downloaded or requested from this preview.',
      'Use the organization’s official privacy or records-request process until an approved, authenticated data-rights adapter is available.',
    ],
  },
};

export function ParentCaregiverPortalScreen() {
  const router = useRouter();
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowId | null>(null);
  const [draft, setDraft] = useState('');
  const [draftReviewed, setDraftReviewed] = useState(false);
  const [agendaNote, setAgendaNote] = useState('');
  const [agendaTime, setAgendaTime] = useState('');
  const [agendaItems, setAgendaItems] = useState<{ id: number; note: string; time: string }[]>([]);
  const [reminders, setReminders] = useState({ appointments: true, documents: false, wellbeing: false });
  const [recoveryCheckIn, setRecoveryCheckIn] = useState<string | null>(null);

  const openWorkflow = (id: WorkflowId) => {
    setSelectedWorkflow(id);
    setDraft('');
    setDraftReviewed(false);
    if (id === 'evidence') router.push('/evidence' as any);
    if (id === 'companion') router.push('/companion' as any);
    if (id === 'crisis') router.push('/sos' as any);
  };

  const addAgendaNote = () => {
    const note = agendaNote.trim();
    if (!note) return;
    setAgendaItems((current) => [...current, { id: Date.now(), note, time: agendaTime.trim() }]);
    setAgendaNote('');
    setAgendaTime('');
  };

  const draftWorkflow = selectedWorkflow === 'messages' || selectedWorkflow === 'grievance';
  const detail = selectedWorkflow ? workflowDetails[selectedWorkflow] : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>PARENT & CAREGIVER CENTER</Text>
          <Text style={styles.title}>Family support workspace</Text>
          <Text style={styles.subtitle}>Guided previews and local tools. Case messaging, calendar sync, alerts, and sensitive records are not connected to production services.</Text>
        </View>

        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Production services are not enabled</Text>
          <Text style={styles.gateText}>No parent workflow on this screen sends a message, updates a case, saves sensitive information, or dispatches help.</Text>
        </View>

        {selectedWorkflow && detail ? (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.sectionTitle}>{detail.title}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedWorkflow(null)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            {detail.body.map((paragraph) => <Text key={paragraph} style={styles.detailText}>{paragraph}</Text>)}

            {draftWorkflow ? (
              <View style={styles.formGroup}>
                <TextInput
                  value={draft}
                  onChangeText={(value) => { setDraft(value); setDraftReviewed(false); }}
                  placeholder={selectedWorkflow === 'messages' ? 'Write a message draft…' : 'Describe what you would like reviewed…'}
                  placeholderTextColor="#718096"
                  multiline
                  style={styles.input}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => setDraftReviewed(Boolean(draft.trim()))} disabled={!draft.trim()}>
                  <Text style={styles.actionButtonText}>Review local draft</Text>
                </TouchableOpacity>
                {draftReviewed ? <Text style={styles.confirmation}>Draft previewed. It remains only in this screen session and has not been sent.</Text> : null}
              </View>
            ) : null}

            {selectedWorkflow === 'calendar' ? (
              <View style={styles.formGroup}>
                <TextInput value={agendaNote} onChangeText={setAgendaNote} placeholder="Agenda note (for example, visit preparation)" placeholderTextColor="#718096" style={styles.input} />
                <TextInput value={agendaTime} onChangeText={setAgendaTime} placeholder="Date/time to confirm" placeholderTextColor="#718096" style={styles.input} />
                <TouchableOpacity style={styles.actionButton} onPress={addAgendaNote} disabled={!agendaNote.trim()}>
                  <Text style={styles.actionButtonText}>Add session-only note</Text>
                </TouchableOpacity>
                {agendaItems.map((item) => (
                  <View key={item.id} style={styles.sessionItem}>
                    <Text style={styles.itemTitle}>{item.note}</Text>
                    {item.time ? <Text style={styles.detailText}>{item.time}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {selectedWorkflow === 'notifications' ? (
              <View style={styles.formGroup}>
                {([
                  ['appointments', 'Appointment reminders'],
                  ['documents', 'Document deadlines'],
                  ['wellbeing', 'Wellbeing check-ins'],
                ] as const).map(([key, label]) => (
                  <TouchableOpacity key={key} style={styles.preferenceRow} onPress={() => setReminders((current) => ({ ...current, [key]: !current[key] }))}>
                    <Text style={styles.detailText}>{label}</Text>
                    <Text style={styles.preferenceValue}>{reminders[key] ? 'On' : 'Off'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {selectedWorkflow === 'recovery' ? (
              <View style={styles.choiceRow}>
                {['Doing okay', 'Could use support', 'Prefer not to say'].map((choice) => (
                  <TouchableOpacity key={choice} style={[styles.choice, recoveryCheckIn === choice && styles.choiceSelected]} onPress={() => setRecoveryCheckIn(choice)}>
                    <Text style={styles.choiceText}>{choice}</Text>
                  </TouchableOpacity>
                ))}
                {recoveryCheckIn ? <Text style={styles.confirmation}>Your check-in is held only in this screen session.</Text> : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {workflowGroups.map((group) => (
          <View key={group.title} style={styles.groupCard}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.itemList}>
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  activeOpacity={0.8}
                  onPress={() => openWorkflow(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}, ${item.readiness}`}
                >
                  <View style={[styles.itemGlyph, { backgroundColor: item.tone }]}>
                    <Text style={styles.itemGlyphText}>{item.label.slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemDetail}>{item.detail}</Text>
                  </View>
                  <Text style={styles.statusTag}>{item.readiness}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  gateCard: { backgroundColor: '#FFF7ED', borderRadius: 14, borderWidth: 1, borderColor: '#FED7AA', padding: 14, gap: 5 },
  gateTitle: { fontSize: 14, fontWeight: '700', color: '#9A5B18' },
  gateText: { fontSize: 12, lineHeight: 18, color: '#7C4A17' },
  detailCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#BEE3F8', padding: 16, gap: 10 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A202C' },
  closeText: { color: '#205AA7', fontWeight: '700', padding: 6 },
  detailText: { fontSize: 13, lineHeight: 19, color: '#4A5568' },
  formGroup: { gap: 9, marginTop: 4 },
  input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E0', backgroundColor: '#F8FAFC', padding: 11, color: '#1A202C' },
  actionButton: { backgroundColor: '#2D6CDF', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontWeight: '700' },
  confirmation: { color: '#276749', fontSize: 12, lineHeight: 17, fontWeight: '600' },
  sessionItem: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, gap: 3 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  preferenceValue: { backgroundColor: '#EDF2F7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, color: '#2D3748', fontSize: 12, fontWeight: '700' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#EDF2F7' },
  choiceSelected: { backgroundColor: '#C6F6D5' },
  choiceText: { color: '#2D3748', fontSize: 12, fontWeight: '600' },
  groupCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 12 },
  groupTitle: { fontSize: 14, fontWeight: '700', color: '#4A5568', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemList: { gap: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
  itemGlyph: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemGlyphText: { fontWeight: '700', color: '#1A202C', fontSize: 16 },
  itemContent: { flex: 1, gap: 2 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  itemDetail: { fontSize: 12, color: '#4A5568', lineHeight: 17 },
  statusTag: { fontSize: 10, fontWeight: '700', color: '#2D3748', backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
});
