import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const emotions = ['Happy', 'Sad', 'Angry', 'Scared', 'Calm'];

export default function EmotionPicker({ onSelect }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>How are you feeling?</Text>
      {emotions.map((e) => (
        <TouchableOpacity key={e} onPress={() => onSelect(e)}>
          <Text style={{ padding: 10, fontSize: 18 }}>{e}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
