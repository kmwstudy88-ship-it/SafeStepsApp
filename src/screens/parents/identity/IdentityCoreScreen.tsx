import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import metadata from '../../../data/parents/identity/parent_identity_background.json';

const IdentityCoreScreen = () => {
  const coreSection = (metadata as any).sections.find(
    (s: any) => s.section_id === 'identity_core'
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
        Parent Identity – Core
      </Text>
      {coreSection?.items?.map((item: any) => (
        <View key={item.id} style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 16 }}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default IdentityCoreScreen;
