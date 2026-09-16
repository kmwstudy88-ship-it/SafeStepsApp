// App.js
import React from 'react';
import AuthProvider from './src/auth/AuthProvider';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
