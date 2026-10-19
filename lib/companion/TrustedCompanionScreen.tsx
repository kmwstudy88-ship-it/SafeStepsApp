import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export function TrustedCompanionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>PARENT SUPPORT</Text>
        <Text style={styles.title}>AI companion</Text>
        <Text style={styles.subtitle}>The companion is not available yet. Chat remains disabled until its consent, catalog, safety, and launch-approval requirements are connected and reviewed.</Text>

        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Launch gate: not approved</Text>
          <Text style={styles.gateText}>No prompt is sent, stored, or simulated here. This screen does not collect or assert trusted consent.</Text>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.sectionTitle}>Required before chat can open</Text>
          {[
            'A trusted consent adapter with a verified consent catalog',
            'Approved AI catalog and service adapter',
            'Reviewed safety, escalation, and privacy behavior',
            'Explicit launch approval after contract and actor testing',
          ].map((requirement) => (
            <View key={requirement} style={styles.requirementRow}>
              <Text style={styles.statusIcon}>○</Text>
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/parent' as any)} accessibilityRole="button">
          <Text style={styles.buttonText}>Return to parent support center</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 14 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', fontSize: 11, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  title: { fontSize: 24, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  gateCard: { backgroundColor: '#FFF7ED', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#FED7AA', gap: 7 },
  gateTitle: { fontSize: 16, fontWeight: '700', color: '#9A5B18' },
  gateText: { fontSize: 13, color: '#7C4A17', lineHeight: 19 },
  requirementsCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  requirementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  statusIcon: { fontSize: 18, lineHeight: 20, color: '#718096' },
  requirementText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#4A5568' },
  button: { backgroundColor: '#2D6CDF', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
