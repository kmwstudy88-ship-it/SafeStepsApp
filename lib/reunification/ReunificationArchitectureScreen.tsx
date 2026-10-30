import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DEFAULT_CASE_ID,
  getCaseBarriers,
  getConcreteSupports,
  getFatherhoodEngagementAudit,
  getKinshipPlacementEquity,
  getParentPartners,
  getParentPartnerSessions,
  getPostReunificationPlan,
  logParentPartnerSession,
  logPostReunificationCheckIn,
  recordFatherInclusiveAccommodation,
  recordServiceBarrierWithTimerPause,
  requestConcreteSupport,
  requestKinshipLicensingWaiverOrSupport,
  type CaseBarrierRecord,
  type ConcreteSupportRecord,
  type EcsCategory,
  type FatherhoodInclusionAudit,
  type KinshipPlacementEquityRecord,
  type ParentPartnerProfile,
  type ParentPartnerSession,
  type PostReunificationStepDownPlan,
} from './reunificationArchitectureService';

type TabKey = 'ecs' | 'peer' | 'stepdown' | 'equity';

export function ReunificationArchitectureScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('ecs');
  const [ecsList, setEcsList] = useState<ConcreteSupportRecord[]>([]);
  const [barriers, setBarriers] = useState<CaseBarrierRecord[]>([]);
  const [partners, setPartners] = useState<ParentPartnerProfile[]>([]);
  const [partnerSessions, setPartnerSessions] = useState<ParentPartnerSession[]>([]);
  const [stepDownPlan, setStepDownPlan] = useState<PostReunificationStepDownPlan | null>(null);
  const [fatherAudit, setFatherAudit] = useState<FatherhoodInclusionAudit | null>(null);
  const [kinshipEquity, setKinshipEquity] = useState<KinshipPlacementEquityRecord | null>(null);

  // ECS form state
  const [ecsCategory, setEcsCategory] = useState<EcsCategory>('rent_arrears');
  const [ecsTitle, setEcsTitle] = useState('');
  const [ecsDesc, setEcsDesc] = useState('');
  const [ecsAmountDollars, setEcsAmountDollars] = useState('250');

  // Barrier form state
  const [barrierDesc, setBarrierDesc] = useState('');
  const [barrierMitigation, setBarrierMitigation] = useState('');

  // Peer Mentor session state
  const [selectedPartnerId, setSelectedPartnerId] = useState('pp_mentor_01');
  const [peerSummary, setPeerSummary] = useState('');

  // Post-reunification check-in state
  const [checkInNeed, setCheckInNeed] = useState('');
  const [checkInSupport, setCheckInSupport] = useState('');

  // Fatherhood / Kinship form state
  const [fatherAccommodation, setFatherAccommodation] = useState('');
  const [kinshipWaiverNote, setKinshipWaiverNote] = useState('');

  async function refreshAll() {
    const [ecs, bar, pts, pSessions, sdPlan, fAudit, kEq] = await Promise.all([
      getConcreteSupports(DEFAULT_CASE_ID),
      getCaseBarriers(DEFAULT_CASE_ID),
      getParentPartners(),
      getParentPartnerSessions(DEFAULT_CASE_ID),
      getPostReunificationPlan(DEFAULT_CASE_ID),
      getFatherhoodEngagementAudit(DEFAULT_CASE_ID),
      getKinshipPlacementEquity(DEFAULT_CASE_ID),
    ]);
    setEcsList(ecs);
    setBarriers(bar);
    setPartners(pts);
    setPartnerSessions(pSessions);
    setStepDownPlan(sdPlan);
    setFatherAudit(fAudit);
    setKinshipEquity(kEq);
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function handleRequestEcs() {
    const dollars = Number(ecsAmountDollars);
    const res = await requestConcreteSupport({
      caseId: DEFAULT_CASE_ID,
      requestedByUserId: 'usr_parent_sarah',
      category: ecsCategory,
      title: ecsTitle,
      description: ecsDesc,
      amountCents: Number.isFinite(dollars) ? Math.round(dollars * 100) : 0,
      mitigatesRiskSignal:
        ecsCategory === 'rent_arrears'
          ? 'unsafe_housing'
          : ecsCategory === 'transport_voucher'
            ? 'limited_transport'
            : 'caregiver_overload',
    });
    if (!res.success) {
      Alert.alert('Check details', res.error || 'Unable to submit request.');
      return;
    }
    setEcsTitle('');
    setEcsDesc('');
    await refreshAll();
    Alert.alert('Concrete Support Requested', 'Routed to flexible funding pool (decoupled from neglect risk scoring).');
  }

  async function handleRecordBarrier() {
    const res = await recordServiceBarrierWithTimerPause({
      caseId: DEFAULT_CASE_ID,
      barrierDomain: 'service_level_structural',
      barrierType: 'agency_waitlist',
      description: barrierDesc,
      mitigationPlan: barrierMitigation,
      pauseComplianceTimer: true,
    });
    if (!res.success) {
      Alert.alert('Check details', res.error || 'Unable to log barrier.');
      return;
    }
    setBarrierDesc('');
    setBarrierMitigation('');
    await refreshAll();
    Alert.alert('Compliance Timer Paused', 'Structural barrier logged so parent is not penalized for agency waitlists.');
  }

  async function handleLogPeerSession() {
    const res = await logParentPartnerSession({
      caseId: DEFAULT_CASE_ID,
      parentPartnerId: selectedPartnerId,
      parentUserId: 'usr_parent_sarah',
      focusArea: 'visitation_transition_regulation',
      summaryNote: peerSummary,
      parentHopeRating: 5,
    });
    if (!res.success) {
      Alert.alert('Check details', res.error || 'Unable to save peer session.');
      return;
    }
    setPeerSummary('');
    await refreshAll();
    Alert.alert('Peer Session Logged', 'Saved in confidential Parent Partner channel (non-surveilled).');
  }

  async function handleLogStepDownCheckIn() {
    const res = await logPostReunificationCheckIn({
      caseId: DEFAULT_CASE_ID,
      familyStabilityScore: 92,
      concreteNeedsIdentified: checkInNeed.trim() ? [checkInNeed.trim()] : ['Ongoing routine preservation'],
      supportProvided: checkInSupport,
    });
    if (!res.success) {
      Alert.alert('Check details', res.error || 'Unable to log check-in.');
      return;
    }
    setCheckInNeed('');
    setCheckInSupport('');
    await refreshAll();
    Alert.alert('Step-Down Check-In Saved', 'Graduated post-reunification support recorded without punitive oversight.');
  }

  async function handleAddFatherAccommodation() {
    const res = await recordFatherInclusiveAccommodation(DEFAULT_CASE_ID, fatherAccommodation);
    if (!res.success) {
      Alert.alert('Check details', res.error || 'Unable to save accommodation.');
      return;
    }
    setFatherAccommodation('');
    await refreshAll();
  }

  async function handleRequestKinshipWaiver() {
    const res = await requestKinshipLicensingWaiverOrSupport({
      caseId: DEFAULT_CASE_ID,
      barrierType: 'bedroom_square_footage',
      description: kinshipWaiverNote,
      requestFullStipendParity: true,
      additionalRespiteHours: 8,
    });
    if (!res.success) {
      Alert.alert('Check details', res.error || 'Unable to submit kinship support request.');
      return;
    }
    setKinshipWaiverNote('');
    await refreshAll();
    Alert.alert('Kinship Equity Approved', 'Physical licensing waiver and full foster stipend parity updated.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>STRUCTURAL FAMILY PRESERVATION ARCHITECTURE</Text>
          <Text style={styles.title}>Reunification Support & Equity Hub</Text>
          <Text style={styles.subtitle}>
            Decoupling material hardship from neglect through Concrete Supports (ECS), Parent Partner peer mentorship,
            kinship caregiver equity, and graduated post-reunification aftercare.
          </Text>
        </View>

        <View style={styles.tabRow}>
          {[
            { key: 'ecs', label: 'Concrete Aid (ECS)' },
            { key: 'peer', label: 'Parent Partners' },
            { key: 'stepdown', label: 'Aftercare Cliff' },
            { key: 'equity', label: 'Dads & Kinship' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key as TabKey)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'ecs' && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Request Economic & Concrete Support (ECS)</Text>
              <Text style={styles.helperText}>
                Poverty is not child neglect. Direct material aid stabilizes the household, reduces cognitive overload,
                and prevents Track C from scoring material hardship as parental unfitness.
              </Text>
              <View style={styles.chipRow}>
                {(['rent_arrears', 'utility_relief', 'transport_voucher', 'childcare_subsidy', 'food_security'] as EcsCategory[]).map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, ecsCategory === cat && styles.chipActive]}
                      onPress={() => setEcsCategory(cat)}
                    >
                      <Text style={[styles.chipText, ecsCategory === cat && styles.chipTextActive]}>
                        {cat.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <TextInput
                style={styles.input}
                value={ecsTitle}
                onChangeText={setEcsTitle}
                placeholder="Support title (e.g., Emergency utility bill or transit pass)"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.input}
                value={ecsAmountDollars}
                onChangeText={setEcsAmountDollars}
                keyboardType="numeric"
                placeholder="Amount ($ AUD)"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={ecsDesc}
                onChangeText={setEcsDesc}
                multiline
                placeholder="How will this concrete support stabilize routines or family time?"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestEcs}>
                <Text style={styles.primaryBtnText}>Request Flexible Funding (Non-Punitive)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Active Concrete Supports ({ecsList.length})</Text>
              {ecsList.map((item) => (
                <View key={item.id} style={styles.itemBox}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.statusPill}>{item.status.toUpperCase()} · ${(item.amountCents / 100).toFixed(0)}</Text>
                  </View>
                  <Text style={styles.itemBody}>{item.description}</Text>
                  {item.mitigatesRiskSignal ? (
                    <Text style={styles.itemMeta}>Decouples signal: {item.mitigatesRiskSignal}</Text>
                  ) : null}
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Structural Barriers & Waitlist Timer Protection</Text>
              <Text style={styles.helperText}>
                When an agency waitlist, transit gap, or childcare shortage blocks a court-ordered service, log it here
                to pause compliance timers so the parent is never penalized for system capacity gaps.
              </Text>
              <TextInput
                style={styles.input}
                value={barrierDesc}
                onChangeText={setBarrierDesc}
                placeholder="Describe agency waitlist, transport, or service hours barrier"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.input}
                value={barrierMitigation}
                onChangeText={setBarrierMitigation}
                placeholder="Interim mitigation plan (e.g., mobile coaching or voucher)"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleRecordBarrier}>
                <Text style={styles.secondaryBtnText}>Log Barrier & Pause Compliance Clock</Text>
              </TouchableOpacity>
              {barriers.map((bar) => (
                <View key={bar.id} style={styles.itemBox}>
                  <Text style={styles.itemTitle}>
                    {bar.barrierType.replace(/_/g, ' ').toUpperCase()}{' '}
                    {bar.complianceTimerPaused ? '⏸️ [COMPLIANCE CLOCK PAUSED]' : ''}
                  </Text>
                  <Text style={styles.itemBody}>{bar.description}</Text>
                  <Text style={styles.itemMeta}>Mitigation: {bar.mitigationPlan}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'peer' && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Lived-Experience Parent Partners (~62% Reunification Efficacy)</Text>
              <Text style={styles.helperText}>
                Parent Partners are mentors who previously navigated child protection, reunified with their children,
                and provide non-judgmental advocacy, court demystification, and emotional support.
              </Text>
              {partners.map((partner) => (
                <TouchableOpacity
                  key={partner.id}
                  style={[styles.itemBox, selectedPartnerId === partner.id && styles.itemBoxSelected]}
                  onPress={() => setSelectedPartnerId(partner.id)}
                >
                  <Text style={styles.itemTitle}>{partner.displayName}</Text>
                  <Text style={styles.itemBody}>{partner.livedExperienceSummary}</Text>
                  <Text style={styles.itemMeta}>Specialties: {partner.specialties.join(' • ')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Log Confidential Peer Support Session</Text>
              <Text style={styles.helperText}>
                🔒 Strictly separated from state surveillance and Track C risk scoring.
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={peerSummary}
                onChangeText={setPeerSummary}
                multiline
                placeholder="What did you and your Parent Partner work on today (e.g., preparing for court or post-visit goodbye regulation)?"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogPeerSession}>
                <Text style={styles.primaryBtnText}>Save Peer Advocacy Note</Text>
              </TouchableOpacity>

              {partnerSessions.map((session) => (
                <View key={session.id} style={styles.itemBox}>
                  <Text style={styles.itemTitle}>
                    {session.focusArea.replace(/_/g, ' ').toUpperCase()} · Hope Rating: {session.parentHopeRating}/5
                  </Text>
                  <Text style={styles.itemBody}>{session.summaryNote}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'stepdown' && stepDownPlan && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Eliminating the Post-Reunification "Service Cliff"</Text>
              <Text style={styles.helperText}>
                Reunification is a vulnerable transition, not an abrupt service cut-off. This 12-month step-down plan
                keeps Concrete Supports (ECS), childcare subsidies, and Parent Partners active after return home.
              </Text>
              <View style={styles.itemBox}>
                <Text style={styles.itemTitle}>Current Phase: {stepDownPlan.currentPhase.replace(/_/g, ' ')}</Text>
                <Text style={styles.itemBody}>Relapse / Stress Buffer: {stepDownPlan.relapseOrCrisisBufferPlan}</Text>
                <Text style={styles.itemMeta}>
                  ECS Continuity: {stepDownPlan.ecsContinuityGuaranteed ? 'Guaranteed' : 'Pending'} · Childcare Subsidy:{' '}
                  {stepDownPlan.childcareSubsidyActive ? 'Active' : 'Pending'}
                </Text>
              </View>

              <TextInput
                style={styles.input}
                value={checkInNeed}
                onChangeText={setCheckInNeed}
                placeholder="Any emerging concrete or routine need post-return?"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={checkInSupport}
                onChangeText={setCheckInSupport}
                multiline
                placeholder="Support provided during this step-down check-in"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogStepDownCheckIn}>
                <Text style={styles.primaryBtnText}>Record Non-Punitive Step-Down Check-In</Text>
              </TouchableOpacity>

              {stepDownPlan.checkIns.map((chk) => (
                <View key={chk.id} style={styles.itemBox}>
                  <Text style={styles.itemTitle}>
                    Stability Score: {chk.familyStabilityScore}/100 ({chk.phase.replace(/_/g, ' ')})
                  </Text>
                  <Text style={styles.itemBody}>{chk.supportProvided}</Text>
                  <Text style={styles.itemMeta}>Needs addressed: {chk.concreteNeedsIdentified.join(', ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'equity' && fatherAudit && kinshipEquity && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Fatherhood & Paternal Kin Inclusion Audit</Text>
              <Text style={styles.helperText}>
                Combats the "mother-oriented" bias of child welfare by auditing paternal engagement and shift-work
                scheduling accommodations.
              </Text>
              {fatherAudit.accommodationsRecorded.map((acc, idx) => (
                <View key={idx} style={styles.itemBox}>
                  <Text style={styles.itemBody}>✓ {acc}</Text>
                </View>
              ))}
              <TextInput
                style={styles.input}
                value={fatherAccommodation}
                onChangeText={setFatherAccommodation}
                placeholder="Add fatherhood scheduling accommodation or paternal kin link"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddFatherAccommodation}>
                <Text style={styles.secondaryBtnText}>Record Father-Inclusive Accommodation</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Kinship Caregiver Financial & Licensing Equity</Text>
              <Text style={styles.helperText}>
                Ensures grandmothers, aunts, and kin carers receive full foster stipend parity, respite care, and
                waivers for rigid middle-class housing square-footage standards.
              </Text>
              <View style={styles.itemBox}>
                <Text style={styles.itemTitle}>{kinshipEquity.kinshipCarerName}</Text>
                <Text style={styles.itemBody}>
                  Stipend Status: {kinshipEquity.stipendStatus.replace(/_/g, ' ').toUpperCase()} ($
                  {(kinshipEquity.monthlyStipendCents / 100).toFixed(0)}/mo) · Respite:{' '}
                  {kinshipEquity.respiteHoursAllocatedPerMonth} hrs/mo
                </Text>
              </View>
              {kinshipEquity.licensingBarriers.map((lb) => (
                <View key={lb.id} style={styles.itemBox}>
                  <Text style={styles.itemTitle}>
                    {lb.barrierType.replace(/_/g, ' ').toUpperCase()} — {lb.waiverStatus.toUpperCase()}
                  </Text>
                  <Text style={styles.itemBody}>{lb.description}</Text>
                  {lb.resolutionNote ? <Text style={styles.itemMeta}>{lb.resolutionNote}</Text> : null}
                </View>
              ))}
              <TextInput
                style={styles.input}
                value={kinshipWaiverNote}
                onChangeText={setKinshipWaiverNote}
                placeholder="Describe kinship licensing barrier or concrete household need"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestKinshipWaiver}>
                <Text style={styles.primaryBtnText}>Approve Kinship Waiver & Stipend Parity</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6FFFA',
    color: '#0D9488',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: '800',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#102033' },
  subtitle: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabBtn: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: '#0D9488' },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: '#4A5568', textAlign: 'center' },
  tabBtnTextActive: { color: '#FFFFFF', fontWeight: '700' },
  section: { gap: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  helperText: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EDF2F7',
  },
  chipActive: { backgroundColor: '#0D9488' },
  chipText: { fontSize: 12, color: '#4A5568', fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: '#FFFFFF' },
  input: {
    backgroundColor: '#F8FCFC',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A202C',
  },
  textArea: { minHeight: 74, textAlignVertical: 'top' },
  primaryBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#2B6CB0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  itemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 4,
  },
  itemBoxSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#1A202C', flex: 1 },
  statusPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemBody: { fontSize: 13, color: '#2D3748', lineHeight: 18 },
  itemMeta: { fontSize: 12, color: '#0D9488', fontWeight: '600' },
});
