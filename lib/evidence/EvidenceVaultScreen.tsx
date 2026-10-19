import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type EvidenceDraft = {
  id: string;
  title: string;
  reflectionText: string;
  hasPhoto: boolean;
  createdAt: string;
};

export function EvidenceVaultScreen() {
  const [items, setItems] = useState<EvidenceDraft[]>([]);
  const [title, setTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Photo library permission is needed to select a photo for this local preview.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAddEvidence = () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Enter a short label for this local draft.');
      return;
    }

    setItems((current) => [{
      id: `draft_${Date.now()}`,
      title: title.trim(),
      reflectionText: reflection.trim(),
      hasPhoto: Boolean(selectedImage),
      createdAt: new Date().toLocaleDateString(),
    }, ...current]);
    setTitle('');
    setReflection('');
    setSelectedImage(null);
    Alert.alert('Local draft added', 'This draft exists only in this screen session. It was not uploaded, stored as case evidence, or sent for worker review.');
  };

  const clearDrafts = () => {
    setItems([]);
    setTitle('');
    setReflection('');
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>LOCAL PREVIEW ONLY</Text>
          <Text style={styles.title}>Evidence draft workspace</Text>
          <Text style={styles.subtitle}>
            Create a temporary note to explore the workflow. Nothing here is attached to a case, verified, uploaded, or retained after leaving this screen.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Do not add sensitive evidence here</Text>
          <Text style={styles.warningText}>This prototype is not an evidence vault. Selected photos and text are held temporarily in screen memory, not securely case-stored or reviewed by a worker.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create a local draft</Text>
          <TextInput
            style={styles.input}
            placeholder="Draft title"
            placeholderTextColor="#718096"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional reflection (avoid sensitive details)"
            placeholderTextColor="#718096"
            value={reflection}
            onChangeText={setReflection}
            multiline
          />
          <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage}>
            <Text style={styles.mediaButtonText}>{selectedImage ? 'Photo selected for this session only' : 'Select a photo (not uploaded)'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleAddEvidence}>
            <Text style={styles.submitButtonText}>Add session-only draft</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionHeader}>Session drafts ({items.length})</Text>
          {items.length ? (
            <TouchableOpacity accessibilityRole="button" onPress={clearDrafts}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {items.length ? (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.statusBadge}>Local draft</Text>
                </View>
                <Text style={styles.categoryLabel}>{item.createdAt} · not uploaded or verified</Text>
                {item.hasPhoto ? <Text style={styles.categoryLabel}>A photo was selected for this session only.</Text> : null}
                {item.reflectionText ? <Text style={styles.reflectionBody}>{item.reflectionText}</Text> : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No session drafts. Nothing has been uploaded or submitted.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', color: '#92400E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  warningCard: { backgroundColor: '#FFF7ED', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FED7AA', gap: 5 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#9A5B18' },
  warningText: { fontSize: 12, color: '#7C4A17', lineHeight: 18 },
  formCard: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, padding: 12, fontSize: 14, color: '#2D3748' },
  textArea: { height: 80, textAlignVertical: 'top' },
  mediaButton: { backgroundColor: '#EDF2F7', padding: 12, borderRadius: 8, alignItems: 'center' },
  mediaButtonText: { color: '#2B6CB0', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  submitButton: { backgroundColor: '#2D6CDF', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  clearText: { color: '#205AA7', fontSize: 13, fontWeight: '700', padding: 6 },
  itemsList: { gap: 12 },
  itemCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748', flex: 1 },
  statusBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#E2E8F0', color: '#4A5568' },
  categoryLabel: { fontSize: 12, color: '#718096' },
  reflectionBody: { fontSize: 13, color: '#4A5568', marginTop: 4 },
  emptyText: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, color: '#4A5568', fontSize: 13 },
});
