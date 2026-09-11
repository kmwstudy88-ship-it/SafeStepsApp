import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

const { analyzeDocumentFairness } = require('../../shared/apiClient');

type FairnessResponse = {
  fairness_score: number;
  bias_indicators: Array<{ category: string; severity: string; evidence: string; explanation: string }>;
  framing_concerns: Array<{ category: string; severity: string; evidence: string; explanation: string }>;
  remediation_recommendations: Array<{ concern: string; reframe: string }>;
};

const DEFAULT_TEXT =
  'Mother failed to cooperate during the morning check. Mother refused to follow instructions and became emotionally hostile when questioned about attendance.';

export function DocumentFairnessViewerScreen() {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FairnessResponse | null>(null);

  const visibleFlags = useMemo(() => {
    return [
      ...(result?.bias_indicators || []).map((entry) => ({
        title: `${entry.category}: "${entry.evidence}"`,
        explanation: entry.explanation,
      })),
      ...(result?.framing_concerns || []).map((entry) => ({
        title: `${entry.category}: "${entry.evidence}"`,
        explanation: entry.explanation,
      })),
    ];
  }, [result]);

  async function handleAnalyze() {
    if (!inputText.trim()) {
      setError('Please enter case note text before analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeDocumentFairness(inputText);
      setResult(response);
    } catch (analysisError: any) {
      setError(analysisError?.message || 'Fairness analysis failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>DOCUMENT FAIRNESS & RECONSTRUCTION</Text>
          <Text style={styles.title}>Caseworker Note Fairness Analyzer</Text>
          <Text style={styles.subtitle}>
            Detects subjective bias, uncalibrated framing, or coercion language in casework records and suggests fair reframing.
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Case Document Note Text</Text>
          <TextInput style={styles.textArea} value={inputText} onChangeText={setInputText} multiline />
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze Framing & Detect Bias</Text>
            )}
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {result ? (
          <View style={styles.resultsCard}>
            <Text style={styles.scoreTitle}>Fairness Analysis Overview</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreVal}>{result.fairness_score} / 100</Text>
                <Text style={styles.scoreSub}>Objective Framing Score</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreVal, { color: '#E53E3E' }]}>{visibleFlags.length} Flags</Text>
                <Text style={styles.scoreSub}>Subjective Attribution</Text>
              </View>
            </View>

            {visibleFlags.length ? (
              visibleFlags.map((item, index) => (
                <View style={styles.flagItem} key={`${item.title}-${index}`}>
                  <Text style={styles.flagTag}>{item.title}</Text>
                  <Text style={styles.flagBody}>{item.explanation}</Text>
                  {result.remediation_recommendations[index] ? (
                    <>
                      <Text style={styles.reframeTag}>Constructive Reframe Recommendation:</Text>
                      <Text style={styles.reframeBody}>
                        "{result.remediation_recommendations[index].reframe}"
                      </Text>
                    </>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.scoreSub}>No major framing concerns detected for this sample.</Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#EBF8FF', color: '#2B6CB0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#718096', lineHeight: 20 },
  inputCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  inputTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  textArea: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, minHeight: 90, fontSize: 14, color: '#2D3748', textAlignVertical: 'top' },
  analyzeButton: { backgroundColor: '#208AEF', padding: 14, borderRadius: 10, alignItems: 'center' },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  errorText: { color: '#C53030', fontSize: 13 },
  resultsCard: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  scoreRow: { flexDirection: 'row', gap: 12 },
  scoreBox: { flex: 1, backgroundColor: '#F8FCFC', padding: 12, borderRadius: 8, alignItems: 'center' },
  scoreVal: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0' },
  scoreSub: { fontSize: 12, color: '#718096', marginTop: 2 },
  flagItem: { backgroundColor: '#FFF5F5', padding: 14, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#E53E3E', gap: 4 },
  flagTag: { fontSize: 13, fontWeight: '700', color: '#9B2C2C' },
  flagBody: { fontSize: 13, color: '#4A5568' },
  reframeTag: { fontSize: 12, fontWeight: '700', color: '#2B6CB0', marginTop: 6 },
  reframeBody: { fontSize: 13, color: '#2D3748', fontStyle: 'italic' },
});
