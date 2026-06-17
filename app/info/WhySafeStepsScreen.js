import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import HeaderBar from "../../components/HeaderBar";
import { useRouter } from "expo-router";

export default function WhySafeStepsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <HeaderBar title="Why SafeSteps Exists" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Why SAFE STEPS Exists</Text>

        <Text style={styles.paragraph}>
          SAFE STEPS was created in response to a simple but painful truth: too
          many children and families move through systems where their voices,
          experiences, and progress are not fully seen. Decisions that shape a
          child’s life are often made using fragmented information, inconsistent
          reports, and snapshots that fail to reflect the full reality of a
          family’s journey.
        </Text>

        <Text style={styles.paragraph}>
          SAFE STEPS exists to change that by creating a clear, structured, and
          compassionate way to understand children, support families, and
          document meaningful progress over time.
        </Text>

        <Text style={styles.subheading}>Children’s Voices Matter</Text>
        <Text style={styles.paragraph}>
          Across child protection, family services, education, and community
          support, one issue appears again and again: children’s voices are not
          captured consistently or safely. Their feelings, fears, hopes, and
          experiences shift rapidly depending on stress, environment, or who is
          asking the questions.
        </Text>

        <Text style={styles.paragraph}>
          SAFE STEPS introduces a system where children can express themselves
          regularly, in age‑appropriate ways, without pressure and without fear.
          Their voice becomes a continuous thread — not a one‑off moment.
        </Text>

        <Text style={styles.subheading}>Supporting Families Fairly</Text>
        <Text style={styles.paragraph}>
          Families often face trauma, domestic violence, mental health
          challenges, financial hardship, unstable housing, or sudden life
          changes. Traditional systems focus heavily on concerns while
          overlooking context, resilience, and progress.
        </Text>

        <Text style={styles.paragraph}>
          SAFE STEPS provides a structured way for families to demonstrate their
          learning, achievements, and engagement — not through verbal claims, but
          through documented evidence.
        </Text>

        <Text style={styles.subheading}>Solving Worker Turnover</Text>
        <Text style={styles.paragraph}>
          When professionals change — sometimes multiple times in a single case —
          families are forced to retell their story and rebuild trust. Important
          details get lost. SAFE STEPS creates a stable, centralised record that
          remains consistent regardless of who is involved.
        </Text>

        <Text style={styles.subheading}>Tracking Wellbeing Over Time</Text>
        <Text style={styles.paragraph}>
          Children’s wellbeing is dynamic. SAFE STEPS introduces wellbeing
          tracking so patterns can emerge — patterns that guide support, inform
          decisions, and highlight both risks and strengths.
        </Text>

        <Text style={styles.subheading}>Education That Creates Change</Text>
        <Text style={styles.paragraph}>
          SAFE STEPS provides structured learning pathways for parents covering
          parenting, child development, emotional regulation, safety, and more.
          Lessons are practical, trauma‑informed, and immediately useful.
        </Text>

        <Text style={styles.paragraph}>
          Children also learn about rights, boundaries, healthy relationships,
          and what safe treatment looks like.
        </Text>

        <Text style={styles.subheading}>The Evidence Vault</Text>
        <Text style={styles.paragraph}>
          SAFE STEPS creates a transparent, chronological record of family
          progress — achievements, assessments, observations, journals, and
          participation. Progress becomes visible, measurable, and acknowledged.
        </Text>

        <Text style={styles.subheading}>A Platform Built on Humanity</Text>
        <Text style={styles.paragraph}>
          SAFE STEPS is not adversarial. It does not label families as “good” or
          “bad.” It recognises complexity, healing, and growth. It strengthens
          professional judgement by providing richer, clearer, and more
          consistent information.
        </Text>

        <Text style={styles.paragraph}>
          Above all, SAFE STEPS exists to ensure that nothing important is lost —
          not a child’s voice, not a parent’s effort, not a family’s progress,
          and not the truth of their story.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 60 },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    color: "#222",
  },
  subheading: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 12,
  },
});
