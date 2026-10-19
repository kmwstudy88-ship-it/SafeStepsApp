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
    { title: 'Parent Caregiver Portal', subtitle: 'Local workflow previews with production service gates', route: '/parent', icon: '👨‍👩‍👧‍👦', badge: 'Parent Hub' },
    { title: 'Family Dashboard', subtitle: 'Family case data unavailable until parent access is verified', route: '/family', icon: '👨‍👩‍👧‍👦', badge: 'Unavailable' },
    { title: 'Supervisor Risk Dashboard', subtitle: 'Unavailable pending verified schema and actor authorization', route: '/dashboard/supervisor', icon: '🚦', badge: 'Blocked' },
    { title: 'Assessments & Practice', subtitle: 'Private reflection and step-by-step learning practice', route: '/assessments', icon: '📊', badge: 'Local' },
    { title: 'Evidence Drafts', subtitle: 'Temporary local preview; not uploaded or worker-verified', route: '/evidence', icon: '🗂️', badge: 'Local only' },
    { title: 'Progress Report Preview', subtitle: 'Export disabled until verified case data and review are connected', route: '/reports', icon: '⚖️', badge: 'Unavailable' },
      ],
    },
    {
      pillar: 'Pillar 3: AI & Voice Coaching',
      items: [
    { title: 'AI Companion', subtitle: 'Unavailable until trusted consent and launch approval are verified', route: '/companion', icon: '🤖', badge: 'Not enabled' },
    { title: 'Breathing Guide', subtitle: 'Optional four-count breathing timer; stop if uncomfortable', route: '/voice-coach', icon: '🌬️', badge: 'Local tool' },
    { title: 'Calm Support Scripts', subtitle: 'Non-emergency suggestions; app cannot dispatch help', route: '/sos', icon: '🚨', badge: 'Guidance' },
    { title: 'Document Fairness & Bias Analyzer', subtitle: 'Objective framing & constructive reframing', route: '/fairness', icon: '📝', badge: 'AI Explainer' },
      ],
    },
    {
      pillar: 'Pillar 4: Safety, Privacy & Contact Visits',
      items: [
        { title: 'Safety Planning Notes', subtitle: 'Temporary on-screen prompts; not saved or an emergency plan', route: '/safety-plan', icon: '🛡️', badge: 'Local draft' },
        { title: 'Family Visit Guide', subtitle: 'Example visit structure and session-only reflection', route: '/contact-visit', icon: '🤝', badge: 'Preview' },
        { title: 'Calculator-Style Screen', subtitle: 'Prototype only; does not guarantee concealment or safety', route: '/discreet', icon: '🔒', badge: 'Prototype' },
      ],
    },
    {
      pillar: 'Pillar 5: Access, Language & Account',
      items: [
        { title: 'Accessibility & Language', subtitle: 'Plain-language mode, text-to-speech, and preferred language tools', route: '/accessibility', icon: '🗣️', badge: 'Inclusive' },
        { title: 'Settings & Trusted Contacts', subtitle: 'Profile and contacts are previews; contacts are not saved or alerted', route: '/settings', icon: '⚙️', badge: 'Prototype' },
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
            Learning and planning prototypes with clear limits on storage, verification, and emergency support.
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
