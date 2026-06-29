import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  fetchMyProfile,
  SafeStepsProfile,
  signOut,
  upsertProfile,
} from "../lib/engines/authEngine";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontWeight: "bold" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={{
          minHeight: multiline ? 100 : 50,
          borderWidth: 1,
          borderColor: "#cbd8d0",
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          backgroundColor: "#ffffff",
          textAlignVertical: "top",
        }}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const [profile, setProfile] = useState<SafeStepsProfile | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [storyGoal, setStoryGoal] = useState("");
  const [strengths, setStrengths] = useState("");
  const [supportNotes, setSupportNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const loadedProfile = await fetchMyProfile();
      setProfile(loadedProfile);
      setDisplayName(loadedProfile.display_name ?? "");
      setStoryGoal(loadedProfile.story_goal ?? "");
      setStrengths(loadedProfile.strengths ?? "");
      setSupportNotes(loadedProfile.support_notes ?? "");
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const savedProfile = await upsertProfile({
        display_name: displayName.trim(),
        email: profile?.email ?? null,
        story_goal: storyGoal.trim(),
        strengths: strengths.trim(),
        support_notes: supportNotes.trim(),
      });

      setProfile(savedProfile);
      setSuccess("Profile saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    setError("");

    try {
      await signOut();
      router.replace("/");
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Could not sign out."
      );
    } finally {
      setSigningOut(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 8 }}>
        Settings
      </Text>

      <Text style={{ marginBottom: 16 }}>
        Manage your SafeSteps profile and account.
      </Text>

      {loading && <ActivityIndicator />}

      {error.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Settings Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {success.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#dcefe8",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>{success}</Text>
        </View>
      )}

      {!loading && (
        <>
          <View
            style={{
              padding: 16,
              backgroundColor: "#f1f5f3",
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Account</Text>

            <Text style={{ marginTop: 8 }}>
              Email: {profile?.email ?? "Unknown"}
            </Text>
            <Text style={{ marginTop: 4 }}>Role: {profile?.role ?? "parent"}</Text>
          </View>

          <Field
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your display name"
            multiline={false}
          />

          <Field
            label="My Why / Story Goal"
            value={storyGoal}
            onChangeText={setStoryGoal}
            placeholder="Why are you doing SafeSteps? What are you working towards?"
          />

          <Field
            label="My Strengths"
            value={strengths}
            onChangeText={setStrengths}
            placeholder="What strengths do you already have?"
          />

          <Field
            label="Support Notes"
            value={supportNotes}
            onChangeText={setSupportNotes}
            placeholder="What support would help you stay on track?"
          />

          <Pressable
            onPress={handleSaveProfile}
            disabled={saving}
            style={{
              padding: 14,
              backgroundColor: "#dcefe8",
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {saving ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ fontWeight: "bold" }}>Save Profile</Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            style={{
              padding: 14,
              backgroundColor: "#ffecec",
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            {signingOut ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ fontWeight: "bold" }}>Logout</Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
