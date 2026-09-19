import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';

const DEFAULT_PIN = '7233';
const RECOVERY_PHRASE = 'BLUEBIRD';

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

  const handleDigit = (digit: string) => {
    setCalcDisplay((prev) => (prev === '0' ? digit : prev + digit));
    const nextPin = pinEntry + digit;
    setPinEntry(nextPin);

    if (nextPin.endsWith(DEFAULT_PIN)) {
      onUnlock?.();
    }
  };

  const handleClear = () => {
    setCalcDisplay('0');
    setPinEntry('');
  };

  const handleRecovery = () => {
    const normalizedPhrase = recoveryPhrase.trim().toUpperCase();
    const normalizedCode = trustedContactCode.trim().toUpperCase();

    if (normalizedPhrase === RECOVERY_PHRASE && normalizedCode === 'SJ-24') {
      setRecoveryMessage('Recovery confirmed. Your disguise PIN resets to 7233 until you change it in Settings & Trusted Contacts.');
      setPinEntry('');
      setCalcDisplay('0');
      return;
    }

    setRecoveryMessage('Recovery details did not match. Move to a safer place and contact your trusted support person or worker for a manual reset.');
  };

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
              >
                <Text style={styles.btnText}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.helpToggle} onPress={() => setShowRecovery((prev) => !prev)}>
        <Text style={styles.helpToggleText}>{showRecovery ? 'Hide PIN help' : 'Need PIN help?'}</Text>
      </TouchableOpacity>

      {showRecovery ? (
        <View style={styles.recoveryCard}>
          <Text style={styles.recoveryTitle}>Discreet recovery path</Text>
          <Text style={styles.recoveryText}>If you cannot remember the PIN, use your stored recovery phrase and trusted-contact code to reset temporary access without exposing the main app.</Text>
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
            <Text style={styles.recoveryButtonText}>Reset disguise PIN</Text>
          </TouchableOpacity>
          <Text style={styles.supportHint}>Demo recovery values: phrase BLUEBIRD, contact code SJ-24.</Text>
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
