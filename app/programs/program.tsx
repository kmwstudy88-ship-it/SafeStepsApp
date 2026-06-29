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
import {
  fetchActiveProgramEnrollment,
  startProgramEnrollment,
  ProgramEnrollment,
} from "../../lib/engines/programEnrollmentEngine";

export default function ProgramPathwayScreen() {
  const params = useLocalSearchParams();
  const programId = String(params.programId ?? "");

  const program = programs.find((item) => item.id === programId) ?? programs[0];

  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [checking, setChecking] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const loadEnrollment = useCallback(async () => {
    setChecking(true);
    setError("");

    try {
      const active = await fetchActiveProgramEnrollment(program.id);
      setEnrollment(active);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not check program enrolment."
      );
    } finally {
      setChecking(false);
    }
  }, [program.id]);

  async function handleStartProgram() {
    setStarting(true);
    setError("");

    try {
      const saved = await startProgramEnrollment(program.id, program.title);
      setEnrollment(saved);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Could not start program."
      );
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    loadEnrollment();
  }, [loadEnrollment]);

  const programStarted = enrollment !== null;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 6 }}>
        {program.title}
      </Text>

      <Text style={{ marginBottom: 8 }}>
        {program.durationMonths > 0
          ? `${program.durationMonths} month structured pathway`
          : "Custom structured pathway"}
      </Text>

      <Text style={{ marginBottom: 18 }}>{program.description}</Text>

      <View
        style={{
          padding: 16,
          backgroundColor: programStarted ? "#dcefe8" : "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Program Enrolment
        </Text>

        {checking ? (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Text style={{ marginTop: 8 }}>
              Status: {programStarted ? "Active" : "Not started"}
            </Text>

            {programStarted && enrollment?.started_at && (
              <Text style={{ marginTop: 6 }}>
                Started: {new Date(enrollment.started_at).toLocaleDateString()}
              </Text>
            )}

            {!programStarted && (
              <Pressable
                onPress={handleStartProgram}
                disabled={starting}
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#dcefe8",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                {starting ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{ fontWeight: "bold" }}>Start Program</Text>
                )}
              </Pressable>
            )}
          </>
        )}

        {error.length > 0 && (
          <View
            style={{
              padding: 12,
              backgroundColor: "#ffecec",
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Program Error</Text>
            <Text style={{ marginTop: 6 }}>{error}</Text>
          </View>
        )}
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Program Structure
        </Text>
        <Text style={{ marginTop: 8 }}>
          Parents complete monthly reflections, weekly reflections, daily
          lessons, learning checkpoints, scenario exercises, real-world
          activities, and end reflections.
        </Text>
      </View>

      {program.months.length === 0 && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>No monthly topics yet</Text>
          <Text style={{ marginTop: 6 }}>
            Monthly topics will be added to this program in the curriculum data
            file.
          </Text>
        </View>
      )}

      {program.months.map((month) => (
        <View
          key={`${program.id}-month-${month.monthNumber}`}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
            opacity: programStarted ? 1 : 0.65,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Month {month.monthNumber}: {month.topic}
          </Text>

          <Text style={{ marginTop: 8 }}>
            This month begins with a parent reflection. There are no right or
            wrong answers.
          </Text>

          {programStarted ? (
            <Link
              href={{
                pathname: "/programs/month",
                params: {
                  programId: program.id,
                  programTitle: program.title,
                  monthNumber: String(month.monthNumber),
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
                <Text style={{ fontWeight: "bold" }}>Open Month</Text>
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
                Start program to unlock months
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
