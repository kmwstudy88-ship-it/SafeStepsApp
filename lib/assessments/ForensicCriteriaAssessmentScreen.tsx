import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const {
  FORENSIC_BOOLEAN_SCALE,
  FORENSIC_CRITERIA_DOMAINS,
  FORENSIC_RELIABILITY_MODIFIERS,
  FORENSIC_SIGNAL_SCALE,
  scoreForensicCriteriaAssessment,
  totalModifierCount,
  totalSignalCount,
} = require('../../shared/forensicCriteriaModel');

type ResponseMap = Record<string, boolean | number | undefined>;

export function ForensicCriteriaAssessmentScreen() {
  const [responses, setResponses] = useState<ResponseMap>({});
  const [result, setResult] = useState<any | null>(null);

  const answeredSignals = useMemo(
    () =>
      FORENSIC_CRITERIA_DOMAINS.reduce(
        (sum: number, domain: any) => sum + domain.signals.filter((signal: any) => responses[signal.id] !== undefined).length,
        0
      ),
    [responses]
  );

  const answeredModifiers = useMemo(
    () =>
      [...FORENSIC_RELIABILITY_MODIFIERS.contradictions, ...FORENSIC_RELIABILITY_MODIFIERS.bias].filter(
        (flag: any) => responses[flag.id] !== undefined
      ).length,
    [responses]
  );

  const totalQuestions = totalSignalCount() + totalModifierCount();
  const answeredQuestions = answeredSignals + answeredModifiers;
  const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);

  function setValue(id: string, value: boolean | number) {
    setResponses((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    setResult(scoreForensicCriteriaAssessment(responses));
  }

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.resultCard}>
            <Text style={styles.resultBadge}>FORENSIC CRITERIA SCORED</Text>
            <Text style={styles.title}>First-Class Forensic Criteria Set</Text>
            <Text style={styles.subtitle}>
              Risk-weighted, protective-weighted, contradiction-aware, bias-adjusted, child-centred, and ML-ready.
            </Text>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.adjusted_concern_score} / 100</Text>
                <Text style={styles.statSub}>Adjusted Concern Score</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{Math.round(result.confidence * 100)}%</Text>
                <Text style={styles.statSub}>Confidence</Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <Text style={styles.summaryLine}>Raw concern score: {result.raw_concern_score} / 100</Text>
              <Text style={styles.summaryLine}>Risk-weighted score: {result.risk_weighted_score} / 100</Text>
              <Text style={styles.summaryLine}>Protective-weighted score: {result.protective_weighted_score} / 100</Text>
              <Text style={styles.summaryLine}>Court defensibility: {result.court_defensibility.status.replace('_', ' ')}</Text>
            </View>

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Child-centred priority domains</Text>
              <Text style={styles.noticeBody}>{result.child_centred_priority_domains.join(', ')}</Text>
            </View>

            {result.domains.map((domain: any) => (
              <View key={domain.id} style={styles.domainResultCard}>
                <View style={styles.domainResultTop}>
                  <Text style={styles.domainResultTitle}>{domain.title}</Text>
                  <Text style={styles.domainResultScore}>{domain.concern_score} / 100</Text>
                </View>
                <Text style={styles.domainMeta}>
                  Risk {domain.risk_weighted_score} · Protective {domain.protective_weighted_score} · Coverage {domain.coverage_score}%
                </Text>
                {!!domain.risk_flags_present.length && (
                  <Text style={styles.flagSummary}>Risk flags: {domain.risk_flags_present.join(', ')}</Text>
                )}
                {!!domain.protective_flags_present.length && (
                  <Text style={styles.protectiveSummary}>Protective flags: {domain.protective_flags_present.join(', ')}</Text>
                )}
              </View>
            ))}

            <View style={styles.modifierCard}>
              <Text style={styles.noticeTitle}>Reliability modifiers</Text>
              <Text style={styles.summaryLine}>Contradictions: {result.contradictions_present.length}</Text>
              <Text style={styles.summaryLine}>Bias flags: {result.bias_flags_present.length}</Text>
              {result.court_defensibility.reasons.map((reason: string, index: number) => (
                <Text key={index} style={styles.limitationsText}>• {reason}</Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.assessmentTag}>FORENSIC</Text>
          <Text style={styles.title}>First-Class Forensic Criteria Set</Text>
          <Text style={styles.description}>
            Structured observation capture for parent-child interaction, safety, regulation, child state, and co-parenting
            dynamics. Higher scores reflect higher concern after protective offsets and reliability adjustments.
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {answeredQuestions} of {totalQuestions} items completed ({progressPercent}%)
          </Text>
        </View>

        {FORENSIC_CRITERIA_DOMAINS.map((domain: any) => (
          <View key={domain.id} style={styles.domainCard}>
            <View style={styles.domainHeader}>
              <Text style={styles.domainTitle}>{domain.title}</Text>
              <Text style={styles.domainWeight}>Child weight {domain.childCentredWeight}×</Text>
            </View>
            <Text style={styles.domainDescription}>{domain.summary}</Text>

            {domain.signals.map((signal: any) => (
              <View key={signal.id} style={styles.questionCard}>
                <Text style={styles.questionText}>{signal.label}</Text>
                <Text style={styles.questionHint}>{signal.detail}</Text>
                <View style={styles.optionsRow}>
                  {FORENSIC_SIGNAL_SCALE.map((option: any) => {
                    const selected = responses[signal.id] === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.optionPill, selected && styles.optionPillSelected]}
                        onPress={() => setValue(signal.id, option.value)}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.flagSection}>
              <Text style={styles.flagSectionTitle}>Risk flags</Text>
              {domain.riskFlags.map((flag: any) => (
                <BooleanRow
                  key={flag.id}
                  label={flag.label}
                  value={responses[flag.id]}
                  onChange={(value) => setValue(flag.id, value)}
                />
              ))}
            </View>

            <View style={styles.flagSection}>
              <Text style={styles.flagSectionTitle}>Protective flags</Text>
              {domain.protectiveFlags.map((flag: any) => (
                <BooleanRow
                  key={flag.id}
                  label={flag.label}
                  value={responses[flag.id]}
                  onChange={(value) => setValue(flag.id, value)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.domainCard}>
          <Text style={styles.domainTitle}>Reliability & Fairness Modifiers</Text>
          <Text style={styles.domainDescription}>
            These modifiers do not create risk by themselves. They temper confidence, flag review requirements, and improve
            court defensibility.
          </Text>

          <View style={styles.flagSection}>
            <Text style={styles.flagSectionTitle}>Contradiction-aware checks</Text>
            {FORENSIC_RELIABILITY_MODIFIERS.contradictions.map((flag: any) => (
              <BooleanRow
                key={flag.id}
                label={flag.label}
                value={responses[flag.id]}
                onChange={(value) => setValue(flag.id, value)}
              />
            ))}
          </View>

          <View style={styles.flagSection}>
            <Text style={styles.flagSectionTitle}>Bias-adjustment checks</Text>
            {FORENSIC_RELIABILITY_MODIFIERS.bias.map((flag: any) => (
              <BooleanRow
                key={flag.id}
                label={flag.label}
                value={responses[flag.id]}
                onChange={(value) => setValue(flag.id, value)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, answeredQuestions < totalQuestions && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={answeredQuestions < totalQuestions}
        >
          <Text style={styles.submitButtonText}>Score Forensic Criteria</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function BooleanRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | number | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.booleanRow}>
      <Text style={styles.booleanLabel}>{label}</Text>
      <View style={styles.booleanOptions}>
        {FORENSIC_BOOLEAN_SCALE.map((option: any) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[styles.booleanPill, selected && styles.booleanPillSelected]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.booleanText, selected && styles.booleanTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  assessmentTag: { alignSelf: 'flex-start', backgroundColor: '#E6FFFA', color: '#285E61', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  description: { fontSize: 14, color: '#718096', lineHeight: 20 },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#42A99D', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#718096' },
  domainCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  domainHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  domainTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A202C' },
  domainWeight: { fontSize: 12, color: '#2B6CB0', fontWeight: '700' },
  domainDescription: { fontSize: 13, color: '#718096', lineHeight: 18 },
  questionCard: { backgroundColor: '#F8FCFC', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  questionText: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  questionHint: { fontSize: 12, color: '#718096', lineHeight: 17 },
  optionsRow: { gap: 8 },
  optionPill: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#EDF2F7' },
  optionPillSelected: { backgroundColor: '#208AEF' },
  optionText: { fontSize: 13, color: '#4A5568' },
  optionTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  flagSection: { gap: 8 },
  flagSectionTitle: { fontSize: 13, fontWeight: '700', color: '#4A5568', textTransform: 'uppercase' },
  booleanRow: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, gap: 10 },
  booleanLabel: { fontSize: 14, color: '#2D3748', fontWeight: '600' },
  booleanOptions: { flexDirection: 'row', gap: 8 },
  booleanPill: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#EDF2F7', alignItems: 'center' },
  booleanPillSelected: { backgroundColor: '#805AD5' },
  booleanText: { fontSize: 13, color: '#4A5568', fontWeight: '600' },
  booleanTextSelected: { color: '#FFFFFF' },
  submitButton: { backgroundColor: '#208AEF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#FFFFFF', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  resultBadge: { alignSelf: 'flex-start', backgroundColor: '#C6F6D5', color: '#22543D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '800' },
  statRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#F8FCFC', padding: 14, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#42A99D' },
  statSub: { fontSize: 12, color: '#718096', marginTop: 4, textAlign: 'center' },
  summaryGrid: { gap: 4 },
  summaryLine: { fontSize: 13, color: '#4A5568' },
  noticeCard: { backgroundColor: '#EBF8FF', padding: 12, borderRadius: 10, gap: 4 },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: '#2B6CB0' },
  noticeBody: { fontSize: 13, color: '#2D3748' },
  domainResultCard: { backgroundColor: '#F8FCFC', padding: 14, borderRadius: 12, gap: 4 },
  domainResultTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  domainResultTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A202C' },
  domainResultScore: { fontSize: 15, fontWeight: '700', color: '#C53030' },
  domainMeta: { fontSize: 12, color: '#718096' },
  flagSummary: { fontSize: 12, color: '#9B2C2C' },
  protectiveSummary: { fontSize: 12, color: '#2F855A' },
  modifierCard: { backgroundColor: '#FFFAF0', padding: 12, borderRadius: 10, gap: 4 },
  limitationsText: { fontSize: 12, color: '#744210', lineHeight: 17 },
});
