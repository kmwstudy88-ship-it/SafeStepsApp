import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppBottomNav } from "../../components/AppBottomNav";
import { ContradictionForm } from "../../components/assessments/ContradictionForm";
import { useAuth } from "../../lib/auth";
import { globalStyles } from "../../lib/styles";
import { supabase } from "../../lib/supabase";

type ContradictionRow = {
  id: string;
  contradiction_type: string;
  severity: string;
  description: string;
  source_a: string | null;
  source_b: string | null;
  worker_notes: string | null;
  include_in_report: boolean;
  supervisor_notified: boolean;
  detected_at: string;
  phase: string | null;
};

const SEVERITY_COLORS: Record<string, string> = {
  minor: "#d97706",
  moderate: "#c05621",
  significant: "#c53030",
};

export default function ContradictionsScreen() {
  const { user } = useAuth();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [rows, setRows] = useState<ContradictionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const loadCaseId = useCallback(async () => {
    if (!user?.id) return null;
    const { data } = await supabase
      .from("reunification_cases")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();
    return data?.id ?? null;
  }, [user?.id]);

  const loadRows = useCallback(
    async (activeCaseId: string) => {
      const { data, error } = await supabase
        .from("assessment_contradictions")
        .select(
          "id, contradiction_type, severity, description, source_a, source_b, worker_notes, include_in_report, supervisor_notified, detected_at, phase",
        )
        .eq("case_id", activeCaseId)
        .order("detected_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ContradictionRow[];
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setMessage("");
      try {
        const id = await loadCaseId();
        if (!active) return;
        if (!id) {
          setMessage("No active case found. Complete case setup first.");
          setLoading(false);
          return;
        }
        setCaseId(id);
        const data = await loadRows(id);
        if (!active) return;
        setRows(data);
      } catch (err) {
        if (active) setMessage(err instanceof Error ? err.message : "Could not load records.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [loadCaseId, loadRows]);

  async function handleSaved() {
    setShowForm(false);
    if (!caseId) return;
    try {
      const data = await loadRows(caseId);
      setRows(data);
    } catch {
      // non-fatal
    }
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Contradiction log</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Purpose</Text>
        <Text style={globalStyles.cardText}>
          Record inconsistencies between the parent's self-report, observed behaviour, and
          collateral information. Use neutral language. Significant inconsistencies are
          flagged for supervisor review and included in the assessment report.
        </Text>
      </View>

      {loading ? <ActivityIndicator /> : null}

      {message ? <Text style={globalStyles.error}>{message}</Text> : null}

      {caseId && !showForm ? (
        <Pressable onPress={() => setShowForm(true)} style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Record new inconsistency</Text>
        </Pressable>
      ) : null}

      {caseId && showForm && user ? (
        <View style={globalStyles.card}>
          <ContradictionForm
            caseId={caseId}
            workerUserId={user.id}
            onSaved={handleSaved}
          />
          <Pressable
            onPress={() => setShowForm(false)}
            style={[globalStyles.button, styles.cancelButton]}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      {rows.length === 0 && !loading && !message ? (
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardText}>No inconsistencies recorded for this case.</Text>
        </View>
      ) : null}

      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowType}>
              {row.contradiction_type.replace(/_/g, " ")}
            </Text>
            <Text
              style={[
                styles.severityBadge,
                { backgroundColor: SEVERITY_COLORS[row.severity] ?? "#718096" },
              ]}
            >
              {row.severity}
            </Text>
          </View>

          {row.phase ? (
            <Text style={styles.rowMeta}>Phase: {row.phase.replace(/_/g, " ")}</Text>
          ) : null}

          <Text style={styles.rowDescription}>{row.description}</Text>

          {row.source_a || row.source_b ? (
            <View style={styles.sourceRow}>
              {row.source_a ? (
                <Text style={styles.source}>
                  <Text style={styles.sourceLabel}>A: </Text>
                  {row.source_a}
                </Text>
              ) : null}
              {row.source_b ? (
                <Text style={styles.source}>
                  <Text style={styles.sourceLabel}>B: </Text>
                  {row.source_b}
                </Text>
              ) : null}
            </View>
          ) : null}

          {row.worker_notes ? (
            <Text style={styles.workerNotes}>{row.worker_notes}</Text>
          ) : null}

          <View style={styles.flags}>
            {row.include_in_report ? (
              <Text style={styles.flag}>Included in report</Text>
            ) : null}
            {row.supervisor_notified ? (
              <Text style={[styles.flag, styles.flagAlert]}>Supervisor notified</Text>
            ) : null}
          </View>

          <Text style={styles.timestamp}>
            {new Date(row.detected_at).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
      ))}

      <AppBottomNav />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    marginTop: 8,
    backgroundColor: "#718096",
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rowType: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2d3748",
    flex: 1,
    textTransform: "capitalize",
  },
  severityBadge: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  rowMeta: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  rowDescription: {
    fontSize: 13,
    color: "#4a5568",
    marginBottom: 6,
  },
  sourceRow: {
    gap: 2,
    marginBottom: 4,
  },
  source: {
    fontSize: 12,
    color: "#718096",
  },
  sourceLabel: {
    fontWeight: "700",
  },
  workerNotes: {
    fontSize: 12,
    color: "#718096",
    fontStyle: "italic",
    marginBottom: 4,
  },
  flags: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 4,
  },
  flag: {
    fontSize: 11,
    color: "#276749",
    backgroundColor: "#f0fff4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c6f6d5",
  },
  flagAlert: {
    color: "#c53030",
    backgroundColor: "#fff5f5",
    borderColor: "#fed7d7",
  },
  timestamp: {
    fontSize: 11,
    color: "#a0aec0",
    marginTop: 6,
  },
});
