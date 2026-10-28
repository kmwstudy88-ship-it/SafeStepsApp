import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  EvidenceRecord,
  EvidenceCaptureMode,
  depositEvidence,
  getEvidenceRecordsForCase,
  logEvidenceDispute,
} from './evidenceVaultService';

export function EvidenceVaultScreen() {
  const [items, setItems] = useState<EvidenceRecord[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Child Safety & Routines');
  const [reflection, setReflection] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<EvidenceCaptureMode>('live_camera');
  const [isDepositing, setIsDepositing] = useState(false);

  // Dispute form state
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  const [disputeStatement, setDisputeStatement] = useState('');

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    const records = await getEvidenceRecordsForCase('demo_case');
    setItems(records);
  };

  const handlePickImage = async (mode: EvidenceCaptureMode) => {
    setCaptureMode(mode);

    if (mode === 'live_camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Camera permissions are required for live forensic capture.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Photo library permissions are required to upload proof.');
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
    }
  };

  const handleDepositEvidence = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please describe what milestone or routine this proof represents.');
      return;
    }

    setIsDepositing(true);
    const depositResult = await depositEvidence({
      caseId: 'demo_case',
      userId: 'parent_user_01',
      title: title.trim(),
      category: category.trim(),
      reflectionText: reflection.trim(),
      imageUri: selectedImage || undefined,
      captureMode,
      deviceTimestamp: new Date().toISOString(),
    });

    setIsDepositing(false);

    if (depositResult.success) {
      Alert.alert(
        'Evidence Sealed & Deposited',
        'Your milestone proof has been cryptographically fingerprinted with SHA-256 and appended to the immutable case chain of custody.'
      );
      setTitle('');
      setReflection('');
      setSelectedImage(null);
      await loadEvidence();
    } else {
      Alert.alert('Deposit Error', depositResult.error || 'Failed to deposit evidence.');
    }
  };

  const handleLogDispute = async (evidenceId: string) => {
    if (!disputeStatement.trim()) {
      Alert.alert('Statement required', 'Please explain your reason or clarification for disputing.');
      return;
    }

    const result = await logEvidenceDispute({
      evidenceId,
      disputedBy: 'parent_user_01',
      role: 'parent',
      reason: disputeStatement.trim(),
    });

    if (result.success) {
      Alert.alert('Dispute Logged', 'Your dispute statement has been attached to the custody record.');
      setActiveDisputeId(null);
      setDisputeStatement('');
      await loadEvidence();
    } else {
      Alert.alert('Error', result.error || 'Could not log dispute.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>CRYPTOGRAPHIC CHAIN OF CUSTODY</Text>
          <Text style={styles.title}>Secure Evidence Vault</Text>
          <Text style={styles.subtitle}>
            Deposit photos, meal preparations, routine charts, or certificates directly to your case plan milestones with SHA-256 tamper-proof timestamps.
          </Text>
        </View>

        {/* Forensic Assurance Notice */}
        <View style={styles.forensicNoticeBox}>
          <Text style={styles.forensicNoticeTitle}>🛡️ Forensic Tamper-Proof Vault</Text>
          <Text style={styles.forensicNoticeBody}>
            Every deposit is dual-timestamped (device UTC + server receipt) and fingerprinted with SHA-256. Records cannot be retroactively modified or deleted. Disputed entries append procedural corrections to the immutable custody chain.
          </Text>
        </View>

        {/* Deposit Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Deposit New Milestone Proof</Text>

          <Text style={styles.fieldLabel}>Milestone Title:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Bedtime Routine Chart / Medicine Lockbox"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.fieldLabel}>Milestone Category:</Text>
          <TextInput
            style={styles.input}
            placeholder="Child Safety & Routines"
            placeholderTextColor="#94A3B8"
            value={category}
            onChangeText={setCategory}
          />

          <Text style={styles.fieldLabel}>Parent Reflection & Context:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what steps you took, how it supported your child, and when it occurred..."
            placeholderTextColor="#94A3B8"
            value={reflection}
            onChangeText={setReflection}
            multiline
          />

          {/* Capture Mode Selector */}
          <Text style={styles.fieldLabel}>Capture Source:</Text>
          <View style={styles.captureModeRow}>
            <TouchableOpacity
              style={[
                styles.captureModeBtn,
                captureMode === 'live_camera' && styles.captureModeBtnActive,
              ]}
              onPress={() => handlePickImage('live_camera')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.captureModeBtnText,
                  captureMode === 'live_camera' && styles.captureModeBtnTextActive,
                ]}
              >
                📷 Live Camera (Forensic)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureModeBtn,
                captureMode === 'gallery_upload' && styles.captureModeBtnActive,
              ]}
              onPress={() => handlePickImage('gallery_upload')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.captureModeBtnText,
                  captureMode === 'gallery_upload' && styles.captureModeBtnTextActive,
                ]}
              >
                🖼️ Gallery Upload
              </Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <View style={styles.attachedBanner}>
              <Text style={styles.attachedText}>✓ Media attached ({captureMode === 'live_camera' ? 'Live Camera' : 'Gallery'})</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isDepositing && styles.submitButtonDisabled]}
            onPress={handleDepositEvidence}
            disabled={isDepositing}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isDepositing ? 'Fingerprinting & Sealing...' : 'Seal & Deposit into Vault'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vault Entries */}
        <Text style={styles.sectionHeader}>Vault Entries ({items.length})</Text>

        <View style={styles.itemsList}>
          {items.map((item) => {
            const isDisputing = activeDisputeId === item.id;

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      item.status === 'verified_by_worker'
                        ? styles.verifiedBadge
                        : item.status === 'disputed'
                        ? styles.disputedBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    {item.status === 'verified_by_worker'
                      ? '✓ Verified by CSO'
                      : item.status === 'disputed'
                      ? '⚠️ Disputed'
                      : 'Pending Review'}
                  </Text>
                </View>

                <View style={styles.tagRow}>
                  <Text style={styles.categoryLabel}>{item.category}</Text>
                  <Text style={styles.captureModeTag}>
                    {item.isLiveCaptured ? '📷 Live Capture' : '🖼️ Upload'}
                  </Text>
                </View>

                {item.reflectionText ? (
                  <Text style={styles.reflectionBody}>"{item.reflectionText}"</Text>
                ) : null}

                {/* Fingerprint & Timestamps */}
                <View style={styles.cryptoBox}>
                  <Text style={styles.cryptoLabel}>SHA-256 Digest:</Text>
                  <Text style={styles.cryptoDigest} numberOfLines={1}>
                    {item.sha256Digest}
                  </Text>
                  <Text style={styles.cryptoTime}>
                    Captured: {new Date(item.deviceTimestamp).toLocaleString()} | Server Receipt: {new Date(item.serverReceiptTimestamp).toLocaleTimeString()}
                  </Text>
                </View>

                {/* Custody Chain History */}
                {item.chainOfCustody && item.chainOfCustody.length > 0 && (
                  <View style={styles.custodySection}>
                    <Text style={styles.custodyTitle}>Chain of Custody History:</Text>
                    {item.chainOfCustody.map((log) => (
                      <Text key={log.id} style={styles.custodyLogItem}>
                        • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {log.action.toUpperCase()} ({log.actorRole}): {log.notes || 'Verified'}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Dispute Action */}
                <TouchableOpacity
                  style={styles.disputeToggleBtn}
                  onPress={() => setActiveDisputeId(isDisputing ? null : item.id)}
                >
                  <Text style={styles.disputeToggleBtnText}>
                    {isDisputing ? '▲ Cancel Dispute Note' : '⚖️ Log Procedural Dispute'}
                  </Text>
                </TouchableOpacity>

                {isDisputing && (
                  <View style={styles.disputeForm}>
                    <Text style={styles.disputeFormTitle}>Non-Destructive Dispute Statement</Text>
                    <Text style={styles.disputeFormSubtitle}>
                      Your statement will be appended to the permanent chain of custody without modifying the original item.
                    </Text>
                    <TextInput
                      style={styles.disputeInput}
                      placeholder="Explain your objection or clarifying evidence..."
                      placeholderTextColor="#94A3B8"
                      value={disputeStatement}
                      onChangeText={setDisputeStatement}
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.submitDisputeBtn}
                      onPress={() => handleLogDispute(item.id)}
                    >
                      <Text style={styles.submitDisputeBtnText}>Append Dispute to Custody Log</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  forensicNoticeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  forensicNoticeTitle: { fontSize: 13, fontWeight: '700', color: '#166534' },
  forensicNoticeBody: { fontSize: 12, color: '#15803D', lineHeight: 17 },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 2 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: { height: 70, textAlignVertical: 'top' },
  captureModeRow: { flexDirection: 'row', gap: 10 },
  captureModeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  captureModeBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  captureModeBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  captureModeBtnTextActive: { color: '#1D4ED8', fontWeight: '700' },
  attachedBanner: {
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  attachedText: { color: '#166534', fontSize: 12, fontWeight: '700' },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 4 },
  itemsList: { gap: 14 },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  statusBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verifiedBadge: { backgroundColor: '#DCFCE7', color: '#166534' },
  pendingBadge: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  disputedBadge: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  tagRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  captureModeTag: { fontSize: 11, color: '#3B82F6', fontWeight: '700' },
  reflectionBody: { fontSize: 13, color: '#334155', fontStyle: 'italic', lineHeight: 18 },
  cryptoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  cryptoLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  cryptoDigest: { fontSize: 11, fontFamily: 'monospace', color: '#0F172A' },
  cryptoTime: { fontSize: 10, color: '#64748B', marginTop: 2 },
  custodySection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    gap: 4,
  },
  custodyTitle: { fontSize: 11, fontWeight: '700', color: '#475569' },
  custodyLogItem: { fontSize: 11, color: '#64748B' },
  disputeToggleBtn: {
    marginTop: 4,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  disputeToggleBtnText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  disputeForm: {
    marginTop: 6,
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  disputeFormTitle: { fontSize: 12, fontWeight: '700', color: '#991B1B' },
  disputeFormSubtitle: { fontSize: 10, color: '#B91C1C', lineHeight: 14 },
  disputeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    color: '#0F172A',
    height: 60,
    textAlignVertical: 'top',
  },
  submitDisputeBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitDisputeBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
