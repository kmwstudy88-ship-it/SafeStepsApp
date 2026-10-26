import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  attachDailyChallengeEvidence,
  buildDailyChallengeSummary,
  claimChallengeReward,
  completeDailyChallengeTask,
  getClaimedChallengeRewards,
  getDailyChallengeSettings,
  getStoredChallengeTasks,
  saveDailyChallengePreferences,
  startDailyChallengeTask,
  subscribeToDailyChallengeTasks,
  type ChallengeTaskRecord,
} from '../lib/dailyChallengesFlow';
import type { SafeStepsParentChallenge } from '../lib/data/safestepsParentChallenges';

export default function DailyChallengesScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ChallengeTaskRecord[]>([]);
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<SafeStepsParentChallenge | null>(null);
  const [reflection, setReflection] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [paused, setPaused] = useState(false);

  const summary = useMemo(
    () => buildDailyChallengeSummary(tasks, claimedRewardIds),
    [tasks, claimedRewardIds],
  );

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToDailyChallengeTasks((nextTasks) => {
      if (active) setTasks(nextTasks);
    });

    Promise.all([
      getStoredChallengeTasks(),
      getClaimedChallengeRewards(),
      getDailyChallengeSettings(),
    ]).then(([storedTasks, storedRewards, storedSettings]) => {
      if (!active) return;
      setTasks(storedTasks);
      setClaimedRewardIds(storedRewards);
      setPaused(storedSettings.paused);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleStart(challenge: SafeStepsParentChallenge) {
    setStatusMessage('');
    await startDailyChallengeTask(challenge.id);
    setSelectedChallenge(challenge);
  }

  async function handleCompleteWithEvidence() {
    if (!selectedChallenge) return;
    setStatusMessage('');
    try {
      await attachDailyChallengeEvidence({
        challengeId: selectedChallenge.id,
        reflection,
        evidenceNote,
      });
      await completeDailyChallengeTask(selectedChallenge.id);
      setReflection('');
      setEvidenceNote('');
      setStatusMessage(`Completed "${selectedChallenge.displayTitle}" (+150 points)!`);
      setSelectedChallenge(null);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Could not complete challenge.',
      );
    }
  }

  async function handleClaimReward(rewardId: string) {
    setStatusMessage('');
    try {
      const result = await claimChallengeReward(rewardId, summary.points);
      setClaimedRewardIds(result.claimedRewardIds);
      setStatusMessage(`${result.reward.label} claimed!`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Could not claim reward.',
      );
    }
  }

  async function handleTogglePause(nextPaused: boolean) {
    setPaused(nextPaused);
    const current = await getDailyChallengeSettings();
    await saveDailyChallengePreferences({ ...current, paused: nextPaused });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back to SafeSteps Hub</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.badge}>EVIDENCE-BACKED DAILY PRACTICE</Text>
          <Text style={styles.title}>Daily Challenges</Text>
          <Text style={styles.subtitle}>
            Complete child-centred daily challenges, attach factual reflection evidence, build streaks, and claim milestones.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {summary.completedCount}/{summary.totalCount}
            </Text>
            <Text style={styles.statLabel}>Completed Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.streak}d</Text>
            <Text style={styles.statLabel}>Active Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.points}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        {statusMessage ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{statusMessage}</Text>
          </View>
        ) : null}

        {selectedChallenge ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{selectedChallenge.displayTitle}</Text>
            <Text style={styles.bodyText}>{selectedChallenge.purpose}</Text>
            <Text style={styles.metaText}>{selectedChallenge.evidenceTask}</Text>
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="Write your reflection on how you practised this challenge..."
              multiline
              style={styles.input}
            />
            <TextInput
              value={evidenceNote}
              onChangeText={setEvidenceNote}
              placeholder="Optional factual evidence note..."
              multiline
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Pressable onPress={handleCompleteWithEvidence} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Save Evidence & Complete</Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedChallenge(null)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today&apos;s Challenges</Text>
          {summary.challenges.map((challenge) => {
            const task = tasks.find((item) => item.challenge_id === challenge.id);
            const isCompleted = task?.status === 'completed';
            return (
              <View key={challenge.id} style={styles.challengeItem}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.challengeTitle}>{challenge.displayTitle}</Text>
                  <Text style={styles.metaText}>
                    {challenge.estimatedTime} • {challenge.category} • 150 pts
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleStart(challenge)}
                  style={[
                    styles.smallButton,
                    isCompleted && { backgroundColor: '#DDF2E8' },
                  ]}
                >
                  <Text
                    style={[
                      styles.smallButtonText,
                      isCompleted && { color: '#005B5D' },
                    ]}
                  >
                    {isCompleted ? 'Completed' : task ? 'Continue' : 'Start'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reward Milestones</Text>
          {summary.rewards.map((reward) => (
            <View key={reward.id} style={styles.challengeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeTitle}>
                  {reward.label} ({reward.points} pts)
                </Text>
                <Text style={styles.metaText}>{reward.description}</Text>
              </View>
              {reward.claimed ? (
                <Text style={styles.claimedPill}>Claimed</Text>
              ) : reward.canClaim ? (
                <Pressable
                  onPress={() => handleClaimReward(reward.id)}
                  style={styles.smallButton}
                >
                  <Text style={styles.smallButtonText}>Claim</Text>
                </Pressable>
              ) : (
                <Text style={styles.metaText}>Locked</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.challengeItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.challengeTitle}>Pause Daily Challenge Reminders</Text>
              <Text style={styles.metaText}>
                Take a break while keeping your completed progress and evidence safe.
              </Text>
            </View>
            <Switch value={paused} onValueChange={handleTogglePause} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FCFA' },
  scroll: { padding: 20, gap: 16 },
  backText: { color: '#005B5D', fontSize: 15, fontWeight: '700' },
  header: { gap: 6 },
  badge: { color: '#007C7A', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  title: { color: '#113C3D', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#607174', fontSize: 15, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E6E2',
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { color: '#113C3D', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#607174', fontSize: 12, fontWeight: '600' },
  noticeCard: {
    backgroundColor: '#EEF8F4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E6E2',
    padding: 14,
  },
  noticeText: { color: '#005B5D', fontSize: 14, fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E6E2',
    padding: 16,
    gap: 12,
  },
  sectionTitle: { color: '#113C3D', fontSize: 18, fontWeight: '900' },
  bodyText: { color: '#113C3D', fontSize: 14, lineHeight: 20 },
  metaText: { color: '#607174', fontSize: 12, lineHeight: 18 },
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: '#D5E6E2',
    borderRadius: 8,
    padding: 10,
    color: '#113C3D',
    textAlignVertical: 'top',
  },
  buttonRow: { flexDirection: 'row', gap: 10 },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007C7A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E8F3EF',
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#005B5D', fontWeight: '800', fontSize: 14 },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEF4F2',
  },
  challengeTitle: { color: '#113C3D', fontSize: 15, fontWeight: '800' },
  smallButton: {
    backgroundColor: '#007C7A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  claimedPill: {
    backgroundColor: '#DDF2E8',
    color: '#005B5D',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
