import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type EvidenceItem = {
  id: string;
  title: string;
  category: string;
  reflectionText: string;
  imageUri?: string;
  status: 'pending_verification' | 'verified_by_worker';
  createdAt: string;
};

export function EvidenceVaultScreen() {
  const [items, setItems] = useState<EvidenceItem[]>([
    {
      id: 'ev_01',
      title: 'Safe Sleeping Space Setup',
      category: 'Child Safety & Routines',
      reflectionText: 'Arranged child bed with safety rail and cleared toys off floor.',
      status: 'verified_by_worker',
      createdAt: '2026-08-20',
    },
  ]);

  const [title, setTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please grant photo permissions to upload proof.');
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
      Alert.alert('Title required', 'Please enter what milestone this evidence represents.');
      return;
    }

    const newItem: EvidenceItem = {
      id: `ev_${Date.now()}`,
      title: title.trim(),
      category: 'Case Plan Goal Demonstration',
      reflectionText: reflection.trim(),
      imageUri: selectedImage ?? undefined,
      status: 'pending_verification',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setItems([newItem, ...items]);
    setTitle('');
    setReflection('');
    setSelectedImage(null);
    Alert.alert('Evidence Stored', 'Evidence logged and queued for caseworker verification.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>PROOF OF CHANGE</Text>
          <Text style={styles.title}>Secure Evidence Vault</Text>
          <Text style={styles.subtitle}>
            Attach photos, meal preps, routine charts, or certificates directly to your case plan milestones.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Log New Milestone Evidence</Text>
          <TextInput
            style={styles.input}
            placeholder="Milestone Title (e.g. Bedtime Routine Chart)"
            placeholderTextColor="#A0AEC0"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Brief reflection on what you did and how it helped your child..."
            placeholderTextColor="#A0AEC0"
            value={reflection}
            onChangeText={setReflection}
            multiline
          />
          <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage}>
            <Text style={styles.mediaButtonText}>{selectedImage ? '✓ Photo Attached' : '+ Select Photo Evidence'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleAddEvidence}>
            <Text style={styles.submitButtonText}>Deposit to Evidence Vault</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Vault Entries ({items.length})</Text>
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={[styles.statusBadge, item.status === 'verified_by_worker' ? styles.verifiedBadge : styles.pendingBadge]}>
                  {item.status === 'verified_by_worker' ? 'Verified by CSO' : 'Pending CSO Review'}
                </Text>
              </View>
              <Text style={styles.categoryLabel}>{item.category} • {item.createdAt}</Text>
              {item.reflectionText ? <Text style={styles.reflectionBody}>"{item.reflectionText}"</Text> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E2E8F0', color: '#4A5568', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 14, color: '#718096', lineHeight: 20 },
  formCard: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  input: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#2D3748' },
  textArea: { height: 80, textAlignVertical: 'top' },
  mediaButton: { backgroundColor: '#EDF2F7', padding: 12, borderRadius: 8, alignItems: 'center' },
  mediaButtonText: { color: '#2B6CB0', fontSize: 14, fontWeight: '600' },
  submitButton: { backgroundColor: '#42A99D', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1A202C', marginTop: 8 },
  itemsList: { gap: 12 },
  itemCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748', flex: 1 },
  statusBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  verifiedBadge: { backgroundColor: '#C6F6D5', color: '#22543D' },
  pendingBadge: { backgroundColor: '#FEEBC8', color: '#C05621' },
  categoryLabel: { fontSize: 12, color: '#A0AEC0' },
  reflectionBody: { fontSize: 13, color: '#4A5568', fontStyle: 'italic', marginTop: 4 },
});
