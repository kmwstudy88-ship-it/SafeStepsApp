import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getPersonalAiHandoffs, updatePersonalAiHandoff, type PersonalAiHandoffRow } from "../../lib/safeStepsApi";

const priority = { critical: 4, high: 3, medium: 2, low: 1 } as const;

export default function PersonalAiHandoffDashboard() {
  const [rows, setRows] = useState<PersonalAiHandoffRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [notice, setNotice] = useState("");
  const ordered = useMemo(() => [...rows].sort((a, b) => priority[b.urgency] - priority[a.urgency] || Number(!!a.assigned_to_user_id) - Number(!!b.assigned_to_user_id) || a.created_at.localeCompare(b.created_at)), [rows]);
  const selected = ordered.find((row) => row.id === selectedId) ?? ordered[0];

  async function refresh() {
    try { setRows(await getPersonalAiHandoffs()); setNotice(""); }
    catch { setNotice("The assignment-scoped handoff queue is unavailable."); }
  }
  useEffect(() => { void refresh(); }, []);

  async function update(status: PersonalAiHandoffRow["status"], assignToMe = false) {
    if (!selected) return;
    try { await updatePersonalAiHandoff(selected.id, { status, assignToMe }); await refresh(); }
    catch { setNotice("That update was not permitted or could not be saved."); }
  }

  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <View style={s.header}><View style={s.heading}><Text style={s.title}>Personal AI handoffs</Text><Text style={s.muted}>Human review only. No automatic emergency dispatch.</Text></View><Pressable onPress={() => router.back()} style={s.back}><Text style={s.backText}>Back</Text></Pressable></View>
    <View style={s.policy}><Text style={s.policyText}>Review only the minimum information needed for safety and the next action. Avoid diagnosis, blame, legal predictions, and unnecessary disclosure.</Text></View>
    {notice ? <Text accessibilityLiveRegion="polite" style={s.error}>{notice}</Text> : null}
    <View style={s.columns}>
      <View style={s.queue}>{ordered.map((row) => <Pressable key={row.id} accessibilityRole="button" accessibilityState={{ selected: selected?.id === row.id }} onPress={() => setSelectedId(row.id)} style={[s.row, selected?.id === row.id && s.selected]}>
        <Text style={[s.badge, { backgroundColor: row.urgency === "critical" ? "#A9362A" : row.urgency === "high" ? "#B75A20" : "#506F78" }]}>{row.urgency.toUpperCase()}</Text>
        <Text style={s.rowTitle}>{row.reason_code.replaceAll("_", " ")}</Text><Text style={s.meta}>{row.status} · {new Date(row.created_at).toLocaleString()}</Text>
      </Pressable>)}</View>
      <View style={s.detail}>{selected ? <>
        <Text style={s.detailTitle}>Handoff {selected.id.slice(0, 8)}</Text><Text style={s.label}>Approved summary</Text><Text style={s.summary}>{selected.summary}</Text>
        <Text style={s.meta}>Flow: {selected.flow_id ?? "Not set"}</Text><Text style={s.meta}>Assigned: {selected.assigned_to_user_id ? "Yes" : "No"}</Text>
        <View style={s.actions}><Action label="Assign to me" primary onPress={() => void update("assigned", true)} /><Action label="Start review" onPress={() => void update("in_review")} /><Action label="Resolve" onPress={() => void update("resolved")} /><Action label="Close" onPress={() => void update("closed")} /></View>
      </> : <Text style={s.muted}>No handoffs are available to your account.</Text>}</View>
    </View>
  </ScrollView>;
}

function Action({ label, primary, onPress }: { label: string; primary?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[s.action, primary && s.actionPrimary]}><Text style={[s.actionText, primary && s.actionPrimaryText]}>{label}</Text></Pressable>;
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:"#F7F5EF"},content:{width:"100%",maxWidth:1120,alignSelf:"center",padding:20,gap:16},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:12},heading:{flex:1,gap:3},title:{fontSize:28,fontWeight:"900",color:"#14313A"},muted:{color:"#566C72",lineHeight:20},back:{minHeight:44,justifyContent:"center",paddingHorizontal:14},backText:{color:"#075A58",fontWeight:"900"},policy:{padding:14,borderRadius:10,backgroundColor:"#E4F3EE",borderWidth:1,borderColor:"#B6D9D1"},policyText:{color:"#14313A",lineHeight:20},error:{color:"#8A2D22",fontWeight:"800"},columns:{flexDirection:"row",flexWrap:"wrap",gap:14},queue:{flex:1,minWidth:285,gap:8},row:{padding:13,borderRadius:10,borderWidth:1,borderColor:"#CBDDD8",backgroundColor:"white",gap:5},selected:{borderColor:"#087F78",borderWidth:2},badge:{alignSelf:"flex-start",overflow:"hidden",borderRadius:14,paddingHorizontal:8,paddingVertical:4,color:"white",fontSize:11,fontWeight:"900"},rowTitle:{fontWeight:"900",color:"#14313A",textTransform:"capitalize"},meta:{fontSize:12,color:"#566C72"},detail:{flex:1.2,minWidth:295,padding:18,gap:10,borderRadius:12,borderWidth:1,borderColor:"#CBDDD8",backgroundColor:"white"},detailTitle:{fontSize:20,fontWeight:"900",color:"#14313A"},label:{fontSize:12,fontWeight:"900",color:"#075A58",textTransform:"uppercase"},summary:{fontSize:15,lineHeight:22,color:"#14313A"},actions:{flexDirection:"row",flexWrap:"wrap",gap:8,paddingTop:8},action:{minHeight:44,justifyContent:"center",paddingHorizontal:14,borderRadius:8,borderWidth:1,borderColor:"#087F78"},actionPrimary:{backgroundColor:"#087F78"},actionText:{color:"#075A58",fontWeight:"900"},actionPrimaryText:{color:"white"},
});
