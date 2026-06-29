import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { programs } from "../../lib/data/programs";

export default function BrowseProgramsScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Browse Programs
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Start a program to create an active SafeSteps pathway.
      </Text>

      {programs.map((program) => (
        <View
          key={program.id}
          style={{
            padding: 16,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {program.title}
          </Text>

          <Text style={{ marginTop: 4 }}>
            {program.durationMonths > 0
              ? `${program.durationMonths} month program`
              : "Custom duration"}
          </Text>

          <Text style={{ marginTop: 8 }}>{program.description}</Text>

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
              <Text style={{ fontWeight: "bold" }}>Open Program</Text>
            </Pressable>
          </Link>
        </View>
      ))}
    </ScrollView>
  );
}