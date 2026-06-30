import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { learningCourses, type LearningCourse } from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

const FILTERS = ["All", "Accountability", "DFV", "AOD", "Mental health", "Safety", "Parenting"] as const;

function courseMatchesFilter(course: LearningCourse, filter: (typeof FILTERS)[number]) {
  if (filter === "All") return true;
  return course.category.toLowerCase().includes(filter.toLowerCase());
}

export default function LearningLibraryScreen() {
  const { initializing, user } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filteredCourses = useMemo(
    () => learningCourses.filter((course) => courseMatchesFilter(course, filter)),
    [filter],
  );

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Learning library</Text>
      <Text style={globalStyles.subtitle}>
        Standalone courses for focused learning. Courses do not use the program month and week structure; they use lessons, knowledge checks, optional reflection, and certificates.
      </Text>

      <View style={globalStyles.segmentedRow}>
        {FILTERS.map((item) => {
          const selected = filter === item;

          return (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={selected ? globalStyles.segmentSelected : globalStyles.segment}
            >
              <Text style={selected ? globalStyles.segmentTextSelected : globalStyles.segmentText}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredCourses.map((course) => (
        <View key={course.id} style={globalStyles.card}>
          <View style={globalStyles.inlineRow}>
            <Text style={globalStyles.pill}>{course.length}</Text>
            <Text style={globalStyles.pill}>public course</Text>
            <Text style={globalStyles.pill}>evidence mode</Text>
          </View>
          <Text style={globalStyles.cardTitle}>{course.title}</Text>
          <Text style={globalStyles.cardText}>{course.category}</Text>
          {course.outcomes.map((outcome) => (
            <Text key={outcome} style={globalStyles.mutedText}>{outcome}</Text>
          ))}

          <View style={globalStyles.compactBlock}>
            <Text style={globalStyles.cardTitle}>Lesson evidence cycle</Text>
            <Text style={globalStyles.cardText}>Before reflection</Text>
            <Text style={globalStyles.cardText}>Lesson content</Text>
            <Text style={globalStyles.cardText}>Readiness questionnaire</Text>
            <Text style={globalStyles.cardText}>Skill demonstration</Text>
            <Text style={globalStyles.cardText}>Evidence upload</Text>
            <Text style={globalStyles.cardText}>After reflection</Text>
            <Text style={globalStyles.cardText}>Spiral reassessment</Text>
          </View>

          {course.lessons.map((lesson) => (
            <View key={lesson.id} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{lesson.title}</Text>
              <Text style={globalStyles.mutedText}>
                Reassess in week {lesson.reassessmentWeekOffset}: {lesson.scoringDomains.join(", ")}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <AppBottomNav />
    </ScrollView>
  );
}
