import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { ChallengeRecommendations } from '../../components/ChallengeRecommendations';
import {
  createCanonicalVisitRecord,
  getCanonicalVisitRecords,
  RELATIONAL_COACHING_PROMPTS,
  type CanonicalVisitRecord,
  type RelationalCoachingFocus,
} from './contactVisitService';

export function ContactVisitCompanionScreen({
  totalMinutes = 60,
  onComplete,
}: {
  totalMinutes?: number;
  onComplete?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'timer' | 'coaching' | 'activities' | 'reflection'>('timer');
  const [child, setChild] = useState('Leo');
  const [coachingFocus, setCoachingFocus] = useState<RelationalCoachingFocus>('follow_the_child_lead');
  const [wentWell, setWentWell] = useState('');
  const [supportNeed, setSupportNeed] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [postVisitTransitionPlan, setPostVisitTransitionPlan] = useState('');
  const [transportSupportRequested, setTransportSupportRequested] = useState(false);
  const [reflections, setReflections] = useState<CanonicalVisitRecord[]>([]);

  useEffect(() => {
    getCanonicalVisitRecords().then(setReflections);
  }, []);

  const ACTIVITIES = [
    { title: 'Playdough Emotion Faces', age: 'Ages 3-8', description: 'Roll balls of dough together to make silly, happy, or calm faces.' },
    { title: 'Two Truths and a Wish', age: 'Ages 6-14', description: 'Take turns sharing two real things and one hopeful wish for next week.' },
    { title: 'Paper Airplane Runway', age: 'All Ages', description: 'Fold paper planes and set landing targets across the visitation room.' },
  ];

  const PHASES = [
    { name: 'Arrival & Greeting', time: '0-10 min', tip: 'Low-key, warm hug. Let child explore the space first.' },
    { name: 'Child-Led Activity', time: '10-45 min', tip: 'Follow child interests. Praise effort rather than outcome.' },
    { name: 'Snack & Chat', time: '45-55 min', tip: 'Offer nutritious snack, review happy moment from visit.' },
    { name: 'Gentle Transition', time: '55-60 min', tip: 'Prepare child 5 mins before CSO announcement. Reassure love.' },
  ];

  const handleSaveReflection = async () => {
    const res = await createCanonicalVisitRecord({
      childName: child,
      coachingFocus,
      wentWell,
      supportNeed,
      nextStep,
      postVisitTransitionPlan,
      transportSupportRequested,
    });

    if (!res.success) {
      Alert.alert('Reflection needed', res.error || 'Please capture what went well and the next step for the next visit.');
      return;
    }

    const updated = await getCanonicalVisitRecords();
    setReflections(updated);
    setWentWell('');
    setSupportNeed('');
    setNextStep('');
    setPostVisitTransitionPlan('');
    onComplete?.();
    Alert.alert('Reflection saved', 'Persisted to canonical visit record (case_visit_records_v19) and ready for supportive follow-up.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>SUPERVISED CONTACT & RELATIONAL COACHING</Text>
          <Text style={styles.title}>Family Time Companion</Text>
          <Text style={styles.subtitle}>
            Supportive, trauma-informed family time (ABC/PCIT-aligned), transition buffering, and reflections persisted to canonical visit records.
          </Text>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'timer' && styles.tabBtnActive]}
            onPress={() => setActiveTab('timer')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'timer' && styles.tabBtnTextActive]}>Visit Flow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'coaching' && styles.tabBtnActive]}
            onPress={() => setActiveTab('coaching')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'coaching' && styles.tabBtnTextActive]}>Coaching</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'activities' && styles.tabBtnActive]}
            onPress={() => setActiveTab('activities')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'activities' && styles.tabBtnTextActive]}>Play Ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'reflection' && styles.tabBtnActive]}
            onPress={() => setActiveTab('reflection')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'reflection' && styles.tabBtnTextActive]}>Reflection</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'timer' ? (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>4-Stage Visit Timeline ({totalMinutes} min session)</Text>
            {PHASES.map((p, i) => (
              <View key={i} style={styles.phaseRow}>
                <View style={styles.phaseIndicator}>
                  <Text style={styles.phaseNum}>{i + 1}</Text>
                </View>
                <View style={styles.phaseDetails}>
                  <View style={styles.phaseTop}>
                    <Text style={styles.phaseName}>{p.name}</Text>
                    <Text style={styles.phaseTime}>{p.time}</Text>
                  </View>
                  <Text style={styles.phaseTip}>{p.tip}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : activeTab === 'coaching' ? (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Supportive In-the-Moment Coaching (ABC & PCIT)</Text>
            <Text style={styles.helperText}>
              Family time is an opportunity to strengthen attachment—not a sterile compliance test. Choose one relational focus for today:
            </Text>
            {RELATIONAL_COACHING_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={[styles.activityBox, coachingFocus === prompt.id && styles.coachingSelected]}
                onPress={() => setCoachingFocus(prompt.id)}
              >
                <View style={styles.activityHeader}>
                  <Text style={styles.actTitle}>{prompt.title}</Text>
                  <Text style={styles.actAge}>{prompt.modelBasis.split(' ')[0]}</Text>
                </View>
                <Text style={styles.actDesc}>{prompt.inTheMomentCue}</Text>
                <Text style={styles.coachingWhy}>Why it matters: {prompt.whyItMatters}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : activeTab === 'activities' ? (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Engaging Play Ideas for Supervised Rooms</Text>
            {ACTIVITIES.map((act, i) => (
              <View key={i} style={styles.activityBox}>
                <View style={styles.activityHeader}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actAge}>{act.age}</Text>
                </View>
                <Text style={styles.actDesc}>{act.description}</Text>
              </View>
            ))}
            <View style={{ marginTop: 12 }}>
              <ChallengeRecommendations
                context="Contact Visit Connection Attachment Child Voice Communication"
                title="Voluntary Visit & Family Bonding Challenges (SS-PCD-030)"
                track="family"
                limit={3}
              />
            </View>
          </View>
        ) : (
          <View style={styles.reflectionColumn}>
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Post-visit reflection & transition handoff</Text>
              <Text style={styles.helperText}>
                Capture this while the visit is still fresh. Persisted to canonical visit records and shared with your support team.
              </Text>
              <TextInput
                style={styles.input}
                value={child}
                onChangeText={setChild}
                placeholder="Child name"
                placeholderTextColor="#A0AEC0"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={wentWell}
                onChangeText={setWentWell}
                placeholder="What went well for connection, regulation, or following your child's lead?"
                placeholderTextColor="#A0AEC0"
                multiline
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={supportNeed}
                onChangeText={setSupportNeed}
                placeholder="Any hard moment, goodbye transition grief, or support need to flag?"
                placeholderTextColor="#A0AEC0"
                multiline
              />
              <TextInput
                style={styles.input}
                value={postVisitTransitionPlan}
                onChangeText={setPostVisitTransitionPlan}
                placeholder="Post-visit transition note for carer (e.g., quiet snack or comfort toy)"
                placeholderTextColor="#A0AEC0"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={nextStep}
                onChangeText={setNextStep}
                placeholder="What should happen before the next visit?"
                placeholderTextColor="#A0AEC0"
                multiline
              />
              <View style={styles.transportRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transportTitle}>Request Transport Voucher / Closer Location</Text>
                  <Text style={styles.helperText}>Flag distance or transit barriers so family time is never missed.</Text>
                </View>
                <Switch
                  value={transportSupportRequested}
                  onValueChange={setTransportSupportRequested}
                  trackColor={{ false: '#CBD5E0', true: '#8FD0C8' }}
                  thumbColor={transportSupportRequested ? '#42A99D' : '#FFFFFF'}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveReflection}>
                <Text style={styles.saveButtonText}>Save to Canonical Visit Record</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Saved reflections ({reflections.length})</Text>
              {reflections.map((entry) => (
                <View key={entry.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logChild}>{entry.childName}</Text>
                    <Text style={styles.logDate}>{entry.loggedAt}</Text>
                  </View>
                  <Text style={styles.logLabel}>What went well</Text>
                  <Text style={styles.logBody}>{entry.wentWell}</Text>
                  {entry.supportNeed ? (
                    <>
                      <Text style={styles.logLabel}>Support need</Text>
                      <Text style={styles.logBody}>{entry.supportNeed}</Text>
                    </>
                  ) : null}
                  {entry.postVisitTransitionPlan ? (
                    <>
                      <Text style={styles.logLabel}>Transition Handoff</Text>
                      <Text style={styles.logBody}>{entry.postVisitTransitionPlan}</Text>
                    </>
                  ) : null}
                  <Text style={styles.logLabel}>Next step</Text>
                  <Text style={styles.logBody}>{entry.nextStep}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#EBF8FF', color: '#2B6CB0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#718096', lineHeight: 20 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 11, backgroundColor: '#EDF2F7', borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#42A99D' },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#4A5568', textAlign: 'center' },
  tabBtnTextActive: { color: '#FFFFFF', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  reflectionColumn: { gap: 16 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  helperText: { fontSize: 13, color: '#4A5568', lineHeight: 20 },
  phaseRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  phaseIndicator: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E6F4FE', alignItems: 'center', justifyContent: 'center' },
  phaseNum: { fontSize: 14, fontWeight: '700', color: '#208AEF' },
  phaseDetails: { flex: 1, gap: 2 },
  phaseTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  phaseName: { fontSize: 15, fontWeight: '700', color: '#2D3748', flex: 1 },
  phaseTime: { fontSize: 12, color: '#718096' },
  phaseTip: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
  activityBox: { backgroundColor: '#F8FCFC', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  coachingSelected: { borderColor: '#42A99D', backgroundColor: '#F0FDFA' },
  coachingWhy: { fontSize: 12, color: '#0D9488', fontStyle: 'italic', marginTop: 2 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748', flex: 1 },
  actAge: { fontSize: 12, fontWeight: '600', color: '#42A99D' },
  actDesc: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
  input: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#2D3748' },
  textArea: { minHeight: 78, textAlignVertical: 'top' },
  transportRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FCFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  transportTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  saveButton: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  logCard: { backgroundColor: '#F8FCFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 6 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  logChild: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  logDate: { fontSize: 12, color: '#718096' },
  logLabel: { fontSize: 12, fontWeight: '700', color: '#42A99D', textTransform: 'uppercase' },
  logBody: { fontSize: 14, color: '#2D3748', lineHeight: 20 },
});
