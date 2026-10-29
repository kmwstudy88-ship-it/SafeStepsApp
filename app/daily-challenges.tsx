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
import { Link, type Href, useRouter } from 'expo-router';
import {
  attachDailyChallengeEvidence,
  buildDailyChallengeSummary,
  claimChallengeReward,
  completeDailyChallengeTask,
  getChallengePoints,
  getClaimedChallengeRewards,
  getDailyChallengeSettings,
  getStoredChallengeTasks,
  pauseChallengeForBreak,
  resumeChallengeFromBreak,
  saveDailyChallengePreferences,
  startDailyChallengeTask,
  subscribeToDailyChallengeTasks,
  type ChallengeTaskRecord,
} from '../lib/dailyChallengesFlow';
import {
  familyChallenges,
  getChallengeSafeguardMetadata,
  getChallengeTrack,
  personalChallenges,
  weekendActivityChallenges,
} from '../lib/data/familyChallenges';
import type { SafeStepsParentChallenge } from '../lib/data/safestepsParentChallenges';

type PracticeTab = 'daily' | 'personal' | 'family' | 'weekend';

const PRACTICE_TABS: readonly { id: PracticeTab; label: string; subtitle: string }[] = [
  {
    id: 'daily',
    label: 'Daily Focus (8)',
    subtitle: 'Core daily habits for streak & reward milestones',
  },
  {
    id: 'personal',
    label: 'Personal Growth',
    subtitle: 'Parent self-regulation, grounding & progress evidence',
  },
  {
    id: 'family',
    label: 'Family & Child',
    subtitle: 'Voluntary connection, child voice & routines (SS-PCD-030)',
  },
  {
    id: 'weekend',
    label: 'Weekend Bonding',
    subtitle: 'Visit-friendly & weekend connection activities',
  },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export default function DailyChallengesScreen() {
  const router = useRouter();
  const [practiceTab, setPracticeTab] = useState<PracticeTab>('daily');
  const [tasks, setTasks] = useState<ChallengeTaskRecord[]>([]);
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<SafeStepsParentChallenge | null>(null);
  const [reflection, setReflection] = useState('');
  const [childPerspective, setChildPerspective] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [paused, setPaused] = useState(false);

  const summary = useMemo(
    () => buildDailyChallengeSummary(tasks, claimedRewardIds),
    [tasks, claimedRewardIds],
  );

  const displayedChallenges = useMemo(() => {
    if (practiceTab === 'personal') return personalChallenges.slice(0, 12);
    if (practiceTab === 'family') return familyChallenges.slice(0, 12);
    if (practiceTab === 'weekend') return weekendActivityChallenges.slice(0, 12);
    return summary.challenges;
  }, [practiceTab, summary.challenges]);

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

  async function handleTakeBreak(challenge: SafeStepsParentChallenge) {
    setStatusMessage('');
    try {
      await pauseChallengeForBreak(
        challenge.id,
        'Stepping away for a calm break (SS-PCD-036)',
      );
      setStatusMessage(
        `Paused "${challenge.displayTitle}" for a break (SS-PCD-036). Your progress and streak are safe with zero penalty.`,
      );
      if (selectedChallenge?.id === challenge.id) {
        setSelectedChallenge(null);
      }
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Could not pause challenge.',
      );
    }
  }

  async function handleResumeBreak(challenge: SafeStepsParentChallenge) {
    setStatusMessage('');
    try {
      await resumeChallengeFromBreak(challenge.id);
      setSelectedChallenge(challenge);
      setStatusMessage(`Resumed "${challenge.displayTitle}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Could not resume challenge.',
      );
    }
  }

  async function handleCompleteWithEvidence() {
    if (!selectedChallenge) return;
    setStatusMessage('');
    try {
      const track = getChallengeTrack(selectedChallenge);
      const pts = getChallengePoints(selectedChallenge);
      await attachDailyChallengeEvidence({
        challengeId: selectedChallenge.id,
        reflection,
        evidenceNote,
        childPerspectiveNote: track === 'family' ? childPerspective : undefined,
        sharedWithChild: track === 'family' && childPerspective.trim().length > 0,
      });
      await completeDailyChallengeTask(selectedChallenge.id);
      setReflection('');
      setChildPerspective('');
      setEvidenceNote('');
      setStatusMessage(`Completed "${selectedChallenge.displayTitle}" (+${pts} points)!`);
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

  const selectedTrack = selectedChallenge ? getChallengeTrack(selectedChallenge) : null;
  const selectedSafeguards = selectedChallenge
    ? getChallengeSafeguardMetadata(selectedChallenge)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back to SafeSteps Hub</Text>
          </Pressable>
          <Link href={'/challenges' as Href} asChild>
            <Pressable>
              <Text style={styles.catalogueLink}>Browse All 104 Challenges →</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.header}>
          <Text style={styles.badge}>EVIDENCE-BACKED PERSONAL & FAMILY PRACTICE</Text>
          <Text style={styles.title}>Daily & Family Challenges</Text>
          <Text style={styles.subtitle}>
            Complete personal self-regulation and voluntary child-centred family challenges, attach factual reflection evidence, build non-punitive streaks, and claim milestones.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {summary.completedCount}/{summary.totalCount}
            </Text>
            <Text style={styles.statLabel}>Daily Focus</Text>
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

        {/* Track Breakdown & 7-Day Activity */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownTop}>
            <Text style={styles.breakdownText}>
              🧘 Personal Completed: <Text style={styles.boldText}>{summary.personalCompletedCount}</Text>
            </Text>
            <Text style={styles.breakdownText}>
              👨‍👧 Family Completed: <Text style={styles.boldText}>{summary.familyCompletedCount}</Text>
            </Text>
            {summary.activeBreakCount > 0 ? (
              <Text style={styles.breakCountText}>
                ⏸ On Break: {summary.activeBreakCount}
              </Text>
            ) : null}
          </View>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, idx) => {
              const active = summary.weekActivity[idx];
              return (
                <View
                  key={day}
                  style={[styles.dayPill, active && styles.dayPillActive]}
                >
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {statusMessage ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{statusMessage}</Text>
          </View>
        ) : null}

        {selectedChallenge ? (
          <View style={styles.card}>
            <View style={styles.selectedHeaderRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.trackPill}>
                  {selectedTrack === 'personal'
                    ? '🧘 Personal Parent Challenge'
                    : '👨‍👧 Family & Parent–Child Challenge'}
                </Text>
                <Text style={styles.sectionTitle}>{selectedChallenge.displayTitle}</Text>
              </View>
              <Pressable
                onPress={() => handleTakeBreak(selectedChallenge)}
                style={styles.breakButton}
              >
                <Text style={styles.breakButtonText}>⏸ I Need a Break</Text>
              </Pressable>
            </View>

            <Text style={styles.bodyText}>{selectedChallenge.purpose}</Text>
            <Text style={styles.metaText}>{selectedChallenge.evidenceTask}</Text>

            {selectedSafeguards ? (
              <View style={styles.safeguardBanner}>
                <Text style={styles.safeguardBannerText}>
                  🛡️ {selectedSafeguards.safeguardSummary}
                </Text>
              </View>
            ) : null}

            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="Write your parent reflection on how you practised this challenge..."
              multiline
              style={styles.input}
            />

            {selectedTrack === 'family' ? (
              <TextInput
                value={childPerspective}
                onChangeText={setChildPerspective}
                placeholder="Optional: Child's shared perspective or words (only if freely shared — no pressure, SS-PCD-043)..."
                multiline
                style={styles.inputSmall}
              />
            ) : null}

            <TextInput
              value={evidenceNote}
              onChangeText={setEvidenceNote}
              placeholder="Optional factual evidence note..."
              multiline
              style={styles.inputSmall}
            />
            <View style={styles.buttonRow}>
              <Pressable onPress={handleCompleteWithEvidence} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Save Evidence & Complete (+{getChallengePoints(selectedChallenge)} pts)
                </Text>
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

        {/* Practice Mode Switcher */}
        <View style={styles.tabsRow}>
          {PRACTICE_TABS.map((tab) => {
            const active = practiceTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setPracticeTab(tab.id)}
                style={[styles.tabChip, active && styles.tabChipActive]}
              >
                <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>
                {PRACTICE_TABS.find((t) => t.id === practiceTab)?.label ?? "Today's Challenges"}
              </Text>
              <Text style={styles.metaText}>
                {PRACTICE_TABS.find((t) => t.id === practiceTab)?.subtitle}
              </Text>
            </View>
            <Link
              href={
                {
                  pathname: '/challenges',
                  params: { track: practiceTab === 'daily' ? 'all' : practiceTab },
                } as unknown as Href
              }
              asChild
            >
              <Pressable style={styles.viewAllPill}>
                <Text style={styles.viewAllPillText}>View All</Text>
              </Pressable>
            </Link>
          </View>

          {displayedChallenges.map((challenge) => {
            const task = tasks.find(
              (item) =>
                item.challenge_id === challenge.id ||
                item.related_lesson_id === `challenge:${challenge.id}`,
            );
            const isCompleted = task?.status === 'completed';
            const isPausedBreak = task?.status === 'paused_break';
            const challengeTrack = getChallengeTrack(challenge);
            const pts = getChallengePoints(challenge);

            return (
              <View key={challenge.id} style={styles.challengeItem}>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.itemBadgeRow}>
                    <Text
                      style={[
                        styles.miniTrackBadge,
                        challengeTrack === 'personal'
                          ? styles.miniPersonalBadge
                          : styles.miniFamilyBadge,
                      ]}
                    >
                      {challengeTrack === 'personal' ? 'Personal' : 'Family'}
                    </Text>
                    <Text style={styles.metaText}>
                      {challenge.estimatedTime} • {challenge.category} • {pts} pts
                    </Text>
                  </View>
                  <Link
                    href={
                      {
                        pathname: '/challenges/[challengeId]',
                        params: { challengeId: challenge.id },
                      } as unknown as Href
                    }
                    asChild
                  >
                    <Pressable>
                      <Text style={styles.challengeTitle}>{challenge.displayTitle}</Text>
                    </Pressable>
                  </Link>
                  <Text style={styles.metaText}>{challenge.purpose}</Text>
                </View>

                <View style={styles.actionColumn}>
                  <Pressable
                    onPress={() =>
                      isPausedBreak ? handleResumeBreak(challenge) : handleStart(challenge)
                    }
                    style={[
                      styles.smallButton,
                      isCompleted && { backgroundColor: '#DDF2E8' },
                      isPausedBreak && { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        isCompleted && { color: '#005B5D' },
                        isPausedBreak && { color: '#92400E' },
                      ]}
                    >
                      {isCompleted
                        ? 'Completed'
                        : isPausedBreak
                        ? 'Resume'
                        : task
                        ? 'Continue'
                        : 'Start'}
                    </Text>
                  </Pressable>
                </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  backText: { color: '#005B5D', fontSize: 15, fontWeight: '700' },
  catalogueLink: { color: '#007C7A', fontSize: 14, fontWeight: '800' },
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
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E6E2',
    padding: 14,
    gap: 10,
  },
  breakdownTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  breakdownText: { color: '#113C3D', fontSize: 13 },
  boldText: { fontWeight: '800', color: '#005B5D' },
  breakCountText: { color: '#92400E', fontSize: 13, fontWeight: '800' },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F4',
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: '#007C7A',
  },
  dayText: {
    color: '#607174',
    fontSize: 11,
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
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
  selectedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  trackPill: {
    color: '#007C7A',
    fontSize: 11,
    fontWeight: '800',
  },
  breakButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  breakButtonText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
  },
  safeguardBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 10,
  },
  safeguardBannerText: {
    color: '#1E40AF',
    fontSize: 12,
    lineHeight: 17,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D5E6E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabChipActive: {
    backgroundColor: '#005B5D',
    borderColor: '#005B5D',
  },
  tabChipText: {
    color: '#113C3D',
    fontSize: 12,
    fontWeight: '800',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  viewAllPill: {
    backgroundColor: '#EEF8F4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllPillText: {
    color: '#005B5D',
    fontSize: 12,
    fontWeight: '800',
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
  inputSmall: {
    minHeight: 64,
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF4F2',
  },
  itemBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  miniTrackBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '800',
  },
  miniPersonalBadge: {
    backgroundColor: '#EDE9FE',
    color: '#5B21B6',
  },
  miniFamilyBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
  },
  actionColumn: {
    alignItems: 'flex-end',
    gap: 6,
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
