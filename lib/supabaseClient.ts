import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabasePublishableKey ??
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  Constants.expoConfig?.extra?.supabaseKey ??
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY;
const isServerRender = typeof window === "undefined";
const isTest = process.env.NODE_ENV === "test";

const serverStorage = {
  getItem() {
    return Promise.resolve(null);
  },
  setItem() {
    return Promise.resolve();
  },
  removeItem() {
    return Promise.resolve();
  },
};

function getAuthStorage() {
  if (isServerRender || isTest) {
    return serverStorage;
  }

  return require("@react-native-async-storage/async-storage").default;
}

function makeMissingClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({
        data: { user: null },
        error: new Error("Supabase is not configured for this environment."),
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: new Error("Supabase is not configured for this environment."),
      }),
      resetPasswordForEmail: async () => ({
        data: {},
        error: new Error("Supabase is not configured for this environment."),
      }),
      setSession: async () => ({
        data: { user: null, session: null },
        error: new Error("Supabase is not configured for this environment."),
      }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({
        data: { user: null },
        error: new Error("Supabase is not configured for this environment."),
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: new Error("Supabase is not configured for this environment."),
      }),
    },
    from: () => {
      throw new Error(
        "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY to your .env file.",
      );
    },
  } as unknown as SupabaseClient;
}

if ((!supabaseUrl || !supabaseAnonKey) && !isTest) {
  throw new Error(
    "Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY.",
  );
}

export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: !isServerRender && !isTest,
          autoRefreshToken: !isServerRender && !isTest,
          detectSessionInUrl: false,
          storage: getAuthStorage(),
        },
      })
    : makeMissingClient();
