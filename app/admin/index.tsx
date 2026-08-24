import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

const items = [
  { title: "Personal AI handoffs", href: "/admin/personal-ai-handoffs", description: "Review assignment-scoped, consented safety handoffs." },
  { title: "Personal AI flow versions", href: "/admin/personal-ai-flow-versions", description: "Review immutable versions, approvals, release checks, and rollback history." },
  { title: "Referral verification", href: "/admin/personal-ai-referrals", description: "Review contact evidence, due dates, safe-mode labels, and independent approvals." },
  { title: "Personal AI incidents", href: "/admin/personal-ai-incidents", description: "Triage safety, privacy, referral, and operational incidents." },
  { title: "Personal AI launch gate", href: "/admin/personal-ai-launch-readiness", description: "View the evidence-backed GO or NO-GO decision." },
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
