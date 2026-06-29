import { Link, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { programs } from "../../lib/data/programs";
import { hasReflectionRecord } from "../../lib/engines/reflectionStatusEngine";

export default function MonthScreen() {
  const params = useLocalSearchParams();

  const programId = String(params.programId ?? "");
  const programTitle = String(params.programTitle ?? "Program");
  const monthNumber = Number(params.monthNumber ?? 0);

  const program = programs.find((item) => item.id === programId) ?? programs[0];
  const month =
    program.months.find((item) => item.monthNumber === monthNumber) ??
    program.months[0];

  const [monthlyReflectionSaved, setMonthlyReflectionSaved] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusError, setStatusError] = useState("");

  const loadMonthStatus = useCallback(async () => {
    if (!month) return;

    setCheckingStatus(true);
    setStatusError("");

    try {
      const saved = await hasReflectionRecord({
        programId: program.id,
        level: "month",
        monthNumber: month.monthNumber,
      });

      setMonthlyReflectionSaved(saved);
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Could not check monthly reflection status."
      );
    } finally {
      setCheckingStatus(false);
    }
  }, [month, program.id]);

  useEffect(() => {
    loadMonthStatus();
  }, [loadMonthStatus]);

  if (!month) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Month not found
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 6 }}>
        Month {month.monthNumber}: {month.topic}
      </Text>

      <Text style={{ marginBottom: 16 }}>{programTitle}</Text>

      <View
        style={{
          padding: 16,
          backgroundColor: monthlyReflectionSaved ? "#dcefe8" : "#f1f5f3",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Monthly Reflection
        </Text>

        <Text style={{ marginTop: 8 }}>
          Before starting this month, parents answer what the monthly topic
          means to them. There are no right or wrong answers.
        </Text>

        <Text style={{ marginTop: 10, fontWeight: "bold" }}>
          Status: {monthlyReflectionSaved ? "Saved" : "Required before weeks unlock"}
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
              level: "month",
              programId: program.id,
              programTitle: program.title,
              monthNumber: String(month.monthNumber),
              monthTopic: month.topic,
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
              {monthlyReflectionSaved
                ? "View / Add Monthly Reflection"
                : "Complete Monthly Reflection"}
            </Text>
          </Pressable>
        </Link>

        <Pressable
          onPress={loadMonthStatus}
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

      {month.weeks.map((week) => (
        <View
          key={`${program.id}-month-${month.monthNumber}-week-${week.weekNumber}`}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
            opacity: monthlyReflectionSaved ? 1 : 0.65,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Week {week.weekNumber}: {week.subTopic}
          </Text>

          <Text style={{ marginTop: 8 }}>
            This weekly sub-topic begins with a parent reflection before daily
            lessons are opened.
          </Text>

          {monthlyReflectionSaved ? (
            <Link
              href={{
                pathname: "/programs/week",
                params: {
                  programId: program.id,
                  programTitle: program.title,
                  monthNumber: String(month.monthNumber),
                  monthTopic: month.topic,
                  weekNumber: String(week.weekNumber),
                },
              }}
              asChild
            >
              <Pressable
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#eef7f2",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Open Week</Text>
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
                Locked until monthly reflection is saved
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
