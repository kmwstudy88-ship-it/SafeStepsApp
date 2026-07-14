import { Link, type Href, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  getVideoSeriesLessonPreviewSlots,
  getVideoSeriesPipelineById,
  getVideoSeriesReviewGates,
} from "../../../lib/data/videoSeriesPipeline";
import { getSafeStepsLessonWatercolorPalette } from "../../../lib/safestepsLessonTheme";

export default function VideoSeriesPipelineDetailScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId?: string }>();
  const series = typeof seriesId === "string" ? getVideoSeriesPipelineById(seriesId) : null;
  const palette = getSafeStepsLessonWatercolorPalette(seriesId ?? "video-series-pipeline-detail");

  if (!series) {
    return (
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.brand}>SafeSteps</Text>
        <Text style={styles.title}>Series not found</Text>
        <Text style={styles.subtitle}>This video-series production pack is not registered in the review pipeline.</Text>
        <Link href={"/courses/video-series-pipeline" as Href} style={styles.link}>
          Back to video series pipeline
        </Link>
      </ScrollView>
    );
  }

  const gates = getVideoSeriesReviewGates(series);
  const lessonPreviewSlots = getVideoSeriesLessonPreviewSlots(series);
  const ready = series.status === "ready_for_curriculum_review";

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.brand}>SafeSteps</Text>
      <Text style={styles.title}>{series.title}</Text>
      <Text style={styles.subtitle}>
        Human review checkpoint for the production pack before any lesson or course promotion.
      </Text>

      <View style={[styles.featureCard, { backgroundColor: palette.wash }]}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <Text style={[styles.status, ready ? styles.statusReady : styles.statusDraft]}>
          {ready ? "Draft generation allowed" : "Blocked from draft generation"}
        </Text>
        <Text style={styles.cardTitle}>Promotion readiness</Text>
        <Text style={styles.cardText}>
          {series.detectedEpisodes} of {series.expectedEpisodes} expected episodes are registered for this series.
        </Text>
        <Text style={styles.metaText}>Course area: {series.courseAreaId}</Text>
        {ready ? <Text style={styles.metaText}>Draft course id: video-series-{series.id}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Review gates</Text>
        {gates.map((gate) => (
          <View key={gate.id} style={styles.gateRow}>
            <Text style={[styles.gateStatus, gate.passed ? styles.gatePassed : styles.gateBlocked]}>
              {gate.passed ? "Pass" : "Blocked"}
            </Text>
            <View style={styles.gateBody}>
              <Text style={styles.gateTitle}>{gate.title}</Text>
              <Text style={styles.cardText}>{gate.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Episode review manifest</Text>
        <Text style={styles.cardText}>
          These slots mirror the expected production pack. Missing slots must be completed before this series can become
          a course draft.
        </Text>
        <View style={styles.slotGrid}>
          {lessonPreviewSlots.map((slot) => {
            const slotReady = slot.status === "ready_for_review";

            return (
              <View key={slot.episodeNumber} style={styles.slotCard}>
                <Text style={[styles.gateStatus, slotReady ? styles.gatePassed : styles.gateBlocked]}>
                  {slotReady ? "Ready" : "Missing"}
                </Text>
                <Text style={styles.gateTitle}>{slot.label}</Text>
                <Text style={styles.cardText}>{slot.detail}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Production sources</Text>
        <Text style={styles.pathLabel}>Master document</Text>
        <Text style={styles.pathText}>{series.masterDocumentPath}</Text>
        <Text style={styles.pathLabel}>Storyboard</Text>
        <Text style={styles.pathText}>{series.storyboardPath}</Text>
        <Text style={styles.pathLabel}>Parent workbook</Text>
        <Text style={styles.pathText}>{series.parentWorkbookPath}</Text>
        <Text style={styles.pathLabel}>JSON pack</Text>
        <Text style={styles.pathText}>{series.jsonPackPath}</Text>
      </View>

      <Link href={"/courses/video-series-pipeline" as Href} style={styles.link}>
        Back to video series pipeline
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 16,
    padding: 20,
    backgroundColor: "#F7F4EC",
  },
  brand: {
    color: "#0D655F",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  title: {
    color: "#263238",
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: "#60706D",
    fontSize: 16,
    lineHeight: 23,
  },
  featureCard: {
    gap: 10,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E5DD",
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E5DD",
    backgroundColor: "#FFFFFF",
  },
  cardAccent: {
    height: 5,
    borderRadius: 8,
  },
  cardTitle: {
    color: "#263238",
    fontSize: 18,
    fontWeight: "900",
  },
  cardText: {
    color: "#60706D",
    fontSize: 14,
    lineHeight: 21,
  },
  metaText: {
    color: "#0D655F",
    fontSize: 13,
    fontWeight: "900",
  },
  status: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "900",
  },
  statusReady: {
    color: "#1F5C3D",
    backgroundColor: "#DCEFE3",
  },
  statusDraft: {
    color: "#7A4E00",
    backgroundColor: "#F7E7C2",
  },
  gateRow: {
    flexDirection: "row",
    gap: 10,
  },
  gateStatus: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "900",
  },
  gatePassed: {
    color: "#1F5C3D",
    backgroundColor: "#DCEFE3",
  },
  gateBlocked: {
    color: "#7A4E00",
    backgroundColor: "#F7E7C2",
  },
  gateBody: {
    flex: 1,
    gap: 3,
  },
  gateTitle: {
    color: "#263238",
    fontSize: 14,
    fontWeight: "900",
  },
  slotGrid: {
    gap: 10,
  },
  slotCard: {
    gap: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E5DD",
    backgroundColor: "#F7FAF8",
  },
  pathLabel: {
    color: "#263238",
    fontSize: 12,
    fontWeight: "900",
  },
  pathText: {
    color: "#60706D",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: "#0D655F",
    fontSize: 14,
    fontWeight: "900",
  },
});
