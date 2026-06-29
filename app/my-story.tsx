import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";

import { AppBottomNav } from "../components/AppBottomNav";
import { useAuth } from "../lib/auth";
import { getProfile, updateProfile, type SafeStepsProfile } from "../lib/platformData";
import { globalStyles } from "../lib/styles";

const emptyProfile: SafeStepsProfile = {
  id: "",
  email: null,
  display_name: null,
  role: "parent",
  story_goal: "",
  strengths: "",
  support_notes: "",
};

export default function MyStoryScreen() {
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<SafeStepsProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    let active = true;

    getProfile(userId, user?.email).then((nextProfile) => {
      if (!active) return;
      setProfile(nextProfile);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId, user?.email]);

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
      await updateProfile(user.id, profile);
      setMessage("My Story saved.");
    } catch {
      setMessage("Could not save My Story yet. Try again shortly.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>My Story</Text>
      <Text style={globalStyles.subtitle}>Record the goal, strengths, and supports that make your progress easier to see.</Text>

      {loading ? <ActivityIndicator /> : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Profile</Text>
        <Text style={globalStyles.cardText}>Role: {profile.role}</Text>
        <Text style={globalStyles.cardText}>Email: {user.email}</Text>
        <TextInput
          onChangeText={(displayName) => setProfile((current) => ({ ...current, display_name: displayName }))}
          placeholder="Display name"
          style={globalStyles.input}
          value={profile.display_name ?? ""}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Current goal</Text>
        <TextInput
          multiline
          onChangeText={(storyGoal) => setProfile((current) => ({ ...current, story_goal: storyGoal }))}
          placeholder="What are you working toward right now?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={profile.story_goal}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Strengths</Text>
        <TextInput
          multiline
          onChangeText={(strengths) => setProfile((current) => ({ ...current, strengths }))}
          placeholder="What strengths, routines, or changes do you want recorded?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={profile.strengths}
        />
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Support notes</Text>
        <TextInput
          multiline
          onChangeText={(supportNotes) => setProfile((current) => ({ ...current, support_notes: supportNotes }))}
          placeholder="Who or what helps you stay on track?"
          style={[globalStyles.input, globalStyles.textArea]}
          value={profile.support_notes}
        />
      </View>

      {message ? <Text style={message.startsWith("My Story") ? globalStyles.notice : globalStyles.error}>{message}</Text> : null}

      <TouchableOpacity
        disabled={saving}
        onPress={handleSave}
        style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
      >
        <Text style={globalStyles.buttonText}>{saving ? "Saving..." : "Save My Story"}</Text>
      </TouchableOpacity>

      <AppBottomNav />
    </ScrollView>
  );
}
