import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

const items = [
  { title: "Create or edit content", href: "/admin/content", description: "Programs, courses, resources, lessons, and bundles." },
  { title: "Progress reports", href: "/reports/longitudinal", description: "Baseline vs month review vs final review." },
  { title: "Notifications", href: "/notifications", description: "Reminders and in-app notifications." },
  { title: "Certificates", href: "/certificates", description: "Standalone and program certificates." },
];

export default function AdminHomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>SafeSteps Admin</Text>
      <Text style={styles.title}>Platform control centre</Text>
      <Text style={styles.body}>Use this area to manage the system after the core shape is stable. Access is protected again by Supabase row-level security and helper permissions.</Text>

      {items.map((item) => (
        <Pressable key={item.href} style={styles.card} onPress={() => router.push(item.href as never)}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardBody}>{item.description}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: "#eef5ef" },
  kicker: { fontSize: 13, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: 30, fontWeight: "800" },
  body: { fontSize: 16, lineHeight: 23 },
  card: { backgroundColor: "white", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#d6e2d8" },
  cardTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  cardBody: { fontSize: 14, lineHeight: 20 },
});
