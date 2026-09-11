import React, { useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { queueFairnessAnalysis, waitForDocumentAnalysis, type DocumentAnalysis } from '../documentIntelligenceApi';

export function DocumentFairnessViewerScreen() {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flags = useMemo(() => [
    ...(analysis?.bias?.signals || []),
    ...(analysis?.fairness?.framing_concerns || []),
  ], [analysis]);

  async function analyze() {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const queued = await queueFairnessAnalysis(inputText.trim());
      const result = await waitForDocumentAnalysis(queued.document_id);
      if (result.analysis?.status === 'failed') throw new Error(result.analysis.error_message || 'Analysis failed.');
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze this document.');
    } finally {
      setLoading(false);
    }
  }

  const fairnessScore = Math.round(analysis?.fairness?.score ?? analysis?.bias?.score ?? 0);
  const recommendations = analysis?.fairness?.remediation_recommendations || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>DOCUMENT FAIRNESS & RECONSTRUCTION</Text>
          <Text style={styles.title}>Caseworker Note Fairness Analyzer</Text>
          <Text style={styles.subtitle}>
            AI-assisted review of subjective framing, unsupported attribution, coercive language and evidence linkage. Results require human review and must not be treated as an automated case decision.
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Case Document Note Text</Text>
          <TextInput
            style={styles.textArea}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!loading}
            placeholder="Paste the document text to review…"
          />
          <TouchableOpacity
            style={[styles.analyzeButton, (!inputText.trim() || loading) && styles.disabledButton]}
            onPress={analyze}
            disabled={!inputText.trim() || loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.analyzeButtonText}>Analyze Framing & Detect Bias</Text>}
          </TouchableOpacity>
          {loading && <Text style={styles.statusText}>Queued securely for document-intelligence analysis…</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {analysis && (
          <View style={styles.resultsCard}>
            <Text style={styles.scoreTitle}>Fairness Analysis Overview</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreVal}>{fairnessScore} / 100</Text>
                <Text style={styles.scoreSub}>Objective Framing Score</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.flagCount}>{flags.length} Flags</Text>
                <Text style={styles.scoreSub}>Framing / Bias Signals</Text>
              </View>
            </View>

            {flags.length === 0 && (
              <View style={styles.neutralItem}>
                <Text style={styles.neutralText}>No material framing or bias signal was returned for this text. Human review is still required.</Text>
              </View>
            )}

            {flags.map((flag, index) => {
              const recommendation = recommendations[index];
              return (
                <View style={styles.flagItem} key={`${flag.category || 'flag'}-${index}`}>
                  <Text style={styles.flagTag}>{flag.category || 'Fairness concern'}{flag.language ? `: “${flag.language}”` : ''}</Text>
                  <Text style={styles.flagBody}>{flag.explanation || 'Review this wording against the source evidence and observable behaviour.'}</Text>
                  {recommendation && (
                    <>
                      <Text style={styles.reframeTag}>Constructive Reframe Recommendation:</Text>
                      <Text style={styles.reframeBody}>{recommendation.reframe}</Text>
                    </>
                  )}
                </View>
              );
            })}

            {(analysis.limitations || []).length > 0 && (
              <View style={styles.limitations}>
                <Text style={styles.limitationsTitle}>Limitations</Text>
                {(analysis.limitations || []).map((item, index) => <Text key={index} style={styles.limitationsText}>• {item}</Text>)}
              </View>
            )}
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
  badge: { alignSelf: 'flex-start', backgroundColor: '#EBF8FF', color: '#2B6CB0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#718096', lineHeight: 20 },
  inputCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  inputTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  textArea: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, minHeight: 130, fontSize: 14, color: '#2D3748', textAlignVertical: 'top' },
  analyzeButton: { backgroundColor: '#208AEF', padding: 14, borderRadius: 10, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  disabledButton: { opacity: 0.55 },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  statusText: { color: '#4A5568', fontSize: 12, textAlign: 'center' },
  errorText: { color: '#9B2C2C', fontSize: 13, backgroundColor: '#FFF5F5', padding: 10, borderRadius: 8 },
  resultsCard: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  scoreRow: { flexDirection: 'row', gap: 12 },
  scoreBox: { flex: 1, backgroundColor: '#F8FCFC', padding: 12, borderRadius: 8, alignItems: 'center' },
  scoreVal: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0' },
  flagCount: { fontSize: 20, fontWeight: 'bold', color: '#E53E3E' },
  scoreSub: { fontSize: 12, color: '#718096', marginTop: 2, textAlign: 'center' },
  flagItem: { backgroundColor: '#FFF5F5', padding: 14, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#E53E3E', gap: 4 },
  flagTag: { fontSize: 13, fontWeight: '700', color: '#9B2C2C' },
  flagBody: { fontSize: 13, color: '#4A5568' },
  reframeTag: { fontSize: 12, fontWeight: '700', color: '#2B6CB0', marginTop: 6 },
  reframeBody: { fontSize: 13, color: '#2D3748', fontStyle: 'italic' },
  neutralItem: { backgroundColor: '#F0FFF4', padding: 12, borderRadius: 8 },
  neutralText: { fontSize: 13, color: '#2F855A' },
  limitations: { backgroundColor: '#FFFAF0', padding: 12, borderRadius: 8, gap: 3 },
  limitationsTitle: { fontWeight: '700', color: '#744210', fontSize: 13 },
  limitationsText: { color: '#744210', fontSize: 12, lineHeight: 17 },
});
