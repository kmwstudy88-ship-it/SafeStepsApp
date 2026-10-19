import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

export function VoiceCalmingCoach({ onExit }: { onExit?: () => void }) {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [activeCycle, setActiveCycle] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === 'Inhale') {
          setPhase('Hold');
          return 4;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 4;
        } else if (phase === 'Exhale') {
          setPhase('Pause');
          return 4;
        } else {
          setPhase('Inhale');
          setActiveCycle((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isRunning]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.badge}>OPTIONAL BREATHING EXERCISE</Text>
        <Text style={styles.title}>Box breathing guide</Text>
        <Text style={styles.subtitle}>
        If comfortable, breathe in, hold, breathe out, and pause for four seconds each. Keep your breathing natural if counting does not feel right.
        </Text>
        <Text style={styles.safetyNote}>This is a simple timing guide, not medical care or crisis support. Stop if you feel dizzy, short of breath, or more distressed.</Text>

        <View style={[styles.breathRing, phase === 'Inhale' ? styles.ringExpand : phase === 'Exhale' ? styles.ringContract : styles.ringHold]}>
          <Text style={styles.phaseText}>{phase}</Text>
          <Text style={styles.timerNumber}>{secondsRemaining}s</Text>
        </View>

        <Text style={styles.cycleLabel}>Completed cycles: {activeCycle}</Text>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsRunning(!isRunning)}
          >
            <Text style={styles.toggleText}>{isRunning ? 'Pause' : 'Resume'}</Text>
          </TouchableOpacity>
          {onExit && (
            <TouchableOpacity style={styles.exitButton} onPress={onExit}>
              <Text style={styles.exitText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#102033' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  badge: { backgroundColor: 'rgba(66, 169, 157, 0.2)', color: '#42A99D', fontSize: 12, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', maxWidth: 300, lineHeight: 20 },
  safetyNote: { fontSize: 12, color: '#CBD5E0', textAlign: 'center', maxWidth: 320, lineHeight: 18 },
  breathRing: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, borderColor: '#42A99D', alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  ringExpand: { borderColor: '#42A99D', backgroundColor: 'rgba(66, 169, 157, 0.15)' },
  ringHold: { borderColor: '#ECC94B', backgroundColor: 'rgba(236, 201, 75, 0.15)' },
  ringContract: { borderColor: '#3182CE', backgroundColor: 'rgba(49, 130, 206, 0.15)' },
  phaseText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  timerNumber: { fontSize: 40, fontWeight: '800', color: '#E2E8F0', marginTop: 4 },
  cycleLabel: { fontSize: 14, color: '#CBD5E0' },
  controlsRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  toggleButton: { backgroundColor: '#42A99D', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  toggleText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  exitButton: { backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  exitText: { color: '#E2E8F0', fontWeight: '600', fontSize: 16 },
});
