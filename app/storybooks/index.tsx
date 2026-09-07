import React from 'react';
import { useRouter } from 'expo-router';
import { StorybookReaderScreen } from '../../lib/storybooks/StorybookReaderScreen';

export default function StorybooksRoute() {
  const router = useRouter();
  return <StorybookReaderScreen onFinish={() => router.back()} />;
}
