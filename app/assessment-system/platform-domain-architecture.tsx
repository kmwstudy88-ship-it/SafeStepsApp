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
  getDomainEventFlow,
  implementationBlueprints,
  platformDomains,
  platformPrinciples,
  sharedServices,
  universalIdTypes,
  versionedArtifactTypes,
} from "../../lib/engines/platformDomainArchitecture";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function PlatformDomainArchitectureScreen() {
  return (
    <AssessmentScreenShell
      title="Platform Domain Architecture"
      subtitle="A domain-driven architecture for scaling SafeSteps as a platform with clear ownership, event flow, IDs, versioning, and reviewable boundaries."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Domain Boundary Map</Text>
          <Text style={assessmentStyles.cardText}>
            Each domain has one responsibility. Domains communicate by event and stable IDs rather
            than duplicating or directly modifying records owned by another domain.
          </Text>
          <View style={styles.domainGrid}>
            {platformDomains.map((domain, index) => (
              <View key={domain.id} style={styles.domainCard}>
                <Text style={styles.index}>{index + 1}</Text>
                <Text style={styles.domainTitle}>{domain.name}</Text>
                <Text style={assessmentStyles.cardText}>{domain.responsibility}</Text>
                <Text style={assessmentStyles.metaLabel}>Owns</Text>
                <ChipList items={domain.owns.slice(0, 6)} />
                <Text style={assessmentStyles.metaLabel}>Boundary rule</Text>
                <Text style={assessmentStyles.cardText}>{domain.mustNot[0]}</Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Event-Driven Flow</Text>
          <Text style={assessmentStyles.cardText}>
            Platform events create a clearer audit trail and let new modules subscribe without
            tightly coupling features.
          </Text>
          <View style={styles.eventList}>
            {getDomainEventFlow().map((event) => (
              <View key={event.eventType} style={styles.eventRow}>
                <StatusPill label={formatLabel(event.eventType)} />
                <Text style={assessmentStyles.cardText}>
                  {formatLabel(event.from)} to {event.to.map(formatLabel).join(", ")}
                </Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Shared Services</Text>
            <Text style={assessmentStyles.cardText}>
              Shared services are reusable platform capabilities. They support domains without
              becoming the source of truth for domain data.
            </Text>
            {sharedServices.map((service) => (
              <View key={service.id} style={styles.serviceRow}>
                <Text style={assessmentStyles.metaValue}>{service.name}</Text>
                <Text style={assessmentStyles.cardText}>
                  Used by {service.usedBy.length === platformDomains.length ? "all domains" : service.usedBy.map(formatLabel).join(", ")}
                </Text>
              </View>
            ))}
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Universal IDs & Versioning</Text>
            <Text style={assessmentStyles.cardText}>
              Relationships are created through permanent IDs. Anything influencing assessment is
              versioned so later reviewers can explain how a result was produced.
            </Text>
            <Text style={assessmentStyles.metaLabel}>Permanent IDs</Text>
            <ChipList items={universalIdTypes.map(formatLabel)} />
            <Text style={assessmentStyles.metaLabel}>Versioned artifacts</Text>
            <ChipList items={versionedArtifactTypes.map(formatLabel)} />
          </AssessmentCard>
        </View>

        <AssessmentCard tone="success">
          <Text style={assessmentStyles.cardTitle}>Platform Principles</Text>
          {platformPrinciples.map((principle) => (
            <Text key={principle} style={assessmentStyles.cardText}>{principle}</Text>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Implementation Blueprints</Text>
          <Text style={assessmentStyles.cardText}>
            These are the next concrete artifacts that turn the architecture into consistently
            implementable platform contracts.
          </Text>
          <View style={styles.blueprintGrid}>
            {implementationBlueprints.map((blueprint) => (
              <View key={blueprint.id} style={styles.blueprintCard}>
                <Text style={styles.blueprintTitle}>{blueprint.title}</Text>
                <ChipList items={blueprint.produces} />
              </View>
            ))}
          </View>
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  domainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  domainCard: {
    flexGrow: 1,
    flexBasis: 280,
    gap: 7,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  index: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
  },
  domainTitle: {
    color: assessmentColors.charcoal,
    fontSize: 18,
    fontWeight: "900",
  },
  eventList: {
    gap: 8,
  },
  eventRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  serviceRow: {
    gap: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: assessmentColors.border,
  },
  blueprintGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  blueprintCard: {
    flexGrow: 1,
    flexBasis: 240,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  blueprintTitle: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "900",
  },
});
