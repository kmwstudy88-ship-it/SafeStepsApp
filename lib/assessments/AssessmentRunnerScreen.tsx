import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { CAPES_ASSESSMENT, scoreAssessment, StandardAssessment, AssessmentResult } from './assessmentDefinitions';

type ParentFeedback = {
  heading: string;
  explanation: string;
  nextStep: string;
  workerShareNote: string;
};

function getParentFeedback(result: AssessmentResult): ParentFeedback {
  if (result.clinicalBand === 'Elevated Concern') {
    return {
      heading: 'Extra support is recommended right now.',
      explanation:
        'Your answers suggest a higher level of stress or parenting difficulty in this check-in. This does not label you as a bad parent — it highlights where more support could make day-to-day family life feel safer and steadier.',
      nextStep: 'Bring this result to your worker, choose one small goal for this week, and pair it with a support action such as respite, coaching, or a safety-plan check-in.',
      workerShareNote: 'Shared in progress records so your worker can compare changes over time and respond to urgent patterns quickly.',
    };
  }

  if (result.clinicalBand === 'Moderate / Support Indicated') {
    return {
      heading: 'Some areas may need extra support.',
      explanation:
        'Your answers show a mix of strengths and pressure points. This usually means routines or emotions are manageable some days, but extra coaching, reflection, or practical support could help make things more consistent.',
      nextStep: 'Review the questions that felt hardest, pick one routine to strengthen this week, and add a follow-up note after your next worker or visit session.',
      workerShareNote: 'Stored as part of your progress story so you can show improvements, not just problems, over time.',
    };
  }

  return {
    heading: 'This check-in shows solid protective strengths today.',
    explanation:
      'Your answers suggest lower current concern or stronger confidence in this area. Keep using the strategies that are already helping, because stable patterns over time matter more than one good day.',
    nextStep: 'Save the result, note what is working well, and repeat the check-in after the next milestone or contact visit to keep tracking progress.',
    workerShareNote: 'Logged alongside future check-ins so strengths stay visible in reports as well as concerns.',
  };
}

export function AssessmentRunnerScreen({
  assessment = CAPES_ASSESSMENT,
  onComplete,
}: {
  assessment?: StandardAssessment;
  onComplete?: (result: AssessmentResult) => void;
}) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const likertOptions = useMemo(
    () =>
      assessment.scaleType === 'likert_1_5'
        ? [
            { label: '1 - Almost never', value: 1 },
            { label: '2 - Rarely', value: 2 },
            { label: '3 - Sometimes', value: 3 },
            { label: '4 - Often', value: 4 },
            { label: '5 - Almost always', value: 5 },
          ]
        : [
            { label: '0 - Not at all', value: 0 },
            { label: '1 - Sometimes', value: 1 },
            { label: '2 - Often', value: 2 },
            { label: '3 - Consistently', value: 3 },
          ],
    [assessment.scaleType]
  );

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
    const feedback = getParentFeedback(result);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.resultCard}>
            <Text style={styles.resultBadge}>ASSESSMENT COMPLETE</Text>
            <Text style={styles.title}>{assessment.fullTitle}</Text>
            <Text style={styles.bandLabel}>{result.clinicalBand}</Text>
            <Text style={styles.feedbackHeading}>{feedback.heading}</Text>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.totalScore} / {result.maxPossibleScore}</Text>
                <Text style={styles.statSub}>Total Score</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.percentage}%</Text>
                <Text style={styles.statSub}>Index</Text>
              </View>
            </View>

            <View style={styles.calloutBox}>
              <Text style={styles.calloutTitle}>What this means</Text>
              <Text style={styles.summaryText}>{feedback.explanation}</Text>
            </View>
            <View style={styles.calloutBox}>
              <Text style={styles.calloutTitle}>Suggested next step</Text>
              <Text style={styles.summaryText}>{feedback.nextStep}</Text>
            </View>
            <View style={styles.calloutBox}>
              <Text style={styles.calloutTitle}>What gets shared</Text>
              <Text style={styles.summaryText}>{feedback.workerShareNote}</Text>
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
          <Text style={styles.assessmentTag}>{assessment.name}</Text>
          <Text style={styles.title}>{assessment.fullTitle}</Text>
          <Text style={styles.description}>{assessment.description}</Text>
          <View style={styles.intakeCard}>
            <Text style={styles.intakeTitle}>Parent self-check-in</Text>
            <Text style={styles.intakeText}>Use this intake to show how things are going from your point of view. When you finish, you will get plain-language feedback, next-step guidance, and a timestamped result for your progress record.</Text>
          </View>
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
                {likertOptions.map((opt) => {
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
  intakeCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, marginTop: 6, gap: 6 },
  intakeTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  intakeText: { fontSize: 13, color: '#4A5568', lineHeight: 20 },
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
  feedbackHeading: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  statRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  statBox: { flex: 1, backgroundColor: '#F8FCFC', padding: 14, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#42A99D' },
  statSub: { fontSize: 12, color: '#718096', marginTop: 4 },
  calloutBox: { backgroundColor: '#F8FCFC', borderRadius: 12, padding: 14, gap: 6 },
  calloutTitle: { fontSize: 13, fontWeight: '700', color: '#2D3748', textTransform: 'uppercase' },
  summaryText: { fontSize: 14, color: '#4A5568', lineHeight: 22 },
});
