import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppBottomNav } from "../../../components/AppBottomNav";
import {
  ASSESSMENT_PHASE_TOOL_REGISTER,
  getPhaseToolEntry,
  type ProgramPhase,
} from "../../../lib/data/assessmentPhaseToolRegister";
import { globalStyles } from "../../../lib/styles";

const STORAGE_MODE_LABELS: Record<string, string> = {
  app_native: "App-native",
  external_summary: "External summary only",
  metadata_only: "Metadata only",
};

const ADMIN_ROLE_LABELS: Record<string, string> = {
  psychologist: "Qualified psychologist",
  worker: "Worker",
  trained_observer: "Trained observer",
  licensed_platform: "Licensed platform",
  worker_under_policy: "Worker under agency policy",
  forensic_psychologist: "Forensic psychologist",
};

export default function AssessmentPhaseScreen() {
  const { phase } = useLocalSearchParams<{ phase: string }>();
  const validPhases = ASSESSMENT_PHASE_TOOL_REGISTER.map((e) => e.phase);

  if (!phase || !validPhases.includes(phase as ProgramPhase)) {
    return (
      <ScrollView contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Unknown phase</Text>
        <Text style={globalStyles.cardText}>
          Valid phases: {validPhases.join(", ")}
        </Text>
        <AppBottomNav />
      </ScrollView>
    );
  }

  const entry = getPhaseToolEntry(phase as ProgramPhase);

  if (!entry) {
    return (
      <ScrollView contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Phase not found</Text>
        <AppBottomNav />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>{entry.phaseLabel}</Text>
      <Text style={globalStyles.subtitle}>{entry.phaseWeeks}</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Governance reminder</Text>
        <Text style={globalStyles.cardText}>
          This register lists the tools relevant to this phase. Do not copy restricted test
          items or scoring guides into SafeSteps. Store licensed-tool results as professional
          summaries only.
        </Text>
      </View>

      {entry.tools.map((tool) => (
        <View key={tool.id} style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <Text style={styles.toolName}>{tool.name}</Text>
            <Text style={[styles.storageBadge, storageBadgeStyle(tool.storageMode)]}>
              {STORAGE_MODE_LABELS[tool.storageMode] ?? tool.storageMode}
            </Text>
          </View>

          <Text style={styles.toolFullName}>{tool.fullName}</Text>
          <Text style={styles.toolDomain}>{tool.domain}</Text>

          <Text style={styles.metaLabel}>Administered by</Text>
          <Text style={styles.metaValue}>{ADMIN_ROLE_LABELS[tool.adminRole] ?? tool.adminRole}</Text>

          {tool.governanceNote ? (
            <>
              <Text style={styles.metaLabel}>Governance note</Text>
              <Text style={styles.governanceNote}>{tool.governanceNote}</Text>
            </>
          ) : null}
        </View>
      ))}

      <AppBottomNav />
    </ScrollView>
  );
}

function storageBadgeStyle(mode: string) {
  if (mode === "app_native") return styles.badgeNative;
  if (mode === "external_summary") return styles.badgeExternal;
  return styles.badgeMeta;
}

const styles = StyleSheet.create({
  toolCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  toolHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  toolName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a202c",
    flex: 1,
  },
  storageBadge: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 8,
  },
  badgeNative: {
    backgroundColor: "#c6f6d5",
    color: "#276749",
  },
  badgeExternal: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  badgeMeta: {
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
  },
  toolFullName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 4,
  },
  toolDomain: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a0aec0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  metaValue: {
    fontSize: 13,
    color: "#4a5568",
  },
  governanceNote: {
    fontSize: 12,
    color: "#718096",
    fontStyle: "italic",
    marginTop: 2,
  },
});
