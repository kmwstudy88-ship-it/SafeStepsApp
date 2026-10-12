import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  StatusPill,
  assessmentColors,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  apiSecurityTests,
  contractTestCases,
  coreApiRules,
  endpointContracts,
  internalApiDomains,
  publicApiDomains,
  recommendedApiMigrations,
  requiredHeaders,
} from "../../lib/engines/apiServiceContracts";

export default function ApiServiceContractsScreen() {
  return (
    <AssessmentScreenShell
      title="API & Service Contracts"
      subtitle="Defines how Expo, Supabase, Edge Functions, storage, workers, and integrations communicate safely with stable, typed, workflow-aware contracts."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Public API Domains</Text>
            <ChipList items={publicApiDomains} />
          </AssessmentCard>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Internal API Domains</Text>
            <ChipList items={internalApiDomains} />
          </AssessmentCard>
        </View>

        <AssessmentCard tone="warning">
          <Text style={assessmentStyles.cardTitle}>Standard Request Headers</Text>
          <Text style={assessmentStyles.cardText}>
            High-impact writes use idempotency, request IDs, correlation IDs, authenticated sessions,
            client versioning, and server-side permission checks.
          </Text>
          <ChipList items={requiredHeaders} />
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>First Controlled Endpoints</Text>
          <View style={styles.endpointGrid}>
            {endpointContracts.map((endpoint) => (
              <View key={endpoint.path} style={styles.endpointCard}>
                <View style={styles.headerRow}>
                  <StatusPill label={endpoint.method} />
                  <StatusPill label={endpoint.idempotencyRequired ? "Idempotent" : "Versioned"} tone={endpoint.idempotencyRequired ? "success" : "warning"} />
                </View>
                <Text style={styles.endpointPath}>{endpoint.path}</Text>
                <Text style={assessmentStyles.cardText}>{endpoint.purpose}</Text>
                <Text style={assessmentStyles.metaLabel}>Emits</Text>
                <ChipList items={endpoint.workflowEventsEmitted} />
              </View>
            ))}
          </View>
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Contract Tests</Text>
            <ChipList items={contractTestCases} />
          </AssessmentCard>
          <AssessmentCard tone="risk">
            <Text style={assessmentStyles.cardTitle}>Security Tests</Text>
            <ChipList items={apiSecurityTests} />
          </AssessmentCard>
        </View>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Recommended API Migrations</Text>
          <ChipList items={recommendedApiMigrations} />
        </AssessmentCard>

        <AssessmentCard tone="success">
          <Text style={assessmentStyles.cardTitle}>Core API Rules</Text>
          {coreApiRules.map((rule) => (
            <Text key={rule} style={assessmentStyles.cardText}>{rule}</Text>
          ))}
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  endpointGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  endpointCard: {
    flexGrow: 1,
    flexBasis: 280,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  headerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  endpointPath: { color: assessmentColors.charcoal, fontSize: 15, fontWeight: "900" },
});
