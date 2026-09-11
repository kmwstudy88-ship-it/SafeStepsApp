import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  getSupervisorDashboard,
  type SupervisorDashboardAlertItem,
  type SupervisorDashboardCaseItem,
  type SupervisorDashboardResponse,
  type SupervisorDashboardTaskItem,
} from '../../lib/caseRiskApi';

export default function SupervisorDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<SupervisorDashboardResponse | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await getSupervisorDashboard());
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load supervisor dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const highestRiskCases = dashboard?.highest_risk_open_cases || [];
  const risingRiskCases = dashboard?.rising_risk_cases || [];
  const openEscalations = dashboard?.open_escalations || [];
  const overdueFollowUps = dashboard?.overdue_follow_ups || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>SUPERVISOR MONITORING</Text>
          <Text style={styles.title}>Risk & Case Updates Dashboard</Text>
          <Text style={styles.subtitle}>Decision-support signals only. Human review is required before adverse action.</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadDashboard}
          accessibilityRole="button"
          accessibilityLabel="Refresh supervisor dashboard"
          accessibilityHint="Reloads the latest risk, escalation, and follow-up data for supervised cases."
        >
          <Text style={styles.refreshText}>Refresh Dashboard</Text>
        </TouchableOpacity>

        {loading ? <ActivityIndicator size="large" color="#208AEF" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <DashboardSection
          title="Highest-Risk Open Cases"
          items={highestRiskCases}
          emptyText="No supervised cases with risk snapshots yet."
          renderItem={(item: SupervisorDashboardCaseItem) => (
            <TouchableOpacity
              key={item.case_id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/cases/[id]', params: { id: item.case_id } })}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${item.latest_risk?.tier || 'unknown'} risk, score ${item.latest_risk?.score ?? 'not available'}`}
              accessibilityHint="Opens the case detail view for the latest risk rationale, alerts, and follow-up tasks."
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>Risk: {item.latest_risk?.tier || 'n/a'} · Score {item.latest_risk?.score ?? 'n/a'}</Text>
              <Text style={styles.meta}>Alerts: {item.open_alert_count} · Overdue tasks: {item.overdue_task_count}</Text>
              <Text style={styles.body}>{item.latest_risk?.rationale || 'No rationale available.'}</Text>
            </TouchableOpacity>
          )}
        />

        <DashboardSection
          title="Rising-Risk Cases"
          items={risingRiskCases}
          emptyText="No recent positive risk deltas."
          renderItem={(item: SupervisorDashboardCaseItem) => (
            <TouchableOpacity
              key={item.case_id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/cases/[id]', params: { id: item.case_id } })}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, rising risk by ${item.delta}, current tier ${item.latest_risk?.tier || 'unknown'}`}
              accessibilityHint="Opens the case detail view for recent timeline events and updated risk rationale."
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>Delta: +{item.delta} · Current tier: {item.latest_risk?.tier || 'n/a'}</Text>
              {(item.recent_events || []).map((event) => (
                <Text key={event.id} style={styles.body}>• {event.event_type}: {event.note || 'Structured event'}</Text>
              ))}
            </TouchableOpacity>
          )}
        />

        <DashboardSection
          title="Open Escalations"
          items={openEscalations}
          emptyText="No open escalations."
          renderItem={(item: SupervisorDashboardAlertItem) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.trigger_type}</Text>
              <Text style={styles.meta}>Severity: {item.severity} · Status: {item.status}</Text>
              <Text style={styles.meta}>Case: {item.case_id}</Text>
            </View>
          )}
        />

        <DashboardSection
          title="Overdue Follow-Ups"
          items={overdueFollowUps}
          emptyText="No overdue follow-up tasks."
          renderItem={(item: SupervisorDashboardTaskItem) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>Priority: {item.priority} · Status: {item.status}</Text>
              <Text style={styles.meta}>Due: {item.due_at}</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardSection<T>({ title, items, emptyText, renderItem }: {
  title: string;
  items: T[];
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length ? items.map(renderItem) : <Text style={styles.meta}>{emptyText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#FEEBC8', color: '#9C4221', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', color: '#102033' },
  subtitle: { color: '#4A5568' },
  refreshButton: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  refreshText: { color: '#FFFFFF', fontWeight: '700' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderColor: '#E2E8F0', borderWidth: 1, padding: 14, gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  meta: { fontSize: 12, color: '#4A5568' },
  body: { fontSize: 12, color: '#2D3748' },
  error: { color: '#C53030' },
});
