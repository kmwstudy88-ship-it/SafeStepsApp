import { Link } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

export default function ProgramsScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Programs
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Main Programs are structured change pathways with monthly topics,
        weekly sub-topics, daily 30-minute lessons, reflections, checkpoints,
        practical activities, evidence, and growth tracking.
      </Text>

      <Link href="/programs/my-programs" asChild>
        <Pressable
          style={{
            padding: 16,
            backgroundColor: "#dcefe8",
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>My Programs</Text>
          <Text style={{ marginTop: 6 }}>
            Continue programs you have already started.
          </Text>
        </Pressable>
      </Link>

      <Link href="/programs/main" asChild>
        <Pressable
          style={{
            padding: 16,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Browse Programs
          </Text>
          <Text style={{ marginTop: 6 }}>
            View and start SafeSteps main programs.
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
