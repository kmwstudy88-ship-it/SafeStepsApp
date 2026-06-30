import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link, Redirect, useLocalSearchParams } from "expo-router";

import { AppBottomNav } from "../../../../components/AppBottomNav";
import { useAuth } from "../../../../lib/auth";
import {
  getProgramById,
  getProgramWeekPlan,
  saveDailyProgramLessonCompletion,
} from "../../../../lib/platformData";
import { globalStyles } from "../../../../lib/styles";

export default function DailyProgramLessonScreen() {
  const { initializing, user } = useAuth();
  const { programId, weekId, dayId } = useLocalSearchParams<{ programId: string; weekId: string; dayId: string }>();
  const program = getProgramById(programId);
  const week = getProgramWeekPlan(programId, weekId);
  const dayNumber = Number(dayId);
  const lesson = useMemo(
    () => week?.dailyLessons.find((item) => item.dayNumber === dayNumber) ?? null,
    [dayNumber, week],
  );
  const [meaningResponse, setMeaningResponse] = useState("");
  const [checkpointResponse, setCheckpointResponse] = useState("");
  const [scenarioResponse, setScenarioResponse] = useState("");
  const [practiceResponse, setPracticeResponse] = useState("");
  const [endReflection, setEndReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!program || !week || !lesson) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Daily lesson not found</Text>
        <Text style={globalStyles.subtitle}>Choose another program week.</Text>
        <Link href="/programs" asChild>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Back to programs</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    );
  }

  const handleComplete = async () => {
    setSaving(true);
    setMessage("");

    try {
      await saveDailyProgramLessonCompletion(user.id, {
        programId: program.id,
        programTitle: program.title,
        week,
        dayNumber: lesson.dayNumber,
        meaningResponse,
        checkpointResponse,
        scenarioResponse,
        practiceResponse,
        endReflection,
      });
      setMeaningResponse("");
      setCheckpointResponse("");
      setScenarioResponse("");
      setPracticeResponse("");
      setEndReflection("");
      setMessage("Daily lesson saved to reflections, timeline, and progress.");
    } catch {
      setMessage("Could not save this daily lesson yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <View style={globalStyles.inlineRow}>
        <Text style={globalStyles.pill}>{program.title}</Text>
        <Text style={globalStyles.pill}>{week.title}</Text>
        <Text style={globalStyles.pill}>Day {lesson.dayNumber}</Text>
        <Text style={globalStyles.pill}>{lesson.durationMinutes} min</Text>
      </View>

      <Text style={globalStyles.title}>{lesson.title}</Text>
      <Text style={globalStyles.subtitle}>{week.focus}</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Before the lesson</Text>
        <Text style={globalStyles.cardText}>{lesson.meaningPrompt}</Text>
        <TextInput
          multiline
          onChangeText={setMeaningResponse}
          placeholder="There are no right or wrong answers."
          style={[globalStyles.input, globalStyles.textArea]}
          value={meaningResponse}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>30-minute lesson</Text>
        <Text style={globalStyles.cardText}>
          Focus on one practical idea from {week.monthTopic.toLowerCase()}. Notice what this skill looks like in your family, what makes it easier, and what makes it hard to use.
        </Text>
        <Text style={globalStyles.cardText}>
          Keep the goal small: one conversation, one routine, one calmer response, or one repair attempt is enough for today&apos;s practice.
        </Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Knowledge checkpoint</Text>
        <Text style={globalStyles.cardText}>{lesson.checkpoint}</Text>
        <TextInput
          multiline
          onChangeText={setCheckpointResponse}
          placeholder="Write your answer."
          style={[globalStyles.input, globalStyles.textArea]}
          value={checkpointResponse}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Scenario checkpoint</Text>
        <Text style={globalStyles.cardText}>
          Imagine this topic comes up during a stressful family moment. What would be a safe, respectful next step?
        </Text>
        <TextInput
          multiline
          onChangeText={setScenarioResponse}
          placeholder="Describe what you would try and why."
          style={[globalStyles.input, globalStyles.textArea]}
          value={scenarioResponse}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Real-world practice</Text>
        <Text style={globalStyles.cardText}>{lesson.practiceTask}</Text>
        <TextInput
          multiline
          onChangeText={setPracticeResponse}
          placeholder="What happened when you tried it?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={practiceResponse}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>End reflection</Text>
        <Text style={globalStyles.cardText}>What did you learn, practise, or notice after today&apos;s lesson?</Text>
        <TextInput
          multiline
          onChangeText={setEndReflection}
          placeholder="Write your end reflection."
          style={[globalStyles.input, globalStyles.textArea]}
          value={endReflection}
        />
      </View>

      {message ? <Text style={message.startsWith("Could") ? globalStyles.error : globalStyles.notice}>{message}</Text> : null}

      <TouchableOpacity
        disabled={saving}
        onPress={handleComplete}
        style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
      >
        <Text style={globalStyles.buttonText}>{saving ? "Saving..." : "Complete daily lesson"}</Text>
      </TouchableOpacity>

      <AppBottomNav />
    </ScrollView>
  );
}
