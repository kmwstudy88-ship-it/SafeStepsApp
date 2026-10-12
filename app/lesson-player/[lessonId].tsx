import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import LegacyLessonPlayer from "../../components/lesson/LegacyLessonPlayer";
import ProductionLessonPlayer from "../../components/lesson/ProductionLessonPlayer";
import { getLesson } from "../../lib/platform/data";
import { hasProductionLessonContent } from "../../lib/platform/productionLessonFlow";
import type { LessonRecord } from "../../lib/platform/types";

export default function LessonPlayerScreen() {
  const params = useLocalSearchParams<{
    lessonId: string;
    enrolmentId?: string;
  }>();
  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;
  const enrolmentId = Array.isArray(params.enrolmentId)
    ? params.enrolmentId[0]
    : params.enrolmentId;

  const [lesson, setLesson] = useState<LessonRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!lessonId) throw new Error("Missing lesson ID.");
        const data = await getLesson(lessonId);
        if (mounted) setLesson(data);
      } catch (error) {
        Alert.alert(
          "Lesson error",
          error instanceof Error
            ? error.message
            : "Could not load lesson.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [lessonId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson || !lessonId) {
    return (
      <View style={styles.center}>
        <Text>Lesson was not found.</Text>
      </View>
    );
  }

  if (hasProductionLessonContent(lesson.production_content)) {
    return (
      <ProductionLessonPlayer
        lesson={lesson}
        enrolmentId={enrolmentId}
      />
    );
  }

  return (
    <LegacyLessonPlayer
      lesson={lesson}
      lessonId={lessonId}
      enrolmentId={enrolmentId}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
  },
});
