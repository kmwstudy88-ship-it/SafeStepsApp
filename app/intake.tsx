import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../lib/auth";
import {
  completeParentIntake,
  loadParentIntakeProgress,
  saveParentIntakeStep,
  type ParentIntakeProgress,
} from "../lib/engines/parentIntakeEngine";
import {
  calculateParentIntakePercent,
  getNextParentIntakeSection,
  getParentIntakeSection,
  getParentIntakeSectionIndex,
  getParentIntakeValidationError,
  getPreviousParentIntakeSection,
  type ParentIntakeAnswers,
  type ParentIntakeSectionKey,
} from "../lib/engines/parentIntakePolicy";

const colors = {
  background: "#EEF5EF",
  card: "#FFFFFF",
  teal: "#008A84",
  tealDark: "#053C4E",
  ink: "#24352E",
  muted: "#5F7068",
  border: "#B9CCC0",
  error: "#8A2F22",
};

export default function ParentIntakeScreen() {
  const { initializing, user } = useAuth();
  const [progress, setProgress] = useState<ParentIntakeProgress | null>(null);
  const [sectionKey, setSectionKey] = useState<ParentIntakeSectionKey>("about_you");
  const [answers, setAnswers] = useState<ParentIntakeAnswers>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;

    loadParentIntakeProgress()
      .then((nextProgress) => {
        if (!active) return;
        if (nextProgress.completedAt) {
          router.replace("/dashboard");
          return;
        }
        setProgress(nextProgress);
        setSectionKey(nextProgress.currentSection);
        setAnswers(nextProgress.draftAnswers[nextProgress.currentSection] ?? {});
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not start parent intake.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const section = useMemo(() => getParentIntakeSection(sectionKey), [sectionKey]);
  const sectionNumber = getParentIntakeSectionIndex(sectionKey) + 1;
  const percent = calculateParentIntakePercent(progress?.completedSectionKeys ?? []);
  const validationError = getParentIntakeValidationError(sectionKey, answers);

  function openSection(nextKey: ParentIntakeSectionKey) {
    if (!progress) return;
    setSectionKey(nextKey);
    setAnswers(progress.draftAnswers[nextKey] ?? {});
    setError("");
  }

  function updateAnswer(fieldKey: string, value: string) {
    setAnswers((current) => ({ ...current, [fieldKey]: value }));
  }

  async function handleContinue() {
    if (!progress || validationError || saving) return;
    setSaving(true);
    setError("");

    try {
      const isReview = sectionKey === "review";
      const nextSectionKey = getNextParentIntakeSection(sectionKey);
      await saveParentIntakeStep({
        caseId: progress.caseId,
        sectionKey,
        answers,
        complete: true,
        nextSectionKey,
      });

      if (isReview) {
        await completeParentIntake(progress.caseId);
        router.replace("/dashboard");
        return;
      }

      const nextCompletedKeys = progress.completedSectionKeys.includes(sectionKey)
        ? progress.completedSectionKeys
        : [...progress.completedSectionKeys, sectionKey];
      const nextDraftAnswers = { ...progress.draftAnswers, [sectionKey]: answers };
      setProgress({
        ...progress,
        draftAnswers: nextDraftAnswers,
        completedSectionKeys: nextCompletedKeys,
        completedSections: nextCompletedKeys.length,
        currentSection: nextSectionKey,
        lastSavedAt: new Date().toISOString(),
      });
      setSectionKey(nextSectionKey);
      setAnswers(nextDraftAnswers[nextSectionKey] ?? {});
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this intake section.");
    } finally {
      setSaving(false);
    }
  }

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        backgroundColor: colors.background,
        flexGrow: 1,
        gap: 16,
        padding: 20,
      }}
    >
      <View style={{ gap: 7 }}>
        <Text selectable style={{ color: colors.tealDark, fontSize: 13, fontWeight: "900" }}>
          PARENT INTAKE · SECTION {sectionNumber} OF 12
        </Text>
        <Text selectable style={{ color: colors.tealDark, fontSize: 30, fontWeight: "900" }}>
          {section.title}
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 15, lineHeight: 22 }}>
          {section.description}
        </Text>
      </View>

      <View style={{ backgroundColor: "#DDEBE4", borderRadius: 99, height: 10, overflow: "hidden" }}>
        <View style={{ backgroundColor: colors.teal, height: 10, width: `${percent}%` }} />
      </View>

      {loading ? (
        <View style={{ alignItems: "center", gap: 10, padding: 24 }}>
          <ActivityIndicator color={colors.teal} />
          <Text selectable style={{ color: colors.ink, fontWeight: "800" }}>
            Preparing your private intake…
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 16,
            borderWidth: 1,
            gap: 18,
            padding: 18,
          }}
        >
          {section.fields.map((field) => (
            <View key={field.key} style={{ gap: 8 }}>
              <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: "900" }}>
                {field.label}{field.optional ? " (optional)" : ""}
              </Text>
              {field.options ? (
                <View style={{ gap: 8 }}>
                  {field.options.map((option) => {
                    const selected = answers[field.key] === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => updateAnswer(field.key, option.value)}
                        style={{
                          backgroundColor: selected ? colors.teal : "#F8FBF9",
                          borderColor: selected ? colors.teal : colors.border,
                          borderRadius: 12,
                          borderWidth: 1,
                          minHeight: 48,
                          justifyContent: "center",
                          paddingHorizontal: 14,
                        }}
                      >
                        <Text selectable style={{ color: selected ? "#FFFFFF" : colors.ink, fontWeight: "800" }}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  value={answers[field.key] ?? ""}
                  onChangeText={(value) => updateAnswer(field.key, value)}
                  placeholder={field.placeholder}
                  placeholderTextColor="#718078"
                  multiline={field.multiline}
                  textAlignVertical={field.multiline ? "top" : "center"}
                  style={{
                    backgroundColor: "#F8FBF9",
                    borderColor: colors.border,
                    borderRadius: 12,
                    borderWidth: 1,
                    color: colors.ink,
                    minHeight: field.multiline ? 120 : 50,
                    padding: 13,
                  }}
                />
              )}
            </View>
          ))}
        </View>
      )}

      {error ? (
        <Text selectable style={{ color: colors.error, fontWeight: "800", lineHeight: 20 }}>
          {error}
        </Text>
      ) : null}

      {!loading && progress ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          {sectionNumber > 1 ? (
            <Pressable
              disabled={saving}
              onPress={() => openSection(getPreviousParentIntakeSection(sectionKey))}
              style={{
                alignItems: "center",
                borderColor: colors.teal,
                borderRadius: 12,
                borderWidth: 1,
                flex: 1,
                justifyContent: "center",
                minHeight: 52,
              }}
            >
              <Text selectable style={{ color: colors.tealDark, fontWeight: "900" }}>Back</Text>
            </Pressable>
          ) : null}
          <Pressable
            disabled={Boolean(validationError) || saving}
            onPress={handleContinue}
            style={{
              alignItems: "center",
              backgroundColor: validationError || saving ? "#9CBDB7" : colors.teal,
              borderRadius: 12,
              flex: 2,
              justifyContent: "center",
              minHeight: 52,
              paddingHorizontal: 14,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text selectable style={{ color: "#FFFFFF", fontWeight: "900" }}>
                {sectionKey === "review" ? "Complete Intake" : "Save & Continue"}
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {validationError && Object.keys(answers).length > 0 ? (
        <Text selectable style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>
          {validationError}
        </Text>
      ) : null}
    </ScrollView>
  );
}
