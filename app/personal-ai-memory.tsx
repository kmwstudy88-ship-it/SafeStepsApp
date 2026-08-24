import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { safeStepsApiRequest } from "../lib/safeStepsApi";

type MemoryRow = { id: string; scope: string; sensitivity: string; memory_key: string; memory_value: string; rationale: string; status: string; expires_at?: string | null };

export default function PersonalAiMemoryScreen() {
  const [rows,setRows]=useState<MemoryRow[]>([]); const [discreet,setDiscreet]=useState(false); const [error,setError]=useState("");
  const load=useCallback(async()=>{try{setError("");setRows(await safeStepsApiRequest<MemoryRow[]>(`/api/memory?discreet=${discreet}`));}catch(cause){setError(cause instanceof Error?cause.message:"Could not load saved preferences.");}},[discreet]);
  useEffect(()=>{void load();},[load]);
  const setStatus=async(id:string,status:"suppressed"|"deleted")=>{await safeStepsApiRequest(`/api/memory/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});await load();};
  const revoke=async()=>{await safeStepsApiRequest("/api/memory/consent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consentType:"memory",granted:false,policyVersion:"1.0"})});await load();};
  return <ScrollView contentContainerStyle={s.container}>
    <Text style={s.kicker}>Controlled memory</Text><Text style={s.title}>My saved preferences</Text>
    <Text style={s.body}>SafeSteps only uses details you approved. Raw crisis or abuse disclosures, diagnoses, allegations and hidden profiles are not allowed here.</Text>
    <View style={s.row}><View style={s.flex}><Text style={s.cardTitle}>Discreet view</Text><Text style={s.meta}>Hide sensitive items and use neutral labels.</Text></View><Switch value={discreet} onValueChange={setDiscreet} /></View>
    {error?<Text style={s.error}>{error}</Text>:null}
    {rows.map(item=><View key={item.id} style={s.card}><Text style={s.cardTitle}>{item.memory_key.replaceAll("_"," ")}</Text><Text style={s.value}>{item.memory_value}</Text><Text style={s.meta}>{item.scope} · {item.sensitivity} · {item.status}</Text><View style={s.actions}><Pressable style={s.secondary} onPress={()=>void setStatus(item.id,"suppressed")}><Text>Don’t bring this up</Text></Pressable><Pressable style={s.danger} onPress={()=>void setStatus(item.id,"deleted")}><Text style={s.dangerText}>Delete</Text></Pressable></View></View>)}
    {!rows.length&&!error?<Text style={s.body}>No active saved preferences.</Text>:null}
    <Pressable style={s.revoke} onPress={()=>void revoke()}><Text style={s.dangerText}>Disable general memory and suppress saved items</Text></Pressable>
  </ScrollView>;
}
const s=StyleSheet.create({container:{padding:20,gap:14,backgroundColor:"#eef5ef"},kicker:{fontSize:13,fontWeight:"700",textTransform:"uppercase"},title:{fontSize:29,fontWeight:"800"},body:{fontSize:15,lineHeight:22},row:{flexDirection:"row",alignItems:"center",backgroundColor:"white",padding:15,borderRadius:15},flex:{flex:1},card:{backgroundColor:"white",padding:15,borderRadius:15,borderWidth:1,borderColor:"#d6e2d8",gap:7},cardTitle:{fontWeight:"800",fontSize:17},value:{fontSize:16},meta:{fontSize:13,color:"#53685d"},actions:{flexDirection:"row",gap:10,marginTop:5},secondary:{backgroundColor:"#e7eee9",padding:10,borderRadius:10},danger:{backgroundColor:"#8f2e26",padding:10,borderRadius:10},dangerText:{color:"white",fontWeight:"700"},revoke:{backgroundColor:"#8f2e26",padding:14,borderRadius:12,alignItems:"center"},error:{color:"#9f2d25"}});
