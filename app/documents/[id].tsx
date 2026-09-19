import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams } from 'expo-router';

import { queueDocumentUpload, waitForDocumentAnalysis, type DocumentAnalysis } from '../../lib/documentIntelligenceApi';

export default function DocumentViewerScreen() {
  const { id: caseId } = useLocalSearchParams<{ id: string }>();

  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [notesText, setNotesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const summaryOverview = typeof analysis?.summary?.overview === 'string'
    ? analysis.summary.overview
    : 'No summary available.';

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
      type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });

    if (result.canceled) return;
    setSelectedDocument(result.assets[0]);
    setError(null);
    setStatus(null);
  }

  async function uploadAndProcess() {
    if (!caseId) {
      setError('Case id is required.');
      return;
    }
    if (!selectedDocument) {
      setError('Select a document first.');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('Uploading document...');

    try {
      if (typeof selectedDocument.size === 'number' && selectedDocument.size > 25 * 1024 * 1024) {
        throw new Error('Document exceeds the 25 MB upload limit.');
      }
      const contentBase64 = await FileSystem.readAsStringAsync(selectedDocument.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const uploadResponse = await queueDocumentUpload({
        caseId,
        fileName: selectedDocument.name,
        mimeType: selectedDocument.mimeType || 'application/octet-stream',
        contentBase64,
        extractedText: notesText.trim() || null,
      });

      setStatus('Queued for analysis. Waiting for results...');
      const result = await waitForDocumentAnalysis(uploadResponse.document_id);
      if (result.analysis?.status === 'failed') throw new Error(result.analysis.error_message || 'Document analysis failed.');
      setStatus('Analysis complete. Human review is required before any case action.');
      setAnalysis(result.analysis);
    } catch (uploadError: any) {
      setError(uploadError?.message || 'Document processing failed');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>DOCUMENT PIPELINE</Text>
        <Text style={styles.title}>Document Viewer & Processor</Text>
        <Text style={styles.subtitle}>Upload a case document, process with the analysis pipeline, and view stored analysis output.</Text>

        <TouchableOpacity style={styles.button} onPress={pickDocument}>
          <Text style={styles.buttonText}>{selectedDocument ? 'Select Different Document' : 'Select Document'}</Text>
        </TouchableOpacity>

        {selectedDocument ? (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>{selectedDocument.name}</Text>
            <Text style={styles.meta}>Type: {selectedDocument.mimeType || 'unknown'}</Text>
            <Text style={styles.meta}>Size: {selectedDocument.size || 'n/a'} bytes</Text>
            <Text style={styles.meta}>Case: {caseId}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Optional extracted text</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={notesText}
            onChangeText={setNotesText}
            placeholder="Paste extracted text from the document to improve section mapping and risk scoring"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={uploadAndProcess} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Upload & Process</Text>}
        </TouchableOpacity>

        {status ? <Text style={styles.success}>{status}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {analysis ? (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>Stored Analysis</Text>
            <Text style={styles.meta}>Analysis ID: {analysis.id}</Text>
            <Text style={styles.meta}>Provider: {analysis.provider || 'heuristic'}</Text>
            <Text style={styles.meta}>Model: {analysis.model || 'n/a'}</Text>
            <Text style={styles.meta}>Risk: {String(analysis.risk?.level || 'n/a')}</Text>
            <Text style={styles.summary}>{summaryOverview}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 14 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', color: '#102033' },
  subtitle: { color: '#4A5568' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderColor: '#E2E8F0', borderWidth: 1, padding: 14, gap: 6 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  meta: { fontSize: 12, color: '#4A5568' },
  textArea: { minHeight: 110, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, textAlignVertical: 'top', backgroundColor: '#F8FCFC' },
  button: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  success: { color: '#2F855A' },
  error: { color: '#C53030' },
  summary: { marginTop: 6, fontSize: 13, color: '#2D3748' },
});
