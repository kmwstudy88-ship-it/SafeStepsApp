import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { familyChallenges, personalChallenges, weekendActivityChallenges } from '../data/familyChallenges';

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
  const router = useRouter();
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

        <View style={styles.challengeHubCard}>
          <View style={styles.challengeHubHeader}>
            <Text style={styles.challengeHubBadge}>VOLUNTARY CONNECTION • SS-PCD-030</Text>
            <Text style={styles.challengeHubTitle}>Personal & Family Challenges</Text>
            <Text style={styles.challengeHubSub}>
              {familyChallenges.length} voluntary family & child-led challenges, {weekendActivityChallenges.length} weekend bonding activities, and {personalChallenges.length} parent self-regulation challenges.
            </Text>
          </View>
          <View style={styles.challengeButtonsRow}>
            <TouchableOpacity
              style={styles.challengePrimaryBtn}
              onPress={() => router.push('/challenges?track=family' as any)}
            >
              <Text style={styles.challengePrimaryBtnText}>Family Challenges ({familyChallenges.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.challengeSecondaryBtn}
              onPress={() => router.push('/challenges?track=weekend' as any)}
            >
              <Text style={styles.challengeSecondaryBtnText}>Weekend Bonding ({weekendActivityChallenges.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.challengeSecondaryBtn}
              onPress={() => router.push('/daily-challenges' as any)}
            >
              <Text style={styles.challengeSecondaryBtnText}>Daily Streaks & Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.reunificationHubCard}>
          <View style={styles.challengeHubHeader}>
            <Text style={styles.reunificationHubBadge}>POVERTY != NEGLECT • STRUCTURAL EQUITY</Text>
            <Text style={styles.challengeHubTitle}>Reunification Safeguards & Concrete Support (ECS)</Text>
            <Text style={styles.challengeHubSub}>
              Request flexible Economic & Concrete Supports (rent, utilities, transit), pause statutory compliance clocks for agency waitlists, connect with a lived-experience Parent Partner, and track your 12-month post-reunification step-down plan.
            </Text>
          </View>
          <View style={styles.challengeButtonsRow}>
            <TouchableOpacity
              style={styles.reunificationPrimaryBtn}
              onPress={() => router.push('/reunification-support' as any)}
            >
              <Text style={styles.challengePrimaryBtnText}>ECS Grants & Waitlist Tolling</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reunificationSecondaryBtn}
              onPress={() => router.push('/contact-visit' as any)}
            >
              <Text style={styles.reunificationSecondaryBtnText}>ABC/PCIT Visit Companion</Text>
            </TouchableOpacity>
          </View>
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
  challengeHubCard: { backgroundColor: '#F0FDF9', borderRadius: 14, borderWidth: 1, borderColor: '#B8E3D6', padding: 16, gap: 12 },
  challengeHubHeader: { gap: 4 },
  challengeHubBadge: { alignSelf: 'flex-start', backgroundColor: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  challengeHubTitle: { fontSize: 16, fontWeight: '800', color: '#102033' },
  challengeHubSub: { fontSize: 13, color: '#334E68', lineHeight: 19 },
  challengeButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  challengePrimaryBtn: { backgroundColor: '#0F766E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  challengePrimaryBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  challengeSecondaryBtn: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#99F6E4', paddingHorizontal: 12, paddingVertical: 10 },
  challengeSecondaryBtnText: { color: '#0F766E', fontSize: 13, fontWeight: '700' },
  reunificationHubCard: { backgroundColor: '#EFF6FF', borderRadius: 14, borderWidth: 1, borderColor: '#BFDBFE', padding: 16, gap: 12 },
  reunificationHubBadge: { alignSelf: 'flex-start', backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  reunificationPrimaryBtn: { backgroundColor: '#1D4ED8', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  reunificationSecondaryBtn: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#93C5FD', paddingHorizontal: 12, paddingVertical: 10 },
  reunificationSecondaryBtnText: { color: '#1D4ED8', fontSize: 13, fontWeight: '700' },
});
