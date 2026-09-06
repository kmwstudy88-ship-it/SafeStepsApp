import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export function DocumentFairnessViewerScreen() {
  const [inputText, setInputText] = useState(
    "Mother failed to cooperate during the morning check. Mother refused to follow instructions and became emotionally hostile when questioned about attendance."
  );

  const [analyzed, setAnalyzed] = useState(true);

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
          <TextInput
            style={styles.textArea}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.analyzeButton} onPress={() => setAnalyzed(true)}>
            <Text style={styles.analyzeButtonText}>Analyze Framing & Detect Bias</Text>
          </TouchableOpacity>
        </View>

        {analyzed && (
          <View style={styles.resultsCard}>
            <Text style={styles.scoreTitle}>Fairness Analysis Overview</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreVal}>42 / 100</Text>
                <Text style={styles.scoreSub}>Objective Framing Score</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreVal, { color: '#E53E3E' }]}>2 Flags</Text>
                <Text style={styles.scoreSub}>Subjective Attribution</Text>
              </View>
            </View>

            <View style={styles.flagItem}>
              <Text style={styles.flagTag}>Subjective Labeling: "Failed to cooperate"</Text>
              <Text style={styles.flagBody}>Does not describe the factual action. Lacks context of what occurred.</Text>
              <Text style={styles.reframeTag}>Constructive Reframe Recommendation:</Text>
              <Text style={styles.reframeBody}>"Mother requested to reschedule the conversation due to school drop-off time."</Text>
            </View>

            <View style={styles.flagItem}>
              <Text style={styles.flagTag}>Hostility Attribution: "Became emotionally hostile"</Text>
              <Text style={styles.flagBody}>Clinical term without objective observable behaviors (e.g. vocal volume, words spoken).</Text>
              <Text style={styles.reframeTag}>Constructive Reframe Recommendation:</Text>
              <Text style={styles.reframeBody}>"Mother spoke with raised volume and expressed distress regarding appointment conflicts."</Text>
            </View>
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
  textArea: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, minHeight: 90, fontSize: 14, color: '#2D3748', textAlignVertical: 'top' },
  analyzeButton: { backgroundColor: '#208AEF', padding: 14, borderRadius: 10, alignItems: 'center' },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
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
