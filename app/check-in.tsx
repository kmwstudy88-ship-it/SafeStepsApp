import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../components/AppBottomNav";
import { useAuth } from "../lib/auth";
import { routeWellbeingCheckIn, type WellbeingCheckIn } from "../lib/engines/wellbeingCheckInEngine";
import { saveDailyCheckIn } from "../lib/platformData";

export default function CheckInScreen() {
  const { initializing, user } = useAuth();
  const [checkIn, setCheckIn] = useState<WellbeingCheckIn>({
    mood: "steady", stress: 2, sleep: "rested", conflict: "low", substanceRisk: "none",
    childDependingNow: false, afraidMayHarm: false, safety: "safe",
  });
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const route = routeWellbeingCheckIn(checkIn);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  function update<K extends keyof WellbeingCheckIn>(key: K, value: WellbeingCheckIn[K]) {
    setCheckIn((current) => ({ ...current, [key]: value }));
    setReviewed(false);
    setMessage("");
  }

  async function handleSave() {
    setReviewed(true);
    setMessage("");
    if (!route.ordinarySaveAllowed) return;
    if (!user) return;
    const userId = user.id;
    setSaving(true);
    try {
      await saveDailyCheckIn(userId, { ...checkIn, note });
      setNote("");
      setMessage("Daily wellbeing check-in saved to your progress record.");
    } catch {
      setMessage("Could not save the check-in yet. Check access and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>DAILY WELLBEING CHECK-IN</Text>
        <Text style={styles.title}>What support would help today?</Text>
        <Text style={styles.subtitle}>A brief check of mood, stress, sleep, conflict, recovery pressure, and safety. This is not a diagnosis or clinical assessment.</Text>
      </View>

      <Question title="How are you feeling?"><Options value={checkIn.mood} onChange={(value) => update("mood", value)} items={[["Steady", "steady"], ["Stressed", "stressed"], ["Overwhelmed", "overwhelmed"]]} /></Question>
      <Question title="Stress level"><Options value={checkIn.stress} onChange={(value) => update("stress", value)} items={[["1 · Low", 1], ["2", 2], ["3", 3], ["4", 4], ["5 · Very high", 5]]} /></Question>
      <Question title="How was your sleep?"><Options value={checkIn.sleep} onChange={(value) => update("sleep", value)} items={[["Rested", "rested"], ["Limited", "limited"], ["Almost none", "none"]]} /></Question>
      <Question title="Family conflict today"><Options value={checkIn.conflict} onChange={(value) => update("conflict", value)} items={[["Low", "low"], ["Rising", "rising"], ["Feels unsafe", "unsafe"]]} /></Question>
      <Question title="Alcohol or other drug pressure">
        <Options value={checkIn.substanceRisk} onChange={(value) => update("substanceRisk", value)} items={[["None", "none"], ["Thoughts", "thoughts"], ["Strong urge", "strong_urge"], ["I have used", "used"]]} />
        {checkIn.substanceRisk !== "none" ? <Options value={checkIn.childDependingNow} onChange={(value) => update("childDependingNow", value)} items={[["No child relying on me now", false], ["A child is relying on me now", true]]} /> : null}
      </Question>
      <Question title="Immediate safety">
        <Options value={checkIn.safety} onChange={(value) => update("safety", value)} items={[["Safe right now", "safe"], ["Watching warning signs", "watching"], ["Need immediate support", "unsafe"]]} />
        <Options value={checkIn.afraidMayHarm} onChange={(value) => update("afraidMayHarm", value)} items={[["I am not afraid I may hurt someone", false], ["I am afraid I may hurt my child or someone else", true]]} />
      </Question>

      <View style={styles.card}>
        <Text style={styles.questionTitle}>Optional private note</Text>
        <Text style={styles.helper}>Avoid names, addresses, schools, case numbers, or detailed disclosures.</Text>
        <TextInput value={note} onChangeText={setNote} maxLength={600} multiline placeholder="What helped, or what support do you want today?" placeholderTextColor="#718187" style={styles.input} />
      </View>

      {reviewed ? (
        <View accessibilityLiveRegion={route.level === "urgent_human_support" ? "assertive" : "polite"} style={[styles.routeCard, route.level === "urgent_human_support" && styles.routeUrgent]}>
          <Text style={styles.routeTitle}>{route.heading}</Text><Text style={styles.routeText}>{route.action}</Text>
          {route.level !== "routine" ? <Link href="/support-guide" asChild><Pressable style={styles.supportButton}><Text style={styles.supportButtonText}>Open human and safety support</Text></Pressable></Link> : null}
        </View>
      ) : null}

      {message ? <Text style={message.startsWith("Daily") ? styles.success : styles.error}>{message}</Text> : null}
      <Pressable disabled={saving} onPress={() => void handleSave()} style={[styles.saveButton, saving && styles.disabled]}><Text style={styles.saveButtonText}>{saving ? "Saving…" : route.ordinarySaveAllowed ? "Review and save check-in" : "Review safety support"}</Text></Pressable>
      <Text style={styles.privacy}>Urgent responses are not saved as ordinary progress check-ins. SafeSteps never dispatches emergency services automatically.</Text>
      <AppBottomNav />
    </ScrollView>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.card}><Text style={styles.questionTitle}>{title}</Text>{children}</View>; }
function Options<T extends string | number | boolean>({ value, onChange, items }: { value: T; onChange: (value: T) => void; items: Array<[string, T]> }) {
  return <View style={styles.options}>{items.map(([label, option]) => { const selected = value === option; return <Pressable key={String(option)} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onChange(option)} style={[styles.option, selected && styles.optionSelected]}><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text></Pressable>; })}</View>;
}

const c = { ink: "#15323A", muted: "#566C72", teal: "#087F78", deep: "#075A58", cream: "#FBF8F1", white: "#FFFFFF", border: "#C9DDD7", coral: "#B94738", coralSoft: "#FBE8E3" };
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.cream }, content: { width: "100%", maxWidth: 920, alignSelf: "center", gap: 14, padding: 20, paddingBottom: 42 },
  hero: { gap: 8, padding: 25, borderRadius: 18, backgroundColor: "#DDEFEA" }, eyebrow: { color: c.deep, fontSize: 12, letterSpacing: 1.1, fontWeight: "900" }, title: { color: c.ink, fontSize: 31, lineHeight: 38, fontWeight: "900" }, subtitle: { color: c.muted, fontSize: 15, lineHeight: 22 },
  card: { gap: 10, padding: 17, borderRadius: 13, borderWidth: 1, borderColor: c.border, backgroundColor: c.white }, questionTitle: { color: c.ink, fontSize: 18, fontWeight: "900" }, helper: { color: c.muted, fontSize: 12, lineHeight: 18 }, options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { minHeight: 42, justifyContent: "center", borderRadius: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: c.border, backgroundColor: c.white }, optionSelected: { borderColor: c.deep, backgroundColor: c.deep }, optionText: { color: c.ink, fontSize: 13, fontWeight: "800" }, optionTextSelected: { color: c.white },
  input: { minHeight: 90, padding: 13, borderRadius: 10, borderWidth: 1, borderColor: c.border, color: c.ink, fontSize: 14, lineHeight: 21, textAlignVertical: "top" }, routeCard: { gap: 8, padding: 17, borderRadius: 13, borderWidth: 1, borderColor: "#A4D5CA", backgroundColor: "#EFF8F5" }, routeUrgent: { borderColor: "#E0A397", backgroundColor: c.coralSoft }, routeTitle: { color: c.ink, fontSize: 20, fontWeight: "900" }, routeText: { color: c.muted, fontSize: 14, lineHeight: 21 },
  supportButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 15, borderRadius: 8, backgroundColor: c.coral }, supportButtonText: { color: c.white, fontWeight: "900" }, saveButton: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: c.teal }, saveButtonText: { color: c.white, fontSize: 15, fontWeight: "900" }, disabled: { opacity: 0.55 }, privacy: { color: c.muted, fontSize: 12, lineHeight: 18 }, success: { color: c.deep, fontWeight: "800" }, error: { color: c.coral, fontWeight: "800" },
});
