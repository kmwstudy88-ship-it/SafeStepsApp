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
import { useRouter } from 'expo-router';
import {
  CasePlan,
  CaseTask,
  CaseProgressSummary,
  getCasePlan,
  getCaseTasks,
  calculateCaseProgress,
  updateCasePlanActionStatus,
  toggleCaseTaskCompletion,
  recordParentGoalPerspective,
  pauseActionComplianceTimer,
} from './casePlanService';
import { ChallengeRecommendations } from '../../components/ChallengeRecommendations';

export function CasePlanScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<CasePlan | null>(null);
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [progress, setProgress] = useState<CaseProgressSummary | null>(null);
  const [activeDisagreementGoalId, setActiveDisagreementGoalId] = useState<string | null>(null);
  const [parentPerspectiveText, setParentPerspectiveText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const activePlan = await getCasePlan('demo_case');
    const caseTasks = await getCaseTasks('demo_case');
    if (activePlan) {
      setPlan(activePlan);
      setProgress(calculateCaseProgress(activePlan));
    }
    setTasks(caseTasks);
  };

  const handleToggleAction = async (goalId: string, actionId: string, currentStatus: string) => {
    if (!plan) return;
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    const result = await updateCasePlanActionStatus({
      caseId: plan.caseId,
      goalId,
      actionId,
      newStatus: nextStatus,
    });

    if (result.success && result.plan) {
      setPlan(result.plan);
      setProgress(calculateCaseProgress(result.plan));
    } else {
      Alert.alert('Update Failed', result.error || 'Could not update action status.');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!plan) return;
    const result = await toggleCaseTaskCompletion(plan.caseId, taskId);
    if (result.success) {
      await loadData();
    }
  };

  const handlePauseActionForBarrier = async (goalId: string, actionId: string) => {
    if (!plan) return;
    const result = await pauseActionComplianceTimer({
      caseId: plan.caseId,
      goalId,
      actionId,
      barrierReason: 'External agency waitlist / transport barrier logged; compliance clock paused.',
    });
    if (result.success && result.plan) {
      setPlan(result.plan);
      setProgress(calculateCaseProgress(result.plan));
      Alert.alert(
        'Compliance Clock Paused',
        'This action is marked as blocked by an external service/transport barrier so your completion score is not penalized.'
      );
    }
  };

  const handleSavePerspective = async (goalId: string) => {
    if (!plan || !parentPerspectiveText.trim()) {
      Alert.alert('Text Required', 'Please enter your perspective or alternative proposal.');
      return;
    }

    setIsSaving(true);
    const result = await recordParentGoalPerspective({
      caseId: plan.caseId,
      goalId,
      parentPerspective: parentPerspectiveText.trim(),
    });
    setIsSaving(false);

    if (result.success) {
      Alert.alert(
        'Perspective Recorded',
        'Your view has been officially recorded in your case plan file and will be presented in your next court and conference review.'
      );
      setActiveDisagreementGoalId(null);
      setParentPerspectiveText('');
      await loadData();
    } else {
      Alert.alert('Error', result.error || 'Could not record perspective.');
    }
  };

  if (!plan || !progress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Case Plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>REUNIFICATION ROADMAP</Text>
          <Text style={styles.title}>{plan.planTitle}</Text>
          <Text style={styles.subtitle}>
            Track demonstrated safety milestones, linked evidence vault items, and daily actions agreed with your family.
          </Text>
        </View>

        {/* Overall Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressTitle}>Overall Plan Completion</Text>
              <Text style={styles.progressSubtitle}>
                {progress.demonstratedGoals} of {progress.totalGoals} Goals Demonstrated
              </Text>
            </View>
            <Text style={styles.progressPercentText}>{progress.overallPercentage}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress.overallPercentage}%` }]} />
          </View>

          <View style={styles.progressStatsRow}>
            <Text style={styles.statItem}>
              ✓ {progress.completedActions} of {progress.totalActions} Actions Completed
            </Text>
            <Text style={styles.statItem}>
              📅 Review Due: {new Date(plan.reviewDueAt || '').toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Immediate Tasks Queue */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Immediate Action Tasks ({tasks.length})</Text>
        </View>
        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <TouchableOpacity
                style={[styles.taskCheckbox, task.isCompleted && styles.taskCheckboxCompleted]}
                onPress={() => handleToggleTask(task.id)}
                activeOpacity={0.8}
              >
                {task.isCompleted && <Text style={styles.taskCheckmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
                {task.description ? (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                ) : null}
                <View style={styles.taskMetaRow}>
                  <Text style={styles.taskDueDate}>
                    Due: {new Date(task.dueAt).toLocaleDateString()}
                  </Text>
                  {task.linkedRoute && (
                    <TouchableOpacity
                      onPress={() => router.push(task.linkedRoute as any)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.taskActionLink}>Open Tool ›</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Goals & Actions Hierarchy */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Case Plan Goals & Evidence Actions</Text>
        </View>

        <View style={styles.goalsList}>
          {plan.goals.map((goal) => {
            const isEditingPerspective = activeDisagreementGoalId === goal.id;

            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalTopRow}>
                  <Text style={styles.goalRefPill}>{goal.goalReference}</Text>
                  <Text
                    style={[
                      styles.goalStatusPill,
                      goal.status === 'demonstrated'
                        ? styles.statusDemonstrated
                        : styles.statusInProgress,
                    ]}
                  >
                    {goal.status === 'demonstrated' ? '✓ Demonstrated' : 'In Progress'}
                  </Text>
                </View>

                <Text style={styles.goalTitle}>{goal.goalTitle}</Text>
                {goal.goalDescription && (
                  <Text style={styles.goalDescription}>{goal.goalDescription}</Text>
                )}

                {/* Child Voice Quote */}
                {goal.childVoiceSummary && (
                  <View style={styles.childVoiceBox}>
                    <Text style={styles.childVoiceLabel}>Leo's Voice (Child Perspective):</Text>
                    <Text style={styles.childVoiceText}>"{goal.childVoiceSummary}"</Text>
                  </View>
                )}

                {/* Recorded Parent Perspective if any */}
                {goal.parentDisagreement && (
                  <View style={styles.parentPerspectiveBox}>
                    <Text style={styles.parentPerspectiveLabel}>
                      Parent Recorded Note / Disagreement:
                    </Text>
                    <Text style={styles.parentPerspectiveText}>"{goal.parentDisagreement}"</Text>
                  </View>
                )}

                {/* Actions Checklist */}
                <View style={styles.actionsContainer}>
                  <Text style={styles.actionsHeader}>
                    Required Actions & Milestones ({goal.actions.length})
                  </Text>
                  {goal.actions.map((act) => {
                    const isCompleted = act.actionStatus === 'completed';

                    return (
                      <View key={act.id} style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionCheckbox, isCompleted && styles.actionCheckboxCompleted]}
                          onPress={() => handleToggleAction(goal.id, act.id, act.actionStatus)}
                          activeOpacity={0.8}
                        >
                          {isCompleted && <Text style={styles.actionCheckmark}>✓</Text>}
                        </TouchableOpacity>

                        <View style={styles.actionDetails}>
                          <View style={styles.actionTitleRow}>
                            <Text
                              style={[
                                styles.actionTitleText,
                                isCompleted && styles.actionTitleTextCompleted,
                              ]}
                            >
                              {act.actionTitle}
                            </Text>
                          </View>
                           <Text style={styles.actionDescText}>{act.actionDescription}</Text>
                          {act.complianceTimerPaused ? (
                            <Text style={styles.evidenceLink}>
                              ⏸️ Compliance Clock Paused: {act.systemicBarrierNote}
                            </Text>
                          ) : null}

                          <View style={styles.actionFooter}>
                            {act.linkedEvidenceVaultIds && act.linkedEvidenceVaultIds.length > 0 && (
                              <TouchableOpacity
                                onPress={() => router.push('/evidence' as any)}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.evidenceLink}>
                                  🔐 Vault: {act.linkedEvidenceVaultIds.join(', ')}
                                </Text>
                              </TouchableOpacity>
                            )}

                            {!isCompleted && !act.complianceTimerPaused && (
                              <TouchableOpacity
                                onPress={() => handlePauseActionForBarrier(goal.id, act.id)}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.routeLink}>⏸️ Flag Waitlist / Barrier</Text>
                              </TouchableOpacity>
                            )}

                            {act.linkedRoute && (
                              <TouchableOpacity
                                onPress={() => router.push(act.linkedRoute as any)}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.routeLink}>Launch Activity ›</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Procedural Right: Record Perspective / Disagreement */}
                <TouchableOpacity
                  style={styles.perspectiveBtn}
                  onPress={() =>
                    setActiveDisagreementGoalId(isEditingPerspective ? null : goal.id)
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.perspectiveBtnText}>
                    {isEditingPerspective
                      ? '▲ Close Perspective Note'
                      : '✍️ Record Parent View or Disagreement'}
                  </Text>
                </TouchableOpacity>

                {isEditingPerspective && (
                  <View style={styles.perspectiveForm}>
                    <Text style={styles.perspectiveFormTitle}>
                      Procedural Fairness: Record Your View on This Goal
                    </Text>
                    <Text style={styles.perspectiveFormSubtitle}>
                      If you believe this goal or its actions are unfair, unrealistic, or completed through alternative means, enter your statement below. It will be permanently recorded in your case file.
                    </Text>
                    <TextInput
                      style={styles.perspectiveInput}
                      placeholder="Enter your perspective or alternative plan..."
                      placeholderTextColor="#94A3B8"
                      value={parentPerspectiveText}
                      onChangeText={setParentPerspectiveText}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.savePerspectiveBtn,
                        isSaving && styles.savePerspectiveBtnDisabled,
                      ]}
                      onPress={() => handleSavePerspective(goal.id)}
                      disabled={isSaving}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.savePerspectiveBtnText}>
                        {isSaving ? 'Attesting...' : 'Attest & Save to Case Plan'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <ChallengeRecommendations
          context={`${plan.planTitle} ${tasks.map((t) => t.title).join(' ')}`}
          title="Personal & Family Challenges Supporting Your Case Plan"
          limit={3}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, gap: 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#64748B', fontSize: 16 },
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
  progressCard: {
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
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  progressSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  progressPercentText: { fontSize: 28, fontWeight: '800', color: '#2563EB' },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 5 },
  progressStatsRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  statItem: { fontSize: 12, fontWeight: '600', color: '#475569' },
  sectionHeaderRow: { marginTop: 4 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#334155' },
  tasksList: { gap: 10 },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxCompleted: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  taskCheckmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  taskContent: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: '#94A3B8' },
  taskDescription: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  taskMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  taskDueDate: { fontSize: 11, color: '#64748B' },
  taskActionLink: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  goalsList: { gap: 16 },
  goalCard: {
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
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalRefPill: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goalStatusPill: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDemonstrated: { backgroundColor: '#DCFCE7', color: '#166534' },
  statusInProgress: { backgroundColor: '#FEF3C7', color: '#B45309' },
  goalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  goalDescription: { fontSize: 13, color: '#475569', lineHeight: 18 },
  childVoiceBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    padding: 10,
    borderRadius: 6,
    gap: 2,
  },
  childVoiceLabel: { fontSize: 11, fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' },
  childVoiceText: { fontSize: 13, fontStyle: 'italic', color: '#1E3A8A' },
  parentPerspectiveBox: {
    backgroundColor: '#FEF9C3',
    borderLeftWidth: 3,
    borderLeftColor: '#EAB308',
    padding: 10,
    borderRadius: 6,
    gap: 2,
  },
  parentPerspectiveLabel: { fontSize: 11, fontWeight: '700', color: '#854D0E' },
  parentPerspectiveText: { fontSize: 13, fontStyle: 'italic', color: '#713F12' },
  actionsContainer: {
    marginTop: 6,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionsHeader: { fontSize: 13, fontWeight: '700', color: '#334155' },
  actionRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  actionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCheckboxCompleted: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  actionCheckmark: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  actionDetails: { flex: 1, gap: 4 },
  actionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  actionTitleText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  actionTitleTextCompleted: { textDecorationLine: 'line-through', color: '#94A3B8' },
  actionDescText: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  actionFooter: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 4 },
  evidenceLink: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  routeLink: { fontSize: 12, fontWeight: '700', color: '#059669' },
  perspectiveBtn: {
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  perspectiveBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  perspectiveForm: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  perspectiveFormTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  perspectiveFormSubtitle: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  perspectiveInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    color: '#0F172A',
    height: 70,
    textAlignVertical: 'top',
  },
  savePerspectiveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  savePerspectiveBtnDisabled: { opacity: 0.6 },
  savePerspectiveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
