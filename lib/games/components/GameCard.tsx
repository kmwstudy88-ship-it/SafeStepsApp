import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function GameCard({ title, children }: Props) {
  return (
    <View style={{ margin: 16, padding: 20, backgroundColor: '#ffffff', borderRadius: 12, elevation: 3 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  );
}
