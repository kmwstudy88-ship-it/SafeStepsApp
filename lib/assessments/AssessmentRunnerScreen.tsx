import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { CAPES_ASSESSMENT, KEPS_ASSESSMENT, scoreAssessment, StandardAssessment, AssessmentResult } from './assessmentDefinitions';

export function AssessmentRunnerScreen({
  assessment = CAPES_ASSESSMENT,
  onComplete,
}: {
  assessment?: StandardAssessment;
  onComplete?: (result: AssessmentResult) => void;
}) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const LIKERT_OPTIONS = [
    { label: '0 - Not at all', value: 0 },
    { label: '1 - Sometimes', value: 1 },
    { label: '2 - Often', value: 2 },
    { label: '3 - Consistently', value: 3 },
  ];

  const handleSelect = (itemId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  const answeredCount = Object.keys(responses).length;
  const progressPercent = Math.round((answeredCount / assessment.items.length) * 100);

  const handleSubmit = () => {
    const res = scoreAssessment(assessment, responses);
    setResult(res);
    onComplete?.(res);
  };

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.resultCard}>
            <Text style={styles.resultBadge}>ASSESSMENT COMPLETE</Text>
            <Text style={styles.title}>{assessment.fullTitle}</Text>
            <Text style={styles.bandLabel}>{result.clinicalBand}</Text>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.totalScore} / {result.maxPossibleScore}</Text>
                <Text style={styles.statSub}>Total Score</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.percentage}%</Text>
                <Text style={styles.statSub}>Severity / Index</Text>
              </View>
            </View>

            <Text style={styles.summaryText}>
              This digital assessment has been timestamped and encrypted into your case progress record. Longitudinal comparisons will be included in your verified caseworker and court summaries.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.assessmentTag}>{assessment.name}</Text>
          <Text style={styles.title}>{assessment.fullTitle}</Text>
          <Text style={styles.description}>{assessment.description}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{answeredCount} of {assessment.items.length} questions completed ({progressPercent}%)</Text>
        </View>

        <View style={styles.questionsList}>
          {assessment.items.map((item, idx) => (
            <View key={item.id} style={styles.questionCard}>
              <Text style={styles.questionNumber}>Question {idx + 1}</Text>
              <Text style={styles.questionText}>{item.prompt}</Text>
              <View style={styles.optionsRow}>
                {LIKERT_OPTIONS.map((opt) => {
                  const isSelected = responses[item.id] === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                      onPress={() => handleSelect(item.id, opt.value)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, answeredCount < assessment.items.length && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={answeredCount < assessment.items.length}
        >
          <Text style={styles.submitButtonText}>Submit & Record Assessment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  assessmentTag: { alignSelf: 'flex-start', backgroundColor: '#E2E8F0', color: '#4A5568', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  description: { fontSize: 14, color: '#718096', lineHeight: 20 },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#42A99D', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#718096' },
  questionsList: { gap: 14 },
  questionCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  questionNumber: { fontSize: 12, fontWeight: '700', color: '#42A99D', textTransform: 'uppercase' },
  questionText: { fontSize: 16, fontWeight: '600', color: '#1A202C' },
  optionsRow: { flexDirection: 'column', gap: 8, marginTop: 4 },
  optionPill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#EDF2F7' },
  optionPillSelected: { backgroundColor: '#208AEF' },
  optionText: { fontSize: 14, color: '#4A5568' },
  optionTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  submitButton: { backgroundColor: '#208AEF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#FFFFFF', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  resultBadge: { alignSelf: 'flex-start', backgroundColor: '#C6F6D5', color: '#22543D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '800' },
  bandLabel: { fontSize: 18, fontWeight: '700', color: '#2B6CB0' },
  statRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  statBox: { flex: 1, backgroundColor: '#F8FCFC', padding: 14, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#42A99D' },
  statSub: { fontSize: 12, color: '#718096', marginTop: 4 },
  summaryText: { fontSize: 14, color: '#4A5568', lineHeight: 22 },
});
