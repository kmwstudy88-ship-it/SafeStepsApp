import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabaseClient';

export default function ParentWelcomeScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(sessionError.message);
        setSession(data.session);
        setCheckingSession(false);
      })
      .catch((sessionError: unknown) => {
        if (!active) return;
        setError(sessionError instanceof Error ? sessionError.message : 'Unable to check sign-in.');
        setCheckingSession(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
      setError(null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    setAuthenticating(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      setPassword('');
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in.');
    } finally {
      setAuthenticating(false);
    }
  }

  async function signOut() {
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(signOutError.message);
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>PARENT &amp; GUARDIAN SPACE</Text>
        <Text style={styles.title}>A place to take your next step</Text>
        <Text style={styles.intro}>
          SafeSteps is being prepared to help parents and guardians understand their support plan and
          keep track of agreed next steps.
        </Text>

        {checkingSession ? (
          <ActivityIndicator size="large" color="#208AEF" accessibilityLabel="Checking sign-in" />
        ) : session ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>You’re signed in</Text>
            <Text style={styles.body}>{session.user.email || 'Your SafeSteps account'}</Text>
            <Text style={styles.notice}>
              Parent case access is not connected to this screen yet. No case information is being
              shown, and signing in here does not record consent.
            </Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={signOut}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in to your account</Text>
            <Text style={styles.body}>
              Use the email and password provided for your SafeSteps account. New account setup is
              not available here.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              editable={!authenticating}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete="password"
              secureTextEntry
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              editable={!authenticating}
            />
            <TouchableOpacity
              style={[styles.button, authenticating && styles.buttonDisabled]}
              onPress={signIn}
              disabled={authenticating || !email.trim() || !password}
              accessibilityRole="button"
              accessibilityState={{ disabled: authenticating || !email.trim() || !password, busy: authenticating }}
            >
              <Text style={styles.buttonText}>{authenticating ? 'Signing in...' : 'Sign in'}</Text>
            </TouchableOpacity>
            <Text style={styles.notice}>
              This sign-in screen does not collect privacy, terms, or information-sharing consent.
            </Text>
          </View>
        )}

        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4FE',
    color: '#208AEF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: '800',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#102033', lineHeight: 34 },
  intro: { color: '#4A5568', fontSize: 16, lineHeight: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C' },
  body: { color: '#4A5568', fontSize: 14, lineHeight: 21 },
  notice: {
    color: '#5B4B21',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    backgroundColor: '#F8FCFC',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#1A202C',
  },
  button: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryButton: {
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#2D3748', fontWeight: '700' },
  error: { color: '#C53030', fontSize: 13 },
});
