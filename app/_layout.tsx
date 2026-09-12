import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#102033',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F7FAFC' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'SafeSteps' }} />
        <Stack.Screen name="scenarios/index" options={{ title: 'Roleplay Simulation' }} />
        <Stack.Screen name="storybooks/index" options={{ title: 'Interactive Storybooks' }} />
        <Stack.Screen name="assessments/index" options={{ title: 'Clinical Assessments' }} />
        <Stack.Screen name="evidence/index" options={{ title: 'Evidence Vault' }} />
        <Stack.Screen name="reports/index" options={{ title: 'Court Reports' }} />
        <Stack.Screen name="cases/index" options={{ title: 'Case List' }} />
        <Stack.Screen name="cases/[id]" options={{ title: 'Case Detail' }} />
        <Stack.Screen name="dashboard/supervisor" options={{ title: 'Supervisor Dashboard' }} />
        <Stack.Screen name="documents/[id]" options={{ title: 'Document Viewer' }} />
        <Stack.Screen name="voice-coach/index" options={{ title: 'Voice & Breathing' }} />
        <Stack.Screen name="sos/index" options={{ title: 'SOS Calming' }} />
        <Stack.Screen name="fairness/index" options={{ title: 'Fairness Analyzer' }} />
        <Stack.Screen name="contact-visit/index" options={{ title: 'Contact Visit Companion' }} />
        <Stack.Screen name="discreet/index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
