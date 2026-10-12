import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { submitChildThreeHousesPlayroom } from "../../lib/aiSupportApi";
import type { ChildThreeHousesResult } from "../../lib/engines/forensicConvergenceAndChildPlayroomEngine";

export default function ChildThreeHousesPlayroomScreen() {
  const router = useRouter();
  const [ageBand, setAgeBand] = useState<"5-8" | "9-12" | "13-17">("9-12");
  const [goodThings, setGoodThings] = useState(
    "Playing soccer with my dog; Reading bedtime stories with Grandma; Art class at school",
  );
  const [worries, setWorries] = useState(
    "When grown-ups have loud voices at night; Worrying about moving schools",
  );
  const [dreams, setDreams] = useState(
    "Everyone using calm voices at dinner; Knowing the weekend plan every Friday",
  );
  const [fiveFingers, setFiveFingers] = useState(
    "Grandma; Miss Taylor (Teacher); Aunty Sarah; Caseworker Sam; Kids Helpline (1800 55 1800)",
  );
  const [worryIntensity, setWorryIntensity] = useState("4");
  const [result, setResult] = useState<ChildThreeHousesResult | null>(null);

  const handleSavePlayroom = async () => {
    const res = await submitChildThreeHousesPlayroom({
      childUserId: "child-local",
      ageBand,
      houseOfGoodThings: goodThings
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      houseOfWorries: worries
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      houseOfDreams: dreams
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      fiveFingerTrustedAdults: fiveFingers
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      worryMonsterIntensity0to10: Number(worryIntensity) || 4,
    });
    setResult(res);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        My Three Houses, 5-Finger Safety Hand & Worry Monster Playroom
      </Text>
      <Text style={styles.subtitle}>
        A safe space to share what makes you happy, what you worry about, and your wishes for home. Grown-up problems are never your fault.
      </Text>

      <View style={styles.chipRow}>
        {(["5-8", "9-12", "13-17"] as const).map((band) => (
          <Pressable
            key={band}
            style={[styles.chip, ageBand === band && styles.chipActive]}
            onPress={() => setAgeBand(band)}
          >
            <Text style={styles.chipText}>Ages {band}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.houseCard, { borderColor: "#10B981" }]}>
        <Text style={styles.houseTitle}>🏡 1. House of Good Things (What makes me feel safe & happy)</Text>
        <TextInput
          style={styles.input}
          multiline
          value={goodThings}
          onChangeText={setGoodThings}
        />
      </View>

      <View style={[styles.houseCard, { borderColor: "#F59E0B" }]}>
        <Text style={styles.houseTitle}>🌧️ 2. House of Worries (Things that feel tricky or scary)</Text>
        <TextInput style={styles.input} multiline value={worries} onChangeText={setWorries} />
      </View>

      <View style={[styles.houseCard, { borderColor: "#38BDF8" }]}>
        <Text style={styles.houseTitle}>🌈 3. House of Dreams (How I wish home felt every day)</Text>
        <TextInput style={styles.input} multiline value={dreams} onChangeText={setDreams} />
      </View>

      <View style={styles.houseCard}>
        <Text style={styles.houseTitle}>✋ 4. My 5-Finger Safety Network Hand (5 Safe Grown-Ups)</Text>
        <TextInput
          style={styles.input}
          multiline
          value={fiveFingers}
          onChangeText={setFiveFingers}
        />
        <Text style={styles.houseTitle}>👾 5. Worry Monster Size Today (0 = Tiny, 10 = Huge)</Text>
        <TextInput
          style={styles.input}
          value={worryIntensity}
          onChangeText={setWorryIntensity}
          keyboardType="numeric"
        />

        <Pressable style={styles.primaryBtn} onPress={handleSavePlayroom}>
          <Text style={styles.primaryBtnText}>Save My Three Houses & Tame Worry Monster</Text>
        </Pressable>

        {result ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{result.childFriendlyResponseMessage}</Text>
            <Text style={styles.resultSafe}>{result.worryMonsterTamingExercise}</Text>
            <Text style={styles.resultBody}>
              5-Finger Safety Network Adults: {result.trustedAdultsCount} | Complete:{" "}
              {result.safetyNetworkComplete ? "Yes!" : "Add at least 3 safe adults"}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/child/support-coach")}
        >
          <Text style={styles.secondaryBtnText}>Back to Child Support Buddy</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/child")}>
          <Text style={styles.secondaryBtnText}>Child Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { padding: 18, paddingBottom: 48, gap: 14 },
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#94A3B8", fontSize: 13 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#1E293B",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#475569",
  },
  chipActive: { backgroundColor: "#0284C7", borderColor: "#38BDF8" },
  chipText: { color: "#F8FAFC", fontSize: 13, fontWeight: "700" },
  houseCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#334155",
    gap: 8,
  },
  houseTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnText: { color: "#064E3B", fontWeight: "800", fontSize: 14 },
  resultBox: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
    gap: 6,
  },
  resultTitle: { color: "#6EE7B7", fontWeight: "700", fontSize: 14 },
  resultSafe: { color: "#38BDF8", fontSize: 13 },
  resultBody: { color: "#E2E8F0", fontSize: 12 },
  secondaryBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
});
