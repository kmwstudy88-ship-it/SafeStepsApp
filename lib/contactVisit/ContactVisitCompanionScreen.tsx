import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';

export function ContactVisitCompanionScreen({
  totalMinutes = 60,
  onComplete,
}: {
  totalMinutes?: number;
  onComplete?: () => void;
}) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [activeTab, setActiveTab] = useState<'timer' | 'activities' | 'notes'>('timer');

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>SUPERVISED CONTACT COMPANION</Text>
          <Text style={styles.title}>Family Visit Companion</Text>
          <Text style={styles.subtitle}>
            Structured schedule, bonding activities, and calm transition prompts for visitation sessions.
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
        ) : (
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
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#4A5568' },
  tabBtnTextActive: { color: '#FFFFFF', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  phaseRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  phaseIndicator: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E6F4FE', alignItems: 'center', justifyContent: 'center' },
  phaseNum: { fontSize: 14, fontWeight: '700', color: '#208AEF' },
  phaseDetails: { flex: 1, gap: 2 },
  phaseTop: { flexDirection: 'row', justifyContent: 'space-between' },
  phaseName: { fontSize: 15, fontWeight: '700', color: '#2D3748' },
  phaseTime: { fontSize: 12, color: '#718096' },
  phaseTip: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
  activityBox: { backgroundColor: '#F8FCFC', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  actTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748' },
  actAge: { fontSize: 12, fontWeight: '600', color: '#42A99D' },
  actDesc: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
});
