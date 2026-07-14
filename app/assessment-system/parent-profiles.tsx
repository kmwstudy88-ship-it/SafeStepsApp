import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  fetchLatestAssessmentCaseSetup,
  type AssessmentCaseSetup,
} from "../../lib/engines/assessmentCaseEngine";
import {
  emptyParentProfileDomains,
  fetchParentProfiles,
  hydrateParentProfileDomains,
  saveParentProfile,
  type ParentProfileDomains,
  type ParentProfileRecord,
  type ParentRole,
} from "../../lib/engines/parentProfileEngine";

type DomainKey = keyof ParentProfileDomains;

const parentRoles: { key: ParentRole; label: string }[] = [
  { key: "mother", label: "Mother" },
  { key: "father", label: "Father" },
  { key: "joint", label: "Joint" },
  { key: "other_carer", label: "Other carer" },
];

const domainTabs: { key: DomainKey; label: string; purpose: string }[] = [
  { key: "identity", label: "Identity", purpose: "Onboarding and case formulation" },
  { key: "protectiveCapacities", label: "Protective Capacities", purpose: "Forensic scoring and risk assessment" },
  { key: "riskIndicators", label: "Risks", purpose: "Risk scoring and case planning" },
  { key: "parentingBehaviors", label: "Parenting Behaviours", purpose: "Curriculum matching and progress tracking" },
  { key: "engagement", label: "Engagement", purpose: "Weekly curriculum adjustment" },
];

const domainFields: Record<DomainKey, { key: string; label: string; placeholder: string; multiline?: boolean }[]> = {
  identity: [
    { key: "name", label: "Name", placeholder: "Parent name or initials" },
    { key: "age", label: "Age", placeholder: "Age or age range" },
    { key: "culturalIdentity", label: "Cultural identity", placeholder: "Culture, language, community, identity" },
    { key: "familyHistory", label: "Family history", placeholder: "Relevant family history", multiline: true },
    { key: "traumaHistory", label: "Trauma history", placeholder: "Known trauma history and impacts", multiline: true },
    { key: "schoolExperienceAdultImpact", label: "School experiences and adult life", placeholder: "How school experiences have affected adult life", multiline: true },
    { key: "schoolExperienceParentingInfluence", label: "School experiences and parenting", placeholder: "How school experiences influence parenting", multiline: true },
    { key: "schoolExperienceChildHopesAndAvoidance", label: "Hopes and avoidance for child", placeholder: "Parts of school experience the parent hopes their child will have or avoid", multiline: true },
    { key: "strengths", label: "Strengths", placeholder: "Observed strengths", multiline: true },
    { key: "supports", label: "Supports", placeholder: "Formal and informal supports", multiline: true },
  ],
  protectiveCapacities: [
    { key: "emotionalRegulation", label: "Emotional regulation", placeholder: "Regulation capacity and strategies", multiline: true },
    { key: "insight", label: "Insight", placeholder: "Insight into harm, needs, and change", multiline: true },
    { key: "empathy", label: "Empathy", placeholder: "Empathy for child and others", multiline: true },
    { key: "stability", label: "Stability", placeholder: "Housing, routines, health, reliability", multiline: true },
    { key: "abilityToProtect", label: "Ability to protect", placeholder: "Protective actions and limits", multiline: true },
    { key: "responsiveness", label: "Responsiveness", placeholder: "Response to child cues, advice, and risk", multiline: true },
  ],
  riskIndicators: [
    { key: "substanceUse", label: "Substance use", placeholder: "Current/past concerns, monitoring, supports", multiline: true },
    { key: "violence", label: "Violence", placeholder: "Violence, coercion, intimidation, threats", multiline: true },
    { key: "neglectPatterns", label: "Neglect patterns", placeholder: "Supervision, nutrition, hygiene, medical, school", multiline: true },
    { key: "mentalHealthInstability", label: "Mental health instability", placeholder: "Instability, triggers, supports, treatment", multiline: true },
    { key: "unsafePartners", label: "Unsafe partners", placeholder: "Unsafe relationships or contact risks", multiline: true },
    { key: "environmentalRisks", label: "Environmental risks", placeholder: "Housing, transport, community, household risks", multiline: true },
  ],
  parentingBehaviors: [
    { key: "disciplineStyle", label: "Discipline style", placeholder: "Discipline patterns and changes", multiline: true },
    { key: "attachmentBehaviors", label: "Attachment behaviours", placeholder: "Connection, repair, attunement, availability", multiline: true },
    { key: "consistency", label: "Consistency", placeholder: "Routines, follow-through, predictability", multiline: true },
    { key: "supervision", label: "Supervision", placeholder: "Monitoring, boundaries, safety awareness", multiline: true },
    { key: "warmth", label: "Warmth", placeholder: "Warmth, praise, positive attention", multiline: true },
    { key: "boundaries", label: "Boundaries", placeholder: "Safe limits and co-parenting boundaries", multiline: true },
  ],
  engagement: [
    { key: "attendance", label: "Attendance", placeholder: "Attendance patterns and reliability", multiline: true },
    { key: "homeworkCompletion", label: "Homework completion", placeholder: "Practice tasks, reflections, evidence", multiline: true },
    { key: "responsiveness", label: "Responsiveness", placeholder: "Response to contact, feedback, and support", multiline: true },
    { key: "motivation", label: "Motivation", placeholder: "Motivation and stated change reasons", multiline: true },
    { key: "barriers", label: "Barriers", placeholder: "Practical, emotional, safety, access barriers", multiline: true },
    { key: "changeReadiness", label: "Change readiness", placeholder: "Readiness, stage of change, next steps", multiline: true },
  ],
};

function cloneEmptyDomains(): ParentProfileDomains {
  return {
    identity: { ...emptyParentProfileDomains.identity },
    protectiveCapacities: { ...emptyParentProfileDomains.protectiveCapacities },
    riskIndicators: { ...emptyParentProfileDomains.riskIndicators },
    parentingBehaviors: { ...emptyParentProfileDomains.parentingBehaviors },
    engagement: { ...emptyParentProfileDomains.engagement },
  };
}

export default function ParentProfilesScreen() {
  const [caseRecord, setCaseRecord] = useState<AssessmentCaseSetup | null>(null);
  const [profiles, setProfiles] = useState<ParentProfileRecord[]>([]);
  const [activeRole, setActiveRole] = useState<ParentRole>("mother");
  const [activeDomain, setActiveDomain] = useState<DomainKey>("identity");
  const [domains, setDomains] = useState<ParentProfileDomains>(cloneEmptyDomains);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.parent_role === activeRole) ?? null,
    [activeRole, profiles],
  );

  async function loadProfiles() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const latestCase = await fetchLatestAssessmentCaseSetup();
      setCaseRecord(latestCase);

      if (!latestCase) {
        setProfiles([]);
        return;
      }

      const nextProfiles = await fetchParentProfiles(latestCase.id);
      setProfiles(nextProfiles);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load parent profiles.");
    } finally {
      setLoading(false);
    }
  }

  function updateDomainField(fieldKey: string, value: string) {
    setDomains((current) => ({
      ...current,
      [activeDomain]: {
        ...current[activeDomain],
        [fieldKey]: value,
      },
    }));
  }

  async function handleSave() {
    if (!caseRecord || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = await saveParentProfile({
        caseId: caseRecord.id,
        ownerId: caseRecord.owner_id,
        parentRole: activeRole,
        displayName,
        domains,
      });

      setProfiles((current) => [
        ...current.filter((profile) => profile.parent_role !== activeRole),
        saved,
      ]);
      setMessage("Parent profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save parent profile.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    setDomains(hydrateParentProfileDomains(activeProfile));
    setDisplayName(activeProfile?.display_name ?? "");
  }, [activeProfile]);

  const selectedDomain = domainTabs.find((domain) => domain.key === activeDomain) ?? domainTabs[0];

  return (
    <AssessmentScreenShell
      title="Parent Profiles"
      subtitle="Split each parent profile into modular domains for scoring, curriculum matching, and case planning."
    >
      {loading ? <ActivityIndicator /> : null}

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {message ? (
        <View style={styles.successCard}>
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}

      {!caseRecord && !loading ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create a case first</Text>
          <Text style={styles.bodyText}>
            Parent profiles attach to the latest assessment case. Complete Case Setup before adding parent domains.
          </Text>
        </View>
      ) : null}

      {caseRecord ? (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{caseRecord.family_label ?? "Active family case"}</Text>
            <Text style={styles.bodyText}>
              Use Mother and Father for separate profiles, Joint for shared parenting work, and Other carer for kinship or guardian profiles.
            </Text>
            <View style={styles.chipRow}>
              {parentRoles.map((role) => {
                const active = role.key === activeRole;
                return (
                  <Pressable
                    key={role.key}
                    onPress={() => setActiveRole(role.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={active ? styles.chipTextActive : styles.chipText}>{role.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Profile identity</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name for this parent profile"
              style={styles.input}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {domainTabs.map((domain) => {
              const active = domain.key === activeDomain;
              return (
                <Pressable
                  key={domain.key}
                  onPress={() => setActiveDomain(domain.key)}
                  style={[styles.domainTab, active && styles.domainTabActive]}
                >
                  <Text style={active ? styles.domainTabTextActive : styles.domainTabText}>{domain.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{selectedDomain.label}</Text>
            <Text style={styles.bodyText}>{selectedDomain.purpose}</Text>

            {domainFields[activeDomain].map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  value={String(domains[activeDomain][field.key as keyof ParentProfileDomains[DomainKey]] ?? "")}
                  onChangeText={(value) => updateDomainField(field.key, value)}
                  placeholder={field.placeholder}
                  multiline={field.multiline}
                  style={[styles.input, field.multiline && styles.textArea]}
                />
              </View>
            ))}

            <Pressable
              disabled={saving}
              onPress={handleSave}
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Parent Profile</Text>
              )}
            </Pressable>
          </View>
        </>
      ) : null}
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  bodyText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#E8F2EF",
  },
  chipActive: {
    backgroundColor: assessmentColors.teal,
  },
  chipText: {
    color: assessmentColors.tealDark,
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  tabRow: {
    gap: 8,
    paddingVertical: 2,
  },
  domainTab: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: assessmentColors.border,
  },
  domainTabActive: {
    backgroundColor: assessmentColors.teal,
    borderColor: assessmentColors.teal,
  },
  domainTabText: {
    color: assessmentColors.tealDark,
    fontWeight: "800",
  },
  domainTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  field: {
    gap: 6,
  },
  label: {
    color: assessmentColors.charcoal,
    fontWeight: "800",
  },
  input: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 96,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: assessmentColors.teal,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  errorCard: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#FBE5E1",
  },
  errorText: {
    color: "#8E2B21",
    fontWeight: "800",
  },
  successCard: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#E4F3EF",
  },
  successText: {
    color: assessmentColors.tealDark,
    fontWeight: "800",
  },
});
