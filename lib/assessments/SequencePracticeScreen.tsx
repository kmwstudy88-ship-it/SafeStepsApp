import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  safeStepsSequenceAssessmentDomains,
  safeStepsSequenceAssessmentItems,
  type SafeStepsSequenceAssessmentItem,
} from '../data/safeStepsSequenceAssessmentItems';
import {
  sequencePracticeDomainContent,
  sequencePracticeLimitations,
} from '../data/safeStepsSequencePracticeContent';
import {
  getShuffledSequenceSteps,
  isSequenceComplete,
  moveSelectedSequenceStep,
} from './sequencePracticeState';

export function SequencePracticeScreen() {
  const [domainId, setDomainId] = useState<string | null>(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const domainItems = useMemo(
    () => safeStepsSequenceAssessmentItems.filter((item) => item.domainId === domainId),
    [domainId]
  );
  const item = domainItems[itemIndex];
  const shuffledSteps = useMemo(() => item ? getShuffledSequenceSteps(item) : [], [item?.id]);
  const domain = safeStepsSequenceAssessmentDomains.find((candidate) => candidate.id === domainId);

  function beginTopic(selectedDomainId: string) {
    setDomainId(selectedDomainId);
    setItemIndex(0);
    setSelectedSteps([]);
    setShowSuggestion(false);
  }

  function returnToTopics() {
    setDomainId(null);
    setSelectedSteps([]);
    setShowSuggestion(false);
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSelectedSteps((current) => moveSelectedSequenceStep(current, index, direction));
  }

  function changeItem(direction: -1 | 1) {
    setItemIndex((current) => current + direction);
    setSelectedSteps([]);
    setShowSuggestion(false);
  }

  if (!domainId) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>LOCAL LEARNING PRACTICE</Text>
          <Text style={styles.title}>Putting steps in order</Text>
          <Text style={styles.body}>
            Explore short everyday examples, arrange the steps in an order that makes sense to you, then compare with the example's suggested sequence.
          </Text>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Practice, not a test</Text>
            <Text style={styles.body}>
              There is no score, pass mark, or saved record. Real situations can have more than one safe order, and these examples have not had their safety explanations reviewed item by item.
            </Text>
          </View>
        </View>

        {safeStepsSequenceAssessmentDomains.map((topic) => {
          const count = safeStepsSequenceAssessmentItems.filter((candidate) => candidate.domainId === topic.id).length;
          const guidance = sequencePracticeDomainContent[topic.id];
          return (
            <TouchableOpacity
              key={topic.id}
              accessibilityRole="button"
              style={styles.topicCard}
              onPress={() => beginTopic(topic.id)}
            >
              <View style={styles.topicTitleRow}>
                <Text style={styles.topicTitle}>{topic.name}</Text>
                <Text style={styles.countBadge}>{count}</Text>
              </View>
              <Text style={styles.body}>{guidance.summary}</Text>
              <Text style={styles.topicAction}>Choose topic ›</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>About this practice set</Text>
          {sequencePracticeLimitations.map((limitation) => (
            <Text key={limitation} style={styles.bullet}>• {limitation}</Text>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (!item || !domain) return null;

  const allStepsSelected = isSequenceComplete(selectedSteps, item.correctSequence);
  const guidance = sequencePracticeDomainContent[domainId];

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.backButton}
        onPress={returnToTopics}
      >
        <Text style={styles.backText}>‹ All topics</Text>
      </TouchableOpacity>

      <View style={styles.progressCard}>
        <Text style={styles.eyebrow}>{domain.name.toUpperCase()}</Text>
        <Text style={styles.body}>Example {itemIndex + 1} of {domainItems.length}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((itemIndex + 1) / domainItems.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>{item.prompt.split(':')[0]}</Text>
        <Text style={styles.body}>
          Choose a step below to add it to your order. You can move selected steps up or down before comparing.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your order</Text>
        {selectedSteps.length === 0 ? (
          <Text style={styles.body}>No steps selected yet.</Text>
        ) : selectedSteps.map((step, index) => (
          <View key={step} style={styles.selectedRow}>
            <Text style={styles.orderNumber}>{index + 1}</Text>
            <Text style={styles.selectedText}>{step}</Text>
            <View style={styles.moveActions}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Move ${step} up`}
                disabled={index === 0}
                onPress={() => moveStep(index, -1)}
                style={[styles.moveButton, index === 0 && styles.disabled]}
              >
                <Text style={styles.moveText}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Move ${step} down`}
                disabled={index === selectedSteps.length - 1}
                onPress={() => moveStep(index, 1)}
                style={[styles.moveButton, index === selectedSteps.length - 1 && styles.disabled]}
              >
                <Text style={styles.moveText}>↓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Remove ${step}`}
                onPress={() => setSelectedSteps((current) => current.filter((candidate) => candidate !== step))}
                style={styles.moveButton}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {selectedSteps.length > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              setSelectedSteps([]);
              setShowSuggestion(false);
            }}
          >
            <Text style={styles.clearText}>Clear and start again</Text>
          </TouchableOpacity>
        )}
      </View>

      {!showSuggestion && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Steps to consider</Text>
          <Text style={styles.body}>Select each step once. This exercise does not mark your choices right or wrong.</Text>
          {shuffledSteps.filter((step) => !selectedSteps.includes(step)).map((step) => (
            <TouchableOpacity
              key={step}
              accessibilityRole="button"
              onPress={() => setSelectedSteps((current) => [...current, step])}
              style={styles.stepButton}
            >
              <Text style={styles.stepButtonText}>{step}</Text>
              <Text style={styles.addMark}>+</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showSuggestion && (
        <View style={styles.suggestionCard}>
          <Text style={styles.sectionTitle}>One suggested sequence</Text>
          <Text style={styles.body}>
            This is the example answer supplied with this activity. It is not an official rule or the only possible safe order in a real situation.
          </Text>
          {item.correctSequence.map((step, index) => (
            <View key={step} style={styles.suggestedRow}>
              <Text style={styles.orderNumber}>{index + 1}</Text>
              <Text style={styles.selectedText}>{step}</Text>
            </View>
          ))}
          <Text style={styles.sectionTitle}>Think it through</Text>
          <Text style={styles.body}>{guidance.reflection}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setShowSuggestion(false)}
            style={styles.editButton}
          >
            <Text style={styles.clearText}>Edit your order</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.navigationRow}>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={itemIndex === 0}
          onPress={() => changeItem(-1)}
          style={[styles.secondaryButton, itemIndex === 0 && styles.disabled]}
        >
          <Text style={styles.secondaryText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={!allStepsSelected}
          onPress={() => setShowSuggestion(true)}
          style={[styles.primaryButton, (!allStepsSelected || showSuggestion) && styles.disabled]}
        >
          <Text style={styles.primaryText}>{showSuggestion ? "Compared" : "Compare example"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={itemIndex === domainItems.length - 1}
          onPress={() => changeItem(1)}
          style={[styles.secondaryButton, itemIndex === domainItems.length - 1 && styles.disabled]}
        >
          <Text style={styles.secondaryText}>Next</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>Your practice stays in this screen's memory only. It is not saved or shared.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  hero: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 18, gap: 10 },
  eyebrow: { color: '#287C70', fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  title: { color: '#102033', fontSize: 22, fontWeight: '800' },
  body: { color: '#526173', fontSize: 14, lineHeight: 21 },
  notice: { backgroundColor: '#F2F7FA', borderRadius: 12, padding: 14, gap: 7 },
  noticeTitle: { color: '#23384D', fontSize: 15, fontWeight: '700' },
  topicCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, gap: 8 },
  topicTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  topicTitle: { flex: 1, color: '#102033', fontSize: 16, fontWeight: '700' },
  countBadge: { color: '#176B62', backgroundColor: '#EFF8F6', overflow: 'hidden', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '800' },
  topicAction: { color: '#176B62', fontSize: 13, fontWeight: '700', marginTop: 2 },
  bullet: { color: '#526173', fontSize: 13, lineHeight: 19 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 12 },
  backText: { color: '#176B62', fontSize: 14, fontWeight: '700' },
  progressCard: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  progressTrack: { height: 7, backgroundColor: '#E7EDF2', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 7, backgroundColor: '#287C70', borderRadius: 4 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 14, padding: 16, gap: 10 },
  sectionTitle: { color: '#102033', fontSize: 16, fontWeight: '700' },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F5F8FA', padding: 9, borderRadius: 10 },
  suggestedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 5 },
  orderNumber: { color: '#176B62', fontSize: 13, fontWeight: '800', backgroundColor: '#E3F2EF', textAlign: 'center', overflow: 'hidden', width: 24, height: 24, borderRadius: 12, paddingTop: 4 },
  selectedText: { flex: 1, color: '#34465A', fontSize: 14, lineHeight: 20 },
  moveActions: { flexDirection: 'row', gap: 3 },
  moveButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#E8EEF2' },
  moveText: { color: '#34465A', fontSize: 17, fontWeight: '700' },
  removeText: { color: '#8A3B32', fontSize: 18, fontWeight: '600' },
  disabled: { opacity: 0.45 },
  clearText: { color: '#4E6477', fontSize: 13, textDecorationLine: 'underline', alignSelf: 'flex-start' },
  stepButton: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F5F8FA', borderWidth: 1, borderColor: '#E0E7EC', borderRadius: 10, padding: 12 },
  stepButtonText: { flex: 1, color: '#34465A', fontSize: 14, lineHeight: 20 },
  addMark: { color: '#176B62', fontSize: 20, fontWeight: '700' },
  suggestionCard: { backgroundColor: '#EFF8F6', borderWidth: 1, borderColor: '#CFE5E0', borderRadius: 14, padding: 16, gap: 10 },
  editButton: { alignSelf: 'flex-start', paddingVertical: 4 },
  navigationRow: { flexDirection: 'row', gap: 7 },
  primaryButton: { flex: 1.15, minHeight: 44, backgroundColor: '#176B62', borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7 },
  primaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  secondaryButton: { flex: 0.8, minHeight: 44, backgroundColor: '#FFFFFF', borderColor: '#CBD5DF', borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7 },
  secondaryText: { color: '#34465A', fontSize: 13, fontWeight: '700' },
  footer: { color: '#64748B', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
