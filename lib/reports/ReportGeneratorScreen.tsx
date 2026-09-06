import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { exportCourtReportPdf, CourtReportData } from './courtReportGenerator';

export function ReportGeneratorScreen() {
  const [generating, setGenerating] = useState(false);
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);

  const sampleReportData: CourtReportData = {
    caseReference: 'CS-QLD-2026-8941',
    parentName: 'Sarah Jenkins',
    childrenNames: ['Leo Jenkins (Age 6)', 'Maya Jenkins (Age 4)'],
    caseworkerName: 'Mark Henderson (Senior Child Safety Officer)',
    reportPeriod: 'June 2026 – September 2026 (12-Week Milestone)',
    completedCurriculumModules: [
      { title: 'Reunification Stage 1: Stabilisation Foundations', completedDate: '2026-07-15', hours: 14 },
      { title: 'AOD: Addiction Science & Trigger Management', completedDate: '2026-08-02', hours: 8 },
      { title: 'Emotional Regulation & Sensory De-escalation', completedDate: '2026-08-28', hours: 12 },
    ],
    assessmentTrajectories: [
      { name: 'CAPES (Parental Efficacy Confidence)', baselineScore: 42, currentScore: 84, deltaLabel: '+42% Significant Gain' },
      { name: 'KEPS (Parenting Distress Severity)', baselineScore: 76, currentScore: 32, deltaLabel: '-44% Distress Reduction' },
      { name: 'Facilitative Boundaries Scale', baselineScore: 48, currentScore: 88, deltaLabel: '+40% Mastery Demonstrated' },
    ],
    contactVisitStats: [
      { totalVisits: 12, attendedVisits: 12, punctualityRate: '100%' },
    ],
    verifiedEvidenceCount: 19,
    workerObservationSummary: 'Sarah has consistently demonstrated emotional regulation tools during weekly supervised visits. Punctual, engaged with children in child-led play, and receptive to positive feedback. Observed proactive boundary setting without raising voice.',
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const uri = await exportCourtReportPdf(sampleReportData);
      setGeneratedUri(uri);
    } catch (e: any) {
      Alert.alert('Export Error', e?.message || 'Unable to generate PDF report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>DOCUMENT EXPORT</Text>
          <Text style={styles.title}>Court-Ready Progress Report</Text>
          <Text style={styles.subtitle}>
            Generates a signed, verifiable PDF summary of case plan progress, assessment trends, and completed curriculum hours.
          </Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.cardHeader}>Report Summary Configuration</Text>
          <View style={styles.previewItem}>
            <Text style={styles.itemLabel}>Case File:</Text>
            <Text style={styles.itemVal}>{sampleReportData.caseReference}</Text>
          </View>
          <View style={styles.previewItem}>
            <Text style={styles.itemLabel}>Parent / Client:</Text>
            <Text style={styles.itemVal}>{sampleReportData.parentName}</Text>
          </View>
          <View style={styles.previewItem}>
            <Text style={styles.itemLabel}>Verified Hours:</Text>
            <Text style={styles.itemVal}>34 Hours Total</Text>
          </View>
          <View style={styles.previewItem}>
            <Text style={styles.itemLabel}>Psychometric Deltas:</Text>
            <Text style={styles.itemVal}>CAPES (+42%), KEPS (-44%)</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.exportButtonText}>Generate & Share Court PDF</Text>
          )}
        </TouchableOpacity>

        {generatedUri && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Report generated successfully and sent to sharing sheet.</Text>
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
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#718096', lineHeight: 20 },
  previewCard: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  previewItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  itemLabel: { fontSize: 14, color: '#718096' },
  itemVal: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  exportButton: { backgroundColor: '#208AEF', padding: 16, borderRadius: 12, alignItems: 'center' },
  exportButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  successBanner: { backgroundColor: '#C6F6D5', padding: 14, borderRadius: 10 },
  successText: { color: '#22543D', fontSize: 13, fontWeight: '600' },
});
