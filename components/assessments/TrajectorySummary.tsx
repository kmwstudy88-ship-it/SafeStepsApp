import { StyleSheet, Text, View } from "react-native";
import type { LongitudinalTrajectorySummary } from "../../lib/engines/assessmentScoringEngine";

type TrajectorySummaryProps = {
  summary: LongitudinalTrajectorySummary;
  domainLabels?: Record<string, string>;
};

const DIRECTION_ICONS: Record<string, string> = {
  improving: "↑",
  declining: "↓",
  stable: "→",
  insufficient_data: "–",
};

const DIRECTION_COLORS: Record<string, string> = {
  improving: "#276749",
  declining: "#c53030",
  stable: "#6b7280",
  insufficient_data: "#a0aec0",
};

const SEVERITY_COLORS: Record<string, string> = {
  minor: "#d97706",
  significant: "#d97706",
  critical: "#c53030",
};

export function TrajectorySummary({ summary, domainLabels = {} }: TrajectorySummaryProps) {
  const overallColor = DIRECTION_COLORS[summary.overallDirection] ?? "#6b7280";
  const overallIcon = DIRECTION_ICONS[summary.overallDirection] ?? "–";

  return (
    <View style={styles.container}>
      <View style={styles.overallRow}>
        <Text style={styles.overallLabel}>Overall trajectory</Text>
        <View style={[styles.directionBadge, { backgroundColor: overallColor }]}>
          <Text style={styles.directionBadgeText}>
            {overallIcon}{" "}
            {summary.overallDirection.replace(/_/g, " ")}
          </Text>
        </View>
      </View>

      <Text style={styles.countText}>
        Based on {summary.assessmentCount} assessment record
        {summary.assessmentCount !== 1 ? "s" : ""}
      </Text>

      {summary.domains.map((domain) => {
        const label = domainLabels[domain.domainId] ?? domain.domainId;
        const color = DIRECTION_COLORS[domain.direction] ?? "#6b7280";
        const icon = DIRECTION_ICONS[domain.direction] ?? "–";
        const hasRegressions = domain.regressionFlags.length > 0;

        return (
          <View key={domain.domainId} style={styles.domainCard}>
            <View style={styles.domainHeader}>
              <Text style={styles.domainLabel}>{label}</Text>
              <Text style={[styles.domainDirection, { color }]}>
                {icon} {domain.direction.replace(/_/g, " ")}
              </Text>
            </View>

            {domain.firstScore !== null && domain.latestScore !== null ? (
              <View style={styles.scoreRow}>
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillLabel}>First</Text>
                  <Text style={styles.scorePillValue}>{domain.firstScore}%</Text>
                </View>
                <Text style={styles.scoreSeparator}>→</Text>
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillLabel}>Latest</Text>
                  <Text style={styles.scorePillValue}>{domain.latestScore}%</Text>
                </View>
                {domain.peakScore !== null && domain.peakScore !== domain.latestScore ? (
                  <>
                    <Text style={styles.scoreSeparator}>Peak</Text>
                    <View style={styles.scorePill}>
                      <Text style={styles.scorePillLabel}>Peak</Text>
                      <Text style={styles.scorePillValue}>{domain.peakScore}%</Text>
                    </View>
                  </>
                ) : null}
              </View>
            ) : null}

            {hasRegressions ? (
              <View style={styles.regressionSection}>
                <Text style={styles.regressionTitle}>
                  {domain.regressionFlags.length} regression
                  {domain.regressionFlags.length !== 1 ? "s" : ""} flagged
                </Text>
                {domain.regressionFlags.map((flag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.regressionFlag,
                      { borderLeftColor: SEVERITY_COLORS[flag.severity] ?? "#d97706" },
                    ]}
                  >
                    <Text style={styles.regressionText}>
                      {flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1)} drop:{" "}
                      {flag.previousScore}% → {flag.currentScore}% (−{flag.drop} points)
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overallLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a202c",
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  directionBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  countText: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
  },
  domainCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  domainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  domainLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3748",
    flex: 1,
  },
  domainDirection: {
    fontSize: 13,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  scorePill: {
    backgroundColor: "#edf2f7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  scorePillLabel: {
    fontSize: 10,
    color: "#718096",
    textTransform: "uppercase",
  },
  scorePillValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2d3748",
  },
  scoreSeparator: {
    fontSize: 14,
    color: "#a0aec0",
  },
  regressionSection: {
    marginTop: 8,
  },
  regressionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#c53030",
    marginBottom: 4,
  },
  regressionFlag: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 4,
  },
  regressionText: {
    fontSize: 12,
    color: "#4a5568",
  },
});
