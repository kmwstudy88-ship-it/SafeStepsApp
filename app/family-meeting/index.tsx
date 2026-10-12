import { Link } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import {
  familyReunificationSafetyAndRewardsEngine,
  familyMeetingPromptAndReflectionEngine,
  getCircuitBreakerTools,
  getClinicianDashboardWidgets,
  getFamilyMeetingFrontendFlows,
  getFamilyMeetingApiEndpoints,
  getFamilyMeetingImplementationRoadmap,
  getFamilyMeetingSecurityGuardrails,
  getFamilyMeetingPromptCardsByPhase,
  getNominationPromptCardsForRole,
  getWeeklyMeetingUxSteps,
  type DeEscalationTool,
  type FamilyApiEndpoint,
  type FrontendFlow,
  type EngineeringRoadmapSprint,
  type SecurityGuardrail,
  type ClinicianDashboardWidget,
  type FamilyMeetingPromptCard,
  type NominationPromptCard,
  type WeeklyMeetingStep,
} from "../../lib/data/familyMeetingPromptEngine";

function PromptCard({ card }: { card: FamilyMeetingPromptCard }) {
  const title =
    card.phase === "nomination"
      ? `${card.target_role} Nomination`
      : card.phase === "negotiation"
        ? card.title
        : card.category;
  const body = card.phase === "negotiation" ? card.instruction : card.question;

  return (
    <View style={styles.promptCard}>
      <View style={styles.promptTop}>
        <Text style={styles.promptId}>{card.prompt_id}</Text>
        <Text style={styles.promptType}>{card.field_type.replaceAll("_", " ")}</Text>
      </View>
      <Text style={styles.promptTitle}>{title}</Text>
      <Text style={styles.promptBody}>{body}</Text>
      {"options" in card && card.options ? (
        <View style={styles.optionRow}>
          {card.options.map((option) => (
            <Text key={option} style={styles.optionChip}>
              {option}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function RoleColumn({ title, cards }: { title: string; cards: NominationPromptCard[] }) {
  return (
    <View style={styles.roleColumn}>
      <Text style={styles.columnTitle}>{title}</Text>
      {cards.map((card) => (
        <PromptCard key={card.prompt_id} card={card} />
      ))}
    </View>
  );
}

function PhaseSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      {children}
    </View>
  );
}

function CircuitBreakerCard({ tool }: { tool: DeEscalationTool }) {
  return (
    <View style={styles.safetyCard}>
      <Text style={styles.promptId}>{tool.tool_id}</Text>
      <Text style={styles.promptTitle}>{tool.name}</Text>
      <Text style={styles.metaText}>Trigger: {tool.trigger}</Text>
      <Text style={styles.promptBody}>{tool.prompt}</Text>
    </View>
  );
}

function MetricTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function DashboardWidget({ widget }: { widget: ClinicianDashboardWidget }) {
  return (
    <View style={styles.widgetCard}>
      <Text style={styles.promptId}>{widget.widget_id}</Text>
      <Text style={styles.promptTitle}>{widget.title}</Text>
      <Text style={styles.promptBody}>{widget.purpose}</Text>
    </View>
  );
}

function EndpointRow({ endpoint }: { endpoint: FamilyApiEndpoint }) {
  return (
    <View style={styles.endpointRow}>
      <Text style={styles.methodPill}>{endpoint.method}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.endpointPath}>{endpoint.endpoint}</Text>
        <Text style={styles.endpointDescription}>{endpoint.description}</Text>
      </View>
    </View>
  );
}

function FlowCard({ flow }: { flow: FrontendFlow }) {
  return (
    <View style={styles.flowCard}>
      <Text style={styles.promptId}>{flow.flow_id}</Text>
      <Text style={styles.promptTitle}>{flow.audience}</Text>
      <Text style={styles.metaText}>{flow.ux_mode}</Text>
      {flow.screens.map((screen) => (
        <View key={screen.screen} style={styles.compactRow}>
          <Text style={styles.compactTitle}>{screen.screen}</Text>
          <Text style={styles.compactText}>{screen.purpose}</Text>
        </View>
      ))}
    </View>
  );
}

function UxStepCard({ step }: { step: WeeklyMeetingStep }) {
  return (
    <View style={styles.stepCard}>
      <Text style={styles.promptId}>{step.step_id}</Text>
      <Text style={styles.promptTitle}>{step.title}</Text>
      <Text style={styles.metaText}>{step.timing}</Text>
      {step.actions.map((action) => (
        <Text key={action} style={styles.bulletLine}>
          {action}
        </Text>
      ))}
    </View>
  );
}

function SecurityGuardrailCard({ guardrail }: { guardrail: SecurityGuardrail }) {
  return (
    <View style={styles.guardrailCard}>
      <Text style={styles.promptTitle}>{guardrail.domain}</Text>
      <Text style={styles.promptBody}>{guardrail.technical_implementation}</Text>
      <Text style={styles.metaText}>Target: {guardrail.target_standard}</Text>
    </View>
  );
}

function RoadmapCard({ sprint }: { sprint: EngineeringRoadmapSprint }) {
  return (
    <View style={styles.roadmapCard}>
      <Text style={styles.promptId}>{sprint.sprint_id}</Text>
      <Text style={styles.promptTitle}>{sprint.title}</Text>
      <Text style={styles.metaText}>{sprint.timeframe}</Text>
      {sprint.deliverables.map((deliverable) => (
        <Text key={deliverable} style={styles.bulletLine}>
          {deliverable}
        </Text>
      ))}
    </View>
  );
}

export default function FamilyMeetingPromptCardsScreen() {
  const negotiationCards = getFamilyMeetingPromptCardsByPhase("negotiation");
  const reflectionCards = getFamilyMeetingPromptCardsByPhase("reflection");
  const samplePayload = familyMeetingPromptAndReflectionEngine.sample_meeting_session_payload;
  const safetyEngine = familyReunificationSafetyAndRewardsEngine;
  const safetyTelemetry = safetyEngine.case_manager_oversight_telemetry;
  const rewards = safetyEngine.gamification_and_rewards;

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Family activity selection</Text>
          <Text style={styles.title}>Prompt Card System</Text>
          <Text style={styles.subtitle}>
            A three-phase guide for nomination, family council negotiation, and Sunday reflection.
          </Text>
          <View style={styles.heroActions}>
            <Link href="/parent-child" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Back to Parent-Child</Text>
              </Pressable>
            </Link>
            <Link href="/timeline" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Open Calendar</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <PhaseSection
          eyebrow="Phase 1"
          title="Individual Nomination Cards"
          description="Displayed when a parent or child is browsing and choosing an activity."
        >
          <View style={styles.twoColumn}>
            <RoleColumn title="Child cards" cards={getNominationPromptCardsForRole("Child")} />
            <RoleColumn title="Parent cards" cards={getNominationPromptCardsForRole("Parent")} />
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Phase 2"
          title="Family Negotiation and Voting Cards"
          description="Displayed on the shared screen during the family council meeting when choices conflict."
        >
          <View style={styles.cardGrid}>
            {negotiationCards.map((card) => (
              <PromptCard key={card.prompt_id} card={card} />
            ))}
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Phase 3"
          title="Post-Activity Sunday Reflection Cards"
          description="Used during the Sunday evening check-in and photo upload."
        >
          <View style={styles.cardGrid}>
            {reflectionCards.map((card) => (
              <PromptCard key={card.prompt_id} card={card} />
            ))}
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Phase 4"
          title="Safety Circuit-Breakers and Rewards"
          description="Used when voting stalls, tension rises, or the family needs a low-pressure fallback."
        >
          <View style={styles.safetySummary}>
            <MetricTile
              label="Consensus timer"
              value={`${safetyEngine.circuit_breaker_protocols.consensus_timer_seconds / 60} min`}
              detail="If no decision is reached, pause voting and trigger a neutral fallback."
            />
            <MetricTile
              label="Pause and reset"
              value={`${safetyEngine.circuit_breaker_protocols.pause_reset_seconds / 60} min`}
              detail="Any family member can request a guided cool-down."
            />
            <MetricTile
              label="Current streak"
              value={`${rewards.family_streaks.current_weekly_streak} weeks`}
              detail={rewards.family_streaks.cycle_required_steps.join(" -> ")}
            />
            <MetricTile
              label="Memory book"
              value={`${rewards.memory_book_generator.total_photos_logged} photos`}
              detail={rewards.memory_book_generator.next_milestone_target}
            />
          </View>
          <View style={styles.cardGrid}>
            {getCircuitBreakerTools().map((tool) => (
              <CircuitBreakerCard key={tool.tool_id} tool={tool} />
            ))}
          </View>
          <View style={styles.badgeRow}>
            {rewards.badges_earned.map((badge) => (
              <View key={badge.badge_id} style={styles.badgeCard}>
                <Text style={styles.promptId}>{badge.badge_id}</Text>
                <Text style={styles.promptTitle}>{badge.title}</Text>
                <Text style={styles.promptBody}>{badge.description}</Text>
                <Text style={styles.metaText}>Unlocked {badge.date_unlocked}</Text>
              </View>
            ))}
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Oversight"
          title="Case Manager and Clinician Monitoring"
          description="A privacy-aware review dashboard for trends, safety monitor events, reflection uploads, and objective progress exports."
        >
          <View style={styles.dashboardPanel}>
            <View style={styles.dashboardHeader}>
              <View>
                <Text style={styles.schemaLabel}>Clinician dashboard</Text>
                <Text style={styles.schemaTitle}>Family {safetyTelemetry.family_id}</Text>
                <Text style={styles.schemaText}>
                  {safetyTelemetry.current_program_stage} - {safetyTelemetry.current_week_label}
                </Text>
              </View>
              <View style={styles.healthScore}>
                <Text style={styles.healthValue}>{safetyTelemetry.overall_health_score}/100</Text>
                <Text style={styles.healthLabel}>Overall health score</Text>
              </View>
            </View>
            <View style={styles.safetySummary}>
              <MetricTile
                label="Consensus rate"
                value={`${safetyTelemetry.consensus_rate_percent}%`}
                detail="Shared agreement across recent meetings."
              />
              <MetricTile
                label="Listening score"
                value={`${safetyTelemetry.clinical_summary_export.active_listening_score}/5`}
                detail="Communication trend for facilitator review."
              />
              <MetricTile
                label="Alignment"
                value={`${safetyTelemetry.clinical_summary_export.parent_child_alignment_percent}%`}
                detail="Agreement on weekend choices."
              />
              <MetricTile
                label="Conflict level"
                value={safetyTelemetry.clinical_summary_export.average_conflict_level}
                detail="Observed pattern, not an automated risk finding."
              />
            </View>
            <View style={styles.feedList}>
              {safetyTelemetry.flags_and_alerts.map((alert) => (
                <View key={`${alert.alert_type}-${alert.message}`} style={styles.feedItem}>
                  <Text style={styles.methodPill}>{alert.severity}</Text>
                  <Text style={styles.feedText}>{alert.message}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.cardGrid}>
            {getClinicianDashboardWidgets().map((widget) => (
              <DashboardWidget key={widget.widget_id} widget={widget} />
            ))}
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Architecture"
          title="API and Database Blueprint"
          description="Implementation contracts for connecting the family app with the clinician oversight platform."
        >
          <View style={styles.schemaPanel}>
            <View style={{ flex: 1, minWidth: 280 }}>
              <Text style={styles.schemaLabel}>Endpoint contracts</Text>
              {getFamilyMeetingApiEndpoints().map((endpoint) => (
                <EndpointRow key={`${endpoint.method}-${endpoint.endpoint}`} endpoint={endpoint} />
              ))}
            </View>
            <View style={styles.payloadSummary}>
              <Text style={styles.schemaLabel}>Consensus payload</Text>
              <Text style={styles.payloadLine}>Family: {safetyEngine.sample_weekly_consensus_payload.family_id}</Text>
              <Text style={styles.payloadLine}>Week: {safetyEngine.sample_weekly_consensus_payload.week_number}</Text>
              <Text style={styles.payloadLine}>Decision: {safetyEngine.sample_weekly_consensus_payload.decision_method}</Text>
              <Text style={styles.payloadLine}>
                Timer: {safetyEngine.sample_weekly_consensus_payload.timer_duration_seconds}s
              </Text>
            </View>
          </View>
          <View style={styles.cardGrid}>
            {safetyEngine.database_schema_blueprint.map((table) => (
              <View key={table.table_name} style={styles.widgetCard}>
                <Text style={styles.promptId}>{table.table_name}</Text>
                <Text style={styles.promptBody}>{table.purpose}</Text>
                <Text style={styles.metaText}>{table.key_fields.join(", ")}</Text>
              </View>
            ))}
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Frontend"
          title="Component Tree and Navigation Flow"
          description="Maps the child, parent, and clinician experiences into role-specific screens without blending private child content into professional or parent views."
        >
          <View style={styles.cardGrid}>
            {getFamilyMeetingFrontendFlows().map((flow) => (
              <FlowCard key={flow.flow_id} flow={flow} />
            ))}
          </View>
          <View style={styles.cardGrid}>
            {getWeeklyMeetingUxSteps().map((step) => (
              <UxStepCard key={step.step_id} step={step} />
            ))}
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Security"
          title="Privacy and Compliance Guardrails"
          description="Engineering targets for sensitive minor data, legal case context, media assets, RBAC, tenant isolation, and auditability."
        >
          <View style={styles.cardGrid}>
            {getFamilyMeetingSecurityGuardrails().map((guardrail) => (
              <SecurityGuardrailCard key={guardrail.domain} guardrail={guardrail} />
            ))}
          </View>
        </PhaseSection>

        <PhaseSection
          eyebrow="Roadmap"
          title="Engineering Implementation Sprints"
          description="A staged build plan from schema and activity ingestion through family workflow, safety/rewards, clinician oversight, and security review."
        >
          <View style={styles.cardGrid}>
            {getFamilyMeetingImplementationRoadmap().map((sprint) => (
              <RoadmapCard key={sprint.sprint_id} sprint={sprint} />
            ))}
          </View>
        </PhaseSection>

        <View style={styles.schemaPanel}>
          <View>
            <Text style={styles.schemaLabel}>Prompt engine</Text>
            <Text style={styles.schemaTitle}>
              {familyMeetingPromptAndReflectionEngine.title} v{familyMeetingPromptAndReflectionEngine.version}
            </Text>
            <Text style={styles.schemaText}>{familyMeetingPromptAndReflectionEngine.description}</Text>
          </View>
          <View style={styles.payloadSummary}>
            <Text style={styles.payloadLine}>Family: {samplePayload.family_id}</Text>
            <Text style={styles.payloadLine}>Week: {samplePayload.week_number}</Text>
            <Text style={styles.payloadLine}>Outcome: {samplePayload.negotiation_outcome.consensus_type}</Text>
            <Text style={styles.payloadLine}>Fun rating: {samplePayload.post_activity_reflection.ratings.overall_fun}/5</Text>
          </View>
        </View>
      </ScrollView>
      <AppBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#F6F4EF",
  },
  content: {
    padding: 20,
    paddingBottom: 110,
    gap: 18,
  },
  hero: {
    backgroundColor: "#113C46",
    borderRadius: 8,
    padding: 22,
  },
  kicker: {
    color: "#A8D7CA",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 6,
  },
  subtitle: {
    color: "#E8F2EF",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    maxWidth: 760,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    backgroundColor: "#F0C04D",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#19323A",
    fontWeight: "900",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#A8D7CA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  section: {
    gap: 10,
  },
  eyebrow: {
    color: "#0A756F",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#173B45",
    fontSize: 24,
    fontWeight: "900",
  },
  sectionDescription: {
    color: "#385C63",
    fontSize: 15,
    lineHeight: 22,
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  roleColumn: {
    flex: 1,
    minWidth: 310,
    gap: 10,
  },
  columnTitle: {
    color: "#173B45",
    fontSize: 18,
    fontWeight: "900",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  promptCard: {
    flexGrow: 1,
    flexBasis: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E2DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 10,
  },
  promptTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  promptId: {
    color: "#0A756F",
    fontSize: 12,
    fontWeight: "900",
  },
  promptType: {
    color: "#4B5F66",
    backgroundColor: "#EDF3F0",
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  promptTitle: {
    color: "#173B45",
    fontSize: 18,
    fontWeight: "900",
  },
  promptBody: {
    color: "#284B54",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    color: "#173B45",
    backgroundColor: "#F3E7C8",
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
  },
  schemaPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7DFDA",
    backgroundColor: "#EAF3F0",
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  schemaLabel: {
    color: "#0A756F",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  schemaTitle: {
    color: "#173B45",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  schemaText: {
    color: "#385C63",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 760,
  },
  payloadSummary: {
    minWidth: 230,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    gap: 5,
  },
  payloadLine: {
    color: "#173B45",
    fontSize: 13,
    fontWeight: "800",
  },
  safetySummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricTile: {
    flexGrow: 1,
    flexBasis: 190,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E2DC",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  metricLabel: {
    color: "#4B5F66",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  metricValue: {
    color: "#173B45",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
  },
  metricDetail: {
    color: "#385C63",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    fontWeight: "700",
  },
  safetyCard: {
    flexGrow: 1,
    flexBasis: 320,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E3C7A6",
    backgroundColor: "#FFF8EC",
    padding: 16,
    gap: 9,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeCard: {
    flexGrow: 1,
    flexBasis: 240,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E4CF",
    backgroundColor: "#F7FBF2",
    padding: 16,
    gap: 8,
  },
  metaText: {
    color: "#577078",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  dashboardPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7DFDA",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 14,
  },
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 14,
  },
  healthScore: {
    minWidth: 180,
    borderRadius: 8,
    backgroundColor: "#DDEFE5",
    padding: 14,
  },
  healthValue: {
    color: "#176E4E",
    fontSize: 27,
    fontWeight: "900",
  },
  healthLabel: {
    color: "#315A49",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 4,
  },
  feedList: {
    gap: 8,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#ECF0EE",
    paddingTop: 10,
  },
  feedText: {
    flex: 1,
    color: "#284B54",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  widgetCard: {
    flexGrow: 1,
    flexBasis: 290,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E2DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 8,
  },
  endpointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#D7DFDA",
  },
  methodPill: {
    color: "#173B45",
    backgroundColor: "#F3E7C8",
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
  },
  endpointPath: {
    color: "#173B45",
    fontSize: 14,
    fontWeight: "900",
  },
  endpointDescription: {
    color: "#385C63",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  flowCard: {
    flexGrow: 1,
    flexBasis: 330,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9E2DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 10,
  },
  compactRow: {
    borderTopWidth: 1,
    borderTopColor: "#ECF0EE",
    paddingTop: 8,
    gap: 2,
  },
  compactTitle: {
    color: "#173B45",
    fontSize: 14,
    fontWeight: "900",
  },
  compactText: {
    color: "#385C63",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  stepCard: {
    flexGrow: 1,
    flexBasis: 290,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7DFDA",
    backgroundColor: "#F8FBFA",
    padding: 16,
    gap: 7,
  },
  bulletLine: {
    color: "#284B54",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  guardrailCard: {
    flexGrow: 1,
    flexBasis: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D3DDE6",
    backgroundColor: "#F7FAFC",
    padding: 16,
    gap: 8,
  },
  roadmapCard: {
    flexGrow: 1,
    flexBasis: 270,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E3C7A6",
    backgroundColor: "#FFFCF6",
    padding: 16,
    gap: 7,
  },
});
