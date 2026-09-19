import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

type VisitReflection = {
  id: string;
  child: string;
  wentWell: string;
  supportNeed: string;
  nextStep: string;
  loggedAt: string;
};

export function ContactVisitCompanionScreen({
  totalMinutes = 60,
  onComplete,
}: {
  totalMinutes?: number;
  onComplete?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'timer' | 'activities' | 'reflection'>('timer');
  const [child, setChild] = useState('Leo');
  const [wentWell, setWentWell] = useState('');
  const [supportNeed, setSupportNeed] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [reflections, setReflections] = useState<VisitReflection[]>([
    {
      id: 'visit-1',
      child: 'Maya',
      wentWell: 'Maya initiated pretend play twice and stayed connected during goodbye.',
      supportNeed: 'She became unsettled when the room got noisy near the end.',
      nextStep: 'Pack headphones and ask for a quieter transition space next visit.',
      loggedAt: '2026-09-10',
    },
  ]);

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

  const handleSaveReflection = () => {
    if (!wentWell.trim() || !nextStep.trim()) {
      Alert.alert('Reflection needed', 'Please capture what went well and the next step for the next visit.');
      return;
    }

    const entry: VisitReflection = {
      id: `visit-${Date.now()}`,
      child: child.trim() || 'Child',
      wentWell: wentWell.trim(),
      supportNeed: supportNeed.trim(),
      nextStep: nextStep.trim(),
      loggedAt: new Date().toISOString().split('T')[0],
    };

    setReflections((prev) => [entry, ...prev]);
    setWentWell('');
    setSupportNeed('');
    setNextStep('');
    onComplete?.();
    Alert.alert('Reflection saved', 'This visit note is ready to feed into progress reports and worker follow-up.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>SUPERVISED CONTACT COMPANION</Text>
          <Text style={styles.title}>Family Visit Companion</Text>
          <Text style={styles.subtitle}>
            Structured schedule, bonding activities, and post-visit reflections that can feed back into progress documentation.
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
            style={[styles.tabBtn, activeTab === 'activities' && styles.tabBtnActive]}
            onPress={() => setActiveTab('activities')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'activities' && styles.tabBtnTextActive]}>Activity Ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'reflection' && styles.tabBtnActive]}
            onPress={() => setActiveTab('reflection')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'reflection' && styles.tabBtnTextActive]}>Reflection Log</Text>
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
          </View>
        ) : (
          <View style={styles.reflectionColumn}>
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Post-visit reflection</Text>
              <Text style={styles.helperText}>Capture this while the visit is still fresh so it can be reused in progress notes and later report writing.</Text>
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
                placeholder="What went well for connection, regulation, or parenting?"
                placeholderTextColor="#A0AEC0"
                multiline
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={supportNeed}
                onChangeText={setSupportNeed}
                placeholder="Any hard moment, trigger, or support need to flag?"
                placeholderTextColor="#A0AEC0"
                multiline
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={nextStep}
                onChangeText={setNextStep}
                placeholder="What should happen before the next visit?"
                placeholderTextColor="#A0AEC0"
                multiline
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveReflection}>
                <Text style={styles.saveButtonText}>Save to Progress Documentation</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Saved reflections</Text>
              {reflections.map((entry) => (
                <View key={entry.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logChild}>{entry.child}</Text>
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
  tabRow: { flexDirection: 'row', gap: 10 },
  tabBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#EDF2F7', borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#42A99D' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#4A5568', textAlign: 'center' },
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
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748', flex: 1 },
  actAge: { fontSize: 12, fontWeight: '600', color: '#42A99D' },
  actDesc: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
  input: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#2D3748' },
  textArea: { minHeight: 78, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  logCard: { backgroundColor: '#F8FCFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 6 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  logChild: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  logDate: { fontSize: 12, color: '#718096' },
  logLabel: { fontSize: 12, fontWeight: '700', color: '#42A99D', textTransform: 'uppercase' },
  logBody: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
});
