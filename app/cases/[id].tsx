import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getCaseRiskHistory, recomputeCaseRisk, type CaseRiskHistoryResponse } from '../../lib/caseRiskApi';
import { supabase } from '../../lib/supabaseClient';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseRow, setCaseRow] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [riskHistory, setRiskHistory] = useState<CaseRiskHistoryResponse['risk_history']>([]);
  const [caseEvents, setCaseEvents] = useState<CaseRiskHistoryResponse['recent_events']>([]);
  const [openAlerts, setOpenAlerts] = useState<CaseRiskHistoryResponse['open_escalations']>([]);
  const [followUpTasks, setFollowUpTasks] = useState<CaseRiskHistoryResponse['follow_up_tasks']>([]);
  const [recomputingRisk, setRecomputingRisk] = useState(false);

  const loadCase = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const [{ data: caseData, error: caseError }, { data: documentData, error: documentError }, { data: analysisData, error: analysisError }, riskPayload] = await Promise.all([
        supabase.from('cases').select('*').eq('id', id).maybeSingle(),
        supabase.from('documents').select('id,file_name,processing_status,updated_at').eq('case_id', id).order('updated_at', { ascending: false }),
        supabase.from('analyses').select('id,provider,model,summary,created_at,risk_result').eq('case_id', id).order('created_at', { ascending: false }),
        getCaseRiskHistory(id).catch(() => null),
      ]);

      if (caseError) throw caseError;
      if (documentError) throw documentError;
      if (analysisError) throw analysisError;

      setCaseRow(caseData);
      setDocuments(documentData || []);
      setAnalyses(analysisData || []);
      setRiskHistory(riskPayload?.risk_history || []);
      setCaseEvents(riskPayload?.recent_events || []);
      setOpenAlerts(riskPayload?.open_escalations || []);
      setFollowUpTasks(riskPayload?.follow_up_tasks || []);
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load case details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  async function handleRecomputeRisk() {
    if (!id) return;
    setRecomputingRisk(true);
    setError(null);
    try {
      await recomputeCaseRisk(id);
      await loadCase();
    } catch (recomputeError: any) {
      setError(recomputeError?.message || 'Unable to recompute case risk');
    } finally {
      setRecomputingRisk(false);
    }
  }

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`case-${id}-live`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `case_id=eq.${id}` }, loadCase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analyses', filter: `case_id=eq.${id}` }, loadCase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_events', filter: `case_id=eq.${id}` }, loadCase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_snapshots', filter: `case_id=eq.${id}` }, loadCase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalation_alerts', filter: `case_id=eq.${id}` }, loadCase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_up_tasks', filter: `case_id=eq.${id}` }, loadCase)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadCase]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? <ActivityIndicator size="large" color="#208AEF" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {caseRow ? (
          <View style={styles.card}>
            <Text style={styles.caseTitle}>{caseRow.title || 'Untitled case'}</Text>
            <Text style={styles.meta}>Case ID: {caseRow.id}</Text>
            <Text style={styles.meta}>Status: {caseRow.status || 'unknown'}</Text>
            <Text style={styles.meta}>Updated: {caseRow.updated_at || 'n/a'}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={() => router.push(`/documents/${id}` as any)}>
          <Text style={styles.buttonText}>Open Document Viewer & Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRecomputeRisk}
          disabled={recomputingRisk}
          accessibilityRole="button"
          accessibilityLabel="Recompute case risk snapshot"
          accessibilityHint="Creates a new deterministic risk snapshot from the latest recorded case events."
          accessibilityState={{ disabled: recomputingRisk, busy: recomputingRisk }}
        >
          <Text style={styles.secondaryButtonText}>{recomputingRisk ? 'Recomputing risk...' : 'Recompute Risk Snapshot'}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Latest Risk Snapshot</Text>
          {riskHistory[0] ? (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{riskHistory[0].tier.toUpperCase()} · Score {riskHistory[0].score}</Text>
              <Text style={styles.meta}>Confidence: {Math.round((riskHistory[0].confidence || 0) * 100)}%</Text>
              <Text style={styles.meta}>{riskHistory[0].rationale}</Text>
              <Text style={styles.meta}>Rules: {riskHistory[0].model_version}</Text>
            </View>
          ) : <Text style={styles.meta}>No risk history available yet.</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents</Text>
          {documents.map((item) => (
            <View style={styles.item} key={item.id}>
              <Text style={styles.itemTitle}>{item.file_name || item.id}</Text>
              <Text style={styles.meta}>Status: {item.processing_status || 'uploaded'}</Text>
            </View>
          ))}
          {!documents.length ? <Text style={styles.meta}>No documents uploaded yet.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Analyses</Text>
          {analyses.map((item) => (
            <View style={styles.item} key={item.id}>
              <Text style={styles.itemTitle}>{item.summary || `Analysis ${item.id}`}</Text>
              <Text style={styles.meta}>
                {item.provider || 'heuristic'} / {item.model || 'n/a'}
              </Text>
              <Text style={styles.meta}>Risk: {item.risk_result?.risk_level || 'n/a'}</Text>
            </View>
          ))}
          {!analyses.length ? <Text style={styles.meta}>No analyses available yet.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Open Escalations</Text>
          {openAlerts.map((item) => (
            <View style={styles.item} key={item.id}>
              <Text style={styles.itemTitle}>{item.trigger_type}</Text>
              <Text style={styles.meta}>Severity: {item.severity}</Text>
              <Text style={styles.meta}>Status: {item.status}</Text>
            </View>
          ))}
          {!openAlerts.length ? <Text style={styles.meta}>No open escalation alerts.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Follow-up Tasks</Text>
          {followUpTasks.map((item) => (
            <View style={styles.item} key={item.id}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.meta}>Type: {item.task_type}</Text>
              <Text style={styles.meta}>Priority: {item.priority} · Status: {item.status}</Text>
              <Text style={styles.meta}>Due: {item.due_at}</Text>
            </View>
          ))}
          {!followUpTasks.length ? <Text style={styles.meta}>No follow-up tasks generated yet.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Timeline Events</Text>
          {caseEvents.map((item) => (
            <View style={styles.item} key={item.id}>
              <Text style={styles.itemTitle}>{item.event_type}</Text>
              <Text style={styles.meta}>{item.note || 'Structured event recorded.'}</Text>
              <Text style={styles.meta}>Source: {item.event_source} · {item.created_at}</Text>
            </View>
          ))}
          {!caseEvents.length ? <Text style={styles.meta}>No case events recorded yet.</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderColor: '#E2E8F0', borderWidth: 1, padding: 14, gap: 6 },
  caseTitle: { fontSize: 20, fontWeight: '700', color: '#102033' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  meta: { fontSize: 12, color: '#4A5568' },
  button: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#EDF2F7', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#2D3748', fontWeight: '700' },
  item: { backgroundColor: '#F8FCFC', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 2 },
  itemTitle: { fontSize: 13, color: '#1A202C', fontWeight: '600' },
  error: { color: '#C53030' },
});
