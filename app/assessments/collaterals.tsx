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
import { CollateralForm } from "../../components/assessments/CollateralForm";
import { useAuth } from "../../lib/auth";
import { globalStyles } from "../../lib/styles";
import { supabase } from "../../lib/supabase";

type CollateralRow = {
  id: string;
  source_name: string;
  role: string;
  date_received: string | null;
  consent_legal_basis: string | null;
  summary: string;
  alignment_with_parent_self_report: string;
  risk_protective_notes: string | null;
  protective_factors_noted: string | null;
  created_at: string;
};

const ALIGNMENT_COLORS: Record<string, string> = {
  supportive: "#276749",
  mixed: "#d97706",
  contradictory: "#c53030",
  unknown: "#718096",
};

export default function CollateralsScreen() {
  const { user } = useAuth();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [rows, setRows] = useState<CollateralRow[]>([]);
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

  const loadRows = useCallback(async (activeCaseId: string) => {
    const { data, error } = await supabase
      .from("assessment_collaterals")
      .select(
        "id, source_name, role, date_received, consent_legal_basis, summary, alignment_with_parent_self_report, risk_protective_notes, protective_factors_noted, created_at",
      )
      .eq("case_id", activeCaseId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as CollateralRow[];
  }, []);

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
      <Text style={globalStyles.title}>Collateral contacts</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Purpose</Text>
        <Text style={globalStyles.cardText}>
          Collateral contacts are external professional or service sources that provide
          independent information about this family. Records are stored as summaries only.
          Obtain consent or record the legal basis before documenting.
        </Text>
      </View>

      {loading ? <ActivityIndicator /> : null}
      {message ? <Text style={globalStyles.error}>{message}</Text> : null}

      {caseId && !showForm ? (
        <Pressable onPress={() => setShowForm(true)} style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Add collateral contact</Text>
        </Pressable>
      ) : null}

      {caseId && showForm && user ? (
        <View style={globalStyles.card}>
          <CollateralForm
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
          <Text style={globalStyles.cardText}>
            No collateral contacts recorded for this case.
          </Text>
        </View>
      ) : null}

      {rows.map((row) => (
        <View key={row.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sourceName}>{row.source_name}</Text>
            <Text style={styles.roleTag}>{row.role.replace(/_/g, " ")}</Text>
          </View>

          {row.date_received ? (
            <Text style={styles.meta}>Received: {row.date_received}</Text>
          ) : null}

          {row.consent_legal_basis ? (
            <Text style={styles.meta}>Basis: {row.consent_legal_basis}</Text>
          ) : null}

          <Text style={styles.summary}>{row.summary}</Text>

          <View style={styles.alignmentRow}>
            <Text style={styles.alignmentLabel}>Alignment:</Text>
            <Text
              style={[
                styles.alignmentValue,
                {
                  color:
                    ALIGNMENT_COLORS[row.alignment_with_parent_self_report] ?? "#718096",
                },
              ]}
            >
              {row.alignment_with_parent_self_report.replace(/_/g, " ")}
            </Text>
          </View>

          {row.risk_protective_notes ? (
            <>
              <Text style={styles.sectionLabel}>Risk notes</Text>
              <Text style={styles.notes}>{row.risk_protective_notes}</Text>
            </>
          ) : null}

          {row.protective_factors_noted ? (
            <>
              <Text style={styles.sectionLabel}>Protective factors</Text>
              <Text style={styles.notes}>{row.protective_factors_noted}</Text>
            </>
          ) : null}

          <Text style={styles.timestamp}>
            {new Date(row.created_at).toLocaleDateString("en-AU", {
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d3748",
    flex: 1,
  },
  roleTag: {
    fontSize: 11,
    color: "#4a5568",
    backgroundColor: "#edf2f7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
    textTransform: "capitalize",
    marginLeft: 8,
  },
  meta: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 2,
  },
  summary: {
    fontSize: 13,
    color: "#4a5568",
    marginTop: 6,
    marginBottom: 8,
  },
  alignmentRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginBottom: 6,
  },
  alignmentLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#718096",
  },
  alignmentValue: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a0aec0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  notes: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    color: "#a0aec0",
    marginTop: 8,
  },
});
