import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';

export function DiscreetModeScreen({
  onUnlock,
}: {
  onUnlock?: () => void;
}) {
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [pinEntry, setPinEntry] = useState('');

  const handleDigit = (digit: string) => {
    setCalcDisplay((prev) => (prev === '0' ? digit : prev + digit));
    const nextPin = pinEntry + digit;
    setPinEntry(nextPin);

    // Default unlock code: 7233 ("SAFE")
    if (nextPin.endsWith('7233')) {
      onUnlock?.();
    }
  };

  const handleClear = () => {
    setCalcDisplay('0');
    setPinEntry('');
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
});
