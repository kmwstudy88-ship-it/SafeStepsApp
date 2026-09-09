module.exports = ({ config }) => ({
  ...config,
  name: "SafeStepsApp",
  slug: "safestepsapp",
  scheme: "safesteps",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: false,
  },
  ios: {
    supportsTablet: true,
  },
  web: {
    bundler: "metro",
  },
  extra: {
    safestepsApiUrl: process.env.EXPO_PUBLIC_SAFESTEPS_API_URL ?? "http://localhost:3000",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabasePublishableKey:
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_KEY ??
      "",
  },
});
