import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  NatureScene,
  OnboardingShell,
  PreferenceRow,
  PrimaryButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";
import {
  loadParentAccessibilityPreferences,
  saveParentAccessibilityPreferences,
} from "../../lib/engines/onboardingEngine";
import {
  defaultParentAccessibilityPreferences,
  type ParentAccessibilityPreferences,
} from "../../lib/engines/onboardingPolicy";

export default function AccessibilityPreferencesScreen() {
  const [preferences, setPreferences] = useState<ParentAccessibilityPreferences>(
    defaultParentAccessibilityPreferences,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    loadParentAccessibilityPreferences()
      .then((saved) => {
        if (active) setPreferences(saved);
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your accessibility preferences.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updatePreference<K extends keyof ParentAccessibilityPreferences>(
    key: K,
    value: ParentAccessibilityPreferences[K],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      await saveParentAccessibilityPreferences(preferences);
      router.replace("/dashboard");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your accessibility preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingShell step={8} totalSteps={8}>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text
          style={{
            color: onboardingColors.tealDark,
            fontSize: 26,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          Accessibility Preferences
        </Text>
        <Text
          style={{
            color: onboardingColors.ink,
            fontSize: 15,
            lineHeight: 21,
            textAlign: "center",
          }}
        >
          Personalise SafeSteps to work best for you. These choices save to your private
          profile.
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={onboardingColors.teal} />
      ) : (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ color: onboardingColors.ink, fontWeight: "900" }}>
              Text Size
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["small", "medium", "large"] as const).map((size) => {
                const selected = preferences.textSize === size;
                return (
                  <Pressable
                    key={size}
                    onPress={() => updatePreference("textSize", size)}
                    style={{
                      alignItems: "center",
                      backgroundColor: selected ? onboardingColors.teal : "rgba(255,255,255,0.86)",
                      borderColor: selected ? onboardingColors.teal : onboardingColors.border,
                      borderRadius: 10,
                      borderWidth: 1,
                      flex: 1,
                      minHeight: 44,
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#FFFFFF" : onboardingColors.ink,
                        fontWeight: "900",
                        textTransform: "capitalize",
                      }}
                    >
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View
            style={{
              borderColor: onboardingColors.border,
              borderRadius: 12,
              borderWidth: 1,
              overflow: "hidden",
            }}
          >
            <PreferenceRow
              icon="contrast-outline"
              label="High Contrast"
              value={preferences.highContrast}
              onValueChange={(value) => updatePreference("highContrast", value)}
            />
            <PreferenceRow
              icon="sync-outline"
              label="Reduced Motion"
              value={preferences.reducedMotion}
              onValueChange={(value) => updatePreference("reducedMotion", value)}
            />
            <PreferenceRow
              icon="volume-high-outline"
              label="Read Aloud"
              value={preferences.readAloud}
              onValueChange={(value) => updatePreference("readAloud", value)}
            />
            <PreferenceRow
              icon="chatbox-ellipses-outline"
              label="Captions"
              value={preferences.captions}
              onValueChange={(value) => updatePreference("captions", value)}
            />
            <PreferenceRow
              icon="reader-outline"
              label="Simple Language"
              value={preferences.simpleLanguage}
              onValueChange={(value) => updatePreference("simpleLanguage", value)}
            />
          </View>
          <View
            style={{
              alignSelf: "center",
              backgroundColor: preferences.highContrast ? "#FFFFFF" : "rgba(255,255,255,0.86)",
              borderColor: preferences.highContrast ? "#000000" : onboardingColors.border,
              borderRadius: 14,
              borderWidth: preferences.highContrast ? 2 : 1,
              gap: 8,
              padding: 12,
              width: "82%",
            }}
          >
            <Text
              style={{
                color: preferences.highContrast ? "#000000" : onboardingColors.ink,
                fontSize: 14,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              Live Preview
            </Text>
            <NatureScene compact />
            <Text
              style={{
                color: preferences.highContrast ? "#000000" : onboardingColors.ink,
                fontSize:
                  preferences.textSize === "large"
                    ? 20
                    : preferences.textSize === "small"
                      ? 14
                      : 16,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              {"You're doing great one step at a time."}
            </Text>
          </View>
        </>
      )}
      {error ? (
        <Text style={{ color: "#9B2F1F", fontWeight: "800", lineHeight: 19 }}>
          {error}
        </Text>
      ) : null}
      {saving ? (
        <ActivityIndicator color={onboardingColors.teal} />
      ) : (
        <PrimaryButton
          label="Save Preferences"
          onPress={handleSave}
          disabled={loading}
        />
      )}
      <Text
        selectable
        style={{
          color: onboardingColors.ink,
          fontSize: 13,
          lineHeight: 18,
          textAlign: "center",
        }}
      >
        You can update these anytime in Settings.
      </Text>
    </OnboardingShell>
  );
}
