import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  getExtractedIntelligence,
  verifyExtractedConcern,
  disputeExtractedConcern,
  resolveContradiction,
  ExtractedConcern,
  ExtractedGoal,
  DocumentContradiction,
  DocumentIntelligenceData,
} from './documentIntelligenceService';

interface Props {
  caseId?: string;
  onBack?: () => void;
}

export const ExtractedIntelligenceScreen: React.FC<Props> = ({
  caseId = 'demo_case',
  onBack,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DocumentIntelligenceData | null>(null);
  const [activeTab, setActiveTab] = useState<'concerns' | 'goals' | 'contradictions'>('concerns');

  // Dispute modal state
  const [disputeModalVisible, setDisputeModalVisible] = useState<boolean>(false);
  const [selectedConcern, setSelectedConcern] = useState<ExtractedConcern | null>(null);
  const [disputeText, setDisputeText] = useState<string>('');
  const [submittingDispute, setSubmittingDispute] = useState<boolean>(false);

  // Clarification modal state
  const [clarifyModalVisible, setClarifyModalVisible] = useState<boolean>(false);
  const [selectedContra, setSelectedContra] = useState<DocumentContradiction | null>(null);
  const [clarifyText, setClarifyText] = useState<string>('');
  const [submittingClarify, setSubmittingClarify] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getExtractedIntelligence(caseId);
      setData(res);
    } catch (err) {
      console.error('Failed to load document intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const handleVerify = async (concernId: string) => {
    const res = await verifyExtractedConcern(caseId, concernId, 'practitioner_current');
    if (res.success) {
      Alert.alert('Verified', 'Concern verified and logged as substantiated.');
      loadData();
    } else {
      Alert.alert('Error', res.error || 'Failed to verify concern.');
    }
  };

  const openDisputeModal = (concern: ExtractedConcern) => {
    setSelectedConcern(concern);
    setDisputeText(concern.parentDisputeNote || '');
    setDisputeModalVisible(true);
  };

  const handleSaveDispute = async () => {
    if (!selectedConcern) return;
    if (!disputeText.trim()) {
      Alert.alert('Required', 'Please enter your dispute statement or contrary facts.');
      return;
    }
    setSubmittingDispute(true);
    const res = await disputeExtractedConcern(caseId, selectedConcern.id, disputeText);
    setSubmittingDispute(false);
    if (res.success) {
      setDisputeModalVisible(false);
      setSelectedConcern(null);
      setDisputeText('');
      Alert.alert('Procedural Reply Recorded', 'Your statement has been attached to the case evidence record without modifying the source document.');
      loadData();
    } else {
      Alert.alert('Error', res.error || 'Failed to submit dispute.');
    }
  };

  const openClarifyModal = (contra: DocumentContradiction) => {
    setSelectedContra(contra);
    setClarifyText(contra.resolutionNotes || '');
    setClarifyModalVisible(true);
  };

  const handleSaveClarify = async () => {
    if (!selectedContra) return;
    if (!clarifyText.trim()) {
      Alert.alert('Required', 'Please enter clarification notes.');
      return;
    }
    setSubmittingClarify(true);
    const res = await resolveContradiction(caseId, selectedContra.id, clarifyText);
    setSubmittingClarify(false);
    if (res.success) {
      setClarifyModalVisible(false);
      setSelectedContra(null);
      setClarifyText('');
      Alert.alert('Clarified', 'Resolution note saved to contradiction log.');
      loadData();
    } else {
      Alert.alert('Error', res.error || 'Failed to save clarification.');
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Analyzing document extractions & citations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleRow}>
          <Text style={styles.titleIcon}>🔍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Document Intelligence & Extractions</Text>
            <Text style={styles.subtitle}>{data.documentTitle}</Text>
          </View>
        </View>

        {/* Canonical Decision Support Banner */}
        <View style={styles.safetyNotice}>
          <Text style={styles.safetyNoticeIcon}>⚖️</Text>
          <Text style={styles.safetyNoticeText}>
            <Text style={{ fontWeight: '700' }}>AI Decision Support Only: </Text>
            All document extractions, source locators, and detected discrepancies require human practitioner verification. SafeSteps never makes automated legal decisions.
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'concerns' && styles.activeTab]}
          onPress={() => setActiveTab('concerns')}
        >
          <Text style={[styles.tabText, activeTab === 'concerns' && styles.activeTabText]}>
            Concerns ({data.concerns.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => setActiveTab('goals')}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
            Goals ({data.goals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contradictions' && styles.activeTab]}
          onPress={() => setActiveTab('contradictions')}
        >
          <Text style={[styles.tabText, activeTab === 'contradictions' && styles.activeTabText]}>
            Contradictions ({data.contradictions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Tab 1: Concerns */}
        {activeTab === 'concerns' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Identified Child Safety Concerns</Text>
            <Text style={styles.sectionSub}>
              Extracted from official casework reports with exact sentence locators and parent right-of-reply.
            </Text>

            {data.concerns.map((concern) => {
              const severityColor =
                concern.severity === 'critical'
                  ? '#DC2626'
                  : concern.severity === 'high'
                  ? '#EA580C'
                  : concern.severity === 'moderate'
                  ? '#D97706'
                  : '#2563EB';

              const statusColor =
                concern.status === 'verified_by_practitioner'
                  ? '#16A34A'
                  : concern.status === 'disputed_by_parent'
                  ? '#0284C7'
                  : '#EAB308';

              return (
                <View key={concern.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.pillBadge, { backgroundColor: severityColor + '20' }]}>
                        <Text style={[styles.pillText, { color: severityColor }]}>
                          {concern.severity.toUpperCase()} SEVERITY
                        </Text>
                      </View>
                      <View style={styles.locatorBadge}>
                        <Text style={styles.locatorText}>📍 {concern.sourceLocator}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {concern.status.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.concernTitle}>{concern.concernTitle}</Text>
                  <Text style={styles.categoryText}>Category: {concern.category}</Text>

                  {/* Quote block */}
                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteLabel}>EXACT SOURCE QUOTE:</Text>
                    <Text style={styles.quoteText}>"{concern.exactQuote}"</Text>
                  </View>

                  <View style={styles.confidenceRow}>
                    <Text style={styles.confidenceLabel}>Model Confidence:</Text>
                    <View style={styles.confidenceBarContainer}>
                      <View
                        style={[
                          styles.confidenceBarFill,
                          { width: `${Math.round(concern.confidence * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.confidenceValue}>
                      {Math.round(concern.confidence * 100)}%
                    </Text>
                  </View>

                  {concern.parentDisputeNote && (
                    <View style={styles.disputeBox}>
                      <Text style={styles.disputeBoxTitle}>⚖️ Parent Procedural Reply:</Text>
                      <Text style={styles.disputeBoxText}>{concern.parentDisputeNote}</Text>
                    </View>
                  )}

                  {concern.verifiedBy && (
                    <View style={styles.verifiedBox}>
                      <Text style={styles.verifiedText}>
                        ✓ Verified by Practitioner ({concern.verifiedBy})
                      </Text>
                    </View>
                  )}

                  {/* Action buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.disputeButton}
                      onPress={() => openDisputeModal(concern)}
                    >
                      <Text style={styles.disputeButtonText}>
                        {concern.parentDisputeNote ? '✏️ Edit Reply' : '⚖️ Exercise Right of Reply'}
                      </Text>
                    </TouchableOpacity>

                    {concern.status !== 'verified_by_practitioner' && (
                      <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={() => handleVerify(concern.id)}
                      >
                        <Text style={styles.verifyButtonText}>✓ Verify Fact</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Tab 2: Goals */}
        {activeTab === 'goals' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Extracted Case Plan Goals</Text>
            <Text style={styles.sectionSub}>
              Key expectations and reunification requirements detected in uploaded court and agency documents.
            </Text>

            {data.goals.map((goal) => {
              const priorityColor =
                goal.priority === 'essential'
                  ? '#DC2626'
                  : goal.priority === 'high'
                  ? '#EA580C'
                  : '#2563EB';

              return (
                <View key={goal.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.pillBadge, { backgroundColor: priorityColor + '20' }]}>
                      <Text style={[styles.pillText, { color: priorityColor }]}>
                        {goal.priority.toUpperCase()} PRIORITY
                      </Text>
                    </View>
                    <View style={styles.locatorBadge}>
                      <Text style={styles.locatorText}>📍 {goal.sourceLocator}</Text>
                    </View>
                  </View>

                  <Text style={styles.goalTitle}>{goal.goalTitle}</Text>
                  <Text style={styles.categoryText}>Domain: {goal.domain}</Text>

                  <View style={styles.suggestedActionBox}>
                    <Text style={styles.actionLabel}>RECOMMENDED PRACTICAL ACTION:</Text>
                    <Text style={styles.actionText}>{goal.suggestedAction}</Text>
                  </View>

                  {goal.targetDate && (
                    <Text style={styles.targetDateText}>
                      📅 Target Completion Date: <Text style={{ fontWeight: '700' }}>{goal.targetDate}</Text>
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Tab 3: Contradictions */}
        {activeTab === 'contradictions' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Document Contradictions & Discrepancies</Text>
            <Text style={styles.sectionSub}>
              AI detected discrepancies between different dates, providers, or parent statements to protect procedural fairness.
            </Text>

            {data.contradictions.map((contra) => {
              const isResolved = contra.status === 'clarified';
              return (
                <View key={contra.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.pillBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.pillText, { color: '#DC2626' }]}>
                        {contra.severity.toUpperCase()} DISCREPANCY
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: isResolved ? '#DCFCE7' : '#FEF3C7' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: isResolved ? '#16A34A' : '#D97706' },
                        ]}
                      >
                        {contra.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.comparisonGrid}>
                    <View style={styles.statementBox}>
                      <Text style={styles.statementTag}>STATEMENT A</Text>
                      <Text style={styles.statementQuote}>"{contra.statementA}"</Text>
                      <Text style={styles.sourceLocatorText}>Source: {contra.sourceA}</Text>
                    </View>

                    <View style={[styles.statementBox, { backgroundColor: '#F8FAFC' }]}>
                      <Text style={[styles.statementTag, { color: '#0284C7' }]}>STATEMENT B</Text>
                      <Text style={styles.statementQuote}>"{contra.statementB}"</Text>
                      <Text style={styles.sourceLocatorText}>Source: {contra.sourceB}</Text>
                    </View>
                  </View>

                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>Analysis of Discrepancy:</Text>
                    <Text style={styles.explanationText}>{contra.explanation}</Text>
                  </View>

                  {contra.resolutionNotes && (
                    <View style={styles.resolutionBox}>
                      <Text style={styles.resolutionTitle}>✓ Clarification Notes:</Text>
                      <Text style={styles.resolutionText}>{contra.resolutionNotes}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.clarifyButton}
                    onPress={() => openClarifyModal(contra)}
                  >
                    <Text style={styles.clarifyButtonText}>
                      {contra.resolutionNotes ? '✏️ Edit Clarification Note' : '📝 Add Clarification Note'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Dispute Modal */}
      <Modal visible={disputeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Exercise Procedural Right of Reply</Text>
            <Text style={styles.modalSub}>
              Australian family law and child protection standards guarantee your right to state your version of facts. Your reply will be permanently attached to this finding.
            </Text>

            {selectedConcern && (
              <View style={styles.modalQuoteBox}>
                <Text style={styles.modalQuoteLabel}>Disputing Concern:</Text>
                <Text style={styles.modalQuoteText}>{selectedConcern.concernTitle}</Text>
                <Text style={styles.modalLocatorText}>Locator: {selectedConcern.sourceLocator}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Your Statement & Supporting Details:</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="State what occurred, why this extraction is inaccurate or incomplete, and reference any proof in the Evidence Vault..."
              value={disputeText}
              onChangeText={setDisputeText}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setDisputeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSaveDispute}
                disabled={submittingDispute}
              >
                {submittingDispute ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Reply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Clarification Modal */}
      <Modal visible={clarifyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Discrepancy Clarification</Text>
            <Text style={styles.modalSub}>
              Document explanations or proof that reconciles this contradiction for the case file.
            </Text>

            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Enter explanation or evidence cross-reference..."
              value={clarifyText}
              onChangeText={setClarifyText}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setClarifyModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSaveClarify}
                disabled={submittingClarify}
              >
                {submittingClarify ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Note</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  safetyNotice: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    alignItems: 'flex-start',
  },
  safetyNoticeIcon: {
    fontSize: 16,
  },
  safetyNoticeText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0284C7',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0284C7',
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  tabContent: {
    gap: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  locatorBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  locatorText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  concernTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  quoteBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#94A3B8',
    padding: 10,
    borderRadius: 4,
    gap: 4,
  },
  quoteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  confidenceBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  disputeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  disputeBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  disputeBoxText: {
    fontSize: 13,
    color: '#14532D',
    lineHeight: 18,
  },
  verifiedBox: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  disputeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  disputeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  suggestedActionBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  actionText: {
    fontSize: 13,
    color: '#0C4A6E',
    lineHeight: 18,
  },
  targetDateText: {
    fontSize: 12,
    color: '#475569',
  },
  comparisonGrid: {
    gap: 8,
  },
  statementBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  statementTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  statementQuote: {
    fontSize: 13,
    color: '#1E293B',
    fontStyle: 'italic',
  },
  sourceLocatorText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  explanationBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  explanationText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
  resolutionBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  resolutionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  resolutionText: {
    fontSize: 12,
    color: '#14532D',
    lineHeight: 17,
  },
  clarifyButton: {
    borderWidth: 1,
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 4,
  },
  clarifyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  modalQuoteBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  modalQuoteLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  modalQuoteText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  modalLocatorText: {
    fontSize: 11,
    color: '#475569',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
