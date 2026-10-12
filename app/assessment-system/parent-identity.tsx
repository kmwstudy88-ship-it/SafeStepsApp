import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import { parentIdentityBackgroundAssessment } from "../../lib/data/parentIdentityBackgroundAssessment";
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

const parentRoles: { key: ParentRole; label: string }[] = [
  { key: "mother", label: "Mother" },
  { key: "father", label: "Father" },
  { key: "joint", label: "Joint" },
  { key: "other_carer", label: "Other carer" },
];

const questionFieldKeys = [
  "schoolExperienceAdultImpact",
  "schoolExperienceParentingInfluence",
  "schoolExperienceChildHopesAndAvoidance",
] as const;

type SchoolExperienceFieldKey = (typeof questionFieldKeys)[number];

function cloneEmptyDomains(): ParentProfileDomains {
  return {
    identity: { ...emptyParentProfileDomains.identity },
    protectiveCapacities: { ...emptyParentProfileDomains.protectiveCapacities },
    riskIndicators: { ...emptyParentProfileDomains.riskIndicators },
    parentingBehaviors: { ...emptyParentProfileDomains.parentingBehaviors },
    engagement: { ...emptyParentProfileDomains.engagement },
  };
}

export default function ParentIdentityAssessmentScreen() {
  const [caseRecord, setCaseRecord] = useState<AssessmentCaseSetup | null>(null);
  const [profiles, setProfiles] = useState<ParentProfileRecord[]>([]);
  const [activeRole, setActiveRole] = useState<ParentRole>("mother");
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
      setError(loadError instanceof Error ? loadError.message : "Could not load parent identity assessment.");
    } finally {
      setLoading(false);
    }
  }

  function updateIdentityField(fieldKey: SchoolExperienceFieldKey, value: string) {
    setDomains((current) => ({
      ...current,
      identity: {
        ...current.identity,
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
      setMessage("Parent identity assessment saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save parent identity assessment.");
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

  return (
    <AssessmentScreenShell
      title={parentIdentityBackgroundAssessment.title}
      subtitle="Structured background prompts for worker-led reflection, case formulation, and parent-profile evidence."
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
          <Text style={styles.itemTitle}>Create a case first</Text>
          <Text style={styles.bodyText}>
            Parent Identity & Background responses attach to the latest assessment case. Complete Case Setup before saving this assessment.
          </Text>
        </View>
      ) : null}

      {caseRecord ? (
        <View style={styles.card}>
          <Text style={styles.itemTitle}>{caseRecord.family_label ?? "Active family case"}</Text>
          <Text style={styles.bodyText}>
            Select the parent profile this background assessment belongs to. Responses are saved into the selected parent identity domain.
          </Text>
          <View style={styles.roleRow}>
            {parentRoles.map((role) => {
              const active = role.key === activeRole;
              return (
                <Pressable
                  key={role.key}
                  onPress={() => setActiveRole(role.key)}
                  style={[styles.roleButton, active && styles.roleButtonActive]}
                >
                  <Text style={active ? styles.roleTextActive : styles.roleText}>{role.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name for this parent profile"
            style={styles.input}
          />
        </View>
      ) : null}

      {parentIdentityBackgroundAssessment.sections.map((section) => (
        <View key={section.sectionId} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.items.map((item) => (
            <View key={item.itemId} style={styles.card}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.bodyText}>
                Record narrative answers separately from practitioner interpretation. These prompts support insight and formulation; they are not a standalone safety finding.
              </Text>

              <View style={styles.questionStack}>
                {item.assessmentQuestions.map((question, index) => (
                  <View key={question.questionId} style={styles.questionCard}>
                    <Text style={styles.questionNumber}>Question {index + 1}</Text>
                    <Text style={styles.questionText}>{question.prompt}</Text>
                    <TextInput
                      value={domains.identity[questionFieldKeys[index]]}
                      onChangeText={(value) => updateIdentityField(questionFieldKeys[index], value)}
                      multiline
                      placeholder="Worker notes or parent response summary"
                      style={styles.textArea}
                    />
                  </View>
                ))}
              </View>

              <GuidanceBlock
                title="What This May Show About the Parent"
                items={item.whatThisMayShowAboutTheParent}
              />
              <GuidanceBlock
                title="Implications for Parenting & the Child"
                items={item.implicationsForParentingAndTheChild}
              />

              <View style={styles.dimensionRow}>
                {item.scoringDimensions.map((dimension) => (
                  <Text key={dimension} style={styles.dimensionChip}>
                    {dimension.replace(/_/g, " ")}
                  </Text>
                ))}
              </View>

              <View style={styles.workerNote}>
                <Text style={styles.workerNoteTitle}>Worker note</Text>
                <Text style={styles.bodyText}>{item.workerNote}</Text>
              </View>

              <GuidanceBlock
                title="Review Rules"
                items={parentIdentityBackgroundAssessment.scoring.rules
                  .filter((rule) => rule.itemId === item.itemId)
                  .map((rule) => `${rule.dimension.replace(/_/g, " ")}: ${rule.reviewPrompt}`)}
              />

              <GuidanceBlock
                title="Curriculum Links"
                items={parentIdentityBackgroundAssessment.curriculumMapping.routes
                  .filter((route) => route.itemId === item.itemId)
                  .map((route) => `${route.when} Suggested focus: ${route.suggestedFocus.join(", ")}.`)}
              />

              {caseRecord ? (
                <Pressable
                  disabled={saving}
                  onPress={handleSave}
                  style={[styles.saveButton, saving && styles.buttonDisabled]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Parent Identity Assessment</Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </AssessmentScreenShell>
  );
}

function GuidanceBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.guidanceBlock}>
      <Text style={styles.guidanceTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.guidanceItem}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 22,
    fontWeight: "900",
  },
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#E8F2EF",
  },
  roleButtonActive: {
    backgroundColor: assessmentColors.teal,
  },
  roleText: {
    color: assessmentColors.tealDark,
    fontWeight: "800",
  },
  roleTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  input: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    color: assessmentColors.charcoal,
  },
  itemTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  bodyText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  questionStack: {
    gap: 10,
  },
  questionCard: {
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  questionNumber: {
    color: assessmentColors.tealDark,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  questionText: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  textArea: {
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    color: assessmentColors.charcoal,
    textAlignVertical: "top",
  },
  guidanceBlock: {
    gap: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: assessmentColors.sage,
  },
  guidanceTitle: {
    color: assessmentColors.tealDark,
    fontSize: 15,
    fontWeight: "900",
  },
  guidanceItem: {
    color: assessmentColors.charcoal,
    fontSize: 14,
    lineHeight: 21,
  },
  dimensionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dimensionChip: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#EEF5F1",
    color: assessmentColors.tealDark,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  workerNote: {
    gap: 6,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5C879",
    backgroundColor: assessmentColors.amber,
  },
  workerNoteTitle: {
    color: assessmentColors.amberText,
    fontSize: 14,
    fontWeight: "900",
  },
  saveButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: assessmentColors.teal,
  },
  saveButtonText: {
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
