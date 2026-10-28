import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getAiSupportOfflineQueueStatus,
  submitChildThreeHousesPlayroom,
} from "../../lib/aiSupportApi";
import type { ChildThreeHousesResult } from "../../lib/engines/forensicConvergenceAndChildPlayroomEngine";

interface SafetyFinger {
  finger: string;
  label: string;
  name: string;
  contact: string;
}

const DEFAULT_FINGERS: SafetyFinger[] = [
  {
    finger: "👍 Thumb",
    label: "Primary Safe Grown-Up",
    name: "Grandma Helen",
    contact: "0400 111 222",
  },
  {
    finger: "☝ Index",
    label: "School / Learning Anchor",
    name: "Miss Taylor (Grade 4 Teacher)",
    contact: "School Wellbeing Office",
  },
  {
    finger: "🖕 Middle",
    label: "Support Worker / Counsellor",
    name: "Caseworker Sam",
    contact: "Child Safety Office",
  },
  {
    finger: "💍 Ring",
    label: "Family / Trusted Neighbour",
    name: "Aunty Sarah",
    contact: "0400 333 444",
  },
  {
    finger: "🤙 Pinky",
    label: "24/7 Helpline Anchor",
    name: "Kids Helpline (Freecall)",
    contact: "1800 55 1800",
  },
];

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

  // Discrete 5-Finger Safety Network state
  const [fingers, setFingers] = useState<SafetyFinger[]>(DEFAULT_FINGERS);

  // Worry Monster Breathing Player state
  const [worryIntensity, setWorryIntensity] = useState("4");
  const [breathPhase, setBreathPhase] = useState<"ready" | "inhale" | "blow" | "ground">("ready");
  const [breathCounter, setBreathCounter] = useState(0);
  const [breathActive, setBreathActive] = useState(false);

  // Offline Sync & Audit state
  const [offlineStatus, setOfflineStatus] = useState<{
    pendingCount: number;
    tamperVerified: boolean;
  }>({ pendingCount: 0, tamperVerified: true });
  const [result, setResult] = useState<ChildThreeHousesResult | null>(null);

  useEffect(() => {
    refreshQueueStatus();
  }, []);

  const refreshQueueStatus = async () => {
    try {
      const q = await getAiSupportOfflineQueueStatus();
      setOfflineStatus({ pendingCount: q.pendingCount, tamperVerified: q.tamperVerified });
    } catch {
      // Non-blocking fallback
    }
  };

  // Worry Monster Breathing loop
  useEffect(() => {
    if (!breathActive) return;
    const interval = setInterval(() => {
      setBreathCounter((prev) => {
        const next = prev + 1;
        if (next <= 3) {
          setBreathPhase("inhale");
        } else if (next <= 8) {
          setBreathPhase("blow");
        } else if (next <= 11) {
          setBreathPhase("ground");
        } else {
          // Loop cycle
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathActive]);

  const updateFinger = (index: number, field: "name" | "contact", val: string) => {
    setFingers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSavePlayroom = async () => {
    const formattedAdults = fingers
      .filter((f) => f.name.trim().length > 0)
      .map((f) => `${f.finger} (${f.label}): ${f.name} [${f.contact}]`);

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
      fiveFingerTrustedAdults: formattedAdults,
      worryMonsterIntensity0to10: Number(worryIntensity) || 4,
    });
    setResult(res);
    await refreshQueueStatus();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Offline Vault & Security Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeDot}>●</Text>
          <Text style={styles.statusBadgeText}>
            Child Safe Mode: Active | Offline Vault:{" "}
            {offlineStatus.pendingCount === 0
              ? "Synchronized"
              : `${offlineStatus.pendingCount} Queued`}
          </Text>
        </View>
        <Text style={styles.tamperText}>
          {offlineStatus.tamperVerified ? "🛡️ Cryptographically Verified" : "⚠ Queue Discrepancy"}
        </Text>
      </View>

      <Text style={styles.title}>
        My Three Houses, 5-Finger Safety Hand &amp; Worry Monster Playroom
      </Text>
      <Text style={styles.subtitle}>
        A confidential, trauma-safe space to share what makes you happy, what feels tricky, and
        your wishes for home. Grown-up problems are never your fault.
      </Text>

      {/* Age Band Selector */}
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

      {/* House 1: Good Things */}
      <View style={[styles.houseCard, { borderColor: "#10B981" }]}>
        <Text style={styles.houseTitle}>
          🏡 1. House of Good Things (What makes me feel safe, loved &amp; happy)
        </Text>
        <TextInput
          style={styles.input}
          multiline
          value={goodThings}
          onChangeText={setGoodThings}
          placeholder="e.g. My puppy; drawing cartoons; bedtime pancakes with Aunt"
          placeholderTextColor="#64748B"
        />
      </View>

      {/* House 2: Worries */}
      <View style={[styles.houseCard, { borderColor: "#F59E0B" }]}>
        <Text style={styles.houseTitle}>
          🌧️ 2. House of Worries (Things that feel loud, scary, or confusing)
        </Text>
        <TextInput
          style={styles.input}
          multiline
          value={worries}
          onChangeText={setWorries}
          placeholder="e.g. Shouting at dinner; not knowing who is picking me up"
          placeholderTextColor="#64748B"
        />
      </View>

      {/* House 3: Dreams */}
      <View style={[styles.houseCard, { borderColor: "#38BDF8" }]}>
        <Text style={styles.houseTitle}>
          🌈 3. House of Dreams (My wishes for how home will feel every day)
        </Text>
        <TextInput
          style={styles.input}
          multiline
          value={dreams}
          onChangeText={setDreams}
          placeholder="e.g. Calm voices; watching movies together; knowing the weekend plan"
          placeholderTextColor="#64748B"
        />
      </View>

      {/* 4. Interactive 5-Finger Safety Network Hand */}
      <View style={[styles.houseCard, { borderColor: "#818CF8" }]}>
        <Text style={styles.houseTitle}>
          ✋ 4. My 5-Finger Safety Hand (5 Safe Grown-Ups I Can Talk To)
        </Text>
        <Text style={styles.sectionSubtitle}>
          Every finger represents a safe adult you trust. Make sure you know how to reach them:
        </Text>

        {fingers.map((f, idx) => (
          <View key={idx} style={styles.fingerCard}>
            <View style={styles.fingerHeader}>
              <Text style={styles.fingerIcon}>{f.finger}</Text>
              <Text style={styles.fingerLabel}>{f.label}</Text>
            </View>
            <View style={styles.fingerInputsRow}>
              <TextInput
                style={[styles.input, { flex: 3 }]}
                value={f.name}
                onChangeText={(val) => updateFinger(idx, "name", val)}
                placeholder="Safe adult name..."
                placeholderTextColor="#64748B"
              />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={f.contact}
                onChangeText={(val) => updateFinger(idx, "contact", val)}
                placeholder="Phone or place..."
                placeholderTextColor="#64748B"
              />
            </View>
          </View>
        ))}
      </View>

      {/* 5. Worry Monster Intensity & Interactive Breathing Grounding Player */}
      <View style={[styles.houseCard, { borderColor: "#EC4899" }]}>
        <Text style={styles.houseTitle}>
          👾 5. Worry Monster Taming &amp; Somatic Reset Station
        </Text>
        <Text style={styles.sectionSubtitle}>
          How big is the Worry Monster feeling right now? (0 = Tiny &amp; Sleepy, 10 = Roaring)
        </Text>
        <TextInput
          style={styles.input}
          value={worryIntensity}
          onChangeText={setWorryIntensity}
          keyboardType="numeric"
          placeholder="Rate 0 to 10"
          placeholderTextColor="#64748B"
        />

        {/* Interactive Breath & Grounding Player */}
        <View style={styles.breathBox}>
          <Text style={styles.breathHeader}>🌬️ 3-Phase Worry Monster Pacer</Text>
          <View style={styles.pacerContainer}>
            <Text style={styles.pacerPhaseTitle}>
              {breathPhase === "ready" && "Ready to Tame the Monster"}
              {breathPhase === "inhale" && "🎈 Inhale (3s): Soften shoulders & fill belly"}
              {breathPhase === "blow" && "👾 Blow (5s): Blow worry into the locked chest"}
              {breathPhase === "ground" && "👣 Ground (3s): Press feet firmly onto floor"}
            </Text>
            <Text style={styles.pacerCount}>
              {breathActive ? `00:${breathCounter.toString().padStart(2, "0")}` : "--:--"}
            </Text>
          </View>

          <View style={styles.pacerButtonRow}>
            <Pressable
              style={[styles.pacerBtn, breathActive && styles.pacerBtnActive]}
              onPress={() => {
                setBreathActive((prev) => !prev);
                if (!breathActive) setBreathCounter(0);
              }}
            >
              <Text style={styles.pacerBtnText}>
                {breathActive ? "Pause Pacer" : "Start 30s Worry Tamer"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.pacerSecondaryBtn}
              onPress={() => {
                setBreathActive(false);
                setBreathCounter(0);
                setBreathPhase("ready");
              }}
            >
              <Text style={styles.pacerSecondaryBtnText}>Reset</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleSavePlayroom}>
          <Text style={styles.primaryBtnText}>
            Lock Into Vault &amp; Generate Child Safety Guidance
          </Text>
        </Pressable>

        {result ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{result.childFriendlyResponseMessage}</Text>
            <Text style={styles.resultSafe}>{result.worryMonsterTamingExercise}</Text>
            <Text style={styles.resultBody}>
              Safety Network: {result.trustedAdultsCount}/5 Adults Registered | Hand Complete:{" "}
              {result.safetyNetworkComplete ? "Yes (Safe)" : "Needs at least 3 adults"}
            </Text>
            <View style={styles.auditLine}>
              <Text style={styles.auditHashLabel}>Cryptographic Audit Seal:</Text>
              <Text style={styles.auditHashVal}>{result.auditSha256}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Navigation Buttons */}
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
  statusBar: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusBadgeDot: { color: "#10B981", fontSize: 10 },
  statusBadgeText: { color: "#E2E8F0", fontSize: 12, fontWeight: "600" },
  tamperText: { color: "#38BDF8", fontSize: 11, fontWeight: "700" },
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#94A3B8", fontSize: 13, lineHeight: 18 },
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
    gap: 10,
  },
  houseTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  sectionSubtitle: { color: "#94A3B8", fontSize: 12 },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  fingerCard: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  fingerHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  fingerIcon: { fontSize: 15 },
  fingerLabel: { color: "#A5B4FC", fontSize: 12, fontWeight: "700" },
  fingerInputsRow: { flexDirection: "row", gap: 8 },
  breathBox: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#F472B6",
  },
  breathHeader: { color: "#F472B6", fontSize: 13, fontWeight: "700" },
  pacerContainer: {
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  pacerPhaseTitle: { color: "#FDE047", fontSize: 13, fontWeight: "700", textAlign: "center" },
  pacerCount: { color: "#F8FAFC", fontSize: 18, fontWeight: "800", fontFamily: "monospace" },
  pacerButtonRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  pacerBtn: {
    flex: 1,
    backgroundColor: "#EC4899",
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: "center",
  },
  pacerBtnActive: { backgroundColor: "#BE185D" },
  pacerBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  pacerSecondaryBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: "#334155",
    borderRadius: 6,
    alignItems: "center",
  },
  pacerSecondaryBtnText: { color: "#F8FAFC", fontWeight: "600", fontSize: 12 },
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
    marginTop: 4,
  },
  resultTitle: { color: "#6EE7B7", fontWeight: "700", fontSize: 14 },
  resultSafe: { color: "#38BDF8", fontSize: 13 },
  resultBody: { color: "#E2E8F0", fontSize: 12 },
  auditLine: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    gap: 2,
  },
  auditHashLabel: { color: "#94A3B8", fontSize: 10, fontWeight: "600" },
  auditHashVal: { color: "#6EE7B7", fontSize: 10, fontFamily: "monospace" },
  secondaryBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
});
