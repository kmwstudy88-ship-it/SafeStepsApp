import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SafeStepsHub() {
  const router = useRouter();

  const PILLARS = [
    {
      pillar: 'Pillar 1: Interactive Learning',
      items: [
        { title: 'Interactive Roleplay Simulator', subtitle: 'Practice de-escalation & caseworker meetings', route: '/scenarios', icon: '🎭', badge: 'Active' },
        { title: 'Interactive Storybooks', subtitle: 'Parent-child co-reading & reflection', route: '/storybooks', icon: '📖', badge: 'Co-reading' },
      ],
    },
    {
      pillar: 'Pillar 2: Proof of Change & Documentation',
      items: [
        { title: 'Case Management Console', subtitle: 'Authenticated case assignments & realtime status', route: '/cases', icon: '🗂️', badge: 'Supabase' },
        { title: 'Family Dashboard', subtitle: 'Track multiple children, cases, and next actions together', route: '/family', icon: '👨‍👩‍👧‍👦', badge: 'Multi-child' },
        { title: 'Supervisor Risk Dashboard', subtitle: 'Highest-risk cases, rising risk, escalations, and follow-ups', route: '/dashboard/supervisor', icon: '🚦', badge: 'Safety' },
        { title: 'Assessments & Results', subtitle: 'Parent self-check-ins with plain-language feedback and next steps', route: '/assessments', icon: '📊', badge: 'Self-check-in' },
        { title: 'Secure Evidence Vault', subtitle: 'Photo proof & routine milestone locker', route: '/evidence', icon: '🔐', badge: 'Vault' },
        { title: 'Court-Ready Progress Reports', subtitle: 'Cryptographically sealed PDF summaries', route: '/reports', icon: '⚖️', badge: 'PDF Export' },
      ],
    },
    {
      pillar: 'Pillar 3: AI & Voice Coaching',
      items: [
        { title: 'Voice Calming Coach', subtitle: 'Box breathing (4-4-4-4) & grounding reset', route: '/voice-coach', icon: '🌬️', badge: 'Audio Reset' },
        { title: '24/7 Parenting SOS Reliever', subtitle: 'Zero-judgment emergency de-escalation scripts', route: '/sos', icon: '🚨', badge: 'SOS' },
        { title: 'Document Fairness & Bias Analyzer', subtitle: 'Objective framing & constructive reframing', route: '/fairness', icon: '📝', badge: 'AI Explainer' },
      ],
    },
    {
      pillar: 'Pillar 4: Safety, Privacy & Contact Visits',
      items: [
        { title: 'Safety Plan Builder', subtitle: 'Editable safety steps, escape contacts, and go-bag checklist', route: '/safety-plan', icon: '🛡️', badge: 'Plan' },
        { title: 'Supervised Contact Visit Companion', subtitle: 'Visit flow, bonding ideas, and post-visit reflections for reports', route: '/contact-visit', icon: '🤝', badge: 'Visits' },
        { title: 'Discreet Privacy Mode', subtitle: 'Functional disguise screen with PIN unlock and recovery support', route: '/discreet', icon: '🔒', badge: 'Disguise' },
      ],
    },
    {
      pillar: 'Pillar 5: Access, Language & Account',
      items: [
        { title: 'Accessibility & Language', subtitle: 'Plain-language mode, text-to-speech, and preferred language tools', route: '/accessibility', icon: '🗣️', badge: 'Inclusive' },
        { title: 'Settings & Trusted Contacts', subtitle: 'Profile, trusted-contact SOS list, and account preferences', route: '/settings', icon: '⚙️', badge: 'Account' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.platformBadge}>CHILD SAFETY & REUNIFICATION PLATFORM</Text>
          <Text style={styles.title}>SafeSteps Hub</Text>
          <Text style={styles.subtitle}>
            Comprehensive evidence-based tools for parents, caseworkers, and family safety.
          </Text>
        </View>

        {PILLARS.map((p, pIdx) => (
          <View key={pIdx} style={styles.pillarSection}>
            <Text style={styles.pillarTitle}>{p.pillar}</Text>
            <View style={styles.cardsList}>
              {p.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.card}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                    <View style={styles.cardText}>
                      <View style={styles.titleRow}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardBadge}>{item.badge}</Text>
                      </View>
                      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={styles.arrow}>›</Text>
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
  scroll: { padding: 20, gap: 20 },
  header: { gap: 6 },
  platformBadge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#718096', lineHeight: 20 },
  pillarSection: { gap: 10 },
  pillarTitle: { fontSize: 15, fontWeight: '700', color: '#4A5568', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardsList: { gap: 10 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cardIcon: { fontSize: 28 },
  cardText: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C', flex: 1 },
  cardBadge: { fontSize: 11, fontWeight: '700', backgroundColor: '#EDF2F7', color: '#4A5568', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  cardSubtitle: { fontSize: 13, color: '#718096' },
  arrow: { fontSize: 24, color: '#CBD5E0', paddingLeft: 8 },
});
