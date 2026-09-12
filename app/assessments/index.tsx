import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { AssessmentRunnerScreen } from '../../lib/assessments/AssessmentRunnerScreen';
import { ForensicCriteriaAssessmentScreen } from '../../lib/assessments/ForensicCriteriaAssessmentScreen';
import { ALL_ASSESSMENTS, StandardAssessment } from '../../lib/assessments/assessmentDefinitions';

const FORENSIC_TAB = {
  id: 'FORENSIC',
  name: 'Forensic',
  kind: 'forensic',
} as const;

const ASSESSMENT_TABS = [
  ...ALL_ASSESSMENTS.map((assessment) => ({ ...assessment, kind: 'standard' as const })),
  FORENSIC_TAB,
];

export default function AssessmentsRoute() {
  const [selectedAssessment, setSelectedAssessment] = useState<(StandardAssessment & { kind: 'standard' }) | typeof FORENSIC_TAB>(
    ASSESSMENT_TABS[0]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.selectorRow}>
        {ASSESSMENT_TABS.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.tabBtn, selectedAssessment.id === a.id && styles.tabBtnActive]}
            onPress={() => setSelectedAssessment(a)}
          >
            <Text style={[styles.tabText, selectedAssessment.id === a.id && styles.tabTextActive]}>
              {a.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {selectedAssessment.kind === 'forensic' ? (
          <ForensicCriteriaAssessmentScreen />
        ) : (
          <AssessmentRunnerScreen key={selectedAssessment.id} assessment={selectedAssessment} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#EDF2F7', alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#208AEF' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },
});
