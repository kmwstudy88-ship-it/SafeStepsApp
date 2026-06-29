import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { programs } from "../../lib/data/programs";
import {
  fetchMyProgramEnrollments,
  ProgramEnrollment,
} from "../../lib/engines/programEnrollmentEngine";

export default function MyProgramsScreen() {
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEnrollments() {
    setLoading(true);
    setError("");

    try {
      const savedEnrollments = await fetchMyProgramEnrollments();
      setEnrollments(savedEnrollments);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your programs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEnrollments();
  }, []);

  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "active"
  );

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        My Programs
      </Text>

      <Text style={{ marginBottom: 16 }}>
        These are the SafeSteps programs you have started.
      </Text>

      <Pressable
        onPress={loadEnrollments}
        style={{
          padding: 12,
          backgroundColor: "#dcefe8",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Refresh My Programs</Text>
      </Pressable>

      {loading && <ActivityIndicator />}

      {error.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Could not load programs</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {!loading && error.length === 0 && activeEnrollments.length === 0 && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            No active programs yet
          </Text>
          <Text style={{ marginTop: 6 }}>
            Browse programs and start one to create your pathway.
          </Text>

          <Link href="/programs/main" asChild>
            <Pressable
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: "#dcefe8",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Browse Programs</Text>
            </Pressable>
          </Link>
        </View>
      )}

      {activeEnrollments.map((enrollment) => {
        const program =
          programs.find((item) => item.id === enrollment.program_id) ??
          programs[0];

        return (
          <View
            key={enrollment.id}
            style={{
              padding: 16,
              backgroundColor: "#ffffff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#d8e5dd",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {program.title}
            </Text>

            <Text style={{ marginTop: 6 }}>
              Status: {enrollment.status}
            </Text>

            <Text style={{ marginTop: 6 }}>
              Started: {new Date(enrollment.started_at).toLocaleDateString()}
            </Text>

            <Link
              href={{
                pathname: "/programs/program",
                params: {
                  programId: program.id,
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
                <Text style={{ fontWeight: "bold" }}>Continue Program</Text>
              </Pressable>
            </Link>
          </View>
        );
      })}
    </ScrollView>
  );
}