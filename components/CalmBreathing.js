import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

export default function CalmBreathing() {
  const [phase, setPhase] = useState('Inhale');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p === 'Inhale' ? 'Exhale' : 'Inhale'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 30 }}>{phase}</Text>
    </View>
  );
}
