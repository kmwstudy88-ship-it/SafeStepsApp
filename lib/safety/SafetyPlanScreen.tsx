import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function SafetyPlanScreen() {
  const [warningSigns, setWarningSigns] = useState('Raised voice in the driveway, repeated texts, child getting clingy before handover.');
  const [safePlace, setSafePlace] = useState("Neighbour Joanne's unit and the library family room.");
  const [goBag, setGoBag] = useState('Medication, spare clothes, court paperwork, charger, comfort toy.');
  const [trustedContacts, setTrustedContacts] = useState('Joanne — 0400 222 111\nCaseworker Priya — 0400 555 222\nDV helpline — 1800 000 000');
  const [childSteps, setChildSteps] = useState('Use the blue backpack cue, move to the car first, then text the caseworker once safe.');
  const [lastSaved, setLastSaved] = useState('2026-09-18 18:20');

  const handleSave = () => {
    setLastSaved(new Date().toISOString().replace('T', ' ').slice(0, 16));
    Alert.alert('Safety plan updated', 'Your editable safety plan is saved and ready for review with your worker or support person.');
  };

  const checklist = [
    'Choose where you and each child can go fast if home no longer feels safe.',
    'Keep transport, charger, and medicines together in one grab-and-go place.',
    'Check trusted-contact numbers every week so they stay current.',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>EDITABLE SAFETY SUPPORT</Text>
          <Text style={styles.title}>Parent Safety Plan Builder</Text>
          <Text style={styles.subtitle}>Create and update a practical plan you can rehearse, share with supports, and revisit after incidents or handovers.</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Plan status</Text>
          <Text style={styles.statusText}>Last updated: {lastSaved}</Text>
          <Text style={styles.statusText}>Share this with your worker, advocate, or trusted support person after any major change.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Warning signs to act on early</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={warningSigns} onChangeText={setWarningSigns} />

          <Text style={styles.label}>Safe places and exit options</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={safePlace} onChangeText={setSafePlace} />

          <Text style={styles.label}>Go-bag essentials</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={goBag} onChangeText={setGoBag} />

          <Text style={styles.label}>Trusted contacts</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={trustedContacts} onChangeText={setTrustedContacts} />

          <Text style={styles.label}>Child-friendly safety steps</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline value={childSteps} onChangeText={setChildSteps} />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Safety Plan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Quick review checklist</Text>
          {checklist.map((item) => (
            <Text key={item} style={styles.checkItem}>• {item}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6FFFA', color: '#285E61', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 6 },
  statusTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  statusText: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10 },
  label: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  input: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#2D3748' },
  textArea: { minHeight: 76, textAlignVertical: 'top' },
  button: { backgroundColor: '#2C7A7B', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  checklistCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 8 },
  checklistTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  checkItem: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
});
