import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, Redirect, type Href } from "expo-router";

import {
  AssessmentCard,
  AssessmentScreenShell,
  StatusPill,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import { useAuth } from "../../lib/auth";
import {
  createVisitContactRecord,
  fetchVisitContactRecords,
  type VisitContactRecord,
} from "../../lib/engines/visitContactEngine";

const visitTypes = [
  "Supervised contact",
  "Unsupervised contact",
  "Supported handover",
  "Virtual contact",
  "School or community contact",
  "Other contact",
] as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseOptionalScore(value: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return Number(trimmed);
}

function parseIncidentCount(value: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 0;
  return Number(trimmed);
}

function formatVisitType(value: string | null) {
  return value?.trim() || "Contact visit";
}

export default function VisitContactScreen() {
  const { initializing, user } = useAuth();
  const [records, setRecords] = useState<VisitContactRecord[]>([]);
  const [visitDate, setVisitDate] = useState(today());
  const [visitType, setVisitType] = useState<string>(visitTypes[0]);
  const [qualityScore, setQualityScore] = useState("");
  const [incidentCount, setIncidentCount] = useState("0");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadRecords() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const nextRecords = await fetchVisitContactRecords();
      setRecords(nextRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load visit and contact records.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createVisitContactRecord({
        visitDate,
        visitType,
        qualityScore: parseOptionalScore(qualityScore),
        incidentCount: parseIncidentCount(incidentCount),
        observationSummary: summary,
      });

      setQualityScore("");
      setIncidentCount("0");
      setSummary("");
      setMessage("Visit and contact record saved.");
      await loadRecords();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save visit and contact record.",
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!initializing && user) {
      loadRecords();
    }
  }, [initializing, user]);

  if (initializing) {
    return (
      <AssessmentScreenShell title="Visit and Contact Logistics">
        <ActivityIndicator />
      </AssessmentScreenShell>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <AssessmentScreenShell
      title="Visit and Contact Logistics"
      subtitle="Record factual contact, handover, incident and observation notes against the current case. These records support human review and do not make automatic decisions."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>New Contact Record</Text>
              <Text style={styles.cardText}>
                Save the date, type of contact, observed quality, incidents, and a short factual summary.
              </Text>
            </View>
            <StatusPill label="Case linked" tone="success" />
          </View>

          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.label}>Visit date</Text>
              <TextInput
                value={visitDate}
                onChangeText={setVisitDate}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Quality score</Text>
              <TextInput
                value={qualityScore}
                onChangeText={setQualityScore}
                placeholder="0-100, optional"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Incident count</Text>
              <TextInput
                value={incidentCount}
                onChangeText={setIncidentCount}
                placeholder="0"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contact type</Text>
            <View style={styles.chipRow}>
              {visitTypes.map((type) => {
                const active = visitType === type;

                return (
                  <Pressable
                    key={type}
                    onPress={() => setVisitType(type)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={active ? styles.chipTextActive : styles.chipText}>
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Observation summary</Text>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              placeholder="Write factual observations, handover details, strengths, concerns, and next follow-up."
              multiline
              style={[styles.input, styles.textArea]}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.primaryButton, saving && styles.disabled]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Contact Record</Text>
            )}
          </Pressable>
        </AssessmentCard>

        <View style={styles.linkGrid}>
          {[
            { label: "Case Setup", href: "/assessment-system/case-setup" },
            { label: "Child Visit Prep", href: "/child/visits/prepare" },
            { label: "Child Reflection", href: "/child/visits/reflection" },
            { label: "Timeline", href: "/timeline" },
          ].map((item) => (
            <Link key={item.href} href={item.href as Href} asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{item.label}</Text>
              </Pressable>
            </Link>
          ))}
        </View>

        <AssessmentCard>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Contact History</Text>
              <Text style={styles.cardText}>
                Latest records from the current case, newest first.
              </Text>
            </View>
            <Pressable onPress={loadRecords} style={styles.refreshButton}>
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>

          {loading ? <ActivityIndicator /> : null}

          {!loading && records.length === 0 ? (
            <Text style={styles.emptyText}>
              No visit or contact records yet. Create a case setup first, then save the first contact note here.
            </Text>
          ) : null}

          {records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordTitle}>{formatVisitType(record.visit_type)}</Text>
                <Text style={styles.recordDate}>{record.visit_date}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metric}>
                  Quality: {record.quality_score === null ? "Not scored" : `${record.quality_score}%`}
                </Text>
                <Text style={styles.metric}>Incidents: {record.incident_count}</Text>
              </View>
              {record.observation_summary ? (
                <Text style={styles.recordSummary}>{record.observation_summary}</Text>
              ) : (
                <Text style={styles.emptyText}>No summary recorded.</Text>
              )}
            </View>
          ))}
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 32,
  },
  cardHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  cardText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 720,
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  field: {
    flexGrow: 1,
    flexBasis: 190,
    gap: 7,
  },
  label: {
    color: assessmentColors.charcoal,
    fontSize: 13,
    fontWeight: "900",
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: assessmentColors.charcoal,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipActive: {
    borderColor: assessmentColors.teal,
    backgroundColor: assessmentColors.sage,
  },
  chipText: {
    color: assessmentColors.muted,
    fontWeight: "800",
  },
  chipTextActive: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: assessmentColors.teal,
    padding: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    flexGrow: 1,
    flexBasis: 180,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  secondaryButtonText: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  linkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  refreshButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: assessmentColors.sage,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshText: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  recordCard: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: assessmentColors.border,
    paddingTop: 12,
  },
  recordHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  recordTitle: {
    color: assessmentColors.charcoal,
    fontSize: 17,
    fontWeight: "900",
  },
  recordDate: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metric: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: assessmentColors.sage,
    color: assessmentColors.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "900",
  },
  recordSummary: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  error: {
    color: assessmentColors.redText,
    fontWeight: "800",
  },
  message: {
    color: assessmentColors.tealDark,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.65,
  },
});
