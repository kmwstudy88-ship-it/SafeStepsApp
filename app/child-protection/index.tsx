import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { globalStyles } from "../../lib/styles";

const oversightItems = [
  {
    title: "Risk and readiness overview",
    body: "Review assessment readiness, critical flags, evidence strength, and phase status without editing parent records.",
    href: "/assessment-system/readiness-index",
  },
  {
    title: "360° Multi-Informant & SAFER Annexures",
    body: "Triangulate contact supervisor, teacher SDQ, and AOD worker collateral and review clinician-signed SAFER court annexures.",
    href: "/assessment-system/multi-informant-court-bridge",
  },
  {
    title: "Child Three Houses & Voice-of-the-Child",
    body: "Review Signs of Safety House of Good Things, Worries, Dreams, and 5-Finger Safety Network adult contacts.",
    href: "/child/three-houses-playroom",
  },
  {
    title: "Contact Visit Reunification Evidence",
    body: "Review developmental handover observations, parent visit reflections, and worker reunification evidence notes.",
    href: "/visits/transition-coach",
  },
  {
    title: "Evidence report review",
    body: "Open report summaries, stored evidence counts, task completion, and progress notes prepared for case review.",
    href: "/reports",
  },
  {
    title: "Clinician SPJ Governance & Sign-Off",
    body: "Verify Structured Professional Judgement (SPJ) approvals, external psychologist bridges, and SHA-256 audit receipts.",
    href: "/clinician-review",
  },
  {
    title: "Timeline and court preparation",
    body: "Review the current event timeline while legal timeline snapshots are being built.",
    href: "/timeline",
  },
  {
    title: "Notifications and alerts",
    body: "Review reminders and alert records that have been generated inside SafeSteps.",
    href: "/notifications",
  },
];

export default function ChildProtectionPortalScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Child Protection Portal</Text>
      <Text style={globalStyles.subtitle}>
        Read-only statutory oversight for assessment status, safety flags, evidence summaries, reports, and timeline review.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Access model</Text>
        <Text style={globalStyles.cardText}>
          This portal is designed for oversight and review. It should not edit parent reflections, scoring, or evidence records directly.
        </Text>
      </View>

      {oversightItems.map((item) => (
        <View key={item.title} style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>{item.title}</Text>
          <Text style={globalStyles.cardText}>{item.body}</Text>
          <Link href={item.href as never} asChild>
            <TouchableOpacity style={globalStyles.secondaryButton}>
              <Text style={globalStyles.secondaryButtonText}>Open</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ))}

      <AppBottomNav />
    </ScrollView>
  );
}
