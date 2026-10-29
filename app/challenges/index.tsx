import { Link, Redirect, type Href, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import {
  buildDailyChallengeSummary,
  getChallengePoints,
  getClaimedChallengeRewards,
  getStoredChallengeTasks,
  subscribeToDailyChallengeTasks,
  type ChallengeTaskRecord,
} from "../../lib/dailyChallengesFlow";
import {
  allChallengeCategories,
  familyChallengeCategories,
  familyChallenges,
  filterChallenges,
  getChallengeTrack,
  isWeekendActivityChallenge,
  personalChallengeCategories,
  personalChallenges,
  weekendActivityCategories,
  weekendActivityChallenges,
  type ChallengeCadenceFilter,
  type ChallengeTrack,
} from "../../lib/data/familyChallenges";
import { safestepsParentChallenges } from "../../lib/data/safestepsParentChallenges";
import { globalStyles } from "../../lib/styles";

const TRACK_TABS: readonly {
  id: ChallengeTrack;
  label: string;
  count: number;
  subtitle: string;
}[] = [
  {
    id: "all",
    label: "All Challenges",
    count: safestepsParentChallenges.length,
    subtitle: "Complete 104-challenge personal & family skill library",
  },
  {
    id: "personal",
    label: "Personal Growth",
    count: personalChallenges.length,
    subtitle: "Parent self-regulation, grounding & progress evidence",
  },
  {
    id: "family",
    label: "Family & Parent-Child",
    count: familyChallenges.length,
    subtitle: "Voluntary connection, child voice, routines & co-parenting (SS-PCD-030)",
  },
  {
    id: "weekend",
    label: "Weekend Bonding",
    count: weekendActivityChallenges.length,
    subtitle: "Visit-friendly and weekend connection activities",
  },
];

const CADENCE_TYPES: readonly ChallengeCadenceFilter[] = ["all", "daily", "weekly", "monthly"];

export default function ChallengesScreen() {
  const { initializing, user } = useAuth();
  const params = useLocalSearchParams<{ track?: string; category?: string }>();

  const initialTrack: ChallengeTrack =
    params.track === "personal" || params.track === "family" || params.track === "weekend"
      ? params.track
      : "all";

  const [track, setTrack] = useState<ChallengeTrack>(initialTrack);
  const [type, setType] = useState<ChallengeCadenceFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category ?? "all");
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<ChallengeTaskRecord[]>([]);
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const userId = user?.id ?? "local-parent";

    const unsubscribe = subscribeToDailyChallengeTasks((nextTasks) => {
      if (active) setTasks(nextTasks);
    });

    Promise.all([
      getStoredChallengeTasks(userId),
      getClaimedChallengeRewards(userId),
    ]).then(([storedTasks, storedRewards]) => {
      if (!active) return;
      setTasks(storedTasks);
      setClaimedRewardIds(storedRewards);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.id]);

  const availableCategories = useMemo(() => {
    if (track === "personal") return [...personalChallengeCategories];
    if (track === "family") return [...familyChallengeCategories];
    if (track === "weekend") return [...weekendActivityCategories];
    return [...allChallengeCategories];
  }, [track]);

  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      !availableCategories.includes(selectedCategory as any)
    ) {
      setSelectedCategory("all");
    }
  }, [availableCategories, selectedCategory]);

  const filtered = useMemo(
    () =>
      filterChallenges({
        track,
        challengeType: type,
        category: selectedCategory,
        query,
      }),
    [query, selectedCategory, track, type],
  );

  const summary = useMemo(
    () => buildDailyChallengeSummary(tasks, claimedRewardIds),
    [tasks, claimedRewardIds],
  );

  const taskByChallengeId = useMemo(() => {
    const map = new Map<string, ChallengeTaskRecord>();
    for (const task of tasks) {
      const id =
        task.challenge_id ||
        (task.related_lesson_id.startsWith("challenge:")
          ? task.related_lesson_id.replace("challenge:", "")
          : "");
      if (id) map.set(id, task);
    }
    return map;
  }, [tasks]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  const activeTrackMeta = TRACK_TABS.find((item) => item.id === track) ?? TRACK_TABS[0];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[globalStyles.screen, styles.screen]}
    >
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>PERSONAL & FAMILY PRACTICE (SS-TASK-001 • SS-PCD-030)</Text>
        <Text style={globalStyles.title}>Personal & Family Challenges</Text>
        <Text style={globalStyles.subtitle}>
          Turn practical parenting skills and voluntary family connection into daily, weekly, or monthly actions with reflection and evidence.
        </Text>
      </View>

      {/* Live Progress & Daily Practice Banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.personalCompletedCount}</Text>
            <Text style={styles.statLabel}>Personal Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.familyCompletedCount}</Text>
            <Text style={styles.statLabel}>Family Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.streak}d</Text>
            <Text style={styles.statLabel}>Active Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
        </View>
        <Link href={"/daily-challenges" as Href} asChild>
          <Pressable style={styles.dailyHubButton}>
            <Text style={styles.dailyHubButtonText}>
              Open Daily Practice, Streaks & Reward Milestones →
            </Text>
          </Pressable>
        </Link>
      </View>

      {/* Personal vs Family vs Weekend Track Tabs */}
      <View style={styles.trackGrid}>
        {TRACK_TABS.map((item) => {
          const selected = track === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTrack(item.id)}
              style={[styles.trackTab, selected && styles.trackTabSelected]}
            >
              <View style={styles.trackTopRow}>
                <Text style={[styles.trackLabel, selected && styles.trackLabelSelected]}>
                  {item.label}
                </Text>
                <Text style={[styles.trackCount, selected && styles.trackCountSelected]}>
                  {item.count}
                </Text>
              </View>
              <Text style={[styles.trackSub, selected && styles.trackSubSelected]}>
                {item.subtitle}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Safeguard Banner for Family & Parent-Child Challenges (SS-PCD-030 & SS-PCD-045) */}
      {(track === "family" || track === "weekend") && (
        <View style={styles.safeguardCard}>
          <Text style={styles.safeguardTitle}>
            🛡️ Voluntary Family & Parent–Child Safeguard (SS-PCD-030 • SS-PCD-045)
          </Text>
          <Text style={styles.safeguardBody}>
            Family and parent–child challenges are completely voluntary connection activities. Pausing with &ldquo;I need a break&rdquo; or skipping an activity never causes a penalty or adverse inference, and outcomes are never used as a covert parenting-capacity score.
          </Text>
        </View>
      )}

      {track === "personal" && (
        <View style={styles.personalInfoCard}>
          <Text style={styles.personalInfoTitle}>
            🧘 Personal Parent Self-Regulation & Progress Evidence
          </Text>
          <Text style={styles.personalInfoBody}>
            Personal challenges focus on your own nervous-system regulation, calm voice practice, trigger planning, and documenting factual safety and support actions.
          </Text>
        </View>
      )}

      <TextInput
        accessibilityLabel="Search challenges"
        value={query}
        onChangeText={setQuery}
        placeholder="Search personal or family challenges, skills, or tags..."
        placeholderTextColor="#667085"
        style={globalStyles.input}
      />

      {/* Cadence Segmented Filter */}
      <View style={globalStyles.segmentedRow}>
        {CADENCE_TYPES.map((value) => (
          <Pressable
            key={value}
            onPress={() => setType(value)}
            style={type === value ? globalStyles.segmentSelected : globalStyles.segment}
          >
            <Text style={type === value ? globalStyles.segmentTextSelected : globalStyles.segmentText}>
              {value === "all" ? "All Cadences" : `${value[0].toUpperCase()}${value.slice(1)}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <Pressable
          onPress={() => setSelectedCategory("all")}
          style={[
            styles.categoryChip,
            selectedCategory === "all" && styles.categoryChipActive,
          ]}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === "all" && styles.categoryChipTextActive,
            ]}
          >
            All Categories ({availableCategories.length})
          </Text>
        </Pressable>
        {availableCategories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  active && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.resultsHeaderRow}>
        <Text style={globalStyles.mutedText}>
          Showing {filtered.length} of {activeTrackMeta.count} challenges
        </Text>
        {(selectedCategory !== "all" || type !== "all" || query.trim() !== "") && (
          <Pressable
            onPress={() => {
              setSelectedCategory("all");
              setType("all");
              setQuery("");
            }}
          >
            <Text style={styles.clearFiltersText}>Reset filters</Text>
          </Pressable>
        )}
      </View>

      {filtered.map((challenge) => {
        const challengeTrack = getChallengeTrack(challenge);
        const weekend = isWeekendActivityChallenge(challenge);
        const task = taskByChallengeId.get(challenge.id);
        const points = getChallengePoints(challenge);

        return (
          <Link
            key={challenge.id}
            href={
              {
                pathname: "/challenges/[challengeId]",
                params: { challengeId: challenge.id },
              } as unknown as Href
            }
            asChild
          >
            <Pressable style={styles.challengeCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.pillRow}>
                  <Text
                    style={[
                      styles.trackBadge,
                      challengeTrack === "personal"
                        ? styles.personalBadge
                        : styles.familyBadge,
                    ]}
                  >
                    {challengeTrack === "personal" ? "🧘 Personal" : "👨‍👧 Family & Child"}
                  </Text>
                  <Text style={globalStyles.pill}>{challenge.challengeType}</Text>
                  <Text style={globalStyles.pill}>{challenge.estimatedTime}</Text>
                  {weekend ? (
                    <Text style={styles.weekendBadge}>☀️ Weekend</Text>
                  ) : null}
                </View>
                <Text style={styles.pointsBadge}>+{points} pts</Text>
              </View>

              <Text style={globalStyles.cardTitle}>{challenge.displayTitle}</Text>
              <Text style={styles.categoryLabel}>{challenge.category}</Text>
              <Text style={globalStyles.cardText}>{challenge.purpose}</Text>

              <View style={styles.cardFooterRow}>
                {task?.status === "completed" ? (
                  <Text style={styles.statusCompleted}>✓ Completed with Evidence</Text>
                ) : task?.status === "paused_break" ? (
                  <Text style={styles.statusBreak}>⏸ Paused on Break (No Penalty)</Text>
                ) : task ? (
                  <Text style={styles.statusInProgress}>● In Progress</Text>
                ) : (
                  <Text style={styles.statusReady}>Tap to view steps, reflection & evidence →</Text>
                )}
              </View>
            </Pressable>
          </Link>
        );
      })}

      <AppBottomNav />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 32,
  },
  headerBlock: {
    gap: 6,
  },
  eyebrow: {
    color: "#007C7A",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  summaryBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D5E6E2",
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: 74,
    backgroundColor: "#F8FCFA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2EFEA",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    color: "#113C3D",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "#607174",
    fontSize: 11,
    fontWeight: "700",
  },
  dailyHubButton: {
    backgroundColor: "#007C7A",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  dailyHubButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  trackGrid: {
    gap: 8,
  },
  trackTab: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5E6E2",
    padding: 14,
    gap: 4,
  },
  trackTabSelected: {
    backgroundColor: "#005B5D",
    borderColor: "#005B5D",
  },
  trackTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackLabel: {
    color: "#113C3D",
    fontSize: 15,
    fontWeight: "800",
  },
  trackLabelSelected: {
    color: "#FFFFFF",
  },
  trackCount: {
    backgroundColor: "#EEF8F4",
    color: "#005B5D",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
  },
  trackCountSelected: {
    backgroundColor: "#007C7A",
    color: "#FFFFFF",
  },
  trackSub: {
    color: "#607174",
    fontSize: 12,
    lineHeight: 17,
  },
  trackSubSelected: {
    color: "#DDF2E8",
  },
  safeguardCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
    gap: 6,
  },
  safeguardTitle: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "800",
  },
  safeguardBody: {
    color: "#1E40AF",
    fontSize: 12,
    lineHeight: 18,
  },
  personalInfoCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    padding: 14,
    gap: 6,
  },
  personalInfoTitle: {
    color: "#4C1D95",
    fontSize: 13,
    fontWeight: "800",
  },
  personalInfoBody: {
    color: "#5B21B6",
    fontSize: 12,
    lineHeight: 18,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D5E6E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: "#007C7A",
    borderColor: "#007C7A",
  },
  categoryChipText: {
    color: "#113C3D",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  resultsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearFiltersText: {
    color: "#007C7A",
    fontSize: 13,
    fontWeight: "800",
  },
  challengeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D5E6E2",
    padding: 16,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  trackBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
  },
  personalBadge: {
    backgroundColor: "#EDE9FE",
    color: "#5B21B6",
  },
  familyBadge: {
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
  },
  weekendBadge: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
  },
  pointsBadge: {
    color: "#007C7A",
    fontSize: 13,
    fontWeight: "900",
  },
  categoryLabel: {
    color: "#005B5D",
    fontSize: 12,
    fontWeight: "700",
  },
  cardFooterRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEF4F2",
  },
  statusCompleted: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "800",
  },
  statusBreak: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "800",
  },
  statusInProgress: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "800",
  },
  statusReady: {
    color: "#607174",
    fontSize: 12,
    fontWeight: "600",
  },
});
