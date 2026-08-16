import { Redirect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../../lib/auth";
import {
  completeParentIntake,
  loadParentIntakeProgress,
  saveParentIntakeStep,
  type ParentIntakeProgress,
} from "../../lib/engines/parentIntakeEngine";
import {
  PARENT_INTAKE_SECTIONS,
  calculateParentIntakePercent,
  getNextParentIntakeSection,
  getParentIntakeSection,
  getParentIntakeSectionIndex,
  getParentIntakeValidationError,
  getPreviousParentIntakeSection,
  type ParentIntakeAnswers,
  type ParentIntakeSectionKey,
} from "../../lib/engines/parentIntakePolicy";

function formatSavedAt(value: string | null) {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ParentIntakeScreen() {
  const router = useRouter();
  const { initializing, user } = useAuth();
  const [progress, setProgress] = useState<ParentIntakeProgress | null>(null);
  const [sectionKey, setSectionKey] = useState<ParentIntakeSectionKey>("about_you");
  const [answers, setAnswers] = useState<ParentIntakeAnswers>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const section = getParentIntakeSection(sectionKey);
  const sectionIndex = getParentIntakeSectionIndex(sectionKey);
  const percent = calculateParentIntakePercent(progress?.completedSectionKeys ?? []);
  const isReview = sectionKey === "review";

  const completedKeys = useMemo(
    () => new Set(progress?.completedSectionKeys ?? []),
    [progress?.completedSectionKeys],
  );

  function openSection(nextSection: ParentIntakeSectionKey, nextProgress = progress) {
    setSectionKey(nextSection);
    setAnswers(nextProgress?.draftAnswers[nextSection] ?? {});
    setMessage("");
    setError("");
  }

  const loadProgress = useCallback(async function loadProgress() {
    setLoading(true);
    setError("");
    try {
      const nextProgress = await loadParentIntakeProgress();
      if (nextProgress.completedAt) {
        router.replace("/dashboard");
        return;
      }
      setProgress(nextProgress);
      setSectionKey(nextProgress.currentSection);
      setAnswers(nextProgress.draftAnswers[nextProgress.currentSection] ?? {});
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load parent intake.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user) void loadProgress();
  }, [user, loadProgress]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  async function saveCurrentSection(options: {
    continueToNext: boolean;
    finishIntake?: boolean;
  }) {
    if (!progress || saving) return;

    const validationError = getParentIntakeValidationError(sectionKey, answers);
    if (options.continueToNext && validationError) {
      setError(validationError);
      return;
    }

    const complete = !validationError;
    const nextSection = options.continueToNext
      ? getNextParentIntakeSection(sectionKey)
      : sectionKey;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveParentIntakeStep({
        caseId: progress.caseId,
        sectionKey,
        answers,
        complete,
        nextSectionKey: nextSection,
      });

      const nextCompletedKeys = complete
        ? [...new Set([...progress.completedSectionKeys, sectionKey])]
        : progress.completedSectionKeys.filter((key) => key !== sectionKey);
      const nextDraftAnswers = {
        ...progress.draftAnswers,
        [sectionKey]: answers,
      };
      const nextProgress: ParentIntakeProgress = {
        ...progress,
        draftAnswers: nextDraftAnswers,
        completedSectionKeys: nextCompletedKeys,
        completedSections: nextCompletedKeys.length,
        currentSection: nextSection,
        completedAt: null,
        lastSavedAt: new Date().toISOString(),
        reviewerState: "not_required",
      };

      setProgress(nextProgress);

      if (options.finishIntake) {
        await completeParentIntake(progress.caseId);
        router.replace("/dashboard");
        return;
      }

      if (options.continueToNext) {
        openSection(nextSection, nextProgress);
      } else {
        setMessage(
          complete
            ? "This section is complete and your progress is saved."
            : "Your draft is saved. Complete the required fields when you return.",
        );
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save intake progress.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>SafeSteps</Text>
        <Text style={styles.progressLabel}>
          Parent intake · Step {sectionIndex + 1} of {PARENT_INTAKE_SECTIONS.length}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{percent}% complete</Text>
          <Text style={styles.savedText}>
            Saved: {formatSavedAt(progress?.lastSavedAt ?? null)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#007D78" />
          <Text style={styles.body}>Loading your saved intake…</Text>
        </View>
      ) : null}

      {!loading && progress ? (
        <>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>{section.eyebrow}</Text>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.body}>{section.description}</Text>
          </View>

          {isReview ? (
            <View style={styles.reviewList}>
              {PARENT_INTAKE_SECTIONS.filter((item) => item.key !== "review").map(
                (item) => {
                  const sectionAnswers = progress.draftAnswers[item.key] ?? {};
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => openSection(item.key)}
                      style={styles.reviewCard}
                    >
                      <View style={styles.reviewTitleRow}>
                        <Text style={styles.reviewTitle}>{item.title}</Text>
                        <Text
                          style={
                            completedKeys.has(item.key)
                              ? styles.completeBadge
                              : styles.requiredBadge
                          }
                        >
                          {completedKeys.has(item.key) ? "Complete" : "Required"}
                        </Text>
                      </View>
                      {item.fields.map((field) => {
                        const value = sectionAnswers[field.key]?.trim();
                        if (!value) return null;
                        const label =
                          field.options?.find((option) => option.value === value)?.label ??
                          value;
                        return (
                          <Text key={field.key} numberOfLines={3} style={styles.reviewText}>
                            {field.label}: {label}
                          </Text>
                        );
                      })}
                      <Text style={styles.editText}>Tap to review or edit</Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          ) : null}

          <View style={styles.card}>
            {section.fields.map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>
                  {field.label}
                  {field.optional ? " (optional)" : ""}
                </Text>

                {field.options ? (
                  <View style={styles.optionList}>
                    {field.options.map((option) => {
                      const selected = answers[field.key] === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          onPress={() =>
                            setAnswers((current) => ({
                              ...current,
                              [field.key]: option.value,
                            }))
                          }
                          style={[styles.option, selected && styles.optionSelected]}
                        >
                          <View
                            style={[styles.radio, selected && styles.radioSelected]}
                          />
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    value={answers[field.key] ?? ""}
                    onChangeText={(value) =>
                      setAnswers((current) => ({ ...current, [field.key]: value }))
                    }
                    placeholder={field.placeholder}
                    multiline={field.multiline}
                    textAlignVertical={field.multiline ? "top" : "center"}
                    style={[styles.input, field.multiline && styles.textArea]}
                  />
                )}
              </View>
            ))}
          </View>

          {sectionKey === "immediate_safety" ? (
            <View style={styles.safetyNotice}>
              <Text style={styles.safetyTitle}>Need urgent help?</Text>
              <Text style={styles.body}>
                Leave SafeSteps and use your emergency or safety plan if it is unsafe to
                keep using this device.
              </Text>
            </View>
          ) : null}

          {message ? <Text style={styles.success}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            {sectionIndex > 0 ? (
              <Pressable
                disabled={saving}
                onPress={() => openSection(getPreviousParentIntakeSection(sectionKey))}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>Back</Text>
              </Pressable>
            ) : null}

            <Pressable
              disabled={saving}
              onPress={() => void saveCurrentSection({ continueToNext: false })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>
                {saving ? "Saving…" : "Save progress"}
              </Text>
            </Pressable>

            <Pressable
              disabled={saving}
              onPress={() =>
                void saveCurrentSection({
                  continueToNext: true,
                  finishIntake: isReview,
                })
              }
              style={styles.primaryButton}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryText}>
                  {isReview ? "Complete intake" : "Save and continue"}
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.returnNote}>
            You can close SafeSteps after saving and return to this step later.
          </Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: "100%",
    padding: 20,
    gap: 14,
    backgroundColor: "#EEF6F2",
  },
  header: {
    gap: 8,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#063E4E",
  },
  brand: { color: "#F6C85F", fontSize: 18, fontWeight: "900" },
  progressLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  progressTrack: {
    height: 10,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  progressFill: { height: 10, borderRadius: 99, backgroundColor: "#69C6B5" },
  progressRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  progressText: { color: "#D9F4EC", fontWeight: "800" },
  savedText: { color: "#D9F4EC" },
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D2E3DA",
    backgroundColor: "#FFFFFF",
  },
  eyebrow: {
    color: "#007D78",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: { color: "#102E39", fontSize: 27, fontWeight: "900" },
  body: { color: "#4A5E58", lineHeight: 22 },
  field: { gap: 7 },
  label: { color: "#173B3B", fontWeight: "800", lineHeight: 20 },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#ACC8BE",
    borderRadius: 11,
    backgroundColor: "#F9FCFA",
    color: "#102E39",
  },
  textArea: { minHeight: 112, paddingTop: 12 },
  optionList: { gap: 8 },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BCD1C8",
    borderRadius: 11,
    backgroundColor: "#F9FCFA",
  },
  optionSelected: { borderColor: "#007D78", backgroundColor: "#DFF3ED" },
  radio: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#78938A",
    borderRadius: 99,
  },
  radioSelected: { borderWidth: 5, borderColor: "#007D78" },
  optionText: { flex: 1, color: "#38524A", fontWeight: "700" },
  optionTextSelected: { color: "#075B58", fontWeight: "900" },
  reviewList: { gap: 10 },
  reviewCard: {
    gap: 6,
    padding: 15,
    borderWidth: 1,
    borderColor: "#D2E3DA",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  reviewTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  reviewTitle: { flex: 1, color: "#173B3B", fontSize: 17, fontWeight: "900" },
  reviewText: { color: "#536861", lineHeight: 20 },
  completeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: "hidden",
    color: "#176046",
    backgroundColor: "#DDF2E7",
    fontSize: 12,
    fontWeight: "900",
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: "hidden",
    color: "#805100",
    backgroundColor: "#FFF0CB",
    fontSize: 12,
    fontWeight: "900",
  },
  editText: { color: "#007D78", fontWeight: "900" },
  safetyNotice: {
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8C86D",
    borderRadius: 14,
    backgroundColor: "#FFF5D9",
  },
  safetyTitle: { color: "#754A00", fontSize: 17, fontWeight: "900" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  primaryButton: {
    minHeight: 48,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: "#007D78",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: {
    minHeight: 48,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#9DBDB2",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },
  secondaryText: { color: "#12615C", fontWeight: "900" },
  returnNote: { color: "#63766F", textAlign: "center", lineHeight: 20 },
  loadingCard: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  success: {
    padding: 12,
    borderRadius: 10,
    color: "#185C43",
    backgroundColor: "#DDF2E7",
    fontWeight: "800",
  },
  error: {
    padding: 12,
    borderRadius: 10,
    color: "#8D2D23",
    backgroundColor: "#FBE5E1",
    fontWeight: "800",
  },
});
