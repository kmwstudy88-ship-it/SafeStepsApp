import React from 'react';
import { useRouter } from 'expo-router';
import { LegalPortalScreen } from '../../lib/legal';

export default function LegalPortalRoute() {
  const router = useRouter();

  return (
    <LegalPortalScreen
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }}
    />
  );
}
