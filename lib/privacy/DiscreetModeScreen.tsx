import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';

import { clearDiscreetPin, clearRecoveryCode, clearRecoveryPhrase, getDiscreetPin, getRecoveryCode, getRecoveryPhrase } from './discreetModeCredentials';

export function DiscreetModeScreen({
  onUnlock,
}: {
  onUnlock?: () => void;
}) {
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [pinEntry, setPinEntry] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [trustedContactCode, setTrustedContactCode] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [storedRecoveryPhrase, setStoredRecoveryPhrase] = useState<string | null>(null);
  const [storedRecoveryCode, setStoredRecoveryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCredentials() {
      try {
        const [pin, phrase, code] = await Promise.all([getDiscreetPin(), getRecoveryPhrase(), getRecoveryCode()]);
        setStoredPin(pin);
        setStoredRecoveryPhrase(phrase);
        setStoredRecoveryCode(code);
      } finally {
        setLoading(false);
      }
    }

    loadCredentials();
  }, []);

  const handleDigit = (digit: string) => {
    setCalcDisplay((prev) => (prev === '0' ? digit : prev + digit));
    const nextPin = pinEntry + digit;
    setPinEntry(nextPin);

    if (storedPin && nextPin.endsWith(storedPin)) {
      onUnlock?.();
    }
  };

  const handleClear = () => {
    setCalcDisplay('0');
    setPinEntry('');
  };

  const handleRecovery = async () => {
    if (!storedRecoveryPhrase || !storedRecoveryCode) {
      setRecoveryMessage('No recovery path is configured yet. Use Settings & Trusted Contacts from a safe session to add one.');
      return;
    }

    const normalizedPhrase = recoveryPhrase.trim().toUpperCase();
    const normalizedCode = trustedContactCode.trim().toUpperCase();

    if (normalizedPhrase === storedRecoveryPhrase && normalizedCode === storedRecoveryCode) {
      await Promise.all([clearDiscreetPin(), clearRecoveryPhrase(), clearRecoveryCode()]);
      setStoredPin(null);
      setStoredRecoveryPhrase(null);
      setStoredRecoveryCode(null);
      setRecoveryMessage('Recovery confirmed. You can return to SafeSteps now and update your disguise PIN in Settings when it is safe.');
      onUnlock?.();
      return;
    }

    setRecoveryMessage('Recovery details did not match. Move to a safer place and contact your trusted support person or worker for a manual reset.');
  };

  if (!loading && !storedPin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Discreet mode needs setup first</Text>
          <Text style={styles.setupText}>Set a disguise PIN in Settings & Trusted Contacts before using this screen so you do not get stuck in a crisis.</Text>
          <TouchableOpacity style={styles.recoveryButton} onPress={() => onUnlock?.()}>
            <Text style={styles.recoveryButtonText}>Return to SafeSteps</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayArea}>
        <Text style={styles.displayText}>{calcDisplay}</Text>
      </View>
      <View style={styles.keypad}>
        {[['7', '8', '9', '÷'], ['4', '5', '6', '×'], ['1', '2', '3', '-'], ['C', '0', '=', '+']].map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[styles.button, btn === 'C' ? styles.clearBtn : ['÷', '×', '-', '+', '='].includes(btn) ? styles.opBtn : styles.numBtn]}
                onPress={() => {
                  if (btn === 'C') handleClear();
                  else handleDigit(btn);
                }}
                disabled={loading || !storedPin}
              >
                <Text style={styles.btnText}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {loading ? <ActivityIndicator color="#FFFFFF" style={styles.loader} /> : null}

      <TouchableOpacity style={styles.helpToggle} onPress={() => setShowRecovery((prev) => !prev)}>
        <Text style={styles.helpToggleText}>{showRecovery ? 'Hide PIN help' : 'Need PIN help?'}</Text>
      </TouchableOpacity>

      {showRecovery ? (
        <View style={styles.recoveryCard}>
          <Text style={styles.recoveryTitle}>Discreet recovery path</Text>
          <Text style={styles.recoveryText}>Use your saved recovery phrase and trusted-contact code to return to the main app without displaying sensitive details on screen.</Text>
          <TextInput
            style={styles.input}
            placeholder="Recovery phrase"
            placeholderTextColor="#A0AEC0"
            value={recoveryPhrase}
            onChangeText={setRecoveryPhrase}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            placeholder="Trusted contact code"
            placeholderTextColor="#A0AEC0"
            value={trustedContactCode}
            onChangeText={setTrustedContactCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.recoveryButton} onPress={handleRecovery}>
            <Text style={styles.recoveryButtonText}>Use recovery details</Text>
          </TouchableOpacity>
          <Text style={styles.supportHint}>If you still cannot get in, contact your worker or trusted support person for a manual reset.</Text>
          {recoveryMessage ? <Text style={styles.recoveryMessage}>{recoveryMessage}</Text> : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', justifyContent: 'flex-end', paddingBottom: 24 },
  displayArea: { paddingHorizontal: 28, paddingBottom: 20, alignItems: 'flex-end' },
  displayText: { color: '#FFFFFF', fontSize: 64, fontWeight: '300' },
  keypad: { gap: 12, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  numBtn: { backgroundColor: '#333333' },
  clearBtn: { backgroundColor: '#A5A5A5' },
  opBtn: { backgroundColor: '#FF9F0A' },
  btnText: { color: '#FFFFFF', fontSize: 30, fontWeight: '400' },
  setupCard: { backgroundColor: '#111827', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: '#374151', padding: 16, gap: 10 },
  setupTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  setupText: { color: '#D1D5DB', fontSize: 13, lineHeight: 20 },
  loader: { marginTop: 18 },
  helpToggle: { alignItems: 'center', marginTop: 18 },
  helpToggleText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  recoveryCard: { backgroundColor: '#111827', marginHorizontal: 16, marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: '#374151', padding: 16, gap: 10 },
  recoveryTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  recoveryText: { color: '#D1D5DB', fontSize: 13, lineHeight: 20 },
  input: { backgroundColor: '#1F2937', borderColor: '#374151', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: '#FFFFFF' },
  recoveryButton: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  recoveryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  supportHint: { color: '#9CA3AF', fontSize: 12 },
  recoveryMessage: { color: '#F9FAFB', fontSize: 13, lineHeight: 20 },
});
