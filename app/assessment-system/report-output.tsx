import { StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

const sections = [
  "Case overview",
  "Assessment domains",
  "Rubric score summary",
  "Evidence summary",
  "Strengths and protective factors",
  "Risks and unresolved concerns",
  "Recommended next steps",
];

export default function ReportOutputScreen() {
  return (
    <AssessmentScreenShell
      title="Report Output"
      subtitle="Preview the structured report areas before connecting live data and export tools."
    >
      <View style={styles.reportCard}>
        <Text style={styles.reportTitle}>SafeSteps Assessment Report</Text>
        <Text style={styles.reportText}>
          This report preview will combine case setup, assessment records, rubric scoring, and evidence uploads into one structured summary.
        </Text>

        {sections.map((section, index) => (
          <View key={section} style={styles.sectionRow}>
            <Text style={styles.sectionNumber}>{index + 1}</Text>
            <Text style={styles.sectionText}>{section}</Text>
          </View>
        ))}
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    gap: 14,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  reportTitle: {
    color: assessmentColors.charcoal,
    fontSize: 22,
    fontWeight: "900",
  },
  reportText: {
    color: assessmentColors.muted,
    lineHeight: 21,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F0",
  },
  sectionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    color: "#FFFFFF",
    backgroundColor: assessmentColors.teal,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "900",
  },
  sectionText: {
    flex: 1,
    color: assessmentColors.charcoal,
    fontWeight: "800",
  },
});

