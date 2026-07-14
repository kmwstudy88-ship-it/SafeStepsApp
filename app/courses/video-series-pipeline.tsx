import { Link, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  summarizeVideoSeriesPipelines,
  videoSeriesPipelines,
} from "../../lib/data/videoSeriesPipeline";
import { getSafeStepsLessonWatercolorPalette } from "../../lib/safestepsLessonTheme";

const summary = summarizeVideoSeriesPipelines();

export default function VideoSeriesPipelineScreen() {
  const palette = getSafeStepsLessonWatercolorPalette("video-series-pipeline");

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.brand}>SafeSteps</Text>
      <Text style={styles.title}>Video Series Production Pipeline</Text>
      <Text style={styles.subtitle}>
        Review imported video-series production packs before promoting them into launch courses, lessons, or parent
        workbooks.
      </Text>

      <View style={[styles.featureCard, { backgroundColor: palette.wash }]}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <Text style={styles.cardTitle}>Pipeline readiness</Text>
        <Text style={styles.cardText}>
          {summary.readySeries} of {summary.totalSeries} series are ready for curriculum review. {summary.totalEpisodes} of{" "}
          {summary.expectedEpisodes} expected episode records were detected.
        </Text>
        <Text style={styles.metaText}>Completion: {summary.completionPercentage}%</Text>
      </View>

      {videoSeriesPipelines.map((series) => {
        const ready = series.status === "ready_for_curriculum_review";

        return (
          <View key={series.id} style={styles.card}>
            <Text style={[styles.status, ready ? styles.statusReady : styles.statusDraft]}>
              {ready ? "Ready for review" : "Needs completion"}
            </Text>
            <Text style={styles.cardTitle}>{series.title}</Text>
            <Text style={styles.cardText}>Course area: {series.courseAreaId}</Text>
            {ready ? <Text style={styles.cardText}>Draft course id: video-series-{series.id}</Text> : null}
            <Text style={styles.metaText}>
              Episodes: {series.detectedEpisodes}/{series.expectedEpisodes}
            </Text>
            <Text style={styles.pathText}>{series.jsonPackPath}</Text>
            <Link
              href={{
                pathname: "/courses/video-series-pipeline/[seriesId]",
                params: { seriesId: series.id },
              } as unknown as Href}
              style={styles.reviewLink}
            >
              Open review details
            </Link>
          </View>
        );
      })}
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
    gap: 8,
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
  pathText: {
    color: "#60706D",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  reviewLink: {
    color: "#0D655F",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
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
});
