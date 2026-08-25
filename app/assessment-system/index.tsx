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
    title: "Document Intelligence",
    description: "Analyze pasted or uploaded document text across capacity, wellbeing, safety, evidence, and worker-review signals.",
    href: "/assessment-system/document-intelligence" as Href,
    status: "AI review",
  },
  {
    title: "Fairness & Reviewability",
    description:
      "Run document fairness detection for bias, coercion, discriminatory framing, and reviewability safeguards before report export.",
    href: "/assessment-system/fairness-review" as Href,
    status: "Safeguards",
  },
  {
    title: "Assessment Method Encyclopedia",
    description:
      "Use varied assessment formats to measure knowledge, application, insight, behaviour, evidence, professional review, and longitudinal change.",
    href: "/assessment-system/method-encyclopedia" as Href,
    status: "Methods",
  },
  {
    title: "Sequence Knowledge",
    description:
      "Arrange child-support actions into a safe order while separating actions that should be left out.",
    href: "/assessment-system/sequence-knowledge" as Href,
    status: "Sequence",
  },
  {
    title: "Psychometric Assessment Engine",
    description:
      "Score demonstrated competency with confidence, evidence quality, reliability, validity, sufficiency, trend, and contradiction review.",
    href: "/assessment-system/psychometric-engine" as Href,
    status: "Psychometric",
  },
  {
    title: "Measurement & Evidence Ontology",
    description:
      "Trace person, competency, capability, behaviour, evidence, observation, finding, claim, conclusion, recommendation, and human review.",
    href: "/assessment-system/measurement-evidence-ontology" as Href,
    status: "Ontology",
  },
  {
    title: "Human Development Model",
    description:
      "Measure development from exposure to mastery and separate learning progress from demonstrated competency evidence.",
    href: "/assessment-system/human-development-model" as Href,
    status: "Development",
  },
  {
    title: "Human Development Operating System",
    description:
      "Connect people, competencies, activities, evidence, reasoning, outcomes, progress, time, quality, reports, and AI.",
    href: "/assessment-system/human-development-operating-system" as Href,
    status: "HDOS",
  },
  {
    title: "Platform Domain Architecture",
    description:
      "Define domain ownership, event flow, shared services, permanent IDs, versioning, and implementation blueprints.",
    href: "/assessment-system/platform-domain-architecture" as Href,
    status: "Platform",
  },
  {
    title: "Implementation Blueprint",
    description:
      "Map the assessment database foundation, scoring tables, evidence links, claims, reviews, quality flags, audit records, and build phases.",
    href: "/assessment-system/implementation-blueprint" as Href,
    status: "Blueprint",
  },
  {
    title: "Workflow & State Machines",
    description:
      "Define controlled lifecycle rules for templates, assignments, sessions, responses, scoring, evidence, reviews, claims, reports, events, and permissions.",
    href: "/assessment-system/workflow-state-machines" as Href,
    status: "Workflow",
  },
  {
    title: "Fairness & Assessor Governance",
    description:
      "Govern context, accessibility, culture, socioeconomic barriers, assessor credentials, conflicts, bias screening, AI limits, appeals, and procedural fairness.",
    href: "/assessment-system/fairness-governance" as Href,
    status: "Governance",
  },
  {
    title: "AI Governance & Responsible Automation",
    description:
      "Govern AI use cases, model lifecycle, prompt workflows, training data, inference routing, guardrails, fairness, explainability, human review, monitoring, incidents, and audit exports.",
    href: "/assessment-system/ai-governance" as Href,
    status: "AI controls",
  },
  {
    title: "Evidence Integrity & Chain of Custody",
    description:
      "Protect evidence provenance, hashes, immutable originals, metadata, consent, child permissions, custody, legal holds, exports, and integrity alerts.",
    href: "/assessment-system/evidence-integrity" as Href,
    status: "Integrity",
  },
  {
    title: "Event Orchestration",
    description:
      "Coordinate outbox events, workflow instances, retries, human tasks, timers, projections, notifications, appeals, reports, and failed-job recovery.",
    href: "/assessment-system/event-orchestration" as Href,
    status: "Events",
  },
  {
    title: "API & Service Contracts",
    description:
      "Define typed API envelopes, stable errors, idempotency, concurrency, upload quarantine, endpoint groups, contract tests, and service boundaries.",
    href: "/assessment-system/api-service-contracts" as Href,
    status: "API",
  },
  {
    title: "Program and Service Recommendations",
    description:
      "Match parent-reported needs to evidence-based parenting programs, service pathways, parent-report wording, and referral drafts.",
    href: "/assessment-system/program-service-recommendations" as Href,
    status: "Recommendations",
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
    title: "Contact Progression Review",
    description:
      "Review generated stage recommendations, hard blocks, required interventions, and caseworker override records.",
    href: "/assessment-system/contact-progression-review" as Href,
    status: "Stage review",
  },
  {
    title: "Home Again Transition Review",
    description:
      "Review return-home stability, child adjustment, setbacks, support use, and maintenance-plan step-down gates.",
    href: "/assessment-system/home-again-transition-review" as Href,
    status: "Home Again",
  },
  {
    title: "Report Output",
    description: "Generate a clear report summary for case review, court, or support planning.",
    href: "/assessment-system/report-output" as Href,
    status: "Reports",
  },
];

const coreLaunchTitles = new Set([
  "Case Setup",
  "Assessment Records",
  "Parent Profiles",
  "Protective Capacity Scoring",
  "Evidence Uploads",
  "Document Intelligence",
  "Fairness & Reviewability",
  "Readiness Index",
  "Contact Progression Review",
  "Report Output",
]);

export default function AssessmentSystemHome() {
  const coreSteps = steps.filter((step) => coreLaunchTitles.has(step.title));
  const extendedSteps = steps.filter((step) => !coreLaunchTitles.has(step.title));

  return (
    <AssessmentScreenShell
      title="Assessment System"
      subtitle="A structured place to document case setup, assessment records, protective-capacity scoring, evidence, readiness, and report output."
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core launch workflow</Text>
        <Text style={styles.sectionText}>
          Start with the minimum production slice: case setup, records, scoring, evidence, review, readiness, and report output.
        </Text>
        <View style={styles.grid}>
          {coreSteps.map((step) => (
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Extended design and governance areas</Text>
        <Text style={styles.sectionText}>
          These routes remain available for blueprint, governance, and deeper assessment-system exploration outside the parent-first launch path.
        </Text>
        <View style={styles.grid}>
          {extendedSteps.map((step) => (
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
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
    marginBottom: 24,
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 24,
    fontWeight: "900",
  },
  sectionText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
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
