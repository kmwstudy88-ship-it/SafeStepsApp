import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Redirect, router } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { completeMyCaseIntake, getMyIntakeProgress } from "../../lib/engines/programStartGateEngine";
import { getIntakeAssessment, type AssessmentDefinition } from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AssessmentsScreen() {
  const { initializing, user } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentDefinition | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    async function loadIntake() {
      setLoading(true);
      setMessage("");

      try {
        const [nextAssessment, progress] = await Promise.all([
          getIntakeAssessment(),
          getMyIntakeProgress(),
        ]);

        if (!active) return;
        setAssessment(nextAssessment);
        setCompletedAt(progress.intakeCompletedAt);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load intake.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadIntake();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => answer.trim().length > 0).length,
    [answers],
  );
  const totalQuestions = assessment?.questions.length ?? 0;
  const canSubmit = totalQuestions > 0 && answeredCount === totalQuestions;

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  const handleSubmit = async () => {
    if (!assessment || saving) return;

    if (!canSubmit) {
      setMessage("Complete every intake section before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await completeMyCaseIntake(assessment.id, answers, totalQuestions);
      setCompletedAt(result.completedAt);
      setAnswers({});
      setMessage(`Intake complete. ${result.completedSections} sections saved. Program start requirements will now be checked.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save intake assessment yet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>SafeSteps Intake Assessment</Text>
      <Text style={globalStyles.subtitle}>
        Intake, profile, and case setup are required before any program can start. Higher-risk pathways also require worker approval.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Pre-entry baseline</Text>
        <Text style={globalStyles.cardText}>
          Complete every section factually. SafeSteps stores the completion time and uses the intake record for pathway review and program-start gating.
        </Text>
        {completedAt ? (
          <Text style={globalStyles.notice}>Completed {formatDate(completedAt)}.</Text>
        ) : (
          <Text style={globalStyles.error}>Required before programs unlock.</Text>
        )}
      </View>

      {loading ? <ActivityIndicator /> : null}

      {assessment && !completedAt ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>{assessment.name}</Text>
          <Text style={globalStyles.cardText}>{assessment.description}</Text>
          <Text style={globalStyles.cardText}>Progress: {answeredCount} of {totalQuestions} sections completed.</Text>

          {assessment.questions.map((question) => (
            <View key={question.id} style={globalStyles.questionBlock}>
              <Text style={globalStyles.cardTitle}>
                {question.question_number}. {question.question_text}
              </Text>
              <TextInput
                multiline
                onChangeText={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                placeholder="Record the intake details for this section."
                placeholderTextColor="#667085"
                style={[globalStyles.input, globalStyles.textArea]}
                value={answers[question.id] ?? ""}
              />
            </View>
          ))}

          {message ? <Text style={message.startsWith("Intake complete") ? globalStyles.notice : globalStyles.error}>{message}</Text> : null}

          <TouchableOpacity
            disabled={!canSubmit || saving}
            onPress={handleSubmit}
            style={[globalStyles.button, (!canSubmit || saving) && globalStyles.buttonDisabled]}
          >
            <Text style={globalStyles.buttonText}>{saving ? "Saving intake..." : "Complete intake assessment"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {message && completedAt ? <Text style={globalStyles.notice}>{message}</Text> : null}

      {completedAt ? (
        <TouchableOpacity onPress={() => router.replace("/intake-progress")} style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>View intake and program start progress</Text>
        </TouchableOpacity>
      ) : null}

      <AppBottomNav />
    </ScrollView>
  );
}
