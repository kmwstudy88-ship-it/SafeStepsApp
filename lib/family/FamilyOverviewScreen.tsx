import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ChildCase = {
  id: string;
  childName: string;
  age: string;
  caseName: string;
  visitStatus: string;
  nextMilestone: string;
  attention: string;
};

const FAMILY_CASES: ChildCase[] = [
  {
    id: 'all',
    childName: 'All children',
    age: '',
    caseName: 'Family overview',
    visitStatus: '2 active cases',
    nextMilestone: 'Joint home review on Tuesday',
    attention: 'Coordinate transport and school pickup coverage.',
  },
  {
    id: 'leo',
    childName: 'Leo',
    age: 'Age 6',
    caseName: 'Reunification Case A',
    visitStatus: 'Weekly supervised visits on track',
    nextMilestone: 'Speech-therapy routine evidence due Friday',
    attention: 'Needs quieter goodbye transition after visits.',
  },
  {
    id: 'maya',
    childName: 'Maya',
    age: 'Age 4',
    caseName: 'Reunification Case B',
    visitStatus: 'Home-day trial approved',
    nextMilestone: 'Sleep routine check-in due Monday',
    attention: 'Pack sensory items before handover.',
  },
];

export function FamilyOverviewScreen() {
  const [selectedCase, setSelectedCase] = useState('all');

  const visibleCards = useMemo(() => {
    if (selectedCase === 'all') return FAMILY_CASES.slice(1);
    return FAMILY_CASES.filter((item) => item.id === selectedCase);
  }, [selectedCase]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>MULTI-CHILD SUPPORT</Text>
          <Text style={styles.title}>Family Dashboard</Text>
          <Text style={styles.subtitle}>See each child, case task, and contact-visit follow-up together so parents are not forced into a single-child view.</Text>
        </View>

        <View style={styles.switcherRow}>
          {FAMILY_CASES.map((item) => {
            const selected = selectedCase === item.id;
            return (
              <TouchableOpacity key={item.id} style={[styles.switcherChip, selected && styles.switcherChipActive]} onPress={() => setSelectedCase(item.id)}>
                <Text style={[styles.switcherText, selected && styles.switcherTextActive]}>{item.childName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>At-a-glance family planning</Text>
          <Text style={styles.summaryText}>Next shared milestone: Joint home review on Tuesday at 10:00 AM</Text>
          <Text style={styles.summaryText}>Open follow-ups: 4 tasks across 2 children</Text>
          <Text style={styles.summaryText}>Shared note: Bring both comfort items and signed medication forms.</Text>
        </View>

        {visibleCards.map((item) => (
          <View key={item.id} style={styles.caseCard}>
            <View style={styles.caseHeader}>
              <View>
                <Text style={styles.caseChild}>{item.childName}</Text>
                <Text style={styles.caseMeta}>{item.age} • {item.caseName}</Text>
              </View>
              <Text style={styles.caseBadge}>{item.visitStatus}</Text>
            </View>
            <Text style={styles.sectionLabel}>Next milestone</Text>
            <Text style={styles.sectionBody}>{item.nextMilestone}</Text>
            <Text style={styles.sectionLabel}>Needs attention</Text>
            <Text style={styles.sectionBody}>{item.attention}</Text>
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
  badge: { alignSelf: 'flex-start', backgroundColor: '#FEEBC8', color: '#9C4221', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  switcherRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  switcherChip: { backgroundColor: '#EDF2F7', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  switcherChipActive: { backgroundColor: '#208AEF' },
  switcherText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  switcherTextActive: { color: '#FFFFFF' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 6 },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  summaryText: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
  caseCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 8 },
  caseHeader: { gap: 10 },
  caseChild: { fontSize: 17, fontWeight: '700', color: '#1A202C' },
  caseMeta: { fontSize: 12, color: '#718096' },
  caseBadge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#42A99D', textTransform: 'uppercase' },
  sectionBody: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
});
