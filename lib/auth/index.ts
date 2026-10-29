export * from './roleBoundaryService';

export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000000';

export type SafeStepsAuthUser = {
  id: string;
  email: string;
};

export type SafeStepsAuthState = {
  initializing: boolean;
  user: SafeStepsAuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const defaultDemoUser: SafeStepsAuthUser = {
  id: 'local-parent',
  email: 'parent@safesteps.local',
};

export function useAuth(): SafeStepsAuthState {
  return {
    initializing: false,
    user: defaultDemoUser,
    async signIn() {},
    signInDemo() {},
    async signUp() {},
    async signOut() {},
  };
}
