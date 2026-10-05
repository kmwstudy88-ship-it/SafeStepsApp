import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  protectiveCapacityContentLimitations,
  protectiveCapacityDomainContent,
  protectiveCapacityItemContent,
} from '../data/safeStepsProtectiveCapacityContent';
import {
  safeStepsCriticalOverrides,
  safeStepsProtectiveCapacityDomains,
  safeStepsProtectiveCapacityItems,
  safeStepsScoringBands,
} from '../data/safeStepsAssessmentInstrument';
import type { AssessmentResponse } from '../data/safeStepsAssessmentInstrument';
import { scoreAssessment } from '../engines/assessmentScoringEngine';

const domainDisplayNames: Record<string, string> = {
  "anti-gaming": "Communication and change over time",
};

export function ProtectiveCapacityReflectionScreen() {
  const [started, setStarted] = useState(false);
  const [domainIndex, setDomainIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  const domain = safeStepsProtectiveCapacityDomains[domainIndex];
  const domainItems = useMemo(
    () => safeStepsProtectiveCapacityItems.filter((item) => item.domainId === domain?.id),
    [domain]
  );
  const answeredCount = Object.keys(responses).length;
  const progressPercent = Math.round((answeredCount / safeStepsProtectiveCapacityItems.length) * 100);
  const scoreResult = showResults
    ? scoreAssessment({
      domains: safeStepsProtectiveCapacityDomains,
      items: safeStepsProtectiveCapacityItems,
      responses: Object.entries(responses).map(([itemId, selectedOptionId]): AssessmentResponse => ({
        itemId,
        selectedOptionId,
      })),
      bands: safeStepsScoringBands,
      criticalOverrides: safeStepsCriticalOverrides,
    })
    : null;

  useEffect(() => {
    if (started && !showResults) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [domainIndex, showResults, started]);

  function setAnswer(itemId: string, selectedOptionId?: string) {
    setResponses((current) => {
      const updated = { ...current };
      if (selectedOptionId) updated[itemId] = selectedOptionId;
      else delete updated[itemId];
      return updated;
    });
  }

  function startOver() {
    setResponses({});
    setDomainIndex(0);
    setShowResults(false);
    setStarted(true);
  }

  if (!started) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>PRIVATE SELF-REFLECTION</Text>
          <Text style={styles.title}>Protective capacity</Text>
          <Text style={styles.body}>
            Reflect on practical strengths, support needs, and questions you may want to discuss. There are no perfect answers, and you can skip anything you cannot answer.
          </Text>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Before you begin</Text>
            <Text style={styles.body}>
              This is an unvalidated reflection prototype, not a professional assessment. It does not decide whether a child is safe or ready for reunification.
            </Text>
            <Text style={styles.body}>
              Your answers stay in this screen's memory only. They are not saved or shared; leaving or resetting this screen clears them.
            </Text>
          </View>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>If there is immediate danger</Text>
            <Text style={styles.body}>
              Do not wait for a questionnaire result. Contact local emergency services or a trusted safe person.
            </Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStarted(true)}>
            <Text style={styles.primaryButtonText}>Begin reflection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (showResults && scoreResult) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>REFLECTION SUMMARY</Text>
          <Text style={styles.title}>A guide for reflection</Text>
          <Text style={styles.body}>
            {scoreResult.answeredItems} of {scoreResult.totalItems} prompts answered ({scoreResult.coveragePercent}% coverage). This is not a score of your parenting or a measure of safety.
          </Text>
          {scoreResult.criticalOverridesApplied.length > 0 && (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>A response needs a real conversation</Text>
              <Text style={styles.body}>
                Please discuss the concern you selected with a qualified support person. This tool cannot assess the situation or decide what should happen next.
              </Text>
            </View>
          )}
        </View>

        {safeStepsProtectiveCapacityDomains.map((resultDomain) => {
          const content = protectiveCapacityDomainContent[resultDomain.id];
          const details = scoreResult.domainScores.find((entry) => entry.domainId === resultDomain.id);
          return (
            <View key={resultDomain.id} style={styles.card}>
              <Text style={styles.cardTitle}>{domainDisplayNames[resultDomain.id] || resultDomain.name}</Text>
              <Text style={styles.body}>
                {details?.answeredItems || 0} of {details?.totalItems || 0} prompts answered
              </Text>
              <Text style={styles.sectionLabel}>A question to reflect on</Text>
              <Text style={styles.body}>{content.reflectionPrompt}</Text>
              <Text style={styles.sectionLabel}>A possible next step</Text>
              <Text style={styles.body}>{content.nextStep}</Text>
              {content.caution && <Text style={styles.cautionText}>{content.caution}</Text>}
            </View>
          );
        })}

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Important limits</Text>
          {protectiveCapacityContentLimitations.map((limitation) => (
            <Text key={limitation} style={styles.bulletText}>• {limitation}</Text>
          ))}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => {
            setShowResults(false);
            setDomainIndex(0);
          }}>
            <Text style={styles.secondaryButtonText}>Edit answers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={startOver}>
            <Text style={styles.primaryButtonText}>Start again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const domainContent = protectiveCapacityDomainContent[domain.id];
  const isLastDomain = domainIndex === safeStepsProtectiveCapacityDomains.length - 1;

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
      <View style={styles.progressCard}>
        <Text style={styles.eyebrow}>TOPIC {domainIndex + 1} OF {safeStepsProtectiveCapacityDomains.length}</Text>
        <Text style={styles.progressText}>{answeredCount} of {safeStepsProtectiveCapacityItems.length} prompts answered</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{domainDisplayNames[domain.id] || domain.name}</Text>
        <Text style={styles.body}>{domainContent.summary}</Text>
        {domainContent.caution && (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Use care with this topic</Text>
            <Text style={styles.body}>{domainContent.caution}</Text>
          </View>
        )}
      </View>

      {domainItems.map((item) => {
        const itemContent = protectiveCapacityItemContent[item.id];
        return (
          <View key={item.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{itemContent.prompt}</Text>
            <Text style={styles.body}>{itemContent.context}</Text>
            {item.options?.map((option) => {
              const selected = responses[item.id] === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => setAnswer(item.id, option.id)}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setAnswer(item.id)}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>
                {responses[item.id] ? "Clear answer — I don't know / not enough information" : "I don't know / not enough information"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.nextStepCard}>
        <Text style={styles.sectionLabel}>Try this next</Text>
        <Text style={styles.body}>{domainContent.nextStep}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, domainIndex === 0 && styles.disabledButton]}
          disabled={domainIndex === 0}
          onPress={() => setDomainIndex((current) => Math.max(0, current - 1))}
        >
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            if (isLastDomain) setShowResults(true);
            else setDomainIndex((current) => current + 1);
          }}
        >
          <Text style={styles.primaryButtonText}>{isLastDomain ? "Review reflections" : "Next topic"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footerNote}>You can skip any prompt. Nothing here is saved or sent to anyone.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  heroCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  eyebrow: { color: '#287C70', fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  title: { color: '#102033', fontSize: 23, fontWeight: '800' },
  body: { color: '#526173', fontSize: 14, lineHeight: 21 },
  noticeCard: { backgroundColor: '#F2F7FA', padding: 14, borderRadius: 12, gap: 7 },
  noticeTitle: { color: '#23384D', fontSize: 15, fontWeight: '700' },
  primaryButton: { backgroundColor: '#176B62', borderRadius: 10, minHeight: 46, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flex: 1 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  progressText: { color: '#526173', fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 7, backgroundColor: '#E7EDF2', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 7, backgroundColor: '#287C70', borderRadius: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { color: '#102033', fontSize: 17, fontWeight: '700' },
  sectionLabel: { color: '#287C70', fontSize: 12, fontWeight: '800', marginTop: 4 },
  questionCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  questionText: { color: '#102033', fontSize: 16, fontWeight: '700', lineHeight: 23 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: '#D8E1E8', borderRadius: 10, backgroundColor: '#FFFFFF' },
  optionSelected: { borderColor: '#287C70', backgroundColor: '#EFF8F6' },
  optionText: { flex: 1, color: '#34465A', fontSize: 14, lineHeight: 20 },
  optionTextSelected: { color: '#14594F', fontWeight: '700' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#8291A0' },
  radioSelected: { borderColor: '#287C70', borderWidth: 6 },
  skipButton: { alignSelf: 'flex-start', paddingVertical: 5 },
  skipText: { color: '#4E6477', fontSize: 13, textDecorationLine: 'underline' },
  nextStepCard: { backgroundColor: '#EFF8F6', borderRadius: 12, padding: 14, gap: 6 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  secondaryButton: { backgroundColor: '#FFFFFF', borderColor: '#CBD5DF', borderWidth: 1, borderRadius: 10, minHeight: 46, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flex: 1 },
  secondaryButtonText: { color: '#34465A', fontSize: 14, fontWeight: '700' },
  disabledButton: { opacity: 0.45 },
  footerNote: { color: '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  alertCard: { backgroundColor: '#FFF5E8', borderColor: '#F0C98C', borderWidth: 1, borderRadius: 12, padding: 14, gap: 7 },
  alertTitle: { color: '#75410B', fontSize: 15, fontWeight: '800' },
  cautionText: { color: '#75410B', fontSize: 13, lineHeight: 19, backgroundColor: '#FFF7E8', padding: 10, borderRadius: 8 },
  bulletText: { color: '#526173', fontSize: 13, lineHeight: 19 },
});
