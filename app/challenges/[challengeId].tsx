import { Link, Redirect, type Href, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import {
  attachDailyChallengeEvidence,
  completeDailyChallengeTask,
  getChallengePoints,
} from "../../lib/dailyChallengesFlow";
import {
  getChallengeSafeguardMetadata,
  getChallengeTrack,
  isWeekendActivityChallenge,
} from "../../lib/data/familyChallenges";
import { getParentChallengeById } from "../../lib/data/safestepsParentChallenges";
import {
  createUserTaskFromParentChallenge,
  fetchParentChallengeTask,
  pauseUserChallengeTask,
  resumeUserChallengeTask,
  type UserTask,
} from "../../lib/engines/taskEngine";
import { globalStyles } from "../../lib/styles";

export default function ChallengeDetailScreen() {
  const { initializing, user } = useAuth();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const challenge = getParentChallengeById(String(challengeId ?? ""));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [task, setTask] = useState<UserTask | null>(null);
  const [checkingTask, setCheckingTask] = useState(true);

  const [beforeAnswer, setBeforeAnswer] = useState("");
  const [reflection, setReflection] = useState("");
  const [childPerspective, setChildPerspective] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");

  const userId = user?.id ?? "local-parent";

  useEffect(() => {
    let active = true;
    if (!challenge) {
      setCheckingTask(false);
      return;
    }

    fetchParentChallengeTask(challenge.id, userId)
      .then((result) => {
        if (active) setTask(result);
      })
      .catch((error) => {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : "Could not check challenge status.",
          );
        }
      })
      .finally(() => {
        if (active) setCheckingTask(false);
      });

    return () => {
      active = false;
    };
  }, [challenge, userId]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  if (!challenge) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={globalStyles.screen}
      >
        <Text style={globalStyles.title}>Challenge not found</Text>
        <Link href={"/challenges" as Href} asChild>
          <Pressable style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Back to Challenges</Text>
          </Pressable>
        </Link>
      </ScrollView>
    );
  }

  const track = getChallengeTrack(challenge);
  const safeguards = getChallengeSafeguardMetadata(challenge);
  const isWeekend = isWeekendActivityChallenge(challenge);
  const points = getChallengePoints(challenge);

  async function addToTasks() {
    if (saving || !challenge) return;
    setSaving(true);
    setMessage("");
    try {
      const savedTask = await createUserTaskFromParentChallenge(challenge.id, userId);
      setTask(savedTask);
      setMessage(
        savedTask.status === "completed"
          ? "You have already completed this challenge."
          : "Challenge started! Complete your reflection and evidence below, or take a break anytime.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start challenge.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTakeBreak() {
    if (saving || !challenge) return;
    setSaving(true);
    setMessage("");
    try {
      const pausedTask = await pauseUserChallengeTask(
        challenge.id,
        "Stepping away for a calm break (SS-PCD-036)",
        userId,
      );
      setTask(pausedTask);
      setMessage(
        "Challenge paused for a break (SS-PCD-036). Your progress and streak are safe with zero penalty.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not pause challenge.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeBreak() {
    if (saving || !challenge) return;
    setSaving(true);
    setMessage("");
    try {
      const resumedTask = await resumeUserChallengeTask(challenge.id, userId);
      setTask(resumedTask);
      setMessage("Welcome back! Challenge resumed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not resume challenge.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEvidenceAndComplete() {
    if (saving || !challenge) return;
    setSaving(true);
    setMessage("");
    try {
      const combinedReflection = [
        beforeAnswer.trim() ? `Starting meaning: ${beforeAnswer.trim()}` : "",
        reflection.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      await attachDailyChallengeEvidence({
        challengeId: challenge.id,
        taskId: task?.id,
        reflection: combinedReflection,
        evidenceNote,
        childPerspectiveNote: track === "family" ? childPerspective : undefined,
        sharedWithChild: track === "family" && childPerspective.trim().length > 0,
        userId,
      });

      await completeDailyChallengeTask(challenge.id, userId);
      const updated = await fetchParentChallengeTask(challenge.id, userId);
      setTask(updated);
      setMessage(
        `Challenge "${challenge.displayTitle}" completed with evidence (+${points} points)!`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete challenge.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[globalStyles.screen, styles.screen]}
    >
      <View style={styles.topNavRow}>
        <Link href={"/challenges" as Href} asChild>
          <Pressable>
            <Text style={styles.backLink}>← Back to Challenges Catalogue</Text>
          </Pressable>
        </Link>
        <Link href={"/daily-challenges" as Href} asChild>
          <Pressable>
            <Text style={styles.backLink}>Daily Streaks & Rewards →</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.badgeRow}>
        <Text
          style={[
            styles.trackBadge,
            track === "personal" ? styles.personalBadge : styles.familyBadge,
          ]}
        >
          {track === "personal"
            ? "🧘 Personal Parent Challenge"
            : "👨‍👧 Family & Parent–Child Challenge"}
        </Text>
        <Text style={globalStyles.pill}>{challenge.challengeType}</Text>
        <Text style={globalStyles.pill}>{challenge.estimatedTime}</Text>
        <Text style={globalStyles.pill}>{challenge.category}</Text>
        {isWeekend ? <Text style={styles.weekendBadge}>☀️ Weekend Bonding</Text> : null}
        <Text style={styles.pointsBadge}>+{points} pts</Text>
      </View>

      <Text style={globalStyles.title}>{challenge.displayTitle}</Text>
      <Text style={globalStyles.subtitle}>{challenge.purpose}</Text>

      {/* Safeguard Card (SS-PCD-030 / SS-PCD-036 / SS-PCD-045) */}
      <View style={styles.safeguardCard}>
        <Text style={styles.safeguardTitle}>
          🛡️ Safeguard & Fairness Notice ({safeguards.registerIds.join(" • ")})
        </Text>
        <Text style={styles.safeguardText}>{safeguards.safeguardSummary}</Text>
      </View>

      <Section title="Before you start" items={[challenge.quickQuestionBeforeChallenge]} />
      <Section title="Parent skill focus" items={challenge.parentSkillFocus} />
      <Section title="Challenge steps" items={challenge.challengeSteps} numbered />
      <Section title="Reflection questions" items={challenge.reflectionQuestions} />
      <Section title="Evidence task" items={[challenge.evidenceTask]} />
      <Section title="Completion checklist" items={challenge.completionChecklist} />

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Safety Note</Text>
        <Text style={globalStyles.cardText}>{challenge.safetyNote}</Text>
      </View>

      {/* Interactive Practice, Break Control & Evidence Submission */}
      {checkingTask ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.workspaceCard}>
          <View style={styles.workspaceHeader}>
            <Text style={styles.workspaceTitle}>
              {task?.status === "completed"
                ? "✓ Challenge Completed"
                : task?.status === "paused_break"
                ? "⏸ Paused for a Calm Break"
                : "Practice, Reflection & Evidence"}
            </Text>
            {task?.status !== "completed" && (
              <Pressable
                disabled={saving}
                onPress={task?.status === "paused_break" ? handleResumeBreak : handleTakeBreak}
                style={styles.breakButton}
              >
                <Text style={styles.breakButtonText}>
                  {task?.status === "paused_break"
                    ? "▶ Resume Activity"
                    : "⏸ I Need a Break (No Penalty)"}
                </Text>
              </Pressable>
            )}
          </View>

          {task?.status === "paused_break" ? (
            <View style={styles.breakNotice}>
              <Text style={styles.breakNoticeTitle}>
                You are taking a break (SS-PCD-036)
              </Text>
              <Text style={styles.breakNoticeBody}>
                Take all the time you or your child need. Your progress, reflections, and streak are preserved without any negative inference.
              </Text>
            </View>
          ) : null}

          {task?.status === "completed" ? (
            <View style={styles.completedBanner}>
              <Text style={styles.completedTitle}>
                Recorded in your challenge history (+{points} pts)
              </Text>
              <Text style={styles.completedBody}>
                Completed at:{" "}
                {task.completed_at
                  ? new Date(task.completed_at).toLocaleString()
                  : "Just now"}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.inputLabel}>
                1. Starting Meaning (Optional — {challenge.quickQuestionBeforeChallenge})
              </Text>
              <TextInput
                value={beforeAnswer}
                onChangeText={setBeforeAnswer}
                placeholder="Write what this skill means to you before starting..."
                placeholderTextColor="#667085"
                multiline
                style={styles.textAreaSmall}
              />

              <Text style={styles.inputLabel}>
                2. Parent Reflection (Required to complete)
              </Text>
              <TextInput
                value={reflection}
                onChangeText={setReflection}
                placeholder="What happened, what worked, and how might this have felt from your child's point of view?"
                placeholderTextColor="#667085"
                multiline
                style={styles.textArea}
              />

              {track === "family" && (
                <>
                  <Text style={styles.inputLabel}>
                    3. Child&apos;s Shared Perspective / Words (Optional — No Pressure, SS-PCD-043)
                  </Text>
                  <Text style={styles.helperText}>
                    Only record if your child freely chose to share their thoughts or words. Never pressure or quiz a child to share (SS-PCD-013).
                  </Text>
                  <TextInput
                    value={childPerspective}
                    onChangeText={setChildPerspective}
                    placeholder="Optional: What your child shared or enjoyed in their own words..."
                    placeholderTextColor="#667085"
                    multiline
                    style={styles.textAreaSmall}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>
                {track === "family" ? "4." : "3."} Factual Evidence Note (Optional)
              </Text>
              <TextInput
                value={evidenceNote}
                onChangeText={setEvidenceNote}
                placeholder="Factual, child-focused note showing how you practised this skill..."
                placeholderTextColor="#667085"
                multiline
                style={styles.textAreaSmall}
              />

              <Pressable
                disabled={saving}
                onPress={handleSaveEvidenceAndComplete}
                style={[styles.completeButton, saving && globalStyles.buttonDisabled]}
              >
                <Text style={styles.completeButtonText}>
                  {saving
                    ? "Saving..."
                    : `Save Evidence & Complete Challenge (+${points} pts)`}
                </Text>
              </Pressable>

              {!task && (
                <Pressable
                  disabled={saving}
                  onPress={addToTasks}
                  style={styles.secondaryActionBtn}
                >
                  <Text style={styles.secondaryActionBtnText}>
                    Save Challenge to In-Progress List for Later
                  </Text>
                </Pressable>
              )}
            </>
          )}

          <View style={styles.vaultLinksRow}>
            <Link
              href={
                {
                  pathname: "/evidence",
                  params: {
                    taskId: task?.id ?? `challenge_task_${challenge.id}`,
                    taskTitle: challenge.displayTitle,
                    challengeId: challenge.id,
                  },
                } as unknown as Href
              }
              asChild
            >
              <Pressable style={styles.vaultLinkButton}>
                <Text style={styles.vaultLinkButtonText}>
                  🔐 Deposit Photo/File Proof in Evidence Vault
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      )}

      {message ? <Text selectable style={globalStyles.notice}>{message}</Text> : null}

      <AppBottomNav />
    </ScrollView>
  );
}

function Section({
  title,
  items,
  numbered = false,
}: {
  title: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.cardTitle}>{title}</Text>
      {items.map((item, index) => (
        <Text key={`${title}-${index}`} style={globalStyles.cardText}>
          {numbered ? `${index + 1}. ` : "• "}
          {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 32,
  },
  topNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  backLink: {
    color: "#005B5D",
    fontSize: 14,
    fontWeight: "800",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  trackBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
  },
  pointsBadge: {
    backgroundColor: "#DDF2E8",
    color: "#005B5D",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
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
  safeguardText: {
    color: "#1E40AF",
    fontSize: 12,
    lineHeight: 18,
  },
  workspaceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D5E6E2",
    padding: 16,
    gap: 12,
  },
  workspaceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  workspaceTitle: {
    color: "#113C3D",
    fontSize: 18,
    fontWeight: "900",
  },
  breakButton: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  breakButtonText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "800",
  },
  breakNotice: {
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 12,
    gap: 4,
  },
  breakNoticeTitle: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "800",
  },
  breakNoticeBody: {
    color: "#B45309",
    fontSize: 12,
    lineHeight: 18,
  },
  completedBanner: {
    backgroundColor: "#EEF8F4",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 14,
    gap: 4,
  },
  completedTitle: {
    color: "#065F46",
    fontSize: 15,
    fontWeight: "800",
  },
  completedBody: {
    color: "#047857",
    fontSize: 13,
  },
  inputLabel: {
    color: "#113C3D",
    fontSize: 13,
    fontWeight: "800",
  },
  helperText: {
    color: "#607174",
    fontSize: 12,
    lineHeight: 17,
  },
  textArea: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: "#D5E6E2",
    borderRadius: 10,
    padding: 12,
    color: "#113C3D",
    backgroundColor: "#F8FCFA",
    textAlignVertical: "top",
  },
  textAreaSmall: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: "#D5E6E2",
    borderRadius: 10,
    padding: 12,
    color: "#113C3D",
    backgroundColor: "#F8FCFA",
    textAlignVertical: "top",
  },
  completeButton: {
    backgroundColor: "#007C7A",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryActionBtn: {
    backgroundColor: "#E8F3EF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  secondaryActionBtnText: {
    color: "#005B5D",
    fontSize: 13,
    fontWeight: "800",
  },
  vaultLinksRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEF4F2",
  },
  vaultLinkButton: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  vaultLinkButtonText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "800",
  },
});
