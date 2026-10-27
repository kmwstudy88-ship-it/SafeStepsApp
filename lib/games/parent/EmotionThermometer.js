import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

export default function EmotionThermometer() {
  const [level, setLevel] = useState(0);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>How are you feeling right now?</Text>
      <Slider
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={level}
        onValueChange={setLevel}
      />
      <Text style={{ marginTop: 12 }}>Emotion level: {level}</Text>
    </View>
  );
}
