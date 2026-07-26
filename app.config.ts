import "dotenv/config";

export default {
  expo: {
    name: "SafeSteps",
    slug: "safesteps",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "safesteps",
    userInterfaceStyle: "automatic",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_KEY ??
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.SUPABASE_PUBLISHABLE_KEY,
      router: {},
      eas: {
        projectId: "1d2466ca-e4d4-4438-a33a-ca623d562953",
      },
    },
    ios: {
      bundleIdentifier: "com.safes.safesteps",
      icon: "./assets/icon.png",
    },
    android: {
      package: "com.safes.safesteps",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-sharing",
      "expo-video",
      [
        "expo-image-picker",
        {
          photosPermission: "SafeSteps uses your photos so you can attach evidence to your progress record.",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/splash-icon.png",
            imageWidth: 76,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
