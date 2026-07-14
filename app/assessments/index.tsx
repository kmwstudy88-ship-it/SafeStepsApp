import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Redirect, router } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import {
  getAssessmentResponses,
  getIntakeAssessment,
  hasCompletedIntakeAssessment,
  submitIntakeAssessmentResponse,
  type AssessmentDefinition,
} from "../../lib/platformData";
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
  const userId = user?.id;
  const [assessment, setAssessment] = useState<AssessmentDefinition | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    let active = true;
    const currentUserId = userId;

    async function loadIntake() {
      setLoading(true);
      const nextAssessment = await getIntakeAssessment();
      const intakeComplete = await hasCompletedIntakeAssessment(currentUserId);
      const history = await getAssessmentResponses(currentUserId, nextAssessment.id);

      if (!active) return;

      setAssessment(nextAssessment);
      setCompletedAt(intakeComplete ? history[0]?.created_at ?? new Date().toISOString() : null);
      setLoading(false);
    }

    loadIntake();

    return () => {
      active = false;
    };
  }, [userId]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => answer.trim().length > 0).length,
    [answers],
  );
  const totalQuestions = assessment?.questions.length ?? 0;
  const canSubmit = totalQuestions > 0 && answeredCount === totalQuestions;

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleSubmit = async () => {
    if (!assessment || !userId || saving) return;

    if (!canSubmit) {
      setMessage("Complete every intake section before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await submitIntakeAssessmentResponse(userId, answers);
      setCompletedAt(new Date().toISOString());
      setAnswers({});
      setMessage(`Intake complete. ${result.completedSections} sections saved. Programs are now unlocked.`);
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
        This is the required first step after sign-up. Programs cannot be started until this intake is complete.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Pre-entry baseline</Text>
        <Text style={globalStyles.cardText}>
          Based on the SafeSteps Intake Assessment document. Record enough information for review, support planning, and program routing before any program begins.
        </Text>
        {completedAt ? (
          <Text style={globalStyles.notice}>Completed {formatDate(completedAt)}. You can now start programs.</Text>
        ) : (
          <Text style={globalStyles.error}>Required before programs unlock.</Text>
        )}
      </View>

      {loading ? <ActivityIndicator /> : null}

      {assessment && !completedAt ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>{assessment.name}</Text>
          <Text style={globalStyles.cardText}>{assessment.description}</Text>

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

      {completedAt ? (
        <TouchableOpacity onPress={() => router.replace("/programs")} style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Continue to programs</Text>
        </TouchableOpacity>
      ) : null}

      <AppBottomNav />
    </ScrollView>
  );
}
