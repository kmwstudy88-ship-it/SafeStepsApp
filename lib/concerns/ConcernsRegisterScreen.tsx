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
import {
  AgencyConcern,
  RightOfReplyType,
  getConcernsForCase,
  submitParentRightOfReply,
} from './concernsRegisterService';

const REPLY_TYPE_LABELS: Record<RightOfReplyType, { label: string; desc: string }> = {
  factual_correction: {
    label: 'Factual Correction',
    desc: 'Correct dates, names, locations, or objective inaccuracies.',
  },
  context_clarification: {
    label: 'Context Clarification',
    desc: 'Provide background details or circumstances not captured in the intake.',
  },
  contrary_evidence: {
    label: 'Contrary Evidence Attached',
    desc: 'Link timestamped photos, drug screens, or attendance logs from the Vault.',
  },
  agreement_with_action_plan: {
    label: 'Agreed with Action Plan',
    desc: 'Acknowledge the concern and state steps taken or planned to resolve it.',
  },
};

export function ConcernsRegisterScreen() {
  const [concerns, setConcerns] = useState<AgencyConcern[]>([]);
  const [activeReplyConcernId, setActiveReplyConcernId] = useState<string | null>(null);
  const [selectedReplyType, setSelectedReplyType] = useState<RightOfReplyType>('factual_correction');
  const [parentStatement, setParentStatement] = useState('');
  const [contraryEvidenceIds, setContraryEvidenceIds] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadConcerns();
  }, []);

  const loadConcerns = async () => {
    const list = await getConcernsForCase('demo_case');
    setConcerns(list);
  };

  const handleOpenReplyForm = (concernId: string) => {
    if (activeReplyConcernId === concernId) {
      setActiveReplyConcernId(null);
    } else {
      setActiveReplyConcernId(concernId);
      setSelectedReplyType('factual_correction');
      setParentStatement('');
      setContraryEvidenceIds('');
    }
  };

  const handleSubmitReply = async (concernId: string) => {
    if (!parentStatement.trim()) {
      Alert.alert('Statement Required', 'Please explain your reply or correction clearly.');
      return;
    }

    setIsSubmitting(true);
    const parsedEvidenceIds = contraryEvidenceIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const result = await submitParentRightOfReply({
      concernId,
      replyType: selectedReplyType,
      parentStatement: parentStatement.trim(),
      contraryEvidenceIds: parsedEvidenceIds,
    });

    setIsSubmitting(false);

    if (result.success) {
      Alert.alert(
        'Right of Reply Recorded',
        'Your statement has been formally attached to this statutory concern and queued for caseworker review. Original agency records remain preserved.'
      );
      setActiveReplyConcernId(null);
      setParentStatement('');
      setContraryEvidenceIds('');
      await loadConcerns();
    } else {
      Alert.alert('Submission Error', result.error || 'Failed to submit right of reply.');
    }
  };

  const getSeverityBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { backgroundColor: '#FEE2E2', color: '#DC2626' };
      case 'high':
        return { backgroundColor: '#FFEDD5', color: '#D97706' };
      case 'moderate':
        return { backgroundColor: '#FEF3C7', color: '#B45309' };
      default:
        return { backgroundColor: '#E0F2FE', color: '#0369A1' };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'accepted_correction':
        return { backgroundColor: '#DCFCE7', color: '#166534', label: 'Accepted by CSO' };
      case 'acknowledged_contrary_position':
        return { backgroundColor: '#E0E7FF', color: '#3730A3', label: 'Position Noted' };
      case 'submitted':
        return { backgroundColor: '#FEF9C3', color: '#854D0E', label: 'Reply Under Review' };
      default:
        return { backgroundColor: '#F1F5F9', color: '#475569', label: 'Action Needed' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>PROCEDURAL FAIRNESS REGISTER</Text>
          <Text style={styles.title}>Concerns & Right of Reply</Text>
          <Text style={styles.subtitle}>
            Review statutory agency concerns and formally attach factual corrections, context, and contrary evidence.
          </Text>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>⚖️ Procedural Fairness Protections</Text>
          <Text style={styles.noticeText}>
            Under child protection standards, you have the right to respond to every allegation.
            All replies are non-destructive: original agency wording is preserved while your
            structured statements and evidence links are permanently appended for court review.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>Registered Agency Concerns ({concerns.length})</Text>

        <View style={styles.concernsList}>
          {concerns.map((concern) => {
            const severityStyle = getSeverityBadgeStyle(concern.severity);
            const statusStyle = getStatusBadgeStyle(concern.rightOfReplyStatus);
            const isReplying = activeReplyConcernId === concern.id;

            return (
              <View key={concern.id} style={styles.concernCard}>
                <View style={styles.cardTopRow}>
                  <Text style={[styles.pill, severityStyle]}>
                    {concern.severity.toUpperCase()} PRIORITY
                  </Text>
                  <Text style={[styles.pill, statusStyle]}>
                    {statusStyle.label}
                  </Text>
                </View>

                <Text style={styles.concernTitle}>{concern.concernTitle}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Source:</Text>
                  <Text style={styles.metaValue}>{concern.sourceDocument}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category:</Text>
                  <Text style={styles.metaValue}>{concern.category.replace(/_/g, ' ')}</Text>
                  <Text style={styles.metaLabel}>• Status:</Text>
                  <Text style={styles.metaValue}>{concern.statutoryStatus}</Text>
                </View>

                <View style={styles.wordingBox}>
                  <Text style={styles.wordingLabel}>Exact Department / Agency Statement:</Text>
                  <Text style={styles.wordingText}>"{concern.agencyWording}"</Text>
                </View>

                {concern.parentReplies && concern.parentReplies.length > 0 && (
                  <View style={styles.repliesSection}>
                    <Text style={styles.repliesHeader}>
                      Parent Recorded Replies ({concern.parentReplies.length})
                    </Text>
                    {concern.parentReplies.map((reply) => (
                      <View key={reply.id} style={styles.replyCard}>
                        <View style={styles.replyTop}>
                          <Text style={styles.replyTypeBadge}>
                            {REPLY_TYPE_LABELS[reply.replyType]?.label || reply.replyType}
                          </Text>
                          <Text style={styles.replyDate}>
                            {new Date(reply.submittedAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.replyStatement}>"{reply.parentStatement}"</Text>
                        {reply.contraryEvidenceIds && reply.contraryEvidenceIds.length > 0 && (
                          <Text style={styles.evidenceAttachedText}>
                            📎 Linked Vault Evidence: {reply.contraryEvidenceIds.join(', ')}
                          </Text>
                        )}
                        {reply.caseworkerReview && (
                          <View style={styles.workerReviewBox}>
                            <Text style={styles.workerReviewStatus}>
                              CSO Review:{' '}
                              {reply.caseworkerReview.status === 'accepted_correction'
                                ? '✓ Accepted Correction'
                                : reply.caseworkerReview.status === 'acknowledged_contrary_position'
                                ? 'ℹ Position Acknowledged'
                                : '⏳ Pending Formal Review'}
                            </Text>
                            {reply.caseworkerReview.caseworkerNote ? (
                              <Text style={styles.workerReviewNote}>
                                Note: {reply.caseworkerReview.caseworkerNote}
                              </Text>
                            ) : null}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.replyToggleBtn, isReplying && styles.replyToggleBtnActive]}
                  onPress={() => handleOpenReplyForm(concern.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.replyToggleBtnText}>
                    {isReplying ? '▲ Cancel Right of Reply' : '✍️ Exercise Right of Reply'}
                  </Text>
                </TouchableOpacity>

                {isReplying && (
                  <View style={styles.replyFormContainer}>
                    <Text style={styles.formTitle}>Formal Right of Reply Statement</Text>
                    <Text style={styles.formSubtitle}>Select the legal nature of your response:</Text>

                    <View style={styles.replyTypePicker}>
                      {(Object.keys(REPLY_TYPE_LABELS) as RightOfReplyType[]).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeOption,
                            selectedReplyType === type && styles.typeOptionSelected,
                          ]}
                          onPress={() => setSelectedReplyType(type)}
                        >
                          <Text
                            style={[
                              styles.typeOptionLabel,
                              selectedReplyType === type && styles.typeOptionLabelSelected,
                            ]}
                          >
                            {REPLY_TYPE_LABELS[type].label}
                          </Text>
                          <Text style={styles.typeOptionDesc}>
                            {REPLY_TYPE_LABELS[type].desc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>Your Factual Statement or Clarification:</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Provide precise details, dates, or what occurred..."
                      placeholderTextColor="#94A3B8"
                      value={parentStatement}
                      onChangeText={setParentStatement}
                      multiline
                    />

                    <Text style={styles.inputLabel}>
                      Linked Evidence Vault IDs (Optional, comma-separated):
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., ev_01, ev_02"
                      placeholderTextColor="#94A3B8"
                      value={contraryEvidenceIds}
                      onChangeText={setContraryEvidenceIds}
                    />

                    <TouchableOpacity
                      style={[styles.submitReplyBtn, isSubmitting && styles.submitReplyBtnDisabled]}
                      onPress={() => handleSubmitReply(concern.id)}
                      disabled={isSubmitting}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.submitReplyBtnText}>
                        {isSubmitting ? 'Recording Reply...' : 'Attest & Submit to Case File'}
                      </Text>
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
  scroll: { padding: 20, gap: 18 },
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
    letterSpacing: 0.5,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  noticeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: '#166534' },
  noticeText: { fontSize: 13, color: '#15803D', lineHeight: 18 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 4 },
  concernsList: { gap: 16 },
  concernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: '700' },
  concernTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  metaValue: { fontSize: 12, color: '#334155' },
  wordingBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#94A3B8',
    padding: 12,
    borderRadius: 6,
    gap: 4,
  },
  wordingLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  wordingText: { fontSize: 14, fontStyle: 'italic', color: '#334155', lineHeight: 20 },
  repliesSection: { marginTop: 6, gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  repliesHeader: { fontSize: 13, fontWeight: '700', color: '#475569' },
  replyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  replyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  replyTypeBadge: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  replyDate: { fontSize: 11, color: '#94A3B8' },
  replyStatement: { fontSize: 13, color: '#1E293B', lineHeight: 18 },
  evidenceAttachedText: { fontSize: 12, color: '#2563EB', fontWeight: '500' },
  workerReviewBox: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 2,
  },
  workerReviewStatus: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  workerReviewNote: { fontSize: 12, color: '#475569', fontStyle: 'italic' },
  replyToggleBtn: {
    marginTop: 6,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  replyToggleBtnActive: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
  replyToggleBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
  replyFormContainer: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 10,
  },
  formTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  formSubtitle: { fontSize: 12, color: '#64748B' },
  replyTypePicker: { gap: 8 },
  typeOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  typeOptionSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  typeOptionLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
  typeOptionLabelSelected: { color: '#1D4ED8' },
  typeOptionDesc: { fontSize: 11, color: '#64748B' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 4 },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitReplyBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  submitReplyBtnDisabled: { opacity: 0.6 },
  submitReplyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
