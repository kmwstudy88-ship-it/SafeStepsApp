import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getProgramById, getProgramMonths } from "../../lib/data/programs";
import {
  fetchActiveProgramEnrollment,
  startProgramEnrollment,
  ProgramEnrollment,
} from "../../lib/engines/programEnrollmentEngine";
import { ChallengeRecommendations } from "../../components/ChallengeRecommendations";

export default function ProgramPathwayScreen() {
  const params = useLocalSearchParams();
  const programId = String(params.programId ?? "");

  const program = getProgramById(programId);
  const selectedProgramId = program?.id ?? "";
  const programMonths = program ? getProgramMonths(program) : [];

  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [checking, setChecking] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  async function handleStartProgram() {
    if (!program) return;

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
    let active = true;

    async function loadEnrollment() {
      setChecking(true);
      setError("");

      try {
        if (!selectedProgramId) return;
        const activeEnrollment = await fetchActiveProgramEnrollment(selectedProgramId);
        if (active) setEnrollment(activeEnrollment);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not check program enrolment."
        );
      } finally {
        if (active) setChecking(false);
      }
    }

    loadEnrollment();

    return () => {
      active = false;
    };
  }, [selectedProgramId]);

  const programStarted = enrollment !== null;

  if (!program) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
          Program not found
        </Text>
        <Text>This program is not available in the current SafeSteps pathway list.</Text>
      </ScrollView>
    );
  }

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

      <ChallengeRecommendations
        context={`${program.title} ${program.description} ${programMonths.map((month) => month.topic).join(" ")}`}
        title="Challenges for this program"
      />

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

      {programMonths.map((month) => (
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
