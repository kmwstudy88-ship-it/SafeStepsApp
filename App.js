import React from 'react';
import { SafeStepsProvider } from './src/safesteps/context';
import { Stack } from 'expo-router';

export default function App() {
  return (
    <SafeStepsProvider>
      <Stack />
    </SafeStepsProvider>
  );
}