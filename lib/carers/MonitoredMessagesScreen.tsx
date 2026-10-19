import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { submissionUuid, usePortalActor } from './ConnectedCarerPortalScreen';
import { createCarerPortalApi, type CarerChannel, type MonitoredMessage } from './carerPortalApi';

export default function MonitoredMessagesScreen() {
  const actor = usePortalActor();
  if (!actor) return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <Text style={styles.heading}>Monitored messages</Text>
    {actor === undefined ? <ActivityIndicator accessibilityLabel="Checking sign-in" /> : <Text style={styles.body}>Sign in to access your approved conversations.</Text>}
  </View></SafeAreaView>;
  return <MessagesWorkspace key={actor} userId={actor} />;
}

function MessagesWorkspace({ userId }: { userId: string }) {
  const api = useMemo(() => createCarerPortalApi(userId), [userId]);
  const [channels, setChannels] = useState<CarerChannel[]>([]);
  const [selected, setSelected] = useState('');
  const [messages, setMessages] = useState<MonitoredMessage[]>([]);
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  const actionBusy = useRef(false);
  const selectedId = useRef('');
  const channelRevision = useRef(0);
  const messageRevision = useRef(0);
  const submission = useRef<string | null>(null);
  const current = channels.find(c => c.id === selected);

  async function loadMessages(id: string) {
    const version = ++messageRevision.current;
    setMessageLoading(true); setMessages([]);
    try {
      const result = await api.getMessages(id);
      if (alive.current && version === messageRevision.current && id === selectedId.current) setMessages(result.messages);
    } catch (e) { if (alive.current && version === messageRevision.current) setError(errorMessage(e)); }
    finally { if (alive.current && version === messageRevision.current) setMessageLoading(false); }
  }
  async function loadChannels() {
    const version = ++channelRevision.current;
    ++messageRevision.current;
    setLoading(true); setChannels([]); setMessages([]); setError('');
    try {
      const result = await api.listChannels();
      if (alive.current && version === channelRevision.current) {
        setChannels(result.channels);
        if (result.channels.some(c => c.id === selectedId.current)) await loadMessages(selectedId.current);
      }
    } catch (e) { if (alive.current && version === channelRevision.current) setError(errorMessage(e)); }
    finally { if (alive.current && version === channelRevision.current) setLoading(false); }
  }
  useEffect(() => {
    alive.current = true; void loadChannels();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && !actionBusy.current) void loadChannels();
    });
    return () => { alive.current = false; ++channelRevision.current; ++messageRevision.current; subscription.remove(); };
  }, [api]);

  function choose(id: string) {
    if (actionBusy.current) return;
    if (id !== selected && text.trim()) { setError('Send or clear your draft before changing conversations.'); return; }
    selectedId.current = id; setSelected(id); setReason(''); setNotice(''); setError(''); void loadMessages(id);
  }
  async function action(run: () => Promise<unknown>, success: string) {
    if (actionBusy.current || !current) return;
    actionBusy.current = true; setBusy(true); setError(''); setNotice('');
    try {
      await run();
      if (!alive.current) return;
      setNotice(success); await loadChannels();
    } catch (e) { if (alive.current) setError(errorMessage(e)); }
    finally { actionBusy.current = false; if (alive.current) setBusy(false); }
  }
  function send() {
    if (!current || !text.trim() || actionBusy.current) return;
    void action(async () => {
      submission.current ??= submissionUuid();
      await api.sendMessage(current.id, text.trim(), submission.current);
      if (alive.current) { setText(''); submission.current = null; }
    }, 'Sent for care-team review. The other participant cannot see it until a worker approves it.');
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Link href="/carers" style={styles.link}>Back to Carer Portal</Link>
    <Text style={styles.heading}>Monitored messages</Text>
    <Text style={styles.body}>Messages are reviewed by the care team before the other participant can see them. Use your existing urgent-contact arrangements for immediate concerns.</Text>
    <TouchableOpacity disabled={busy || loading} onPress={() => void loadChannels()}><Text style={styles.link}>Refresh conversations</Text></TouchableOpacity>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}{submission.current ? ` Your draft is retained. Submission reference: ${submission.current}` : ''}</Text> : null}
    {notice ? <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text> : null}
    {loading ? <ActivityIndicator accessibilityLabel="Loading conversations" /> : !channels.length && !error ?
      <Text style={styles.body}>No conversations are currently available. Your care team must confirm the participants and establish access.</Text> : null}
    {channels.map(ch => <TouchableOpacity key={ch.id} disabled={busy} onPress={() => choose(ch.id)}
      accessibilityRole="button" accessibilityState={{ selected: selected === ch.id }} style={[styles.card,selected===ch.id && styles.selected]}>
      <Text style={styles.title}>{ch.title}</Text>
      <Text style={styles.body}>{ch.revoked ? 'Closed · care-team record' : ch.enabled ? 'Communication on' : 'Communication paused'}</Text>
      <Text style={styles.body}>Access review due {new Date(ch.expiresAt).toLocaleDateString()}</Text>
    </TouchableOpacity>)}
    {current ? <>
      {current.canManage ? <TouchableOpacity disabled={busy} style={styles.primary}
        onPress={() => void action(() => api.setChannelEnabled(current.id,!current.enabled),current.enabled ? 'New messages are paused. The care team retains the record.' : 'Communication is on. New messages still require review.')}>
        <Text style={styles.primaryText}>{current.enabled ? 'Pause new messages' : 'Turn communication on'}</Text>
      </TouchableOpacity> : null}
      <Text style={styles.title}>Conversation record</Text>
      {messageLoading ? <ActivityIndicator accessibilityLabel="Loading messages" /> : !messages.length ? <Text style={styles.body}>No messages are currently visible to you.</Text> : messages.map(m =>
        <View key={m.id} style={styles.card}>
          <Text style={styles.title}>{m.isMine ? 'Your message' : m.senderRole === 'parent' ? 'Parent' : 'Carer'}</Text>
          <Text style={styles.body}>{m.body}</Text><Text style={styles.body}>{new Date(m.createdAt).toLocaleString()} · {m.reviewStatus}</Text>
          {current.canReview && !m.isMine ? <View style={styles.row}>
            <TouchableOpacity disabled={busy || !reason.trim()} style={styles.secondary} onPress={() => void action(
              () => api.reviewMessage(current.id,m.id,'approved',reason.trim()),'Review recorded: approved for the recipient.')}><Text style={styles.link}>Approve</Text></TouchableOpacity>
            <TouchableOpacity disabled={busy || !reason.trim()} style={styles.secondary} onPress={() => void action(
              () => api.reviewMessage(current.id,m.id,'rejected',reason.trim()),'Review recorded: hidden from the recipient.')}><Text style={styles.link}>Reject / withdraw approval</Text></TouchableOpacity>
          </View> : null}
        </View>)}
      {current.canReview ? <View style={styles.card}>
        <Text style={styles.title}>Care-team review</Text>
        <TextInput accessibilityLabel="Review reason" value={reason} onChangeText={setReason} editable={!busy} maxLength={2000}
          multiline placeholder="Record the reason before selecting a review decision." style={styles.input} />
        {!current.revoked ? <TouchableOpacity disabled={busy || !reason.trim()} onPress={() => void action(
          () => api.revokeChannel(current.id,reason.trim()),'Conversation closed. The care-team record is retained.')}>
          <Text style={styles.link}>Close this conversation</Text></TouchableOpacity> : null}
      </View> : null}
      {current.canSend ? <View style={styles.card}>
        <TextInput accessibilityLabel="Message draft" multiline value={text} onChangeText={setText} editable={!busy} maxLength={4000}
          placeholder="Write a practical, child-centred message…" style={[styles.input,styles.draft]} />
        <TouchableOpacity disabled={busy || !text.trim()} style={styles.primary} onPress={send}><Text style={styles.primaryText}>{busy ? 'Working…' : 'Send for review'}</Text></TouchableOpacity>
      </View> : <Text style={styles.body}>New messages are unavailable with your current conversation settings or permissions.</Text>}
    </> : null}
    {text ? <TouchableOpacity disabled={busy} onPress={() => { setText(''); submission.current=null; }}><Text style={styles.link}>Clear message draft</Text></TouchableOpacity> : null}
    <Text style={styles.body}>Only the latest 100 messages currently authorized for you are shown. Unsaved drafts stay on this screen only.</Text>
  </ScrollView></SafeAreaView>;
}
function errorMessage(e: unknown) { return e instanceof Error ? e.message : 'Unable to access this conversation.'; }
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F7F6'},content:{padding:20,gap:16,width:'100%',maxWidth:760,alignSelf:'center'},
  heading:{color:'#193E3C',fontSize:26,fontWeight:'800'},title:{color:'#193E3C',fontSize:17,fontWeight:'700'},
  body:{color:'#536D69',fontSize:14,lineHeight:21},card:{backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#D8E3E1',borderRadius:14,padding:16,gap:12},
  selected:{borderColor:'#08766D',backgroundColor:'#E8F5F2'},link:{color:'#08766D',fontWeight:'700'},
  primary:{backgroundColor:'#08766D',borderRadius:10,padding:14,alignItems:'center'},primaryText:{color:'#FFFFFF',fontWeight:'700'},
  input:{borderWidth:1,borderColor:'#CFDCDA',borderRadius:10,padding:12,color:'#203F3D',backgroundColor:'#FFFFFF'},draft:{minHeight:100,textAlignVertical:'top'},
  row:{flexDirection:'row',flexWrap:'wrap',gap:12},secondary:{padding:8},error:{color:'#9D2836',lineHeight:21},notice:{color:'#08766D',lineHeight:21},
});
