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
import {
  loadParentAccessibilityPreferences,
  saveParentAccessibilityPreferencesFromSettings,
} from "../lib/engines/onboardingEngine";
import {
  defaultParentAccessibilityPreferences,
  type ParentAccessibilityPreferences,
} from "../lib/engines/onboardingPolicy";
import {
  defaultRepresentationPreferences,
  parentCarerRoleOptions,
  parseCommaSeparatedPreferences,
  representationSafeguards,
  representationSetupOptions,
  selectRepresentationIllustrationTags,
  skinToneOptions,
  type RepresentationPreferences,
  type RepresentationSetupChoice,
} from "../lib/engines/representationPreferencesEngine";

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
  const [representationPreferences, setRepresentationPreferences] = useState<RepresentationPreferences>(
    defaultRepresentationPreferences,
  );
  const [accessibilityPreferences, setAccessibilityPreferences] =
    useState<ParentAccessibilityPreferences>(defaultParentAccessibilityPreferences);
  const [languagesText, setLanguagesText] = useState("");
  const [householdText, setHouseholdText] = useState("");
  const [appearanceText, setAppearanceText] = useState("");
  const [practiceText, setPracticeText] = useState("");

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
      setAccessibilityPreferences(await loadParentAccessibilityPreferences());
      const loadedPreferences = loadedProfile.representation_preferences ?? defaultRepresentationPreferences;
      setRepresentationPreferences(loadedPreferences);
      setLanguagesText(loadedPreferences.languagesSpoken.join(", "));
      setHouseholdText(loadedPreferences.householdMembers.join(", "));
      setAppearanceText(loadedPreferences.characterAppearance.join(", "));
      setPracticeText(loadedPreferences.culturalClothingSettingsPractices.join(", "));
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
        representation_preferences: {
          ...representationPreferences,
          languagesSpoken: parseCommaSeparatedPreferences(languagesText),
          householdMembers: parseCommaSeparatedPreferences(householdText),
          characterAppearance: parseCommaSeparatedPreferences(appearanceText),
          culturalClothingSettingsPractices: parseCommaSeparatedPreferences(practiceText),
          updatedAt: new Date().toISOString(),
        },
      });
      await saveParentAccessibilityPreferencesFromSettings(accessibilityPreferences);

      setProfile(savedProfile);
      setSuccess("Settings saved.");
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

  const illustrationSelection = selectRepresentationIllustrationTags({
    ...representationPreferences,
    languagesSpoken: parseCommaSeparatedPreferences(languagesText),
    householdMembers: parseCommaSeparatedPreferences(householdText),
    characterAppearance: parseCommaSeparatedPreferences(appearanceText),
    culturalClothingSettingsPractices: parseCommaSeparatedPreferences(practiceText),
  });

  function updateRepresentationPreferences(update: Partial<RepresentationPreferences>) {
    setRepresentationPreferences((current) => ({ ...current, ...update }));
  }

  function toggleListValue(key: "parentCarerRoles" | "preferredSkinTones", value: string) {
    setRepresentationPreferences((current) => {
      const currentValues = current[key];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues.filter((item) => item !== "No preference"), value];

      return { ...current, [key]: nextValues.length > 0 ? nextValues : ["No preference"] };
    });
  }

  function updateAccessibilityPreference<K extends keyof ParentAccessibilityPreferences>(
    key: K,
    value: ParentAccessibilityPreferences[K],
  ) {
    setAccessibilityPreferences((current) => ({ ...current, [key]: value }));
  }

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

          <View
            style={{
              padding: 16,
              backgroundColor: "#f7faf8",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#cbd8d0",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
              Representation Preferences
            </Text>
            <Text style={{ marginBottom: 12, lineHeight: 21 }}>
              Would you like the people and families shown throughout SafeSteps to reflect your family, culture or community?
            </Text>
            <Text style={{ marginBottom: 12, lineHeight: 21, fontWeight: "600" }}>
              These choices personalise illustrations only. They do not change lessons, assessments, risk scores, case decisions, or child-protection evidence.
            </Text>

            <View style={{ gap: 8, marginBottom: 14 }}>
              {representationSetupOptions.map((option) => {
                const selected = representationPreferences.setupChoice === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() =>
                      updateRepresentationPreferences({
                        setupChoice: option.id as RepresentationSetupChoice,
                        preferPeopleFreeIllustrations: option.id === "people_free",
                      })
                    }
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? "#0d655f" : "#cbd8d0",
                      backgroundColor: selected ? "#dcefe8" : "#ffffff",
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>{option.label}</Text>
                    <Text style={{ marginTop: 4, lineHeight: 19 }}>{option.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Field
              label="Cultural identity or background"
              value={representationPreferences.culturalIdentity}
              onChangeText={(culturalIdentity) => updateRepresentationPreferences({ culturalIdentity })}
              placeholder="No preference, Prefer not to say, or write what you choose"
              multiline={false}
            />

            <Field
              label="Aboriginal and/or Torres Strait Islander representation"
              value={representationPreferences.aboriginalTorresStraitIslanderRepresentation}
              onChangeText={(aboriginalTorresStraitIslanderRepresentation) =>
                updateRepresentationPreferences({ aboriginalTorresStraitIslanderRepresentation })
              }
              placeholder="No preference, Prefer not to say, Aboriginal, Torres Strait Islander, or both"
              multiline={false}
            />

            <Field
              label="Languages spoken"
              value={languagesText}
              onChangeText={setLanguagesText}
              placeholder="English, Auslan, Arabic, Samoan"
              multiline={false}
            />

            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Parent/carer role</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {parentCarerRoleOptions.map((role) => {
                const selected = representationPreferences.parentCarerRoles.includes(role);
                return (
                  <Pressable
                    key={role}
                    onPress={() => toggleListValue("parentCarerRoles", role)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? "#0d655f" : "#cbd8d0",
                      backgroundColor: selected ? "#dcefe8" : "#ffffff",
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>{role}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Field
              label="Family structure"
              value={representationPreferences.familyStructure}
              onChangeText={(familyStructure) => updateRepresentationPreferences({ familyStructure })}
              placeholder="No preference, single parent, two households, kinship family"
              multiline={false}
            />

            <Field
              label="Household members"
              value={householdText}
              onChangeText={setHouseholdText}
              placeholder="Parent, child, grandparent, auntie, sibling"
              multiline={false}
            />

            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Preferred skin tones and character appearance</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {skinToneOptions.map((skinTone) => {
                const selected = representationPreferences.preferredSkinTones.includes(skinTone);
                return (
                  <Pressable
                    key={skinTone}
                    onPress={() => toggleListValue("preferredSkinTones", skinTone)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? "#0d655f" : "#cbd8d0",
                      backgroundColor: selected ? "#dcefe8" : "#ffffff",
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>{skinTone}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Field
              label="Character appearance"
              value={appearanceText}
              onChangeText={setAppearanceText}
              placeholder="Hair style, disability aids, clothing preferences"
              multiline={false}
            />

            <Field
              label="Cultural clothing, settings and family practices"
              value={practiceText}
              onChangeText={setPracticeText}
              placeholder="Community setting, family meal, cultural clothing, people-free home routine"
              multiline={false}
            />

            <Pressable
              onPress={() =>
                updateRepresentationPreferences({
                  preferPeopleFreeIllustrations: !representationPreferences.preferPeopleFreeIllustrations,
                  setupChoice: !representationPreferences.preferPeopleFreeIllustrations
                    ? "people_free"
                    : representationPreferences.setupChoice === "people_free"
                      ? "choose_later"
                      : representationPreferences.setupChoice,
                })
              }
              style={{
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: representationPreferences.preferPeopleFreeIllustrations ? "#0d655f" : "#cbd8d0",
                backgroundColor: representationPreferences.preferPeopleFreeIllustrations ? "#dcefe8" : "#ffffff",
                marginBottom: 14,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {representationPreferences.preferPeopleFreeIllustrations ? "Selected: " : ""}
                Prefer illustrations without identifiable people
              </Text>
            </Pressable>

            <View style={{ padding: 12, borderRadius: 10, backgroundColor: "#ffffff", marginBottom: 12 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Current illustration mode</Text>
              <Text>{illustrationSelection.mode}</Text>
              <Text style={{ marginTop: 6, lineHeight: 19 }}>{illustrationSelection.contentPolicy}</Text>
              <Text style={{ marginTop: 6, lineHeight: 19 }}>Tags: {illustrationSelection.tags.join(", ")}</Text>
            </View>

            {representationSafeguards.map((safeguard) => (
              <Text key={safeguard} style={{ lineHeight: 20, marginBottom: 6 }}>
                - {safeguard}
              </Text>
            ))}
          </View>

          <View
            style={{
              padding: 16,
              backgroundColor: "#f7faf8",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#cbd8d0",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
              Accessibility Preferences
            </Text>
            <Text style={{ marginBottom: 12, lineHeight: 21 }}>
              Update the display and reading supports you chose during onboarding.
            </Text>

            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Text Size</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
              {(["small", "medium", "large"] as const).map((size) => {
                const selected = accessibilityPreferences.textSize === size;
                return (
                  <Pressable
                    key={size}
                    onPress={() => updateAccessibilityPreference("textSize", size)}
                    style={{
                      alignItems: "center",
                      backgroundColor: selected ? "#dcefe8" : "#ffffff",
                      borderColor: selected ? "#0d655f" : "#cbd8d0",
                      borderRadius: 10,
                      borderWidth: 1,
                      flex: 1,
                      minHeight: 44,
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "900", textTransform: "capitalize" }}>
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {[
              ["highContrast", "High Contrast"],
              ["reducedMotion", "Reduced Motion"],
              ["readAloud", "Read Aloud"],
              ["captions", "Captions"],
              ["simpleLanguage", "Simple Language"],
            ].map(([key, label]) => {
              const preferenceKey = key as keyof Omit<ParentAccessibilityPreferences, "textSize">;
              const selected = accessibilityPreferences[preferenceKey];
              return (
                <Pressable
                  key={key}
                  onPress={() => updateAccessibilityPreference(preferenceKey, !selected)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selected ? "#0d655f" : "#cbd8d0",
                    backgroundColor: selected ? "#dcefe8" : "#ffffff",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    {selected ? "Selected: " : ""}
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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
