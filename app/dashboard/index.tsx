import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardRoute() {
  const router = useRouter();

  const PATHWAYS = [
    {
      role: 'Parent Workspace',
      title: 'Family Progress Dashboard',
      description: 'Track case plans, lessons, evidence vault, and contact visits.',
      route: '/family',
      icon: '👨‍👩‍👧‍👦',
      color: '#0284C7',
    },
    {
      role: 'Child Safe Space',
      title: 'Child Experience & Activities',
      description: 'Feelings check-ins, storybooks, games, and safe messaging.',
      route: '/child/login',
      icon: '🧒',
      color: '#10B981',
    },
    {
      role: 'Carer Portal',
      title: 'Foster & Kinship Carer Logs',
      description: 'Daily routines, milestones, and pre/post-visit observations.',
      route: '/carers',
      icon: '🌿',
      color: '#0D9488',
    },
    {
      role: 'Supervisor & Caseworker',
      title: 'Risk & Safeguarding Console',
      description: 'Triage child requests, escalations, and serious decisions.',
      route: '/dashboard/supervisor',
      icon: '🚦',
      color: '#EA580C',
    },
    {
      role: 'Court & Legal Representative',
      title: 'Privileged Judicial Portal',
      description: 'Source-linked chronologies, concern tracking, and sealed bundles.',
      route: '/legal',
      icon: '🏛️',
      color: '#7C3AED',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← SafeSteps Hub</Text>
          </TouchableOpacity>
          <Text style={styles.badge}>ROLE-AWARE PATHWAYS (SS-PLAT-001)</Text>
          <Text style={styles.title}>SafeSteps Dashboard</Text>
          <Text style={styles.subtitle}>
            Select your authorized family or professional pathway to access your tailored workspace.
          </Text>
        </View>

        <View style={styles.pathwayList}>
          {PATHWAYS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.card}
              onPress={() => router.push(p.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardIcon}>{p.icon}</Text>
                <View style={styles.cardText}>
                  <View style={[styles.roleBadge, { backgroundColor: p.color + '18' }]}>
                    <Text style={[styles.roleText, { color: p.color }]}>{p.role.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  <Text style={styles.cardDesc}>{p.description}</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 18, gap: 16 },
  header: { gap: 6 },
  backButton: { alignSelf: 'flex-start', marginBottom: 4 },
  backButtonText: { fontSize: 13, color: '#0284C7', fontWeight: '700' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  pathwayList: { gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cardIcon: { fontSize: 32 },
  cardText: { flex: 1, gap: 3 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: '800' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  cardDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  arrow: { fontSize: 24, color: '#CBD5E1', paddingLeft: 8 },
});
