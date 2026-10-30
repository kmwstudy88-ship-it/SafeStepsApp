import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  getAuthorizedLegalCases,
  getCaseVerifiedChronology,
  getConcernByConcernProgress,
  getDisclosureBundles,
  generateBundleAccessReceipt,
  getStatutoryDefenseFilings,
  AuthorizedLegalCase,
  VerifiedChronologyEvent,
  ConcernProgressTracking,
  DisclosureBundle,
  StatutoryDefenseFiling,
} from './legalPortalService';

interface Props {
  onBack?: () => void;
}

export function LegalPortalScreen({ onBack }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [cases, setCases] = useState<AuthorizedLegalCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<AuthorizedLegalCase | null>(null);

  const [activeTab, setActiveTab] = useState<'chronology' | 'concerns' | 'bundles'>('chronology');
  const [chronology, setChronology] = useState<VerifiedChronologyEvent[]>([]);
  const [concerns, setConcerns] = useState<ConcernProgressTracking[]>([]);
  const [bundles, setBundles] = useState<DisclosureBundle[]>([]);
  const [statutoryFilings, setStatutoryFilings] = useState<StatutoryDefenseFiling[]>([]);
  const [downloadingBundleId, setDownloadingBundleId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const caseList = await getAuthorizedLegalCases();
        setCases(caseList);
        if (caseList.length > 0) {
          setSelectedCase(caseList[0]);
          await loadCaseData(caseList[0].id);
        }
      } catch (err) {
        console.error('Failed to load legal portal:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  const loadCaseData = async (caseId: string) => {
    const [chron, conc, bndl, filings] = await Promise.all([
      getCaseVerifiedChronology(caseId),
      getConcernByConcernProgress(caseId),
      getDisclosureBundles(caseId),
      getStatutoryDefenseFilings(caseId),
    ]);
    setChronology(chron);
    setConcerns(conc);
    setBundles(bndl);
    setStatutoryFilings(filings);
  };

  const handleSelectCase = async (c: AuthorizedLegalCase) => {
    setSelectedCase(c);
    setLoading(true);
    await loadCaseData(c.id);
    setLoading(false);
  };

  const handleAccessBundle = async (bundle: DisclosureBundle) => {
    setDownloadingBundleId(bundle.id);
    const res = await generateBundleAccessReceipt(bundle.id, 'lawyer_current');
    setDownloadingBundleId(null);
    if (res.success && res.receipt) {
      Alert.alert(
        'Verified Access Receipt Issued',
        `Receipt #${res.receipt.receiptId}\nDigital Hash: ${res.receipt.accessHash}\nSigned: ${res.receipt.signedTimestamp.replace('T', ' ').slice(0, 19)} UTC\n\nDisclosure bundle verified and ready for courtroom presentation.`
      );
    } else {
      Alert.alert('Error', res.error || 'Unable to access bundle');
    }
  };

  if (loading || !selectedCase) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0369A1" />
        <Text style={styles.loadingText}>Loading Court & Lawyer Verified Case File...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to SafeSteps Hub</Text>
            </TouchableOpacity>
          )}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COURT & LAWYER PORTAL (SS-LEG-001 - 004)</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.badgeText, { color: '#166534' }]}>
                ROLE: {selectedCase.clientRole.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{selectedCase.matterTitle}</Text>
          <Text style={styles.caseMeta}>
            Matter No: <Text style={{ fontWeight: '700' }}>{selectedCase.caseNumber}</Text> · {selectedCase.courtJurisdiction}
          </Text>
          <Text style={styles.childrenText}>
            Children: {selectedCase.children.join(' · ')}
          </Text>

          {/* Legal Notice */}
          <View style={styles.legalNotice}>
            <Text style={styles.legalNoticeIcon}>⚖️</Text>
            <Text style={styles.legalNoticeText}>
              <Text style={{ fontWeight: '700' }}>Privileged Court Presentation: </Text>
              Discloses source-linked evidentiary chronologies, forensic child voice, and verified parental right-of-reply under Children and Young Persons care jurisdiction.
            </Text>
          </View>
        </View>

        {/* Matter Selector if multiple */}
        {cases.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.casePicker}>
            {cases.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.caseChip, c.id === selectedCase.id && styles.caseChipActive]}
                onPress={() => handleSelectCase(c)}
              >
                <Text style={[styles.caseChipText, c.id === selectedCase.id && styles.caseChipTextActive]}>
                  {c.caseNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chronology' && styles.tabActive]}
            onPress={() => setActiveTab('chronology')}
          >
            <Text style={[styles.tabText, activeTab === 'chronology' && styles.tabTextActive]}>
              Verified Chronology ({chronology.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'concerns' && styles.tabActive]}
            onPress={() => setActiveTab('concerns')}
          >
            <Text style={[styles.tabText, activeTab === 'concerns' && styles.tabTextActive]}>
              Concern Progress ({concerns.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'bundles' && styles.tabActive]}
            onPress={() => setActiveTab('bundles')}
          >
            <Text style={[styles.tabText, activeTab === 'bundles' && styles.tabTextActive]}>
              Disclosure Bundles ({bundles.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: VERIFIED CHRONOLOGY (SS-LEG-002) */}
        {activeTab === 'chronology' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Source-Linked Evidentiary Chronology</Text>
            <Text style={styles.sectionSub}>
              Immutable case events, court directions, milestone completions, and forensic observations.
            </Text>

            {chronology.map((event) => {
              const catColor =
                event.category === 'court_order'
                  ? '#7C3AED'
                  : event.category === 'substantiated_concern'
                  ? '#DC2626'
                  : event.category === 'positive_milestone'
                  ? '#16A34A'
                  : event.category === 'contact_visit'
                  ? '#0284C7'
                  : '#D97706';

              return (
                <View key={event.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.eventDate}>📅 {event.date}</Text>
                    <View style={[styles.catBadge, { backgroundColor: catColor + '18' }]}>
                      <Text style={[styles.catBadgeText, { color: catColor }]}>
                        {event.category.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.eventSummary}>{event.summary}</Text>

                  {/* Verbatim child words if present */}
                  {event.verbatimChildWords && (
                    <View style={styles.childQuoteBox}>
                      <Text style={styles.quoteTag}>CHILD'S OWN WORDS (VERBATIM):</Text>
                      <Text style={styles.quoteBody}>"{event.verbatimChildWords}"</Text>
                    </View>
                  )}

                  {/* Provenance source badge */}
                  <View style={styles.provenanceBox}>
                    <Text style={styles.provenanceLabel}>SOURCE PROVENANCE:</Text>
                    <Text style={styles.provenanceText}>📍 {event.provenanceSource}</Text>
                  </View>

                  {/* Evidence hash & reply indicators */}
                  <View style={styles.footerRow}>
                    {event.evidenceHash && (
                      <Text style={styles.hashText}>
                        🔐 SHA-256: {event.evidenceHash.substring(0, 16)}...
                      </Text>
                    )}
                    {event.parentReplyLinked && (
                      <View style={styles.replyBadge}>
                        <Text style={styles.replyText}>⚖️ Procedural Reply Linked</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: CONCERN-BY-CONCERN PROGRESS (SS-LEG-003) */}
        {activeTab === 'concerns' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Concern-by-Concern Demonstrated Progress</Text>
            <Text style={styles.sectionSub}>
              Tracks each initial statutory concern against parental response, demonstrated change, and supporting evidence.
            </Text>

            {concerns.map((item) => {
              const statusColor =
                item.status === 'substantially_resolved'
                  ? '#16A34A'
                  : item.status === 'actively_mitigating'
                  ? '#0284C7'
                  : item.status === 'disputed_unresolved'
                  ? '#D97706'
                  : '#DC2626';

              return (
                <View key={item.concernId} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.concernSource}>{item.statutorySource}</Text>
                    <View style={[styles.catBadge, { backgroundColor: statusColor + '18' }]}>
                      <Text style={[styles.catBadgeText, { color: statusColor }]}>
                        {item.status.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <View style={styles.findingBox}>
                    <Text style={styles.fieldLabel}>ORIGINAL STATUTORY FINDING:</Text>
                    <Text style={styles.fieldText}>{item.originalFinding}</Text>
                  </View>

                  {item.parentResponseText && (
                    <View style={[styles.findingBox, { backgroundColor: '#F0F9FF' }]}>
                      <Text style={[styles.fieldLabel, { color: '#0369A1' }]}>PARENT PROCEDURAL RESPONSE:</Text>
                      <Text style={[styles.fieldText, { color: '#0C4A6E' }]}>{item.parentResponseText}</Text>
                    </View>
                  )}

                  <View style={[styles.findingBox, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.fieldLabel, { color: '#166534' }]}>DEMONSTRATED BEHAVIOURAL CHANGE:</Text>
                    <Text style={[styles.fieldText, { color: '#14532D', fontWeight: '600' }]}>
                      {item.demonstratedChangeSummary}
                    </Text>
                  </View>

                  <View style={styles.evidencePillsRow}>
                    <Text style={styles.evidenceLabel}>Supporting Vault Proofs:</Text>
                    {item.supportingVaultEvidenceIds.map((id) => (
                      <View key={id} style={styles.evidencePill}>
                        <Text style={styles.evidencePillText}>📁 {id}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 3: DISCLOSURE & EVIDENCE BUNDLES (SS-LEG-004) */}
        {activeTab === 'bundles' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Court Filing & Disclosure Bundles</Text>
            <Text style={styles.sectionSub}>
              Cryptographically sealed evidentiary bundles prepared for filing or judicial inspection.
            </Text>

            {bundles.map((bundle) => (
              <View key={bundle.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.bundleVersion}>VERSION {bundle.version}</Text>
                  <View style={[styles.catBadge, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.catBadgeText, { color: '#166534' }]}>SEALED</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{bundle.bundleTitle}</Text>
                <Text style={styles.meta}>Filed Date: {bundle.courtFilingDate} · Sealed by: {bundle.sealedBy}</Text>
                <Text style={styles.meta}>Contains: {bundle.itemsCount} verified evidentiary items</Text>

                <View style={styles.hashBox}>
                  <Text style={styles.hashLabel}>CRYPTOGRAPHIC SHA-256 PROVENANCE DIGEST:</Text>
                  <Text style={styles.hashFull}>{bundle.sha256Digest}</Text>
                </View>

                {bundle.isTimeLimited && (
                  <Text style={styles.expiryText}>
                    ⏳ Time-Limited Token Expires: {bundle.expiryDate.replace('T', ' ').slice(0, 16)} UTC
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.accessButton}
                  onPress={() => handleAccessBundle(bundle)}
                  disabled={downloadingBundleId === bundle.id}
                >
                  {downloadingBundleId === bundle.id ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.accessButtonText}>
                      📜 Issue Access Receipt & Open Bundle
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            {statutoryFilings.length > 0 && (
              <>
                <Text style={[styles.sectionHeading, { marginTop: 10 }]}>
                  Statutory Safeguard Filings (Waitlist Tolling & Poverty ≠ Neglect)
                </Text>
                {statutoryFilings.map((filing) => (
                  <View key={filing.id} style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.bundleVersion}>
                        {filing.filingType.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <View style={[styles.catBadge, { backgroundColor: '#EFF6FF' }]}>
                        <Text style={[styles.catBadgeText, { color: '#1D4ED8' }]}>STATUTORY RECORD</Text>
                      </View>
                    </View>
                    <Text style={styles.cardTitle}>{filing.title}</Text>
                    <Text style={styles.meta}>Authority: {filing.statutoryAuthority}</Text>
                    <Text style={styles.eventSummary}>{filing.factualGrounds}</Text>
                    {filing.daysTolledRequested !== undefined && (
                      <Text style={styles.expiryText}>
                        ⏸️ Permanency Clock Tolled: {filing.daysTolledRequested} Days (Agency Waitlist)
                      </Text>
                    )}
                    {filing.ecsStabilizationAmountAud !== undefined && (
                      <Text style={[styles.expiryText, { color: '#166534' }]}>
                        💵 ECS Material Stabilization: ${filing.ecsStabilizationAmountAud} AUD
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  scroll: { padding: 16, gap: 14 },
  header: { gap: 6 },
  backButton: { alignSelf: 'flex-start', marginBottom: 4 },
  backButtonText: { fontSize: 13, color: '#0369A1', fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#0369A1' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  caseMeta: { fontSize: 13, color: '#334155' },
  childrenText: { fontSize: 12, color: '#64748B' },
  legalNotice: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginTop: 4,
  },
  legalNoticeIcon: { fontSize: 16 },
  legalNoticeText: { fontSize: 12, color: '#334155', flex: 1, lineHeight: 17 },
  casePicker: { flexDirection: 'row', gap: 8, marginVertical: 2 },
  caseChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  caseChipActive: { backgroundColor: '#0369A1', borderColor: '#0369A1' },
  caseChipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  caseChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#0369A1' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
  tabContent: { gap: 12 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  sectionSub: { fontSize: 12, color: '#64748B', lineHeight: 17, marginTop: -6 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  eventDate: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  eventSummary: { fontSize: 13, color: '#334155', lineHeight: 18 },
  childQuoteBox: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
    padding: 9,
    borderRadius: 4,
    gap: 2,
  },
  quoteTag: { fontSize: 10, fontWeight: '800', color: '#B45309', letterSpacing: 0.5 },
  quoteBody: { fontSize: 12, color: '#78350F', fontStyle: 'italic' },
  provenanceBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    gap: 2,
  },
  provenanceLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  provenanceText: { fontSize: 12, color: '#334155' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hashText: { fontSize: 11, color: '#64748B', fontFamily: 'monospace' },
  replyBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  replyText: { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  concernSource: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  findingBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    padding: 9,
    gap: 2,
  },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: '#DC2626', letterSpacing: 0.5 },
  fieldText: { fontSize: 12, color: '#334155', lineHeight: 17 },
  evidencePillsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  evidenceLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  evidencePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  evidencePillText: { fontSize: 11, color: '#334155', fontWeight: '600' },
  bundleVersion: { fontSize: 11, fontWeight: '800', color: '#0369A1' },
  meta: { fontSize: 12, color: '#64748B' },
  hashBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    gap: 2,
  },
  hashLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  hashFull: { fontSize: 10, color: '#0F172A', fontFamily: 'monospace' },
  expiryText: { fontSize: 11, color: '#D97706', fontWeight: '600' },
  accessButton: {
    backgroundColor: '#0369A1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  accessButtonText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
