import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import {
  getAssessmentResponses,
  getProgressCheckAssessment,
  submitAssessmentResponse,
  type AssessmentDefinition,
  type AssessmentResponse,
} from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getSavedScore(response: AssessmentResponse) {
  const payload = response.responses as unknown as {
    score?: number;
    maxScore?: number;
  };

  return {
    score: payload.score ?? 0,
    maxScore: payload.maxScore ?? 0,
  };
}

export default function AssessmentsScreen() {
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const [assessment, setAssessment] = useState<AssessmentDefinition | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    let active = true;

    getProgressCheckAssessment().then(async (nextAssessment) => {
      if (!active) return;
      setAssessment(nextAssessment);

      if (nextAssessment) {
        setHistory(await getAssessmentResponses(userId, nextAssessment.id));
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((key) => answers[key] > 0).length,
    [answers],
  );

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleSubmit = async () => {
    if (!assessment) return;

    if (answeredCount !== assessment.questions.length) {
      setMessage("Answer every question before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await submitAssessmentResponse(user.id, assessment, answers);
      setHistory(await getAssessmentResponses(user.id, assessment.id));
      setAnswers({});
      setMessage(`Saved score: ${result.score}/${result.maxScore}`);
    } catch {
      setMessage("Could not save assessment yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Assessments</Text>
      <Text style={globalStyles.subtitle}>Complete a quick check-in and save the result to your progress record.</Text>

      {loading ? <ActivityIndicator /> : null}

      {!loading && !assessment ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Assessment unavailable</Text>
          <Text style={globalStyles.cardText}>The starter assessment has not been loaded yet.</Text>
        </View>
      ) : null}

      {assessment ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>{assessment.name}</Text>
          <Text style={globalStyles.cardText}>{assessment.description}</Text>

          {assessment.questions.map((question) => (
            <View key={question.id} style={globalStyles.questionBlock}>
              <Text style={globalStyles.cardText}>
                {question.question_number}. {question.question_text}
              </Text>
              <View style={globalStyles.scoreRow}>
                {[1, 2, 3, 4, 5].map((score) => {
                  const selected = answers[question.id] === score;

                  return (
                    <TouchableOpacity
                      key={score}
                      onPress={() => setAnswers((current) => ({ ...current, [question.id]: score }))}
                      style={selected ? globalStyles.scoreButtonSelected : globalStyles.scoreButton}
                    >
                      <Text style={selected ? globalStyles.scoreButtonTextSelected : globalStyles.scoreButtonText}>
                        {score}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {message ? <Text style={message.startsWith("Saved") ? globalStyles.notice : globalStyles.error}>{message}</Text> : null}

          <TouchableOpacity
            disabled={saving}
            onPress={handleSubmit}
            style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
          >
            <Text style={globalStyles.buttonText}>{saving ? "Saving..." : "Save assessment"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Saved results</Text>
        {history.length === 0 ? (
          <Text style={globalStyles.cardText}>No assessment results saved yet.</Text>
        ) : (
          history.map((item) => {
            const result = getSavedScore(item);

            return (
              <Text key={item.id} style={globalStyles.cardText}>
                {formatDate(item.created_at)} - {result.score}/{result.maxScore}
              </Text>
            );
          })
        )}
      </View>

      <AppBottomNav />
    </ScrollView>
  );
}
