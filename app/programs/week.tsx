import { Link, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getProgramById, getProgramMonth, getProgramWeek } from "../../lib/data/programs";
import { hasReflectionRecord } from "../../lib/engines/reflectionStatusEngine";
import { ChallengeRecommendations } from "../../components/ChallengeRecommendations";

export default function WeekScreen() {
  const params = useLocalSearchParams();

  const programId = String(params.programId ?? "");
  const programTitle = String(params.programTitle ?? "Program");
  const monthNumber = Number(params.monthNumber ?? 0);
  const monthTopic = String(params.monthTopic ?? "Monthly Topic");
  const weekNumber = Number(params.weekNumber ?? 0);

  const program = getProgramById(programId);
  const month = program ? getProgramMonth(program, monthNumber) : null;
  const week = program ? getProgramWeek(program, monthNumber, weekNumber) : null;

  const [weeklyReflectionSaved, setWeeklyReflectionSaved] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusError, setStatusError] = useState("");

  const loadWeekStatus = useCallback(async () => {
    if (!month || !program || !week) return;

    setCheckingStatus(true);
    setStatusError("");

    try {
      const saved = await hasReflectionRecord({
        programId: program.id,
        level: "week",
        monthNumber: month.monthNumber,
        weekNumber: week.weekNumber,
      });

      setWeeklyReflectionSaved(saved);
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Could not check weekly reflection status."
      );
    } finally {
      setCheckingStatus(false);
    }
  }, [month, program, week]);

  useEffect(() => {
    loadWeekStatus();
  }, [loadWeekStatus]);

  if (!program) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Program not found
        </Text>
        <Text style={{ marginTop: 6 }}>
          This program is not available in the current SafeSteps pathway list.
        </Text>
      </ScrollView>
    );
  }

  if (!month || !week) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Week not found
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 6 }}>
        Week {week.weekNumber}: {week.subTopic}
      </Text>

      <Text style={{ marginBottom: 16 }}>
        {programTitle} - Month {month.monthNumber}: {month.topic}
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: weeklyReflectionSaved ? "#dcefe8" : "#f1f5f3",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Weekly Reflection
        </Text>

        <Text style={{ marginTop: 8 }}>
          Parents answer what this weekly sub-topic means to them before
          starting daily lessons. There are no right or wrong answers.
        </Text>

        <Text style={{ marginTop: 10, fontWeight: "bold" }}>
          Status: {weeklyReflectionSaved ? "Saved" : "Required before daily lessons unlock"}
        </Text>

        {checkingStatus && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        )}

        {statusError.length > 0 && (
          <View
            style={{
              padding: 12,
              backgroundColor: "#ffecec",
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Status Check Error</Text>
            <Text style={{ marginTop: 6 }}>{statusError}</Text>
          </View>
        )}

        <Link
          href={{
            pathname: "/programs/reflection",
            params: {
              level: "week",
              programId: program.id,
              programTitle: program.title,
              monthNumber: String(month.monthNumber),
              monthTopic: month.topic,
              weekNumber: String(week.weekNumber),
              weekSubTopic: week.subTopic,
            },
          }}
          asChild
        >
          <Pressable
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: "#ffffff",
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#cbd8d0",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              {weeklyReflectionSaved
                ? "View / Add Weekly Reflection"
                : "Complete Weekly Reflection"}
            </Text>
          </Pressable>
        </Link>

        <Pressable
          onPress={loadWeekStatus}
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#eef7f2",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Refresh Unlock Status</Text>
        </Pressable>
      </View>

      <ChallengeRecommendations
        context={`${program.title} ${month.topic} ${week.subTopic} ${week.lessons.map((lesson) => lesson.title).join(" ")}`}
        title="Optional practice this week"
        limit={2}
      />

      {week.lessons.map((lesson) => (
        <View
          key={`${program.id}-month-${month.monthNumber}-week-${week.weekNumber}-day-${lesson.day}`}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
            opacity: weeklyReflectionSaved ? 1 : 0.65,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Day {lesson.day}: {lesson.title}
          </Text>

          <Text style={{ marginTop: 6 }}>
            Duration: {lesson.durationMinutes} minutes
          </Text>

          <Text style={{ marginTop: 8 }}>
            Required: start reflection, lesson content, knowledge checkpoint,
            scenario checkpoint, real-world activity, and end reflection.
          </Text>

          {weeklyReflectionSaved ? (
            <Link
              href={{
                pathname: "/programs/lesson",
                params: {
                  programId: program.id,
                  programTitle: program.title,
                  monthNumber: String(month.monthNumber),
                  monthTopic: monthTopic,
                  weekNumber: String(week.weekNumber),
                  weekSubTopic: week.subTopic,
                  day: String(lesson.day),
                  lessonTitle: lesson.title,
                },
              }}
              asChild
            >
              <Pressable
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#dcefe8",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Open Daily Lesson</Text>
              </Pressable>
            </Link>
          ) : (
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: "#e5e5e5",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#777777" }}>
                Locked until weekly reflection is saved
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
