import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link, Redirect, useLocalSearchParams } from "expo-router";

import { AppBottomNav } from "../../../components/AppBottomNav";
import { useAuth } from "../../../lib/auth";
import { getLessonById } from "../../../lib/lessonContent";
import type { AppLesson } from "../../../lib/lessonContent";
import {
  getProgramById,
  getProgramWeekBulkPlan,
  getProgramWeekPlan,
  saveProgramMeaningReflections,
  saveWeeklyGrowthNotes,
  startProgramWeek,
  startProgramWeekWithBulkAdds,
} from "../../../lib/platformData";
import { globalStyles } from "../../../lib/styles";

export default function ProgramWeekScreen() {
  const { initializing, user } = useAuth();
  const { programId, weekId } = useLocalSearchParams<{ programId: string; weekId: string }>();
  const program = getProgramById(programId);
  const week = getProgramWeekPlan(programId, weekId);
  const bulkPlan = getProgramWeekBulkPlan(programId, weekId);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [monthResponse, setMonthResponse] = useState("");
  const [weeklyResponse, setWeeklyResponse] = useState("");
  const [dailyResponses, setDailyResponses] = useState<Record<number, string>>({});
  const [familyWin, setFamilyWin] = useState("");
  const [toolboxSkill, setToolboxSkill] = useState("");
  const [futureLetter, setFutureLetter] = useState("");

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!program || !week) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Week not found</Text>
        <Text style={globalStyles.subtitle}>Choose another program week.</Text>
        <Link href="/programs" asChild>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Back to programs</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    );
  }

  const lessons = week.lessonIds.map(getLessonById).filter((lesson): lesson is AppLesson => Boolean(lesson));

  const handleStartWeek = async () => {
    setSaving(true);
    setMessage("");

    try {
      await startProgramWeek(user.id, program.id, week);
      setMessage("Week started and added to your progress record.");
    } catch {
      setMessage("Could not save this week start yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartWeekWithBulkAdds = async () => {
    setSaving(true);
    setMessage("");

    try {
      const result = await startProgramWeekWithBulkAdds(user.id, program.id, week);
      setMessage(
        result.taskCount + result.evidenceCount > 0
          ? `${week.title} started with ${result.taskCount} tasks and ${result.evidenceCount} evidence drafts added.`
          : `${week.title} started. The bulk plan already exists.`,
      );
    } catch {
      setMessage("Could not add the full week plan yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMeaningReflections = async () => {
    setSaving(true);
    setMessage("");

    try {
      await saveProgramMeaningReflections(user.id, {
        programId: program.id,
        programTitle: program.title,
        week,
        monthResponse,
        weeklyResponse,
        dailyResponses,
      });
      setMonthResponse("");
      setWeeklyResponse("");
      setDailyResponses({});
      setMessage("Meaning reflections saved to evidence and progress.");
    } catch {
      setMessage("Could not save meaning reflections yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWeeklyGrowth = async () => {
    setSaving(true);
    setMessage("");

    try {
      await saveWeeklyGrowthNotes(user.id, {
        programId: program.id,
        programTitle: program.title,
        week,
        familyWin,
        toolboxSkill,
        futureLetter,
      });
      setFamilyWin("");
      setToolboxSkill("");
      setFutureLetter("");
      setMessage("Weekly growth notes saved to reflections and timeline.");
    } catch {
      setMessage("Could not save weekly growth notes yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <View style={globalStyles.inlineRow}>
        <Text style={globalStyles.pill}>{program.title}</Text>
        <Text style={globalStyles.pill}>{week.title}</Text>
      </View>

      <Text style={globalStyles.title}>{week.title}</Text>
      <Text style={globalStyles.subtitle}>{week.focus}</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Month {week.monthNumber}: {week.monthTopic}</Text>
        <Text style={globalStyles.cardText}>{week.monthReflectionPrompt}</Text>
        <TextInput
          multiline
          onChangeText={setMonthResponse}
          placeholder="Write what this monthly topic means to you."
          style={[globalStyles.input, globalStyles.textArea]}
          value={monthResponse}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Weekly sub topic</Text>
        <Text style={globalStyles.cardText}>{week.focus}</Text>
        <Text style={globalStyles.cardText}>{week.weeklyReflectionPrompt}</Text>
        <TextInput
          multiline
          onChangeText={setWeeklyResponse}
          placeholder="Write what this weekly sub topic means to you."
          style={[globalStyles.input, globalStyles.textArea]}
          value={weeklyResponse}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Daily 30-minute lessons</Text>
        {week.dailyLessons.map((lesson) => (
          <View key={lesson.dayNumber} style={globalStyles.selectableItem}>
            <View style={globalStyles.inlineRow}>
              <Text style={globalStyles.pill}>Day {lesson.dayNumber}</Text>
              <Text style={globalStyles.pill}>{lesson.durationMinutes} min</Text>
            </View>
            <Text style={globalStyles.selectableItemTitle}>{lesson.title}</Text>
            <Text style={globalStyles.selectableItemText}>{lesson.meaningPrompt}</Text>
            <TextInput
              multiline
              onChangeText={(value) => setDailyResponses((current) => ({ ...current, [lesson.dayNumber]: value }))}
              placeholder="Write your answer before starting this lesson."
              style={[globalStyles.input, globalStyles.textArea]}
              value={dailyResponses[lesson.dayNumber] ?? ""}
            />
            <Text style={globalStyles.selectableItemText}>Checkpoint: {lesson.checkpoint}</Text>
            <Text style={globalStyles.selectableItemText}>Practice: {lesson.practiceTask}</Text>
          </View>
        ))}
        <TouchableOpacity
          disabled={saving}
          onPress={handleSaveMeaningReflections}
          style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
        >
          <Text style={globalStyles.buttonText}>{saving ? "Saving..." : "Save meaning reflections"}</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Evidence prompt</Text>
        <Text style={globalStyles.cardText}>{week.evidencePrompt}</Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Weekly growth notes</Text>
        <Text style={globalStyles.cardText}>These notes help show strengths, practice, and personal change over time.</Text>
        <TextInput
          multiline
          onChangeText={setFamilyWin}
          placeholder="What went well for your family this week?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={familyWin}
        />
        <TextInput
          multiline
          onChangeText={setToolboxSkill}
          placeholder="What skill are you adding to My Toolbox?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={toolboxSkill}
        />
        <TextInput
          multiline
          onChangeText={setFutureLetter}
          placeholder="Imagine your child reads this in ten years. What would you like them to know about the effort you are making today?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={futureLetter}
        />
        <TouchableOpacity
          disabled={saving}
          onPress={handleSaveWeeklyGrowth}
          style={[globalStyles.secondaryButton, saving && globalStyles.buttonDisabled]}
        >
          <Text style={globalStyles.secondaryButtonText}>{saving ? "Saving..." : "Save weekly growth notes"}</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Linked lessons</Text>
        {lessons.length === 0 ? (
          <Text style={globalStyles.cardText}>No core lessons are attached to this week yet. Use the learning library for supporting content.</Text>
        ) : (
          lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={{ pathname: "/lessons/[lessonId]", params: { lessonId: lesson.id } }}
              asChild
            >
              <TouchableOpacity style={globalStyles.secondaryButton}>
                <Text style={globalStyles.secondaryButtonText}>{lesson.title}</Text>
              </TouchableOpacity>
            </Link>
          ))
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Week actions</Text>
        <Text style={globalStyles.cardText}>Complete the linked lesson or library course.</Text>
        <Text style={globalStyles.cardText}>Save one evidence item connected to this focus.</Text>
        <Text style={globalStyles.cardText}>Review your tasks and mark completed actions.</Text>
        <Text style={globalStyles.cardText}>Use assessments when the pathway calls for a check-in.</Text>
      </View>

      {bulkPlan ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Bulk add this week</Text>
          <Text style={globalStyles.cardText}>
            Add the practical task list and draft evidence records for this program week.
          </Text>
          <Text style={globalStyles.mutedText}>Tasks to add</Text>
          {bulkPlan.tasks.map((task) => (
            <View key={task.title} style={globalStyles.selectableItem}>
              <Text style={globalStyles.selectableItemTitle}>{task.title}</Text>
              <Text style={globalStyles.selectableItemText}>
                {task.category} - {task.priority} priority
              </Text>
            </View>
          ))}
          <Text style={globalStyles.mutedText}>Evidence drafts to add</Text>
          {bulkPlan.evidence.map((item) => (
            <View key={item.title} style={globalStyles.selectableItem}>
              <Text style={globalStyles.selectableItemTitle}>{item.title}</Text>
              <Text style={globalStyles.selectableItemText}>{item.notes}</Text>
            </View>
          ))}
          <TouchableOpacity
            disabled={saving}
            onPress={handleStartWeekWithBulkAdds}
            style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
          >
            <Text style={globalStyles.buttonText}>{saving ? "Adding..." : "Start week and add plan"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {message ? <Text style={message.startsWith("Could") ? globalStyles.error : globalStyles.notice}>{message}</Text> : null}

      <TouchableOpacity
        disabled={saving}
        onPress={handleStartWeek}
        style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
      >
        <Text style={globalStyles.buttonText}>{saving ? "Saving..." : "Start this week"}</Text>
      </TouchableOpacity>

      <AppBottomNav />
    </ScrollView>
  );
}
