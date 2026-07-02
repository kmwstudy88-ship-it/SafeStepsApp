import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

const steps: {
  title: string;
  description: string;
  href: Href;
  status: string;
}[] = [
  {
    title: "Case Setup",
    description: "Create the family case profile, worker details, program stream, and key dates.",
    href: "/assessment-system/case-setup" as Href,
    status: "Start here",
  },
  {
    title: "Assessment Records",
    description: "View assessment history, review due dates, and continue saved records.",
    href: "/assessment-system/records" as Href,
    status: "Records",
  },
  {
    title: "Rubric Scoring",
    description: "Score parenting capacity, safety, stability, engagement, and evidence strength.",
    href: "/assessment-system/scoring" as Href,
    status: "Scoring",
  },
  {
    title: "Evidence Uploads",
    description: "Attach observations, documents, visit notes, photos, and service confirmations.",
    href: "/assessment-system/evidence-uploads" as Href,
    status: "Evidence",
  },
  {
    title: "Report Output",
    description: "Generate a clear report summary for case review, court, or support planning.",
    href: "/assessment-system/report-output" as Href,
    status: "Reports",
  },
];

export default function AssessmentSystemHome() {
  return (
    <AssessmentScreenShell
      title="Assessment System"
      subtitle="A structured place to document case setup, assessment records, rubric scoring, evidence, and report output."
    >
      <View style={styles.grid}>
        {steps.map((step) => (
          <Link key={step.title} href={step.href} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.badge}>{step.status}</Text>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardText}>{step.description}</Text>
              <Text style={styles.linkText}>Open</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    flexGrow: 1,
    flexBasis: 280,
    gap: 10,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
  },
  cardTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  cardText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  linkText: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
});

