import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export function FamilyOverviewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>FAMILY DASHBOARD</Text>
        <Text style={styles.title}>Family overview</Text>
        <Text style={styles.subtitle}>
          A private family view will appear here when an approved parent-to-case access contract is available.
        </Text>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Family case data is not connected</Text>
          <Text style={styles.noticeText}>
            This dashboard does not currently load children, assigned cases, visits, tasks, or milestones. No sample family information is shown.
          </Text>
          <Text style={styles.noticeText}>
            Parent access rules and the case identity crosswalk must be verified before this screen can display case-linked information.
          </Text>
        </View>

        <View style={styles.nextStepsCard}>
          <Text style={styles.sectionTitle}>What you can do now</Text>
          <Text style={styles.bodyText}>
            Use the parent support center for general guidance and session-only planning previews. They are not saved to a case or shared with a caseworker.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/parent' as any)}
            accessibilityRole="button"
            accessibilityLabel="Open parent and caregiver support center"
          >
            <Text style={styles.buttonText}>Open parent support center</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#205AA7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  noticeCard: { backgroundColor: '#FFF7ED', borderRadius: 14, borderWidth: 1, borderColor: '#FED7AA', padding: 16, gap: 9 },
  noticeTitle: { fontSize: 16, fontWeight: '700', color: '#9A5B18' },
  noticeText: { fontSize: 13, lineHeight: 19, color: '#7C4A17' },
  nextStepsCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 11 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  bodyText: { fontSize: 13, lineHeight: 19, color: '#4A5568' },
  button: { backgroundColor: '#2D6CDF', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
