import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { safeStepsApiRequest } from "../../lib/safeStepsApi";

type Row = { id: string; flow_id: string; version: string; title: string; status: string; risk_level: string; change_summary: string; jurisdiction_scope: string[]; personal_ai_flow_version_approvals?: { id: string; approval_role: string; decision: string }[] };

export default function PersonalAiFlowVersionsScreen() {
  const [rows, setRows] = useState<Row[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await safeStepsApiRequest<Row[]>("/api/admin/flow-versions"); setRows(response); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load flow versions."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <ScrollView contentContainerStyle={s.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
    <Text style={s.kicker}>Governed configuration</Text><Text style={s.title}>Flow version administration</Text>
    <Text style={s.body}>Released content is immutable. Critical versions require two independent approvals and a completed release checklist before activation.</Text>
    {error ? <Text style={s.error}>{error}</Text> : null}
    {rows.map((row) => <View key={row.id} style={s.card}>
      <View style={s.line}><Text style={s.cardTitle}>{row.title}</Text><Text style={[s.badge, row.status === "active" && s.active]}>{row.status}</Text></View>
      <Text style={s.meta}>{row.flow_id} · v{row.version} · {row.risk_level}</Text><Text style={s.body}>{row.change_summary}</Text>
      <Text style={s.meta}>Approvals: {row.personal_ai_flow_version_approvals?.filter((item) => item.decision === "approved").length ?? 0} · Jurisdictions: {row.jurisdiction_scope?.join(", ") || "none"}</Text>
    </View>)}
    {!loading && rows.length === 0 ? <Text style={s.body}>No governed flow versions have been created yet.</Text> : null}
    <Pressable style={s.button} onPress={() => void load()}><Text style={s.buttonText}>Refresh review queue</Text></Pressable>
  </ScrollView>;
}

const s = StyleSheet.create({ container: { padding: 20, gap: 14, backgroundColor: "#eef5ef" }, kicker: { fontSize: 13, fontWeight: "700", textTransform: "uppercase" }, title: { fontSize: 29, fontWeight: "800" }, body: { fontSize: 15, lineHeight: 22 }, error: { color: "#9f2d25" }, card: { backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#d6e2d8", padding: 15, gap: 7 }, line: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, cardTitle: { flex: 1, fontSize: 17, fontWeight: "800" }, meta: { color: "#50645a", fontSize: 13 }, badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: "hidden", backgroundColor: "#e8ddd0", fontWeight: "700" }, active: { backgroundColor: "#cce9d2", color: "#205a30" }, button: { backgroundColor: "#244f3d", padding: 14, borderRadius: 12, alignItems: "center" }, buttonText: { color: "white", fontWeight: "800" } });
