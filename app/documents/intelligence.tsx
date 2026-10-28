import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ExtractedIntelligenceScreen } from '../../lib/documents';

export default function DocumentIntelligenceRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ caseId?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <ExtractedIntelligenceScreen
        caseId={params.caseId || 'demo_case'}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
