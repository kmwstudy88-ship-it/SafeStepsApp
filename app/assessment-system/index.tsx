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
    title: "Parent Profiles",
    description: "Split each parent into identity, protective capacity, risk, parenting behaviour, and engagement domains.",
    href: "/assessment-system/parent-profiles" as Href,
    status: "Profiles",
  },
  {
    title: "Parent Identity & Background",
    description: "Use structured background prompts to document school history, reflection, parenting impact, and worker interpretation.",
    href: "/assessment-system/parent-identity" as Href,
    status: "Identity",
  },
  {
    title: "Protective Capacity Scoring",
    description: "Score safety, protective capacity, routines, services, child voice, and evidence with critical overrides.",
    href: "/assessment-system/scoring" as Href,
    status: "Scoring",
  },
  {
    title: "Child Development & Capacity",
    description:
      "Use age-based scenarios to test child development awareness, risk recognition, parent regulation, and protective action.",
    href: "/assessment-system/child-development-capacity" as Href,
    status: "Scenarios",
  },
  {
    title: "Intensive Reunification Support",
    description:
      "Track intensive program models, kinship mapping, graduated contact, service-load risk, and pre-return safety verification.",
    href: "/assessment-system/intensive-reunification-support" as Href,
    status: "High intensity",
  },
  {
    title: "Evidence Uploads",
    description: "Attach observations, documents, visit notes, photos, and service confirmations.",
    href: "/assessment-system/evidence-uploads" as Href,
    status: "Evidence",
  },
  {
    title: "Visit and Contact Logistics",
    description: "Record contact dates, handovers, observed quality, incidents, and factual summaries against the current case.",
    href: "/visits" as Href,
    status: "Visits",
  },
  {
    title: "Session Management",
    description: "Schedule sessions, generate agendas, record notes, handle consented transcripts, score sessions, and flag missed sessions.",
    href: "/sessions" as Href,
    status: "Sessions",
  },
  {
    title: "Document Management",
    description: "Track document requests, versions, expiry dates, evidence links, and report-ready attachments.",
    href: "/documents" as Href,
    status: "Documents",
  },
  {
    title: "Service Referrals",
    description: "Track support referrals, provider-contact consent, attendance evidence, overdue follow-up, and review prompts.",
    href: "/referrals" as Href,
    status: "Referrals",
  },
  {
    title: "Readiness Index",
    description: "Check readiness across home stability, parenting routines, child voice, evidence, and risk reduction.",
    href: "/assessment-system/readiness-index" as Href,
    status: "Readiness",
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
      subtitle="A structured place to document case setup, assessment records, protective-capacity scoring, evidence, readiness, and report output."
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

