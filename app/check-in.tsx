import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";

import { AppBottomNav } from "../components/AppBottomNav";
import { useAuth } from "../lib/auth";
import { saveDailyCheckIn, type DailyCheckInInput } from "../lib/platformData";
import { globalStyles } from "../lib/styles";

type Option<T extends string> = {
  label: string;
  value: T;
};

const moodOptions: Option<DailyCheckInInput["mood"]>[] = [
  { label: "Steady", value: "steady" },
  { label: "Stressed", value: "stressed" },
  { label: "Overwhelmed", value: "overwhelmed" },
];

const safetyOptions: Option<DailyCheckInInput["safety"]>[] = [
  { label: "Safe", value: "safe" },
  { label: "Watching signs", value: "watching" },
  { label: "Need support", value: "unsafe" },
];

export default function CheckInScreen() {
  const { initializing, user } = useAuth();
  const [mood, setMood] = useState<DailyCheckInInput["mood"]>("steady");
  const [safety, setSafety] = useState<DailyCheckInInput["safety"]>("safe");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      await saveDailyCheckIn(user.id, { mood, safety, note });
      setNote("");
      setMessage("Daily check-in saved to your progress record.");
    } catch {
      setMessage("Could not save the check-in yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Daily check-in</Text>
      <Text style={globalStyles.subtitle}>Record today’s stress, safety, and support notes so progress is visible over time.</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>How are you travelling today?</Text>
        <View style={globalStyles.segmentedRow}>
          {moodOptions.map((option) => {
            const selected = mood === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setMood(option.value)}
                style={selected ? globalStyles.segmentSelected : globalStyles.segment}
              >
                <Text style={selected ? globalStyles.segmentTextSelected : globalStyles.segmentText}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Safety signal</Text>
        <View style={globalStyles.segmentedRow}>
          {safetyOptions.map((option) => {
            const selected = safety === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSafety(option.value)}
                style={selected ? globalStyles.segmentSelected : globalStyles.segment}
              >
                <Text style={selected ? globalStyles.segmentTextSelected : globalStyles.segmentText}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Short note</Text>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="What helped today? What needs support tomorrow?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={note}
        />
      </View>

      {message ? <Text style={message.startsWith("Daily") ? globalStyles.notice : globalStyles.error}>{message}</Text> : null}

      <TouchableOpacity
        disabled={saving}
        onPress={handleSave}
        style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
      >
        <Text style={globalStyles.buttonText}>{saving ? "Saving..." : "Save check-in"}</Text>
      </TouchableOpacity>

      <AppBottomNav />
    </ScrollView>
  );
}
