import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export function ReportGeneratorScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>REPORT EXPORT UNAVAILABLE</Text>
          <Text style={styles.title}>Progress report preview</Text>
          <Text style={styles.subtitle}>
            Report generation is disabled until verified case data, authorization, and review workflows are connected.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>No court-ready or verified report is available</Text>
          <Text style={styles.warningText}>
            This app does not currently create a court filing, certified record, cryptographic seal, or verified progress report. No sample names, scores, case details, or fabricated worker observations are used here.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Required before export</Text>
          {[
            'Verified and authorized case data source',
            'Accurate case identity crosswalk and role-based access checks',
            'Clear provenance and human review for every included item',
            'Approved export, integrity, and audit process',
          ].map((requirement) => (
            <View key={requirement} style={styles.requirementRow}>
              <Text style={styles.statusIcon}>○</Text>
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          For official records or court documents, use the authorized agency or legal representative process. Do not rely on this prototype for deadlines, filings, or evidence submission.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', color: '#92400E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  warningCard: { backgroundColor: '#FFF7ED', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#FED7AA', gap: 8 },
  warningTitle: { fontSize: 16, fontWeight: '700', color: '#9A5B18' },
  warningText: { fontSize: 13, color: '#7C4A17', lineHeight: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  requirementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  statusIcon: { color: '#718096', fontSize: 17 },
  requirementText: { flex: 1, color: '#4A5568', fontSize: 13, lineHeight: 19 },
  footer: { color: '#4A5568', fontSize: 12, lineHeight: 18 },
});
