import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { globalStyles } from "../lib/styles";

const REASONS = [
  {
    title: "Children's voices need continuity",
    body:
      "SafeSteps gives children and families a structured way to record experiences, needs, strengths, and progress over time instead of relying on isolated snapshots.",
  },
  {
    title: "Families need fair evidence of effort",
    body:
      "The platform helps parents show practical learning, reflections, routines, tasks, and evidence of change in a clear chronological record.",
  },
  {
    title: "Professionals need better context",
    body:
      "Facilitators can review progress, notes, reports, assessments, and longitudinal snapshots so support decisions are based on a fuller picture.",
  },
  {
    title: "Progress should be visible",
    body:
      "SafeSteps links lessons, check-ins, tasks, evidence, and reflections so growth can be tracked and discussed with more consistency.",
  },
];

export default function WhySafeStepsScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Why SafeSteps Exists</Text>
      <Text style={globalStyles.subtitle}>
        SafeSteps was built to help families, children, and professionals keep a clearer record of learning,
        safety, effort, and change.
      </Text>

      {REASONS.map((reason) => (
        <View key={reason.title} style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>{reason.title}</Text>
          <Text style={globalStyles.cardText}>{reason.body}</Text>
        </View>
      ))}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>A platform built around dignity</Text>
        <Text style={globalStyles.cardText}>
          SafeSteps is designed to document context, strengths, support needs, and meaningful action without
          reducing a family&apos;s story to a single report or one moment in time.
        </Text>
      </View>

      <Link href="/my-story" asChild>
        <TouchableOpacity style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Back to My Story</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}
