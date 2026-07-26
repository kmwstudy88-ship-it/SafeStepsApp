import { Link, Redirect, type Href } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";

import { useAuth } from "../../../lib/auth";
import { DailyChallengeHeader, dailyChallengeStyles as styles } from "../../../components/dailyChallenges/shared";

export default function DailyChallengeSettings() {
  const { initializing, user } = useAuth();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [eveningCheckIn, setEveningCheckIn] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [paused, setPaused] = useState(false);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <DailyChallengeHeader title="Challenge Settings" subtitle="Notification and challenge preferences." />
      {[
        ["Daily Challenge Reminder", "9:00 AM", dailyReminder, setDailyReminder],
        ["Evening Check-In", "8:00 PM", eveningCheckIn, setEveningCheckIn],
        ["Streak Alerts", "Notify me when my streak is at risk", streakAlerts, setStreakAlerts],
      ].map(([label, detail, value, setter]) => (
        <View key={String(label)} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.cardTitle}>{String(label)}</Text>
              <Text style={styles.muted}>{String(detail)}</Text>
            </View>
            <Switch value={Boolean(value)} onValueChange={setter as (value: boolean) => void} />
          </View>
        </View>
      ))}
      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.cardTitle}>Pause Challenges</Text>
            <Text style={styles.muted}>Take a break</Text>
          </View>
          <Switch value={paused} onValueChange={setPaused} />
        </View>
      </View>
      <Link href={"/parent/daily-challenges" as Href} asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Save Settings</Text></Pressable>
      </Link>
    </ScrollView>
  );
}
