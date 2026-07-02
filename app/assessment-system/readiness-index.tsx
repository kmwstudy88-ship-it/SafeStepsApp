import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

const readinessAreas = [
  {
    title: "Safe and stable home environment",
    description: "The home environment is safe, predictable, and suitable for children.",
  },
  {
    title: "Parenting routines and consistency",
    description: "Daily routines, supervision, boundaries, and care tasks are consistent.",
  },
  {
    title: "Service engagement",
    description: "Required services, programs, appointments, and support plans are being followed.",
  },
  {
    title: "Child voice and wellbeing",
    description: "The child voice is heard, recorded, and considered in planning.",
  },
  {
    title: "Evidence of change over time",
    description: "Progress is supported by repeated evidence, not a single snapshot.",
  },
  {
    title: "Risk reduction",
    description: "Known risks are reduced, managed, and reviewed with a clear safety plan.",
  },
];

export default function ReadinessIndexScreen() {
  const [checkedAreas, setCheckedAreas] = useState<Record<string, boolean>>({});

  const completedCount = useMemo(
    () => readinessAreas.filter((area) => checkedAreas[area.title]).length,
    [checkedAreas],
  );

  const readinessPercent = Math.round((completedCount / readinessAreas.length) * 100);

  function toggleArea(title: string) {
    setCheckedAreas((current) => ({
      ...current,
      [title]: !current[title],
    }));
  }

  return (
    <AssessmentScreenShell
      title="Reunification Readiness Index"
      subtitle="Check what is stable, what is improving, and what still needs support before reunification decisions."
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Readiness score</Text>
        <Text style={styles.summaryScore}>{readinessPercent}%</Text>
        <Text style={styles.summaryText}>
          {completedCount} of {readinessAreas.length} readiness areas marked as currently supported.
        </Text>
      </View>

      <View style={styles.list}>
        {readinessAreas.map((area) => {
          const active = Boolean(checkedAreas[area.title]);

          return (
            <Pressable
              key={area.title}
              onPress={() => toggleArea(area.title)}
              style={[styles.areaCard, active && styles.areaCardActive]}
            >
              <View style={active ? styles.checkActive : styles.checkEmpty}>
                <Text style={styles.checkText}>{active ? "✓" : ""}</Text>
              </View>

              <View style={styles.areaCopy}>
                <Text style={styles.areaTitle}>{area.title}</Text>
                <Text style={styles.areaDescription}>{area.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 8,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: assessmentColors.sage,
  },
  summaryLabel: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  summaryScore: {
    color: assessmentColors.charcoal,
    fontSize: 38,
    fontWeight: "900",
  },
  summaryText: {
    color: assessmentColors.muted,
    lineHeight: 21,
  },
  list: {
    gap: 12,
  },
  areaCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  areaCardActive: {
    borderColor: assessmentColors.teal,
    backgroundColor: "#F1FBF8",
  },
  checkEmpty: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: assessmentColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: assessmentColors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  areaCopy: {
    flex: 1,
    gap: 5,
  },
  areaTitle: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "900",
  },
  areaDescription: {
    color: assessmentColors.muted,
    lineHeight: 20,
  },
});