import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";

const journeys: ReadonlyArray<{ title: string; detail: string; href: string; icon: string; urgent?: boolean }> = [
  { title: "Help me right now", detail: "Safety-screened support for an overwhelming moment.", href: "/support-guide", icon: "♡", urgent: true },
  { title: "Prepare for a visit", detail: "Plan calm, child-centred contact and review visit expectations.", href: "/visits", icon: "◷" },
  { title: "Repair after something went wrong", detail: "Accountable words after yelling, missed contact, or broken trust.", href: "/parenting-coach", icon: "↻" },
  { title: "Recovery and parenting", detail: "Craving, relapse-risk, sober-supervision and human support pathways.", href: "/support-guide", icon: "↗" },
  { title: "I’m worried about safety", detail: "Domestic-violence-aware planning, safer-device guidance and services.", href: "/resources/safety-planning", icon: "⌂", urgent: true },
  { title: "My parenting plan", detail: "Age-aware scripts, family values, routines and approaches that help.", href: "/parenting-coach", icon: "◌" },
  { title: "Daily check-in", detail: "Check mood, stress, sleep, conflict, recovery pressure and safety.", href: "/check-in", icon: "◎" },
  { title: "Journal and reflections", detail: "Notice skills, barriers and a child-centred goal for next time.", href: "/programs/reflection", icon: "✎" },
];

const priorities = [
  "Immediate safety", "Child wellbeing", "Caregiver regulation", "Accountability",
  "Connection", "Nonviolent boundaries", "Repair", "Professional support", "Long-term family stability",
];

export default function PersonalAiSupportHome() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Link href="/dashboard" style={styles.back}>‹ Dashboard</Link>
        <Text style={styles.brand}>SafeSteps</Text>
      </View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SAFESTEPS PERSONAL AI SUPPORT · SAFE PARENTING & REUNIFICATION</Text>
        <Text style={styles.title}>Make the next safe, child-centred decision</Text>
        <Text style={styles.subtitle}>Practical support for parenting stress, supervised contact, repair, recovery, family violence safety, and professional navigation.</Text>
        <Text style={styles.boundary}>SafeSteps is an AI support tool—not a therapist, doctor, lawyer, social worker, DV advocate, AOD counsellor, court, child-protection authority, or emergency service.</Text>
      </View>

      <View style={styles.emergency}>
        <View style={styles.emergencyCopy}><Text style={styles.emergencyTitle}>Immediate danger?</Text><Text style={styles.emergencyText}>Call Triple Zero now. If this device may be monitored, use a safer device if possible.</Text></View>
        <Link href="/support-guide" asChild><Pressable style={styles.emergencyButton}><Text style={styles.emergencyButtonText}>Safety support</Text></Pressable></Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionKicker}>CHOOSE WHAT YOU NEED</Text>
        <Text style={styles.sectionTitle}>How can SafeSteps support you?</Text>
        <View style={styles.grid}>
          {journeys.map((journey) => (
            <Link key={journey.title} href={journey.href} asChild>
              <Pressable style={[styles.card, journey.urgent && styles.cardUrgent]}>
                <Text style={styles.icon}>{journey.icon}</Text><Text style={styles.cardTitle}>{journey.title}</Text><Text style={styles.cardText}>{journey.detail}</Text><Text style={styles.cardAction}>Open →</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={styles.priorityCard}>
        <Text style={styles.sectionKicker}>THE SAFESTEPS PERSONAL AI SUPPORT PRIORITY ORDER</Text>
        <Text style={styles.sectionTitle}>Safety before progress</Text>
        <View style={styles.priorityRow}>{priorities.map((item, index) => <View key={item} style={styles.priorityItem}><Text style={styles.priorityNumber}>{index + 1}</Text><Text style={styles.priorityText}>{item}</Text></View>)}</View>
        <Text style={styles.priorityNote}>The AI cannot determine custody, parenting capacity, reunification readiness, legal compliance, or whether a person or child is safe. Those decisions remain with appropriately authorized people.</Text>
      </View>
      <AppBottomNav />
    </ScrollView>
  );
}

const c = { ink: "#14313A", muted: "#566C72", teal: "#087F78", deep: "#075A58", cream: "#FBF8F1", white: "#FFFFFF", border: "#C9DDD7", coral: "#B94738", coralSoft: "#FBE8E3" };
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.cream }, content: { width: "100%", maxWidth: 1100, alignSelf: "center", gap: 22, padding: 20, paddingBottom: 44 }, topBar: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { color: c.deep, fontWeight: "900" }, brand: { color: c.deep, fontSize: 22, fontWeight: "900" },
  hero: { gap: 10, padding: 29, borderRadius: 20, backgroundColor: "#DDEFEA" }, eyebrow: { color: c.deep, fontSize: 12, letterSpacing: 1.1, fontWeight: "900" }, title: { color: c.ink, maxWidth: 780, fontSize: 35, lineHeight: 42, fontWeight: "900" }, subtitle: { color: c.muted, maxWidth: 800, fontSize: 16, lineHeight: 24 }, boundary: { color: c.deep, maxWidth: 850, paddingTop: 5, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  emergency: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, padding: 18, borderRadius: 13, borderWidth: 1, borderColor: "#E3ADA1", backgroundColor: c.coralSoft }, emergencyCopy: { flex: 1, minWidth: 230, gap: 3 }, emergencyTitle: { color: "#7D2C22", fontSize: 18, fontWeight: "900" }, emergencyText: { color: "#7D2C22", fontSize: 14, lineHeight: 20 }, emergencyButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16, borderRadius: 8, backgroundColor: c.coral }, emergencyButtonText: { color: c.white, fontWeight: "900" },
  section: { gap: 12 }, sectionKicker: { color: c.teal, fontSize: 12, letterSpacing: 1, fontWeight: "900" }, sectionTitle: { color: c.ink, fontSize: 25, lineHeight: 31, fontWeight: "900" }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 11 }, card: { flexGrow: 1, flexBasis: 235, minHeight: 175, gap: 7, padding: 17, borderRadius: 13, borderWidth: 1, borderColor: c.border, backgroundColor: c.white }, cardUrgent: { borderColor: "#DFB0A7", backgroundColor: "#FFF9F7" }, icon: { color: c.teal, fontSize: 27, fontWeight: "900" }, cardTitle: { color: c.ink, fontSize: 17, fontWeight: "900" }, cardText: { color: c.muted, flex: 1, fontSize: 13, lineHeight: 19 }, cardAction: { color: c.deep, fontSize: 13, fontWeight: "900" },
  priorityCard: { gap: 12, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.white }, priorityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, priorityItem: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 9, backgroundColor: "#EDF6F3" }, priorityNumber: { color: c.white, width: 22, height: 22, borderRadius: 11, overflow: "hidden", textAlign: "center", textAlignVertical: "center", backgroundColor: c.teal, fontSize: 12, fontWeight: "900" }, priorityText: { color: c.ink, fontSize: 13, fontWeight: "800" }, priorityNote: { color: c.muted, fontSize: 12, lineHeight: 18 },
});
