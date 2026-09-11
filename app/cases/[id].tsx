import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { supabase } from '../../lib/supabaseClient';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseRow, setCaseRow] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);

  const loadCase = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const [{ data: caseData, error: caseError }, { data: documentData, error: documentError }, { data: analysisData, error: analysisError }] = await Promise.all([
        supabase.from('cases').select('*').eq('id', id).maybeSingle(),
        supabase.from('documents').select('id,file_name,processing_status,updated_at').eq('case_id', id).order('updated_at', { ascending: false }),
        supabase.from('analyses').select('id,provider,model,summary,created_at,risk_result').eq('case_id', id).order('created_at', { ascending: false }),
      ]);

      if (caseError) throw caseError;
      if (documentError) throw documentError;
      if (analysisError) throw analysisError;

      setCaseRow(caseData);
      setDocuments(documentData || []);
      setAnalyses(analysisData || []);
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load case details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`case-${id}-live`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `case_id=eq.${id}` }, loadCase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analyses', filter: `case_id=eq.${id}` }, loadCase)
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

        <TouchableOpacity style={styles.button} onPress={() => router.push(`/cases/${id}/documents` as any)}>
          <Text style={styles.buttonText}>Open Document Viewer & Upload</Text>
        </TouchableOpacity>

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
  item: { backgroundColor: '#F8FCFC', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 2 },
  itemTitle: { fontSize: 13, color: '#1A202C', fontWeight: '600' },
  error: { color: '#C53030' },
});
