import { useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

type CheckInDomain = {
  id: string;
  title: string;
  items: {
    id: string;
    title: string;
    detail: string;
  }[];
};

type CheckInLog = {
  id: string;
  createdAt: string;
  averageScore: number;
  notes: Record<string, string>;
  scores: Record<string, number>;
};

const scaleOptions = [
  { value: 1, icon: "😟", label: "Concern" },
  { value: 2, icon: "🙁", label: "Hard" },
  { value: 3, icon: "😐", label: "Mixed" },
  { value: 4, icon: "🙂", label: "Settled" },
  { value: 5, icon: "😄", label: "Strong" },
];

const domains: CheckInDomain[] = [
  {
    id: "emotional",
    title: "Daily / Weekly Emotional Check-In",
    items: [
      {
        id: "mood",
        title: "Mood & Emotional State",
        detail: "How has their overall mood been, such as cheerful, anxious, withdrawn, or easily frustrated?",
      },
      {
        id: "expression",
        title: "Emotional Expression",
        detail: "Are they able to share how they feel, or are emotions coming out through outbursts or silence?",
      },
      {
        id: "stress",
        title: "Stress & Worry Signals",
        detail: "Are there new or recurring fears, worries, or signs of stress?",
      },
    ],
  },
  {
    id: "routine",
    title: "Physical & Routine Foundations",
    items: [
      {
        id: "sleep",
        title: "Sleep Patterns",
        detail: "Are they falling asleep easily, waking during the night, or having nightmares?",
      },
      {
        id: "appetite",
        title: "Appetite & Meals",
        detail: "Has there been a sudden change in eating habits or interest in food?",
      },
      {
        id: "energy",
        title: "Energy & Activity",
        detail: "Do they have steady energy through the day, or are they unusually sluggish or hyperactive?",
      },
    ],
  },
  {
    id: "relational",
    title: "Social & Relational Health",
    items: [
      {
        id: "peers",
        title: "Peer Relationships",
        detail: "How are interactions with friends, classmates, or siblings? Any signs of conflict or isolation?",
      },
      {
        id: "connection",
        title: "Parent / Carer Connection",
        detail: "Has there been positive one-on-one time this week? Do they feel safe opening up?",
      },
      {
        id: "school",
        title: "School / Care Environment",
        detail: "Are there complaints or anxiety about school, daycare, or external activities?",
      },
    ],
  },
  {
    id: "coping",
    title: "Behavioral & Coping Observations",
    items: [
      {
        id: "behavior",
        title: "Changes in Behavior",
        detail: "Any notable regression, clinginess, bedwetting, or major behavioral shifts?",
      },
      {
        id: "coping-tools",
        title: "Coping Mechanisms",
        detail: "What helped them calm down when overwhelmed, such as quiet time, drawing, or outdoor play?",
      },
      {
        id: "screen-time",
        title: "Screen Time & Overstimulation",
        detail: "Is digital use affecting mood, sleep, or behavior?",
      },
    ],
  },
];

const allItems = domains.flatMap((domain) => domain.items);
const conversationStarters = [
  "What was the best part of your day, and was there anything hard?",
  "If your feeling today was a color or weather, what would it be?",
  "Is there anything you want to talk about or wish we did differently this week?",
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ChildWellbeingCheckInScreen() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const scoredCount = allItems.filter((item) => scores[item.id]).length;
  const averageScore = scoredCount
    ? allItems.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0) / scoredCount
    : 0;

  const trendLogs = logs.slice(0, 6).reverse();
  const summary = useMemo(
    () =>
      domains
        .map((domain) => {
          const lines = domain.items.map((item) => {
            const score = scores[item.id] ? `${scores[item.id]}/5` : "Not rated";
            const note = notes[item.id]?.trim();
            return [`${item.title}: ${score}`, note ? `  Note: ${note}` : ""].filter(Boolean).join("\n");
          });

          return `${domain.title}\n${lines.join("\n")}`;
        })
        .join("\n\n"),
    [notes, scores],
  );

  function saveLog() {
    if (scoredCount === 0) return;

    setLogs((current) => [
      {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        averageScore,
        notes,
        scores,
      },
      ...current,
    ]);
  }

  async function shareReport() {
    const trendSummary = logs.length
      ? logs
          .slice(0, 6)
          .map((log) => `${formatDateTime(log.createdAt)}: ${log.averageScore.toFixed(1)}/5`)
          .join("\n")
      : "No saved trend logs yet.";

    await Share.share({
      title: "SafeSteps child wellbeing check-in",
      message: [
        "SafeSteps child wellbeing check-in",
        "",
        `Current average: ${averageScore ? averageScore.toFixed(1) : "Not rated"}/5`,
        "",
        summary,
        "",
        "Recent trend",
        trendSummary,
      ].join("\n"),
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back to resources</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Guide</Text>
        <Text style={styles.title}>Child Wellbeing Check-In</Text>
        <Text style={styles.intro}>
          A calm 2-minute parent observation tool for noticing emotional, physical, relational, and coping patterns over
          time. Keep child privacy in mind and share only what is appropriate for support or care planning.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTextBlock}>
          <Text style={styles.summaryTitle}>This check-in</Text>
          <Text style={styles.summaryText}>
            {scoredCount} of {allItems.length} areas rated. Average: {averageScore ? averageScore.toFixed(1) : "not rated"}/5.
          </Text>
        </View>
        <View style={styles.actionRow}>
          <Pressable disabled={scoredCount === 0} onPress={saveLog} style={[styles.primaryButton, scoredCount === 0 && styles.disabledButton]}>
            <Text style={styles.primaryButtonText}>Save Log</Text>
          </Pressable>
          <Pressable onPress={shareReport} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Share Report</Text>
          </Pressable>
        </View>
      </View>

      {domains.map((domain) => (
        <View key={domain.id} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{domain.title}</Text>
          {domain.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
              <View style={styles.scaleRow}>
                {scaleOptions.map((option) => {
                  const selected = scores[item.id] === option.value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={option.value}
                      onPress={() => setScores((current) => ({ ...current, [item.id]: option.value }))}
                      style={[styles.scaleButton, selected && styles.scaleButtonSelected]}
                    >
                      <Text style={styles.scaleIcon}>{option.icon}</Text>
                      <Text style={[styles.scaleLabel, selected && styles.scaleLabelSelected]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                multiline
                onChangeText={(value) => setNotes((current) => ({ ...current, [item.id]: value }))}
                placeholder="Add observations, examples, or context..."
                placeholderTextColor="#6B776F"
                style={styles.noteInput}
                textAlignVertical="top"
                value={notes[item.id] ?? ""}
              />
            </View>
          ))}
        </View>
      ))}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Action Plan & Grounding Prompts</Text>
        {conversationStarters.map((prompt) => (
          <View key={prompt} style={styles.promptCard}>
            <Text style={styles.promptText}>“{prompt}”</Text>
          </View>
        ))}
        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>When to seek extra support</Text>
          <Text style={styles.supportText}>
            Consider professional guidance if sadness, withdrawal, drastic sleep or appetite changes, extreme anxiety,
            safety concerns, or major behavior changes persist for more than two weeks or feel urgent.
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Trend Tracker</Text>
        {trendLogs.length ? (
          trendLogs.map((log) => (
            <View key={log.id} style={styles.trendRow}>
              <Text style={styles.trendLabel}>{formatDateTime(log.createdAt)}</Text>
              <View style={styles.trendTrack}>
                <View style={[styles.trendFill, { width: `${(log.averageScore / 5) * 100}%` }]} />
              </View>
              <Text style={styles.trendScore}>{log.averageScore.toFixed(1)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Save a log to start seeing weekly wellbeing trends.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F7FAF8",
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingVertical: 6,
  },
  backButtonText: {
    color: "#0D5C75",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    marginBottom: 16,
    maxWidth: 900,
  },
  eyebrow: {
    color: "#0D5C75",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: "#12332B",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },
  intro: {
    color: "#43534D",
    fontSize: 15,
    lineHeight: 22,
  },
  summaryCard: {
    alignItems: "center",
    backgroundColor: "#EAF6F4",
    borderColor: "#B8DAD4",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 14,
  },
  summaryTextBlock: {
    flex: 1,
    minWidth: 240,
  },
  summaryTitle: {
    color: "#12332B",
    fontSize: 17,
    fontWeight: "900",
  },
  summaryText: {
    color: "#43534D",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#0D5C75",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#0D5C75",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "#0D5C75",
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.5,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  sectionTitle: {
    color: "#183C33",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D8E5DD",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
    padding: 12,
  },
  itemTitle: {
    color: "#1E352E",
    fontSize: 15,
    fontWeight: "900",
  },
  itemDetail: {
    color: "#53635C",
    fontSize: 13,
    lineHeight: 19,
  },
  scaleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scaleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CCDCD4",
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 78,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  scaleButtonSelected: {
    backgroundColor: "#0D5C75",
    borderColor: "#0D5C75",
  },
  scaleIcon: {
    fontSize: 22,
    marginBottom: 3,
  },
  scaleLabel: {
    color: "#334740",
    fontSize: 12,
    fontWeight: "800",
  },
  scaleLabelSelected: {
    color: "#FFFFFF",
  },
  noteInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CCDCD4",
    borderRadius: 8,
    borderWidth: 1,
    color: "#12332B",
    fontSize: 14,
    minHeight: 74,
    padding: 10,
  },
  promptCard: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D8E5DD",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  promptText: {
    color: "#1E352E",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  supportBox: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    padding: 12,
  },
  supportTitle: {
    color: "#7C2D12",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  supportText: {
    color: "#8A4B22",
    fontSize: 13,
    lineHeight: 19,
  },
  trendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  trendLabel: {
    color: "#43534D",
    fontSize: 12,
    fontWeight: "800",
    width: 150,
  },
  trendTrack: {
    backgroundColor: "#E7EEE9",
    borderRadius: 999,
    flex: 1,
    height: 12,
    overflow: "hidden",
  },
  trendFill: {
    backgroundColor: "#0D5C75",
    borderRadius: 999,
    height: "100%",
  },
  trendScore: {
    color: "#183C33",
    fontSize: 13,
    fontWeight: "900",
    width: 32,
  },
  emptyText: {
    color: "#66756E",
    fontSize: 13,
  },
});
