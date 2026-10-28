import React, { useState, useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Share,
} from 'react-native';
import {
  getSafetyPlan,
  updateSafetyPlan,
  formatSafetyPlanSummary,
  SafetyPlan,
} from './safetyPlanService';

interface Props {
  caseId?: string;
  onBack?: () => void;
}

export function SafetyPlanScreen({ caseId = 'demo_case', onBack }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [plan, setPlan] = useState<SafetyPlan | null>(null);

  const [warningSigns, setWarningSigns] = useState('');
  const [safePlace, setSafePlace] = useState('');
  const [goBag, setGoBag] = useState('');
  const [childSteps, setChildSteps] = useState('');
  const [codeWord, setCodeWord] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSafetyPlan(caseId);
      setPlan(data);
      setWarningSigns(data.warningSigns);
      setSafePlace(data.safePlace);
      setGoBag(data.goBagEssentials);
      setChildSteps(data.childSteps);
      setCodeWord(data.codeWord || '');
    } catch (err) {
      console.error('Failed to load safety plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateSafetyPlan(caseId, {
      warningSigns,
      safePlace,
      goBagEssentials: goBag,
      childSteps,
      codeWord,
    });
    setSaving(false);
    if (res.success && res.plan) {
      setPlan(res.plan);
      Alert.alert(
        'Safety Plan Saved',
        'Your plan is stored locally and securely cached for offline access.'
      );
    } else {
      Alert.alert('Error', res.error || 'Failed to save safety plan.');
    }
  };

  const handleShareSummary = async () => {
    if (!plan) return;
    const text = formatSafetyPlanSummary(plan);
    try {
      await Share.share({
        message: text,
        title: 'SafeSteps Family Safety Plan',
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const checklist = [
    'Choose where you and each child can go fast if home no longer feels safe.',
    'Keep transport, charger, and medicines together in one grab-and-go place.',
    'Check trusted-contact numbers every week so they stay current.',
    'Practice the calm code-word with your child so they know when to listen and move.',
  ];

  if (loading || !plan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading safety plan toolkit...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.badge}>OFFLINE SAFETY TOOLKIT (SS-AIC-027)</Text>
          <Text style={styles.title}>Parent Safety Plan Builder</Text>
          <Text style={styles.subtitle}>
            Create and maintain a practical plan you can rehearse, access offline without cell service, and share with your support team.
          </Text>
        </View>

        {/* Emergency Helplines Card */}
        <View style={styles.crisisBanner}>
          <Text style={styles.crisisTitle}>🚨 Immediate Danger? Dial 000</Text>
          <Text style={styles.crisisText}>
            For 24/7 confidential family violence support, call <Text style={{ fontWeight: '700' }}>1800RESPECT (1800 737 732)</Text>. For crisis mental health support, call <Text style={{ fontWeight: '700' }}>Lifeline (13 11 14)</Text>.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Plan Status</Text>
            <TouchableOpacity style={styles.exportButton} onPress={handleShareSummary}>
              <Text style={styles.exportButtonText}>📲 Export / Share</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.statusText}>
            Last updated: {plan.lastUpdated.replace('T', ' ').slice(0, 16)} UTC
          </Text>
          <Text style={styles.statusSub}>
            Always review this plan after any change in accommodation, contact visit arrangements, or incident.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Warning Signs to Act on Early</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={warningSigns}
            onChangeText={setWarningSigns}
            placeholder="Describe early tension cues, voice levels, or patterns..."
          />

          <Text style={styles.label}>Safe Haven & Exit Options</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={safePlace}
            onChangeText={setSafePlace}
            placeholder="Address of trusted neighbour, family member, or public safe space..."
          />

          <Text style={styles.label}>Go-Bag Essentials</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={goBag}
            onChangeText={setGoBag}
            placeholder="Medicines, court papers, phone charger, keys, comfort items..."
          />

          <Text style={styles.label}>Child Action Steps & Safe Routine</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={childSteps}
            onChangeText={setChildSteps}
            placeholder="Simple instructions for your child (e.g., put on shoes, head to car)..."
          />

          <Text style={styles.label}>Child Safe Code Word (Optional)</Text>
          <TextInput
            style={styles.input}
            value={codeWord}
            onChangeText={setCodeWord}
            placeholder="e.g. Blueberry (a signal that means pack quietly now)"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>💾 Save Safety Plan</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Trusted Contacts Section */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Emergency & Trusted Contacts</Text>
          {plan.trustedContacts.map((contact) => (
            <View key={contact.id} style={styles.contactRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRel}>{contact.relationship}</Text>
              </View>
              <View style={styles.phonePill}>
                <Text style={styles.phoneText}>📞 {contact.phone}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Quick Review Checklist</Text>
          {checklist.map((item, idx) => (
            <Text key={idx} style={styles.checkItem}>
              • {item}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  scroll: { padding: 18, gap: 14 },
  header: { gap: 6 },
  backButton: { alignSelf: 'flex-start', marginBottom: 4 },
  backButtonText: { fontSize: 14, color: '#0D9488', fontWeight: '600' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#CCFBF1',
    color: '#0F766E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 13, lineHeight: 19, color: '#475569' },
  crisisBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  crisisTitle: { fontSize: 14, fontWeight: '800', color: '#DC2626' },
  crisisText: { fontSize: 12, color: '#991B1B', lineHeight: 17 },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  statusText: { fontSize: 12, color: '#64748B' },
  statusSub: { fontSize: 12, color: '#475569', lineHeight: 17 },
  exportButton: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  exportButtonText: { fontSize: 12, fontWeight: '700', color: '#0F766E' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginTop: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 11,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  contactRel: { fontSize: 11, color: '#64748B' },
  phonePill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  phoneText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  checklistCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 14,
    gap: 6,
  },
  checklistTitle: { fontSize: 13, fontWeight: '700', color: '#0F766E' },
  checkItem: { fontSize: 12, color: '#115E59', lineHeight: 18 },
});
