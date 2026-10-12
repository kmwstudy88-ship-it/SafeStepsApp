import { Link } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

const cardStyle = {
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
} as const;

export default function ProgramsScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Programs
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Your program journey starts with the pathway saved in parent intake.
        SafeSteps explains the match and records your confirmation before an
        enrolment can begin.
      </Text>

      <Link href="/programs/recommendation" asChild>
        <Pressable
          style={[cardStyle, { backgroundColor: "#dcefe8" }]}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            My Recommendation
          </Text>
          <Text style={{ marginTop: 6 }}>
            Review why a pathway is shown, confirm your choice, and see any
            worker or governance safeguards still required.
          </Text>
        </Pressable>
      </Link>

      <Link href="/programs/my-programs" asChild>
        <Pressable
          style={[cardStyle, { backgroundColor: "#e8f2f7" }]}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>My Programs</Text>
          <Text style={{ marginTop: 6 }}>
            Continue a confirmed program that has been approved and started.
          </Text>
        </Pressable>
      </Link>

      <Link href="/programs/main" asChild>
        <Pressable
          style={[cardStyle, { backgroundColor: "#f1f5f3" }]}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Compare Programs
          </Text>
          <Text style={{ marginTop: 6 }}>
            Read the pathway descriptions and launch status. Browsing does not
            create or change an enrolment.
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
