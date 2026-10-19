import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export function SafetyPlanScreen() {
  const [warningSigns, setWarningSigns] = useState('');
  const [safePlace, setSafePlace] = useState('');
  const [goBag, setGoBag] = useState('');
  const [trustedContacts, setTrustedContacts] = useState('');
  const [childSteps, setChildSteps] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>TEMPORARY NOTES</Text>
          <Text style={styles.title}>Safety planning notes</Text>
          <Text style={styles.subtitle}>Use these blank prompts only if it is safe to enter information on this device.</Text>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>This is not a saved or emergency plan</Text>
          <Text style={styles.statusText}>Notes remain only in this screen's memory and may be lost when you leave or close the app. Nothing is sent to a worker, trusted contact, or emergency service.</Text>
          <Text style={styles.statusText}>If you are in immediate danger, contact your local emergency service. For planning, consider working with a qualified local safety advocate who understands your situation. Do not rely on this app to protect you or keep information hidden.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Warning signs you may want to notice</Text>
          <TextInput accessibilityLabel="Warning signs notes" placeholder="Optional notes" placeholderTextColor="#718096" style={[styles.input, styles.textArea]} multiline value={warningSigns} onChangeText={setWarningSigns} />

          <Text style={styles.label}>Places or options you have discussed with an advocate</Text>
          <TextInput accessibilityLabel="Places and options notes" placeholder="Optional notes" placeholderTextColor="#718096" style={[styles.input, styles.textArea]} multiline value={safePlace} onChangeText={setSafePlace} />

          <Text style={styles.label}>Items you may want to plan for</Text>
          <TextInput accessibilityLabel="Items to plan for notes" placeholder="Optional notes" placeholderTextColor="#718096" style={[styles.input, styles.textArea]} multiline value={goBag} onChangeText={setGoBag} />

          <Text style={styles.label}>People or services you have independently confirmed are safe to contact</Text>
          <TextInput accessibilityLabel="Confirmed contacts notes" placeholder="Optional notes" placeholderTextColor="#718096" style={[styles.input, styles.textArea]} multiline value={trustedContacts} onChangeText={setTrustedContacts} />

          <Text style={styles.label}>Steps discussed with a qualified support person</Text>
          <TextInput accessibilityLabel="Discussed safety steps notes" placeholder="Optional notes" placeholderTextColor="#718096" style={[styles.input, styles.textArea]} multiline value={childSteps} onChangeText={setChildSteps} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#FFF7ED', color: '#9A3412', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  noticeCard: { backgroundColor: '#FFF7ED', borderRadius: 14, borderWidth: 1, borderColor: '#FED7AA', padding: 16, gap: 8 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#9A3412' },
  statusText: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10 },
  label: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  input: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#2D3748' },
  textArea: { minHeight: 76, textAlignVertical: 'top' },
});
