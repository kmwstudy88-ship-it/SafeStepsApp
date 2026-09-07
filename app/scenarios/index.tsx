import React from 'react';
import { useRouter } from 'expo-router';
import { ScenarioSimulatorScreen } from '../../lib/scenarios/ScenarioSimulatorScreen';

export default function ScenariosRoute() {
  const router = useRouter();
  return <ScenarioSimulatorScreen onExit={() => router.back()} />;
}
