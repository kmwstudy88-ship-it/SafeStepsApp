module.exports = ({ config }) => ({
  ...config,
  name: "SafeStepsApp",
  slug: "safestepsapp",
  scheme: "safesteps",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  plugins: ["expo-router", "expo-secure-store"],
  experiments: {
    typedRoutes: false,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "au.com.safesteps.app",
    infoPlist: {
      NSCameraUsageDescription: "SafeSteps requires camera access for tamper-proof live capture of required case plan milestones and home safety verification.",
      NSPhotoLibraryUsageDescription: "SafeSteps requires photo library access to upload documentation and completion certificates.",
      NSMicrophoneUsageDescription: "SafeSteps requires microphone access for audio reflections and telehealth support sessions.",
    },
  },
  android: {
    package: "au.com.safesteps.app",
    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
    },
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
    ],
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
