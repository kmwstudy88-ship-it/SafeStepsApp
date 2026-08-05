import { Link, Redirect, type Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { DailyChallengeHeader, dailyChallengeStyles as styles } from "../../../components/dailyChallenges/shared";
import {
  defaultDailyChallengeSettings,
  loadDailyChallengeSettings,
  saveDailyChallengeSettings,
  type DailyChallengeSettings as DailyChallengeSettingsState,
} from "../../../lib/engines/dailyChallengeSettingsEngine";

export default function DailyChallengeSettings() {
  const { initializing, user } = useAuth();
  const [settings, setSettings] = useState<DailyChallengeSettingsState>(defaultDailyChallengeSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    loadDailyChallengeSettings()
      .then((savedSettings) => {
        if (active) setSettings(savedSettings);
      })
      .catch(() => {
        if (active) setMessage("Could not load saved challenge settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateSetting(key: keyof DailyChallengeSettingsState, value: boolean) {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      const saved = await saveDailyChallengeSettings(settings);
      setSettings(saved);
      setMessage("Challenge settings saved on this device.");
    } catch {
      setMessage("Could not save challenge settings.");
    } finally {
      setSaving(false);
    }
  }

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <DailyChallengeHeader title="Challenge Settings" subtitle="Notification and challenge preferences." />
      {loading ? (
        <View style={styles.card}>
          <ActivityIndicator />
          <Text style={styles.body}>Loading challenge settings...</Text>
        </View>
      ) : (
        <>
          {[
            ["Daily Challenge Reminder", "9:00 AM", "dailyReminder"],
            ["Evening Check-In", "8:00 PM", "eveningCheckIn"],
            ["Streak Alerts", "Notify me when your streak is at risk", "streakAlerts"],
          ].map(([label, detail, key]) => (
            <View key={String(label)} style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.cardTitle}>{String(label)}</Text>
                  <Text style={styles.muted}>{String(detail)}</Text>
                </View>
                <Switch
                  value={settings[key as keyof DailyChallengeSettingsState]}
                  onValueChange={(value) => updateSetting(key as keyof DailyChallengeSettingsState, value)}
                />
              </View>
            </View>
          ))}
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.cardTitle}>Pause Challenges</Text>
                <Text style={styles.muted}>Keep your history while pausing challenge prompts</Text>
              </View>
              <Switch value={settings.paused} onValueChange={(value) => updateSetting("paused", value)} />
            </View>
          </View>
          <Pressable disabled={saving} onPress={handleSave} style={[styles.button, saving && { opacity: 0.65 }]}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Save Settings</Text>}
          </Pressable>
          {message ? <Text style={styles.muted}>{message}</Text> : null}
        </>
      )}
      <Link href={"/parent/daily-challenges" as Href} asChild>
        <Pressable style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Back to Challenges</Text></Pressable>
      </Link>
    </ScrollView>
  );
}
