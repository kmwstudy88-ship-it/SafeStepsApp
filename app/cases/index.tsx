import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { supabase } from '../../lib/supabaseClient';

type CaseRow = {
  id: string;
  title: string;
  status: string;
  updated_at?: string;
};

export default function CaseListScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [appUserId, setAppUserId] = useState<string | null>(null);

  const isSignedIn = useMemo(() => Boolean(authUserId), [authUserId]);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const userId = sessionData.session?.user?.id ?? null;
      setAuthUserId(userId);

      if (!userId) {
        setCases([]);
        setAppUserId(null);
        setLoading(false);
        return;
      }

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (userError) throw userError;
      const mappedUserId = userRow?.id ?? null;
      setAppUserId(mappedUserId);

      if (!mappedUserId) {
        setCases([]);
        setError('Your authenticated account is not yet linked in the users table. Contact an administrator.');
      } else {
        const { data: assignmentRows, error: assignmentError } = await supabase
          .from('case_assignments')
          .select('case_id')
          .eq('user_id', mappedUserId)
          .eq('is_active', true);

        if (assignmentError) throw assignmentError;

        const assignedCaseIds = (assignmentRows || []).map((row: any) => row.case_id).filter(Boolean);
        if (!assignedCaseIds.length) {
          setCases([]);
        } else {
          const { data: caseRows, error: caseError } = await supabase
            .from('cases')
            .select('id,title,status,updated_at')
            .in('id', assignedCaseIds)
            .order('updated_at', { ascending: false });
          if (caseError) throw caseError;
          setCases((caseRows || []) as CaseRow[]);
        }
      }
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load assigned cases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    const channel = supabase
      .channel('case-management-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_assignments' }, loadCases)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, loadCases)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analyses' }, loadCases)
      .subscribe();

    const authSubscription = supabase.auth.onAuthStateChange(() => {
      loadCases();
    });

    return () => {
      supabase.removeChannel(channel);
      authSubscription.data.subscription.unsubscribe();
    };
  }, [loadCases]);

  async function signInWithPassword() {
    setAuthenticating(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      await loadCases();
    } catch (signInError: any) {
      setError(signInError?.message || 'Sign in failed');
    } finally {
      setAuthenticating(false);
    }
  }

  async function signInWithGoogle() {
    setAuthenticating(true);
    setError(null);
    try {
      const redirectTo = Linking.createURL('/cases');
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
    } catch (oauthError: any) {
      setError(oauthError?.message || 'Google sign-in failed');
    } finally {
      setAuthenticating(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await loadCases();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>CASE MANAGEMENT</Text>
        <Text style={styles.title}>Assigned Cases</Text>
        <Text style={styles.subtitle}>Load case assignments from Supabase and keep status updates in real time.</Text>

        {!isSignedIn ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in to load assignments</Text>
            <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.button} onPress={signInWithPassword} disabled={authenticating}>
              <Text style={styles.buttonText}>{authenticating ? 'Signing in...' : 'Sign in with Email'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={signInWithGoogle} disabled={authenticating}>
              <Text style={styles.secondaryButtonText}>Sign in with Google OAuth</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Authenticated session</Text>
            <Text style={styles.meta}>Auth user: {authUserId}</Text>
            <Text style={styles.meta}>App user: {appUserId || 'Not mapped in users table'}</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={signOut}>
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? <ActivityIndicator size="large" color="#208AEF" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {cases.map((caseItem) => (
          <TouchableOpacity key={caseItem.id} style={styles.caseCard} onPress={() => router.push(`/cases/${caseItem.id}` as any)}>
            <View>
              <Text style={styles.caseTitle}>{caseItem.title || 'Untitled case'}</Text>
              <Text style={styles.caseMeta}>Status: {caseItem.status || 'unknown'}</Text>
              <Text style={styles.caseMeta}>Updated: {caseItem.updated_at || 'n/a'}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {!loading && !cases.length && isSignedIn ? <Text style={styles.meta}>No case assignments available for this user yet.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 14 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', color: '#102033' },
  subtitle: { color: '#4A5568' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderColor: '#E2E8F0', borderWidth: 1, padding: 14, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  input: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10 },
  button: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#EDF2F7', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#2D3748', fontWeight: '700' },
  caseCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderColor: '#E2E8F0', borderWidth: 1, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  caseTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  caseMeta: { fontSize: 12, color: '#718096', marginTop: 2 },
  chevron: { fontSize: 24, color: '#A0AEC0' },
  meta: { color: '#4A5568', fontSize: 12 },
  error: { color: '#C53030', fontSize: 13 },
});
