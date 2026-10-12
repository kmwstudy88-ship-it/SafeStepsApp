import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link, Redirect, type Href, useLocalSearchParams } from "expo-router";

import { AppBottomNav } from "../../../components/AppBottomNav";
import { useAuth } from "../../../lib/auth";
import { getProgramById, getProgramWeekPlans } from "../../../lib/platformData";
import { globalStyles } from "../../../lib/styles";

export default function ProgramDetailsScreen() {
  const { initializing, user } = useAuth();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const program = getProgramById(programId);
  const weekPlans = getProgramWeekPlans(programId, 8);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!program) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
        <Text style={globalStyles.title}>Program not found</Text>
        <Text style={globalStyles.subtitle}>Choose another SafeSteps pathway.</Text>
        <Link href="/programs" asChild>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Back to programs</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    );
  }

  const cadence = program.evidenceCadence;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <View style={globalStyles.inlineRow}>
        <Text style={globalStyles.pill}>{program.durationLabel ?? `${program.weeks} weeks`}</Text>
        <Text style={globalStyles.pill}>
          {program.pathwayType === "custom-built" ? "custom built" : "set program"}
        </Text>
      </View>

      <Text style={globalStyles.title}>{program.title}</Text>
      <Text style={globalStyles.subtitle}>{program.description}</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Program structure</Text>
        <Text style={globalStyles.cardText}>Each month has one main topic and a parent meaning reflection before learning starts.</Text>
        <Text style={globalStyles.cardText}>Each month is broken into four weekly sub topics with the same no-right-or-wrong baseline reflection.</Text>
        <Text style={globalStyles.cardText}>Each week contains five daily 30-minute lessons with a meaning prompt, checkpoint, practice task, and end reflection.</Text>
        <Text style={globalStyles.cardText}>Courses stay separate in the learning library as standalone learning with lessons, checks, and certificates.</Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Who it is for</Text>
        {program.audience?.map((item) => (
          <Text key={item} style={globalStyles.cardText}>{item}</Text>
        ))}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Focus areas</Text>
        {program.focusAreas?.map((item) => (
          <Text key={item} style={globalStyles.cardText}>{item}</Text>
        ))}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Evidence rhythm</Text>
        <Text style={globalStyles.cardText}>
          Daily check-ins: {cadence?.dailyCheckIns === true ? "included" : "configured to the plan"}
        </Text>
        <Text style={globalStyles.cardText}>
          Weekly uploads: {cadence?.weeklyUploads ? "required" : "optional"}
        </Text>
        <Text style={globalStyles.cardText}>
          Monthly questionnaires: {cadence?.monthlyQuestionnaires === true ? "included" : "configured to the plan"}
        </Text>
        <Text style={globalStyles.cardText}>
          Spiral reassessments: {typeof cadence?.reassessmentEveryWeeks === "number"
            ? `every ${cadence.reassessmentEveryWeeks} weeks`
            : "configured to the plan"}
        </Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Program evidence outputs</Text>
        <Text style={globalStyles.cardText}>Baseline, midpoint, and final assessments</Text>
        <Text style={globalStyles.cardText}>Skill demonstrations linked to lessons</Text>
        <Text style={globalStyles.cardText}>Monthly accountability and insight review</Text>
        <Text style={globalStyles.cardText}>30-day, 90-day, and full completion reports</Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Start the pathway</Text>
        <Text style={globalStyles.cardText}>
          Open a week to see the focus, evidence prompt, and linked lessons for that stage.
        </Text>
        {weekPlans.map((week) => (
          <Link
            key={week.id}
            href={{ pathname: "/programs/[programId]/[weekId]", params: { programId: program.id, weekId: String(week.weekNumber) } }}
            asChild
          >
            <TouchableOpacity style={globalStyles.secondaryButton}>
              <Text style={globalStyles.secondaryButtonText}>{week.title}: {week.focus}</Text>
              <Text style={globalStyles.mutedText}>{week.dailyLessons.length} daily lessons, 30 minutes each</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      <Link href={"/library" as Href} asChild>
        <TouchableOpacity style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Open learning library</Text>
        </TouchableOpacity>
      </Link>

      <AppBottomNav />
    </ScrollView>
  );
}
