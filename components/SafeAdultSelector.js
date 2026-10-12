import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function SafeAdultSelector({ onSelect }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Who is a safe adult you trust?</Text>
      <TextInput
        placeholder='Type name...'
        onChangeText={onSelect}
        style={{ borderWidth: 1, padding: 10, marginTop: 10 }}
      />
    </View>
  );
}
