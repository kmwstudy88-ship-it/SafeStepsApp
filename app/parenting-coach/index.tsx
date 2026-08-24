import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import {
  assessParentingCoachSafety,
  createParentingCoachPlan,
  type ChildAgeBand,
  type ParentingCoachPlan,
  type ParentingMoment,
} from "../../lib/engines/parentingCoachEngine";
import {
  clearParentingCoachProfile,
  loadParentingCoachProfile,
  saveParentingCoachProfile,
  type ParentingCoachProfile,
} from "../../lib/parentingCoachMemory";

const ageOptions: Array<{ id: ChildAgeBand; label: string }> = [
  { id: "0_2", label: "0–2" }, { id: "3_5", label: "3–5" }, { id: "6_9", label: "6–9" },
  { id: "10_12", label: "10–12" }, { id: "13_17", label: "13–17" },
];

const moments: Array<{ id: ParentingMoment; label: string; icon: string }> = [
  { id: "meltdown", label: "Meltdown", icon: "◌" },
  { id: "bedtime", label: "Bedtime", icon: "☾" },
  { id: "screen_time", label: "Screen transition", icon: "▣" },
  { id: "sibling_conflict", label: "Sibling conflict", icon: "↔" },
  { id: "noncompliance", label: "Won’t cooperate", icon: "◇" },
  { id: "homework", label: "Homework", icon: "✎" },
  { id: "connection", label: "Won’t talk", icon: "♡" },
  { id: "repair", label: "Repair after yelling", icon: "↻" },
];

const valueOptions: Array<{ id: ParentingCoachProfile["values"][number]; label: string }> = [
  { id: "calm", label: "Calm" }, { id: "connection", label: "Connection" },
  { id: "consistency", label: "Consistency" }, { id: "independence", label: "Independence" },
  { id: "culture", label: "Faith & culture" },
];

const approachOptions: Array<{ id: ParentingCoachProfile["helpfulApproaches"][number]; label: string }> = [
  { id: "visual_cues", label: "Visual cues" }, { id: "two_choices", label: "Two choices" },
  { id: "movement_break", label: "Movement breaks" }, { id: "quiet_space", label: "Quiet space" },
  { id: "advance_warning", label: "Advance warnings" },
];

export default function ParentingCoachScreen() {
  const [ageBand, setAgeBand] = useState<ChildAgeBand>("3_5");
  const [moment, setMoment] = useState<ParentingMoment>("meltdown");
  const [parentState, setParentState] = useState(5);
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState<ParentingCoachPlan | null>(null);
  const [safetyConcern, setSafetyConcern] = useState<string[] | null>(null);
  const [values, setValues] = useState<ParentingCoachProfile["values"]>(["connection", "calm"]);
  const [approaches, setApproaches] = useState<ParentingCoachProfile["helpfulApproaches"]>([]);
  const [memoryMessage, setMemoryMessage] = useState("Memory is off. No child profile or conversation is being saved.");

  useEffect(() => {
    void loadParentingCoachProfile().then(({ profile, storage }) => {
      if (!profile) return;
      setAgeBand(profile.ageBand);
      setValues(profile.values);
      setApproaches(profile.helpfulApproaches);
      setMemoryMessage(storage === "encrypted_device" ? "Encrypted coaching preferences loaded from this device." : "Coaching preferences are held for this browser session only.");
    });
  }, []);

  function buildPlan() {
    const safety = assessParentingCoachSafety(description);
    if (!safety.safeForCoaching) {
      setSafetyConcern(safety.matchedConcerns);
      setPlan(null);
      return;
    }
    setSafetyConcern(null);
    setPlan(createParentingCoachPlan({
      ageBand,
      moment,
      parentCapacity: parentState >= 8 ? "overwhelmed" : parentState >= 5 ? "stretched" : "steady",
    }));
  }

  async function rememberPreferences() {
    const storage = await saveParentingCoachProfile({ schemaVersion: 1, ageBand, values, helpfulApproaches: approaches });
    setMemoryMessage(storage === "encrypted_device"
      ? "Saved as a small encrypted preference profile on this device. No names or conversations were saved."
      : "Saved for this browser session only. No names or conversations were saved.");
  }

  async function forgetPreferences() {
    await clearParentingCoachProfile();
    setValues(["connection", "calm"]);
    setApproaches([]);
    setMemoryMessage("Preferences deleted. Memory is off.");
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <Link href="/dashboard" style={styles.backLink}>‹ Dashboard</Link>
        <Text style={styles.brand}>SafeSteps</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>PARENTING SUPER COACH</Text>
        <Text style={styles.title}>Help for the moment you’re in</Text>
        <Text style={styles.subtitle}>Everyday parenting guidance—not diagnosis, therapy, or emergency care. Start with your calm, then connection, a clear boundary, and repair.</Text>
      </View>

      <View style={styles.safetyCheck}>
        <Text style={styles.safetyTitle}>First: is anyone at risk of being hurt right now?</Text>
        <Text style={styles.body}>If yes, ordinary coaching is not enough. Use the SafeSteps Support Guide for immediate safety and specialist contacts.</Text>
        <Link href="/support-guide" asChild><Pressable style={styles.safetyButton}><Text style={styles.safetyButtonText}>Open safety support</Text></Pressable></Link>
      </View>

      <Section kicker="1 · HELP ME NOW" title="Choose the parenting moment">
        <View style={styles.optionGrid}>{moments.map((item) => <Choice key={item.id} label={`${item.icon}  ${item.label}`} selected={moment === item.id} onPress={() => { setMoment(item.id); setPlan(null); }} />)}</View>
      </Section>

      <Section kicker="2 · KEEP IT AGE-AWARE" title="Child age range">
        <View style={styles.optionRow}>{ageOptions.map((item) => <Choice key={item.id} label={item.label} selected={ageBand === item.id} onPress={() => setAgeBand(item.id)} compact />)}</View>
      </Section>

      <Section kicker="3 · REGULATE THE ADULT FIRST" title="How close are you to losing it?">
        <View style={styles.stateRow}>{[2, 5, 8, 10].map((value) => <Choice key={value} label={`${value}/10`} selected={parentState === value} onPress={() => setParentState(value)} compact />)}</View>
        <Text style={styles.hint}>At 8–10, the plan starts with stepping back safely and bringing in another adult if needed.</Text>
      </Section>

      <Section kicker="4 · SAFETY CHECK" title="What is happening right now?">
        <TextInput
          value={description}
          onChangeText={(text) => { setDescription(text); setPlan(null); setSafetyConcern(null); }}
          placeholder="Keep it brief and leave out names, addresses, schools and case details…"
          placeholderTextColor="#718187"
          multiline
          maxLength={600}
          style={styles.input}
        />
        <Pressable style={styles.primaryButton} onPress={buildPlan}><Text style={styles.primaryButtonText}>Give me a calm plan</Text></Pressable>
      </Section>

      {safetyConcern ? (
        <View accessibilityLiveRegion="assertive" style={styles.escalationCard}>
          <Text style={styles.escalationTitle}>This needs human safety support</Text>
          <Text style={styles.body}>SafeSteps detected a concern that should not be handled as ordinary parenting coaching. Check immediate safety and contact emergency or appropriately qualified support.</Text>
          <Link href="/support-guide" asChild><Pressable style={styles.dangerButton}><Text style={styles.primaryButtonText}>See immediate support</Text></Pressable></Link>
        </View>
      ) : null}

      {plan ? (
        <View accessibilityLiveRegion="polite" style={styles.planCard}>
          <Text style={styles.planKicker}>YOUR IN-THE-MOMENT PLAN</Text>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <PlanBlock number="1" title="Regulate yourself" text={plan.regulate} />
          <View style={styles.needsCard}>
            <Text style={styles.blockTitle}>What might be underneath the behaviour</Text>
            {plan.possibleNeeds.map((need) => <Text key={need} style={styles.bullet}>• {need}</Text>)}
            <Text style={styles.hint}>These are possibilities to check, not a diagnosis or claim about your child’s motives.</Text>
          </View>
          <PlanBlock number="2" title="Connect and hold the boundary" text={plan.steps.join(" ")} />
          <View style={styles.scriptCard}><Text style={styles.scriptLabel}>SAY THIS NOW</Text><Text style={styles.script}>“{plan.sayThis}”</Text></View>
          <View style={styles.avoidCard}><Text style={styles.avoidLabel}>AVOID</Text><Text style={styles.body}>“{plan.avoidThis}”</Text></View>
          <PlanBlock number="3" title="Prevent and repair later" text={plan.repair} />
          <Text style={styles.professional}>{plan.professionalReview}</Text>
        </View>
      ) : null}

      <Section kicker="OPTIONAL · FAMILY PLAYBOOK" title="Remember what fits your family">
        <Text style={styles.body}>Only structured preferences are remembered—never child names, descriptions, or conversations.</Text>
        <Text style={styles.fieldLabel}>Parenting values</Text>
        <View style={styles.optionRow}>{valueOptions.map((item) => <Choice key={item.id} label={item.label} selected={values.includes(item.id)} onPress={() => setValues((current) => current.includes(item.id) ? current.filter((value) => value !== item.id) : [...current, item.id])} compact />)}</View>
        <Text style={styles.fieldLabel}>Approaches that help</Text>
        <View style={styles.optionRow}>{approachOptions.map((item) => <Choice key={item.id} label={item.label} selected={approaches.includes(item.id)} onPress={() => setApproaches((current) => current.includes(item.id) ? current.filter((value) => value !== item.id) : [...current, item.id])} compact />)}</View>
        <View style={styles.memoryActions}>
          <Pressable style={styles.secondaryButton} onPress={() => void rememberPreferences()}><Text style={styles.secondaryButtonText}>Remember preferences</Text></Pressable>
          <Pressable style={styles.textButton} onPress={() => void forgetPreferences()}><Text style={styles.textButtonText}>Delete memory</Text></Pressable>
        </View>
        <Text style={styles.memoryMessage}>{memoryMessage}</Text>
      </Section>

      <AppBottomNav />
    </ScrollView>
  );
}

function Section({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionKicker}>{kicker}</Text><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function Choice({ label, selected, onPress, compact = false }: { label: string; selected: boolean; onPress: () => void; compact?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, compact && styles.choiceCompact, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>;
}

function PlanBlock({ number, title, text }: { number: string; title: string; text: string }) {
  return <View style={styles.planBlock}><Text style={styles.planNumber}>{number}</Text><View style={styles.planCopy}><Text style={styles.blockTitle}>{title}</Text><Text style={styles.body}>{text}</Text></View></View>;
}

const c = { ink: "#15323A", muted: "#566C72", teal: "#087F78", deep: "#075A58", mint: "#E5F3EF", cream: "#FBF8F1", white: "#FFFFFF", border: "#C9DDD7", coral: "#B94738", coralSoft: "#FBE8E3" };
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.cream }, content: { width: "100%", maxWidth: 1050, alignSelf: "center", gap: 22, padding: 20, paddingBottom: 44 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 48 }, backLink: { color: c.deep, fontWeight: "900" }, brand: { color: c.deep, fontSize: 22, fontWeight: "900" },
  hero: { gap: 9, padding: 28, borderRadius: 20, backgroundColor: "#DDEFEA" }, eyebrow: { color: c.deep, fontSize: 12, letterSpacing: 1.2, fontWeight: "900" }, title: { color: c.ink, fontSize: 34, lineHeight: 41, fontWeight: "900" }, subtitle: { color: c.muted, maxWidth: 760, fontSize: 16, lineHeight: 24 },
  safetyCheck: { gap: 8, padding: 17, borderRadius: 13, borderWidth: 1, borderColor: "#E4B3A8", backgroundColor: c.coralSoft }, safetyTitle: { color: "#7D2C22", fontSize: 17, fontWeight: "900" }, safetyButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, borderRadius: 8, backgroundColor: c.coral }, safetyButtonText: { color: c.white, fontWeight: "900" },
  section: { gap: 11, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.white }, sectionKicker: { color: c.teal, fontSize: 12, letterSpacing: 1, fontWeight: "900" }, sectionTitle: { color: c.ink, fontSize: 23, lineHeight: 29, fontWeight: "900" },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, stateRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  choice: { flexGrow: 1, flexBasis: 190, minHeight: 52, justifyContent: "center", borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.white }, choiceCompact: { flexGrow: 0, flexBasis: "auto", minHeight: 42 }, choiceSelected: { borderColor: c.deep, backgroundColor: c.deep }, choiceText: { color: c.ink, fontSize: 14, fontWeight: "800", textAlign: "center" }, choiceTextSelected: { color: c.white },
  hint: { color: c.muted, fontSize: 12, lineHeight: 18 }, body: { color: c.muted, fontSize: 14, lineHeight: 21 }, input: { minHeight: 110, padding: 14, borderRadius: 11, borderWidth: 1, borderColor: c.border, color: c.ink, fontSize: 15, lineHeight: 22, textAlignVertical: "top" },
  primaryButton: { alignSelf: "flex-start", minHeight: 48, justifyContent: "center", paddingHorizontal: 18, borderRadius: 9, backgroundColor: c.teal }, primaryButtonText: { color: c.white, fontSize: 14, fontWeight: "900" },
  escalationCard: { gap: 10, padding: 20, borderRadius: 14, borderWidth: 1, borderColor: "#DF9D91", backgroundColor: c.coralSoft }, escalationTitle: { color: "#7D2C22", fontSize: 22, fontWeight: "900" }, dangerButton: { alignSelf: "flex-start", minHeight: 46, justifyContent: "center", paddingHorizontal: 16, borderRadius: 9, backgroundColor: c.coral },
  planCard: { gap: 14, padding: 22, borderRadius: 16, borderWidth: 1, borderColor: "#A4D5CA", backgroundColor: "#EFF8F5" }, planKicker: { color: c.deep, fontSize: 12, letterSpacing: 1.1, fontWeight: "900" }, planTitle: { color: c.ink, fontSize: 26, fontWeight: "900" }, planBlock: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, planNumber: { width: 30, height: 30, borderRadius: 15, overflow: "hidden", color: c.white, backgroundColor: c.teal, textAlign: "center", textAlignVertical: "center", fontWeight: "900" }, planCopy: { flex: 1, gap: 4 }, blockTitle: { color: c.ink, fontSize: 16, fontWeight: "900" },
  needsCard: { gap: 6, padding: 15, borderRadius: 11, backgroundColor: c.white }, bullet: { color: c.muted, fontSize: 14, lineHeight: 20 }, scriptCard: { gap: 5, padding: 16, borderRadius: 11, backgroundColor: c.deep }, scriptLabel: { color: "#A5E0D7", fontSize: 11, letterSpacing: 1, fontWeight: "900" }, script: { color: c.white, fontSize: 17, lineHeight: 25, fontWeight: "700" }, avoidCard: { gap: 4, padding: 14, borderRadius: 10, backgroundColor: "#F5ECE8" }, avoidLabel: { color: "#8B3A30", fontSize: 11, letterSpacing: 1, fontWeight: "900" }, professional: { color: c.deep, fontSize: 13, lineHeight: 20, fontWeight: "700" },
  fieldLabel: { color: c.ink, fontSize: 14, fontWeight: "900", paddingTop: 4 }, memoryActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 9 }, secondaryButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 15, borderRadius: 8, backgroundColor: c.teal }, secondaryButtonText: { color: c.white, fontWeight: "900" }, textButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 10 }, textButtonText: { color: c.coral, fontWeight: "900" }, memoryMessage: { color: c.muted, fontSize: 12, lineHeight: 18 },
});
