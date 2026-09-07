import React from 'react';
import { useRouter } from 'expo-router';
import { DiscreetModeScreen } from '../../lib/privacy/DiscreetModeScreen';

export default function DiscreetRoute() {
  const router = useRouter();
  return <DiscreetModeScreen onUnlock={() => router.replace('/')} />;
}
