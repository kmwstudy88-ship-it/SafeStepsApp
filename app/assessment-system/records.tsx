import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

const records = [
  {
    title: "Initial family assessment",
    date: "Draft",
    status: "Needs scoring",
    href: "/assessment-system/scoring" as Href,
  },
  {
    title: "Three month progress review",
    date: "Upcoming",
    status: "Not started",
    href: "/assessment-system/case-setup" as Href,
  },
  {
    title: "Evidence review summary",
    date: "Ready",
    status: "Evidence required",
    href: "/assessment-system/evidence-uploads" as Href,
  },
];

export default function AssessmentRecordsScreen() {
  return (
    <AssessmentScreenShell
      title="Assessment Records"
      subtitle="Track current, upcoming, and completed assessment records for the family case."
    >
      <View style={styles.list}>
        {records.map((record) => (
          <View key={record.title} style={styles.recordCard}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.recordTitle}>{record.title}</Text>
              <Text style={styles.recordMeta}>{record.date}</Text>
              <Text style={styles.recordStatus}>{record.status}</Text>
            </View>

            <Link href={record.href} asChild>
              <Pressable style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Open</Text>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  recordTitle: {
    color: assessmentColors.charcoal,
    fontSize: 17,
    fontWeight: "900",
  },
  recordMeta: {
    color: assessmentColors.muted,
    fontWeight: "700",
  },
  recordStatus: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  smallButton: {
    minHeight: 40,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: assessmentColors.teal,
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});

