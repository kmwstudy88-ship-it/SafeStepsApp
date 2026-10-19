import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export function SOSQuickRelieverScreen() {
  const [selectedScript, setSelectedScript] = useState<number>(0);

  const SOS_SCRIPTS = [
    {
      title: 'When your child refuses to leave or stop playing',
      script: '“I know you want to keep playing. It is fun. And our bodies need to go now. Do you want to hop like a kangaroo or march like a bear to the car?”',
      rationale: 'One optional way to acknowledge feelings while stating a limit and offering a choice. Adapt it to the child and situation.',
    },
    {
      title: 'When your child screams in a public space',
      script: '“I am here with you. Let’s find a quieter spot if we can.” Use a calm voice and give the child space.',
      rationale: 'A calm, simple offer may help some children. It is not guaranteed to work; prioritize immediate safety.',
    },
    {
      title: 'When you feel about to yell or lose control',
      script: '“My body feels very loud right now. I am stepping to the kitchen counter to take three slow breaths so I can stay safe.”',
      rationale: 'Naming the need for a pause can help create space. Make sure the child is safely supervised.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.sosBadge}>NON-EMERGENCY CALMING TOOLS</Text>
          <Text style={styles.title}>Calm support scripts</Text>
          <Text style={styles.subtitle}>
            Optional examples for stressful moments. Adapt them to your family; they may not fit every child or situation.
          </Text>
        </View>

        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Immediate danger?</Text>
          <Text style={styles.emergencyText}>Call your local emergency number now. This app does not contact emergency services, dispatch help, or monitor safety. These calming scripts are not emergency response.</Text>
        </View>

        <View style={styles.tabRow}>
          {SOS_SCRIPTS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.tabButton, selectedScript === idx && styles.tabButtonActive]}
              onPress={() => setSelectedScript(idx)}
            >
              <Text style={[styles.tabText, selectedScript === idx && styles.tabTextActive]}>
                Situation {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.scriptCard}>
          <Text style={styles.situationTitle}>{SOS_SCRIPTS[selectedScript].title}</Text>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>{SOS_SCRIPTS[selectedScript].script}</Text>
          </View>
          <Text style={styles.rationaleTag}>Optional approach</Text>
          <Text style={styles.rationaleText}>{SOS_SCRIPTS[selectedScript].rationale}</Text>
        </View>

        <View style={styles.groundingBox}>
          <Text style={styles.groundingTitle}>Optional grounding reset</Text>
          <Text style={styles.checkItem}>✓ Unclench your jaw and drop your shoulders</Text>
          <Text style={styles.checkItem}>✓ Place both feet flat on the floor</Text>
          <Text style={styles.checkItem}>✓ Remember: Your child is having a hard time, not giving you a hard time</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  sosBadge: { alignSelf: 'flex-start', backgroundColor: '#FED7D7', color: '#9B2C2C', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#742A2A' },
  subtitle: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, backgroundColor: '#EDF2F7', borderRadius: 8, alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#E53E3E' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  scriptCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 14, borderWidth: 1, borderColor: '#FEB2B2', gap: 12 },
  emergencyCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#C53030', gap: 6 },
  emergencyTitle: { fontSize: 15, fontWeight: '800', color: '#9B2C2C' },
  emergencyText: { fontSize: 13, color: '#742A2A', lineHeight: 19 },
  situationTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
  quoteBox: { backgroundColor: '#FFF5F5', padding: 16, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#E53E3E' },
  quoteText: { fontSize: 18, fontStyle: 'italic', color: '#9B2C2C', lineHeight: 26, fontWeight: '600' },
  rationaleTag: { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase' },
  rationaleText: { fontSize: 13, color: '#4A5568', lineHeight: 18 },
  groundingBox: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  groundingTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748' },
  checkItem: { fontSize: 13, color: '#4A5568', lineHeight: 20 },
});
