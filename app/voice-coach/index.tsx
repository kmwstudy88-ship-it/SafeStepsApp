import React from 'react';
import { useRouter } from 'expo-router';
import { VoiceCalmingCoach } from '../../lib/voice/VoiceCalmingCoach';

export default function VoiceCoachRoute() {
  const router = useRouter();
  return <VoiceCalmingCoach onExit={() => router.back()} />;
}
