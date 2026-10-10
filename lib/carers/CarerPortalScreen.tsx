import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type Tab = 'Home' | 'Journal' | 'Messages' | 'Settings';
type EntryKind = 'Daily update' | 'Achievement' | 'Worry or concern';

type JournalEntry = {
  id: string;
  kind: EntryKind;
  title: string;
  detail: string;
  time: string;
  shared: boolean;
  imageUri?: string;
};

const tabs: Array<{ label: Tab; icon: string }> = [
  { label: 'Home', icon: '⌂' },
  { label: 'Journal', icon: '✎' },
  { label: 'Messages', icon: '◌' },
  { label: 'Settings', icon: '⚙' },
];

const initialEntries: JournalEntry[] = [
  {
    id: '1',
    kind: 'Achievement',
    title: 'A big morning at school',
    detail: 'Mia walked into class independently and showed her teacher the reading card she completed.',
    time: 'Today, 9:15 am',
    shared: true,
  },
  {
    id: '2',
    kind: 'Daily update',
    title: 'Bedtime routine',
    detail: 'Settled after two stories and used her breathing exercise. Asleep by 8:10 pm.',
    time: 'Yesterday, 8:24 pm',
    shared: false,
  },
];

export function CarerPortalScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [entries, setEntries] = useState(initialEntries);
  const [composerOpen, setComposerOpen] = useState(false);
  const [entryKind, setEntryKind] = useState<EntryKind>('Daily update');
  const [entryText, setEntryText] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>();
  const [parentCommunication, setParentCommunication] = useState(true);

  const sharedCount = useMemo(() => entries.filter((entry) => entry.shared).length, [entries]);

  async function chooseMedia() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) setAttachment(result.assets[0]?.uri);
  }

  function saveEntry() {
    const detail = entryText.trim();
    if (!detail) {
      Alert.alert('Add a few details', 'Describe what happened before saving this update.');
      return;
    }

    setEntries((current) => [
      {
        id: String(Date.now()),
        kind: entryKind,
        title: entryKind === 'Achievement' ? 'A new achievement' : entryKind === 'Worry or concern' ? 'New concern recorded' : 'Daily care update',
        detail,
        time: 'Just now',
        shared: false,
        imageUri: attachment,
      },
      ...current,
    ]);
    setEntryText('');
    setAttachment(undefined);
    setComposerOpen(false);
    setActiveTab('Journal');
  }

  const content = activeTab === 'Home'
    ? renderHome()
    : activeTab === 'Journal'
      ? renderJournal()
      : activeTab === 'Messages'
        ? renderMessages()
        : renderSettings();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>S</Text></View>
          <View style={styles.brandCopy}>
            <Text style={styles.brand}>SafeSteps</Text>
            <Text style={styles.portalLabel}>CARER PORTAL</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} accessibilityLabel="Notifications">
            <Text style={styles.bell}>♢</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <View style={styles.avatar}><Text style={styles.avatarText}>AL</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.label === activeTab;
            return (
              <TouchableOpacity key={tab.label} style={styles.tab} onPress={() => setActiveTab(tab.label)} accessibilityRole="tab">
                <Text style={[styles.tabIcon, active && styles.tabActive]}>{tab.icon}</Text>
                <Text style={[styles.tabText, active && styles.tabActive]}>{tab.label}</Text>
                {active ? <View style={styles.activeTabLine} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );

  function renderHome() {
    return (
      <>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeCopy}>
            <Text style={styles.eyebrow}>SATURDAY, 10 OCTOBER</Text>
            <Text style={styles.pageTitle}>Good morning, Alex</Text>
            <Text style={styles.pageSubtitle}>Here’s what’s happening for Mia today.</Text>
          </View>
          <View style={styles.childAvatar}><Text style={styles.childAvatarText}>M</Text></View>
        </View>

        <View style={styles.caseCard}>
          <View style={styles.caseTopRow}>
            <View style={styles.caseIcon}><Text style={styles.caseIconText}>⌂</Text></View>
            <View style={styles.grow}>
              <Text style={styles.caseLabel}>CONNECTED FAMILY CASE</Text>
              <Text style={styles.caseName}>Mia’s reunification journey</Text>
              <Text style={styles.caseMeta}>Mia Carter · Age 7</Text>
            </View>
            <View style={styles.activePill}><View style={styles.activeDot} /><Text style={styles.activePillText}>Active</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Reunification plan</Text>
            <Text style={styles.progressValue}>Week 6 of 12</Text>
          </View>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
          <Text style={styles.caseFootnote}>Next review with the care team · 14 October</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick update</Text>
        <Text style={styles.sectionHint}>Capture the moments that help Mia’s care team see the full picture.</Text>
        <View style={styles.quickGrid}>
          <QuickButton icon="☼" label="Daily update" tint="#E8F5F2" color="#147C73" onPress={() => openComposer('Daily update')} />
          <QuickButton icon="★" label="Achievement" tint="#FFF3DC" color="#A46013" onPress={() => openComposer('Achievement')} />
          <QuickButton icon="!" label="Worry or concern" tint="#FDEBEC" color="#B33A48" onPress={() => openComposer('Worry or concern')} />
          <QuickButton icon="▧" label="Photo or video" tint="#EFEAFA" color="#6650A4" onPress={chooseMedia} />
        </View>

        {composerOpen ? renderComposer() : null}

        <View style={styles.sectionHeadingRow}>
          <View><Text style={styles.sectionTitle}>Recent moments</Text><Text style={styles.sectionHint}>{sharedCount} approved to share with parent</Text></View>
          <TouchableOpacity onPress={() => setActiveTab('Journal')}><Text style={styles.link}>View journal</Text></TouchableOpacity>
        </View>
        {entries.slice(0, 2).map(renderEntry)}

        <View style={styles.messageStatusCard}>
          <View style={styles.messageStatusIcon}><Text style={styles.messageStatusIconText}>◌</Text></View>
          <View style={styles.grow}>
            <Text style={styles.messageStatusTitle}>Carer–parent messages are {parentCommunication ? 'on' : 'off'}</Text>
            <Text style={styles.messageStatusBody}>{parentCommunication ? 'Messages are monitored by the care team for everyone’s safety.' : 'The parent cannot send new messages while communication is paused.'}</Text>
          </View>
          <Switch value={parentCommunication} onValueChange={setParentCommunication} trackColor={{ false: '#CBD5E0', true: '#8FD0C8' }} thumbColor={parentCommunication ? '#147C73' : '#FFFFFF'} />
        </View>
      </>
    );
  }

  function renderJournal() {
    return <>
      <Text style={styles.eyebrow}>MIA’S CARE RECORD</Text>
      <Text style={styles.pageTitle}>Journal</Text>
      <Text style={styles.pageSubtitle}>Factual, child-centred updates are visible to the care team. Parent sharing always requires approval.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => openComposer('Daily update')}><Text style={styles.primaryButtonText}>＋ Add an update</Text></TouchableOpacity>
      {composerOpen ? renderComposer() : null}
      <View style={styles.filterRow}><View style={styles.filterActive}><Text style={styles.filterActiveText}>All updates</Text></View><View style={styles.filter}><Text style={styles.filterText}>Achievements</Text></View><View style={styles.filter}><Text style={styles.filterText}>Concerns</Text></View></View>
      {entries.map(renderEntry)}
    </>;
  }

  function renderMessages() {
    return <>
      <Text style={styles.eyebrow}>SAFE COMMUNICATION</Text>
      <Text style={styles.pageTitle}>Messages</Text>
      <Text style={styles.pageSubtitle}>Keep practical conversations about Mia in one supported place.</Text>
      <View style={styles.messageStatusCard}><View style={styles.messageStatusIcon}><Text style={styles.messageStatusIconText}>✓</Text></View><View style={styles.grow}><Text style={styles.messageStatusTitle}>Care-team monitored</Text><Text style={styles.messageStatusBody}>Your caseworker can review this conversation. Use emergency services for immediate danger.</Text></View></View>
      {parentCommunication ? <View style={styles.conversationCard}>
        <View style={styles.conversationHeader}><View style={styles.parentAvatar}><Text style={styles.parentAvatarText}>JC</Text></View><View><Text style={styles.entryTitle}>Jordan · Mia’s parent</Text><Text style={styles.onlineText}>Communication approved</Text></View></View>
        <View style={styles.incomingBubble}><Text style={styles.bubbleText}>Could you please let me know whether Mia wants her blue book for our visit?</Text><Text style={styles.bubbleTime}>9:41 am · Monitored</Text></View>
        <View style={styles.replyRow}><TextInput style={styles.replyInput} placeholder="Write a supportive reply…" placeholderTextColor="#8A97A5" /><TouchableOpacity style={styles.sendButton}><Text style={styles.sendText}>➤</Text></TouchableOpacity></View>
      </View> : <View style={styles.emptyCard}><Text style={styles.emptyIcon}>◌</Text><Text style={styles.emptyTitle}>Messages are paused</Text><Text style={styles.emptyBody}>You can turn communication back on in Settings. The care team can still contact you.</Text></View>}
    </>;
  }

  function renderSettings() {
    return <>
      <Text style={styles.eyebrow}>CASE PREFERENCES</Text>
      <Text style={styles.pageTitle}>Sharing & communication</Text>
      <Text style={styles.pageSubtitle}>Choose how you participate while keeping the care team informed.</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}><View style={styles.settingIcon}><Text style={styles.settingIconText}>◌</Text></View><View style={styles.grow}><Text style={styles.settingTitle}>Carer–parent communication</Text><Text style={styles.settingBody}>Allow monitored messages with Mia’s parent. The care team retains the conversation record.</Text></View><Switch value={parentCommunication} onValueChange={setParentCommunication} trackColor={{ false: '#CBD5E0', true: '#8FD0C8' }} thumbColor={parentCommunication ? '#147C73' : '#FFFFFF'} /></View>
        <View style={styles.divider} />
        <View style={styles.settingRow}><View style={styles.settingIcon}><Text style={styles.settingIconText}>▣</Text></View><View style={styles.grow}><Text style={styles.settingTitle}>Photos and videos</Text><Text style={styles.settingBody}>Media is private to the care team until a worker approves sharing with the parent.</Text></View></View>
      </View>
      <View style={styles.safetyNote}><Text style={styles.safetyNoteTitle}>You stay in control</Text><Text style={styles.safetyNoteBody}>Turning off parent communication does not affect your access to Mia’s case or your ability to contact the care team.</Text></View>
    </>;
  }

  function renderComposer() {
    return <View style={styles.composer}>
      <View style={styles.composerHeader}><View><Text style={styles.composerEyebrow}>NEW ENTRY</Text><Text style={styles.composerTitle}>{entryKind}</Text></View><TouchableOpacity onPress={() => setComposerOpen(false)}><Text style={styles.close}>×</Text></TouchableOpacity></View>
      <View style={styles.kindRow}>{(['Daily update', 'Achievement', 'Worry or concern'] as EntryKind[]).map((kind) => <TouchableOpacity key={kind} style={[styles.kindChip, entryKind === kind && styles.kindChipActive]} onPress={() => setEntryKind(kind)}><Text style={[styles.kindText, entryKind === kind && styles.kindTextActive]}>{kind}</Text></TouchableOpacity>)}</View>
      <TextInput value={entryText} onChangeText={setEntryText} multiline style={styles.textArea} placeholder="What did you notice? Include the context and how Mia responded." placeholderTextColor="#8A97A5" />
      {attachment ? <View style={styles.attachmentRow}><Image source={{ uri: attachment }} style={styles.attachmentPreview} /><Text style={styles.attachmentText}>Media ready to attach</Text><TouchableOpacity onPress={() => setAttachment(undefined)}><Text style={styles.removeText}>Remove</Text></TouchableOpacity></View> : <TouchableOpacity style={styles.attachButton} onPress={chooseMedia}><Text style={styles.attachButtonText}>▧  Add photo or video</Text></TouchableOpacity>}
      <View style={styles.reviewNote}><Text style={styles.reviewNoteText}>🔒 Saved to the care team first. A worker reviews anything shared with parents.</Text></View>
      <TouchableOpacity style={styles.primaryButton} onPress={saveEntry}><Text style={styles.primaryButtonText}>Save to Mia’s journal</Text></TouchableOpacity>
    </View>;
  }

  function renderEntry(entry: JournalEntry) {
    const concern = entry.kind === 'Worry or concern';
    return <View key={entry.id} style={styles.entryCard}>
      {entry.imageUri ? <Image source={{ uri: entry.imageUri }} style={styles.entryImage} /> : null}
      <View style={styles.entryTop}><View style={[styles.entryKindPill, concern && styles.concernPill]}><Text style={[styles.entryKindText, concern && styles.concernText]}>{entry.kind}</Text></View><Text style={styles.entryTime}>{entry.time}</Text></View>
      <Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDetail}>{entry.detail}</Text>
      <View style={styles.entryFooter}><Text style={styles.teamVisible}>✓ Care team can view</Text><Text style={entry.shared ? styles.shared : styles.awaiting}>{entry.shared ? '◉ Parent sharing approved' : '○ Care team only'}</Text></View>
    </View>;
  }

  function openComposer(kind: EntryKind) {
    setEntryKind(kind);
    setComposerOpen(true);
  }
}

function QuickButton({ icon, label, tint, color, onPress }: { icon: string; label: string; tint: string; color: string; onPress: () => void }) {
  return <TouchableOpacity style={styles.quickButton} onPress={onPress}><View style={[styles.quickIcon, { backgroundColor: tint }]}><Text style={[styles.quickIconText, { color }]}>{icon}</Text></View><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickArrow}>›</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F7' },
  shell: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', backgroundColor: '#F4F8F7' },
  topBar: { minHeight: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E1EAE8' },
  brandMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#08766D', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' }, brandCopy: { marginLeft: 10, flex: 1 }, brand: { color: '#143B3A', fontSize: 17, fontWeight: '800' }, portalLabel: { color: '#738886', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  bellButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 7 }, bell: { fontSize: 25, color: '#345B58' }, notificationDot: { position: 'absolute', right: 4, top: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E08A4A', borderWidth: 2, borderColor: '#FFFFFF' },
  avatar: { width: 37, height: 37, borderRadius: 19, backgroundColor: '#DCEDEA', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#08766D', fontWeight: '800', fontSize: 12 },
  scrollContent: { padding: 20, paddingBottom: 38, gap: 14 }, welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 15 }, welcomeCopy: { flex: 1, gap: 3 }, eyebrow: { color: '#45817B', fontSize: 11, fontWeight: '800', letterSpacing: 1.15 },
  pageTitle: { color: '#143B3A', fontSize: 27, lineHeight: 34, fontWeight: '800' }, pageSubtitle: { color: '#607471', fontSize: 14, lineHeight: 21 }, childAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F1CDA6', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#FFFFFF' }, childAvatarText: { color: '#774825', fontWeight: '800', fontSize: 20 },
  caseCard: { backgroundColor: '#0F6F68', padding: 17, borderRadius: 18, marginTop: 4, shadowColor: '#0B4F4A', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, caseTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, caseIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center', justifyContent: 'center' }, caseIconText: { color: '#FFFFFF', fontSize: 23 }, grow: { flex: 1 }, caseLabel: { color: '#BCE3DF', fontSize: 9, fontWeight: '800', letterSpacing: 1 }, caseName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginTop: 2 }, caseMeta: { color: '#D4EBE8', fontSize: 12, marginTop: 2 }, activePill: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.14)' }, activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9EE5C0' }, activePillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#DCE7E5', marginVertical: 13, opacity: 0.55 }, progressHeader: { flexDirection: 'row', justifyContent: 'space-between' }, progressLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }, progressValue: { color: '#D4EBE8', fontSize: 11 }, progressTrack: { height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.2)', marginTop: 9 }, progressFill: { width: '50%', height: 6, borderRadius: 4, backgroundColor: '#F4C978' }, caseFootnote: { color: '#D4EBE8', fontSize: 11, marginTop: 10 },
  sectionTitle: { color: '#193E3C', fontSize: 17, fontWeight: '800', marginTop: 5 }, sectionHint: { color: '#748582', fontSize: 12, marginTop: -8 }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, quickButton: { flexBasis: '47%', flexGrow: 1, minHeight: 76, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DEE8E6', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, quickIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, quickIconText: { fontSize: 18, fontWeight: '800' }, quickLabel: { flex: 1, color: '#284A47', fontWeight: '700', fontSize: 12 }, quickArrow: { color: '#9AA9A7', fontSize: 21 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 2 }, link: { color: '#08766D', fontSize: 12, fontWeight: '800' }, entryCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DEE8E6', borderRadius: 15, padding: 15, gap: 7 }, entryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, entryKindPill: { backgroundColor: '#E9F5F2', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 }, concernPill: { backgroundColor: '#FDEBEC' }, entryKindText: { color: '#147C73', fontSize: 10, fontWeight: '800' }, concernText: { color: '#B33A48' }, entryTime: { color: '#8A9996', fontSize: 10 }, entryTitle: { color: '#203F3D', fontSize: 15, fontWeight: '800' }, entryDetail: { color: '#607471', fontSize: 12, lineHeight: 18 }, entryFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, borderTopWidth: 1, borderTopColor: '#EDF2F1', paddingTop: 9, marginTop: 2 }, teamVisible: { color: '#5B716E', fontSize: 10, fontWeight: '600' }, shared: { color: '#147C73', fontSize: 10, fontWeight: '700' }, awaiting: { color: '#8A7460', fontSize: 10, fontWeight: '700' }, entryImage: { width: '100%', height: 180, borderRadius: 10 },
  messageStatusCard: { backgroundColor: '#EAF5F3', borderRadius: 15, padding: 14, flexDirection: 'row', gap: 11, alignItems: 'center', borderWidth: 1, borderColor: '#CFE7E3' }, messageStatusIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, messageStatusIconText: { color: '#147C73', fontSize: 18, fontWeight: '800' }, messageStatusTitle: { color: '#214541', fontSize: 13, fontWeight: '800' }, messageStatusBody: { color: '#617A77', fontSize: 11, lineHeight: 16, marginTop: 2 },
  tabBar: { minHeight: 70, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#DEE8E6', flexDirection: 'row', paddingBottom: Platform.OS === 'ios' ? 6 : 2 }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }, tabIcon: { color: '#879895', fontSize: 21, fontWeight: '600' }, tabText: { color: '#879895', fontSize: 10, fontWeight: '700' }, tabActive: { color: '#08766D' }, activeTabLine: { position: 'absolute', bottom: 0, width: 28, height: 3, backgroundColor: '#08766D', borderRadius: 2 },
  primaryButton: { backgroundColor: '#08766D', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 17, alignItems: 'center' }, primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }, filterRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' }, filter: { borderWidth: 1, borderColor: '#D9E4E2', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: '#FFFFFF' }, filterActive: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: '#DDEFEA' }, filterText: { color: '#6B7C79', fontSize: 11, fontWeight: '700' }, filterActiveText: { color: '#08766D', fontSize: 11, fontWeight: '800' },
  composer: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#CFE0DD', padding: 16, gap: 12 }, composerHeader: { flexDirection: 'row', justifyContent: 'space-between' }, composerEyebrow: { color: '#60827E', fontSize: 9, fontWeight: '800', letterSpacing: 1 }, composerTitle: { color: '#193E3C', fontSize: 18, fontWeight: '800' }, close: { color: '#6E817E', fontSize: 27 }, kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, kindChip: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F0F4F3' }, kindChipActive: { backgroundColor: '#DDEFEA' }, kindText: { color: '#657976', fontSize: 10, fontWeight: '700' }, kindTextActive: { color: '#08766D' }, textArea: { minHeight: 105, borderWidth: 1, borderColor: '#CFDCDA', borderRadius: 11, padding: 12, color: '#203F3D', fontSize: 13, textAlignVertical: 'top' }, attachButton: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#A9C4C0', borderRadius: 11, padding: 12, alignItems: 'center' }, attachButtonText: { color: '#08766D', fontSize: 12, fontWeight: '800' }, reviewNote: { backgroundColor: '#F4F7F6', padding: 10, borderRadius: 9 }, reviewNoteText: { color: '#687B78', fontSize: 10, lineHeight: 15 }, attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, attachmentPreview: { width: 43, height: 43, borderRadius: 8 }, attachmentText: { flex: 1, color: '#536D69', fontSize: 11 }, removeText: { color: '#A73C45', fontSize: 11, fontWeight: '700' },
  conversationCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DEE8E6', borderRadius: 16, padding: 15, gap: 16 }, conversationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 }, parentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1E8DA', alignItems: 'center', justifyContent: 'center' }, parentAvatarText: { color: '#735B3F', fontWeight: '800' }, onlineText: { color: '#348178', fontSize: 10, marginTop: 2 }, incomingBubble: { backgroundColor: '#F0F5F4', borderRadius: 14, borderTopLeftRadius: 4, padding: 12, maxWidth: '85%' }, bubbleText: { color: '#3D5956', fontSize: 13, lineHeight: 19 }, bubbleTime: { color: '#899895', fontSize: 9, marginTop: 5 }, replyRow: { flexDirection: 'row', gap: 8 }, replyInput: { flex: 1, backgroundColor: '#F6F9F8', borderWidth: 1, borderColor: '#D8E3E1', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 12 }, sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#08766D', alignItems: 'center', justifyContent: 'center' }, sendText: { color: '#FFFFFF', fontSize: 16 }, emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', gap: 8 }, emptyIcon: { fontSize: 30, color: '#8EA19E' }, emptyTitle: { color: '#274945', fontSize: 16, fontWeight: '800' }, emptyBody: { color: '#6C7F7C', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#DEE8E6', padding: 15 }, settingRow: { flexDirection: 'row', gap: 11, alignItems: 'center' }, settingIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#E9F4F2', alignItems: 'center', justifyContent: 'center' }, settingIconText: { color: '#08766D', fontSize: 18 }, settingTitle: { color: '#244541', fontSize: 13, fontWeight: '800' }, settingBody: { color: '#6A7D7A', fontSize: 11, lineHeight: 16, marginTop: 3 }, safetyNote: { borderLeftWidth: 3, borderLeftColor: '#E0A550', backgroundColor: '#FFF9EE', padding: 14, borderRadius: 9 }, safetyNoteTitle: { color: '#6A4C25', fontSize: 13, fontWeight: '800' }, safetyNoteBody: { color: '#7B684F', fontSize: 11, lineHeight: 17, marginTop: 3 },
});
