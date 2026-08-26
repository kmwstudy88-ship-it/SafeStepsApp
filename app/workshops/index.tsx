import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getWorkshopsByFormat, getWorkshopsByLevel, workshops, type Workshop } from "../../curriculum/workshops";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../../lib/safestepsLessonTheme";

type FormatFilter = "all" | Workshop["format"];
type LevelFilter = "all" | Workshop["level"];
type DurationFilter = "all" | "under90" | "90to120" | "over120";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function formatLabel(value: string): string {
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const palette = getSafeStepsLessonWatercolorPalette(workshop.id);

  return (
    <Link
      href={{ pathname: "/workshops/[workshopId]", params: { workshopId: workshop.id } }}
      asChild
    >
      <Pressable style={[styles.card, { backgroundColor: palette.wash }]}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, { backgroundColor: palette.accentDark }]}>
            {formatLabel(workshop.format)}
          </Text>
          <Text style={[styles.badge, { backgroundColor: palette.accent }]}>
            {formatLabel(workshop.level)}
          </Text>
        </View>
        <Text style={styles.cardTitle}>{workshop.title}</Text>
        <Text style={styles.cardText} numberOfLines={3}>{workshop.description}</Text>
        <Text style={styles.metaText}>
          {formatDuration(workshop.durationMinutes)} · {workshop.composedFromLessonIds.length} lessons embedded
        </Text>
      </Pressable>
    </Link>
  );
}

export default function WorkshopsScreen() {
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");

  const filtered = useMemo(() => {
    let list = workshops;

    if (formatFilter !== "all") {
      list = getWorkshopsByFormat(formatFilter).filter((w) => list.includes(w));
    }
    if (levelFilter !== "all") {
      list = getWorkshopsByLevel(levelFilter).filter((w) => list.includes(w));
    }
    if (durationFilter === "under90") {
      list = list.filter((w) => w.durationMinutes < 90);
    } else if (durationFilter === "90to120") {
      list = list.filter((w) => w.durationMinutes >= 90 && w.durationMinutes <= 120);
    } else if (durationFilter === "over120") {
      list = list.filter((w) => w.durationMinutes > 120);
    }

    return list;
  }, [formatFilter, levelFilter, durationFilter]);

  const formatOptions: { value: FormatFilter; label: string }[] = [
    { value: "all", label: "All formats" },
    { value: "self-guided", label: "Self-guided" },
    { value: "facilitated", label: "Facilitated" },
    { value: "group", label: "Group" },
  ];

  const levelOptions: { value: LevelFilter; label: string }[] = [
    { value: "all", label: "All levels" },
    { value: "foundational", label: "Foundational" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const durationOptions: { value: DurationFilter; label: string }[] = [
    { value: "all", label: "Any length" },
    { value: "under90", label: "Under 90 min" },
    { value: "90to120", label: "90–120 min" },
    { value: "over120", label: "Over 2 hrs" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.brand}>SafeSteps</Text>
      <Text style={styles.title}>Workshops</Text>
      <Text style={styles.subtitle}>
        Workshops bring lessons together into a deeper, structured experience. They can be run
        individually, with a facilitator, or as a group session.
      </Text>

      <View style={styles.featureCard}>
        <View style={styles.featureAccent} />
        <Text style={styles.featureTitle}>What is a workshop?</Text>
        <Text style={styles.featureText}>
          Each workshop is 60–180 minutes and draws on 2–4 core SafeSteps lessons. It includes
          group activities, guided reflections, and a practical evidence task to complete between
          sessions.
        </Text>
        <Text style={styles.metaText}>{workshops.length} workshops available</Text>
      </View>

      <Text style={styles.filterLabel}>Format</Text>
      <View style={styles.chipRow}>
        {formatOptions.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ selected: formatFilter === value }}
            onPress={() => setFormatFilter(value)}
            style={formatFilter === value ? styles.chipActive : styles.chip}
          >
            <Text style={formatFilter === value ? styles.chipTextActive : styles.chipText}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.filterLabel}>Level</Text>
      <View style={styles.chipRow}>
        {levelOptions.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ selected: levelFilter === value }}
            onPress={() => setLevelFilter(value)}
            style={levelFilter === value ? styles.chipActive : styles.chip}
          >
            <Text style={levelFilter === value ? styles.chipTextActive : styles.chipText}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.filterLabel}>Duration</Text>
      <View style={styles.chipRow}>
        {durationOptions.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ selected: durationFilter === value }}
            onPress={() => setDurationFilter(value)}
            style={durationFilter === value ? styles.chipActive : styles.chip}
          >
            <Text style={durationFilter === value ? styles.chipTextActive : styles.chipText}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No workshops match these filters</Text>
          <Text style={styles.featureText}>Try removing one or more filters.</Text>
        </View>
      ) : (
        filtered.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    gap: 14,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  brand: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  title: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },
  featureCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    backgroundColor: safestepsLessonTheme.colors.card,
    ...safestepsLessonTheme.shadow,
  },
  featureAccent: {
    width: 52,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
    backgroundColor: safestepsLessonTheme.colors.peach,
  },
  featureTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 22,
    fontWeight: "900",
  },
  featureText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  metaText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "900",
    fontSize: 14,
  },
  filterLabel: {
    color: safestepsLessonTheme.colors.muted,
    fontWeight: "800",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: safestepsLessonTheme.radius.pill,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: safestepsLessonTheme.colors.card,
  },
  chipActive: {
    borderRadius: safestepsLessonTheme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
  chipText: {
    color: safestepsLessonTheme.colors.navy,
    fontWeight: "700",
    fontSize: 14,
  },
  chipTextActive: {
    color: safestepsLessonTheme.colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  card: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    ...safestepsLessonTheme.shadow,
  },
  cardAccent: {
    width: 48,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    borderRadius: safestepsLessonTheme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: safestepsLessonTheme.colors.white,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    overflow: "hidden",
  },
  cardTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26,
  },
  cardText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 8,
    backgroundColor: safestepsLessonTheme.colors.card,
  },
  emptyTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontWeight: "900",
    fontSize: 18,
  },
});
