import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { BUILTIN_SCENARIOS, RoleplayScenario, ScenarioChoice, evaluateScenarioSession, ScenarioRunResult } from './scenarioEngine';

export function ScenarioSimulatorScreen({
  scenario = BUILTIN_SCENARIOS[0],
  onComplete,
  onExit,
}: {
  scenario?: RoleplayScenario;
  onComplete?: (result: ScenarioRunResult) => void;
  onExit?: () => void;
}) {
  const [currentStepId, setCurrentStepId] = useState<string>(scenario.initialStepId);
  const [selectedChoices, setSelectedChoices] = useState<ScenarioChoice[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<ScenarioRunResult | null>(null);

  const step = scenario.steps[currentStepId];

  const handleChoose = (choice: ScenarioChoice) => {
    const updated = [...selectedChoices, choice];
    setSelectedChoices(updated);
    setLatestFeedback(choice.immediateFeedback);

    if (choice.nextStepId && scenario.steps[choice.nextStepId] && choice.nextStepId !== 'step_finish') {
      setCurrentStepId(choice.nextStepId);
    } else {
      const evaluation = evaluateScenarioSession(scenario, updated);
      setResult(evaluation);
      onComplete?.(evaluation);
    }
  };

  const handleRestart = () => {
    setCurrentStepId(scenario.initialStepId);
    setSelectedChoices([]);
    setLatestFeedback(null);
    setResult(null);
  };

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.badge}>{scenario.difficultyLabel} Simulation</Text>
            <Text style={styles.title}>Session Evaluation</Text>
            <Text style={styles.proficiencyTag}>Proficiency: {result.overallProficiency}</Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreValue}>{result.deEscalationScore}%</Text>
                <Text style={styles.scoreLabel}>De-escalation</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreValue}>{result.emotionalRegulationScore}%</Text>
                <Text style={styles.scoreLabel}>Regulation</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreValue}>{result.connectionScore}%</Text>
                <Text style={styles.scoreLabel}>Connection</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Key Coaching Takeaways</Text>
            {result.recommendations.map((rec, i) => (
              <Text key={i} style={styles.bulletItem}>• {rec}</Text>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              {onExit && (
                <TouchableOpacity style={styles.primaryButton} onPress={onExit}>
                  <Text style={styles.primaryButtonText}>Finish Session</Text>
                </TouchableOpacity>
              )}
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
          <Text style={styles.badge}>{scenario.category.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.title}>{scenario.title}</Text>
          <Text style={styles.contextText}>{scenario.initialPrompt}</Text>
        </View>

        {step && (
          <View style={styles.dialogueBox}>
            <Text style={styles.speakerTag}>{step.speaker}</Text>
            <Text style={styles.dialogueText}>"{step.dialogue}"</Text>
            {step.contextCue ? <Text style={styles.cueText}>{step.contextCue}</Text> : null}
          </View>
        )}

        {latestFeedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Outcome</Text>
            <Text style={styles.feedbackBody}>{latestFeedback}</Text>
          </View>
        )}

        <Text style={styles.promptLabel}>Choose your response:</Text>
        <View style={styles.choicesList}>
          {step?.choices.map((choice) => (
            <TouchableOpacity
              key={choice.id}
              style={styles.choiceCard}
              onPress={() => handleChoose(choice)}
              activeOpacity={0.8}
            >
              <Text style={styles.choiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  contextText: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  dialogueBox: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  speakerTag: { fontSize: 13, fontWeight: '700', color: '#42A99D', textTransform: 'uppercase' },
  dialogueText: { fontSize: 18, fontStyle: 'italic', color: '#1A202C', lineHeight: 26 },
  cueText: { fontSize: 13, color: '#718096' },
  feedbackCard: { backgroundColor: '#EBF8FF', borderLeftWidth: 4, borderLeftColor: '#3182CE', padding: 12, borderRadius: 8 },
  feedbackTitle: { fontSize: 13, fontWeight: '700', color: '#2B6CB0' },
  feedbackBody: { fontSize: 13, color: '#2D3748', marginTop: 2 },
  promptLabel: { fontSize: 15, fontWeight: '700', color: '#2D3748', marginTop: 8 },
  choicesList: { gap: 12 },
  choiceCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#CBD5E0' },
  choiceText: { fontSize: 15, color: '#2D3748', lineHeight: 22 },
  card: { backgroundColor: '#FFFFFF', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 16 },
  proficiencyTag: { fontSize: 16, fontWeight: '700', color: '#208AEF' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  scoreBox: { flex: 1, alignItems: 'center', backgroundColor: '#F8FCFC', padding: 12, borderRadius: 10, marginHorizontal: 4 },
  scoreValue: { fontSize: 22, fontWeight: 'bold', color: '#42A99D' },
  scoreLabel: { fontSize: 12, color: '#4A5568', marginTop: 4 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  bulletItem: { fontSize: 14, color: '#4A5568', lineHeight: 20, marginBottom: 4 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryButton: { flex: 1, backgroundColor: '#208AEF', padding: 14, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondaryButton: { flex: 1, backgroundColor: '#EDF2F7', padding: 14, borderRadius: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#2D3748', fontWeight: '700', fontSize: 15 },
});
