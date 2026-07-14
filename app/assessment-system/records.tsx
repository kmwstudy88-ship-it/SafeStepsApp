import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  multiSourceEvidenceRequirements,
  reunificationAssessmentPhases,
} from "../../lib/data/safeStepsAssessmentInstrument";

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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reunification assessment phases</Text>
        <Text style={styles.sectionText}>
          Each review should show what phase it belongs to, which evidence sources were checked, and which risks or gaps still need human review.
        </Text>
        <View style={styles.phaseGrid}>
          {reunificationAssessmentPhases.map((phase) => (
            <View key={phase.id} style={styles.phaseCard}>
              <Text style={styles.phaseTiming}>{phase.timing}</Text>
              <Text style={styles.phaseTitle}>{phase.label}</Text>
              <Text style={styles.phaseText}>{phase.focus}</Text>
              <Text style={styles.phaseSources}>
                Sources: {phase.requiredSources.join(", ")}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Multi-source evidence checks</Text>
        <Text style={styles.sectionText}>
          The assessment record should not rely on one data point. Self-report, observation, collateral, uploads, and transcript/session notes must be kept separate.
        </Text>
        <View style={styles.sourceList}>
          {multiSourceEvidenceRequirements.map((requirement) => (
            <View key={requirement.source} style={styles.sourceRow}>
              <Text style={styles.sourceTitle}>{requirement.source}</Text>
              <Text style={styles.sourceText}>{requirement.purpose}</Text>
              <Text style={styles.sourceCaution}>{requirement.caution}</Text>
            </View>
          ))}
        </View>
      </View>

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
  section: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionText: {
    color: assessmentColors.muted,
    lineHeight: 21,
  },
  phaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  phaseCard: {
    flexGrow: 1,
    flexBasis: 220,
    gap: 7,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE7E1",
    backgroundColor: "#F7FBF9",
  },
  phaseTiming: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  phaseTitle: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  phaseText: {
    color: assessmentColors.muted,
    lineHeight: 20,
  },
  phaseSources: {
    color: assessmentColors.charcoal,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  sourceList: {
    gap: 8,
  },
  sourceRow: {
    gap: 4,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  sourceTitle: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  sourceText: {
    color: assessmentColors.charcoal,
    lineHeight: 20,
  },
  sourceCaution: {
    color: assessmentColors.muted,
    lineHeight: 19,
    fontSize: 13,
  },
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

