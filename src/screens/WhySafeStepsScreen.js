import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WhySafeStepsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Why SafeSteps Exists</Text>

      <View style={styles.card}>
        <Text style={styles.paragraph}>
          SAFE STEPS was created in response to a simple but painful truth: too
          many children and families move through systems where their voices,
          experiences, and progress are not fully seen. Decisions that shape a
          childâ€™s life are often made using fragmented information, inconsistent
          reports, and snapshots that fail to reflect the full reality of a
          familyâ€™s journey.
        </Text>

        <Text style={styles.paragraph}>
          SAFE STEPS exists to change that by creating a clear, structured, and
          compassionate way to understand children, support families, and
          document meaningful progress over time.
        </Text>

        <Text style={styles.subheading}>Childrenâ€™s Voices Matter</Text>
        <Text style={styles.paragraph}>
          Across child protection, family services, education, and community
          support, one issue appears again and again: childrenâ€™s voices are not
          captured consistently or safely. Their feelings, fears, hopes, and
          experiences shift rapidly depending on stress, environment, or who is
          asking the questions.
        </Text>

        <Text style={styles.paragraph}>
          SAFE STEPS introduces a system where children can express themselves
          regularly, in ageâ€‘appropriate ways, without pressure and without fear.
          Their voice becomes a continuous thread â€” not a oneâ€‘off moment.
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
          learning, achievements, and engagement â€” not through verbal claims, but
          through documented evidence.
        </Text>

        <Text style={styles.subheading}>Solving Worker Turnover</Text>
        <Text style={styles.paragraph}>
          When professionals change â€” sometimes multiple times in a single case â€”
          families are forced to retell their story and rebuild trust. Important
          details get lost. SAFE STEPS creates a stable, centralised record that
          remains consistent regardless of who is involved.
        </Text>

        <Text style={styles.subheading}>Tracking Wellbeing Over Time</Text>
        <Text style={styles.paragraph}>
          Childrenâ€™s wellbeing is dynamic. SAFE STEPS introduces wellbeing
          tracking so patterns can emerge â€” patterns that guide support, inform
          decisions, and highlight both risks and strengths.
        </Text>

        <Text style={styles.subheading}>Education That Creates Change</Text>
        <Text style={styles.paragraph}>
          SAFE STEPS provides structured learning pathways for parents covering
          parenting, child development, emotional regulation, safety, and more.
          Lessons are practical, traumaâ€‘informed, and immediately useful.
        </Text>

        <Text style={styles.paragraph}>
          Children also learn about rights, boundaries, healthy relationships,
          and what safe treatment looks like.
        </Text>

        <Text style={styles.subheading}>The Evidence Vault</Text>
        <Text style={styles.paragraph}>
          SAFE STEPS creates a transparent, chronological record of family
          progress â€” achievements, assessments, observations, journals, and
          participation. Progress becomes visible, measurable, and acknowledged.
        </Text>

        <Text style={styles.subheading}>A Platform Built on Humanity</Text>
        <Text style={styles.paragraph}>
          SAFE STEPS is not adversarial. It does not label families as â€œgoodâ€ or
          â€œbad.â€ It recognises complexity, healing, and growth. It strengthens
          professional judgement by providing richer, clearer, and more
          consistent information.
        </Text>

        <Text style={styles.paragraph}>
          Above all, SAFE STEPS exists to ensure that nothing important is lost â€”
          not a childâ€™s voice, not a parentâ€™s effort, not a familyâ€™s progress,
          and not the truth of their story.
        </Text>
      </View>
      <TouchableOpacity
    style={styles.navButton}
    onPress={() => router.push('/my-story')}
  >
    <Text style={styles.navButtonText}>Back to My Story</Text>
  </TouchableOpacity>
</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F4F2",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A3C40",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  subheading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A3C40",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2E4A4E",
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#1A3C40',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
