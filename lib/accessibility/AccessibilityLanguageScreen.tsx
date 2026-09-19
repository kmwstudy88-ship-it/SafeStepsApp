import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = ['English', 'Arabic', 'Vietnamese', 'Plain-language English'];

export function AccessibilityLanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('Plain-language English');
  const [plainLanguage, setPlainLanguage] = useState(true);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const [largeText, setLargeText] = useState(false);

  const toggleButton = (label: string, value: boolean, onPress: () => void) => (
    <TouchableOpacity style={[styles.toggleCard, value && styles.toggleCardActive]} onPress={onPress}>
      <Text style={[styles.toggleTitle, value && styles.toggleTitleActive]}>{label}</Text>
      <Text style={[styles.toggleBody, value && styles.toggleTitleActive]}>{value ? 'On' : 'Off'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>ACCESSIBILITY & LANGUAGE</Text>
          <Text style={styles.title}>Inclusive Access Tools</Text>
          <Text style={styles.subtitle}>Switch between supported languages, simplify wording, and turn on spoken guidance for low-literacy or high-stress moments.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferred language</Text>
          <View style={styles.languageRow}>
            {LANGUAGES.map((language) => {
              const selected = selectedLanguage === language;
              return (
                <TouchableOpacity key={language} style={[styles.languageChip, selected && styles.languageChipActive]} onPress={() => setSelectedLanguage(language)}>
                  <Text style={[styles.languageText, selected && styles.languageTextActive]}>{language}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.toggleGrid}>
          {toggleButton('Plain-language mode', plainLanguage, () => setPlainLanguage((prev) => !prev))}
          {toggleButton('Text-to-speech prompts', textToSpeech, () => setTextToSpeech((prev) => !prev))}
          {toggleButton('Large text', largeText, () => setLargeText((prev) => !prev))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preview</Text>
          <Text style={[styles.previewHeading, largeText && styles.previewHeadingLarge]}>Next appointment</Text>
          <Text style={[styles.previewBody, largeText && styles.previewBodyLarge]}>
            {plainLanguage
              ? 'Tuesday at 10:00 AM. Bring medication forms, comfort toy, and your safety plan.'
              : 'Your upcoming appointment is scheduled for Tuesday at 10:00 AM. Please remember medication forms, the child comfort item, and your current safety plan.'}
          </Text>
          <Text style={styles.previewMeta}>Language: {selectedLanguage} • Audio prompts: {textToSpeech ? 'Enabled' : 'Disabled'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E9D8FD', color: '#553C9A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languageChip: { backgroundColor: '#EDF2F7', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  languageChipActive: { backgroundColor: '#6B46C1' },
  languageText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  languageTextActive: { color: '#FFFFFF' },
  toggleGrid: { gap: 10 },
  toggleCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleCardActive: { borderColor: '#6B46C1', backgroundColor: '#FAF5FF' },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  toggleTitleActive: { color: '#553C9A' },
  toggleBody: { fontSize: 13, color: '#718096' },
  previewHeading: { fontSize: 18, fontWeight: '700', color: '#1A202C' },
  previewHeadingLarge: { fontSize: 22 },
  previewBody: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  previewBodyLarge: { fontSize: 18, lineHeight: 28 },
  previewMeta: { fontSize: 12, color: '#718096' },
});
