// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      "backend/**",
      "frontend/**",
      "src/components/**",
      "src/core/**",
      "src/config/**",
      "src/curriculum/**",
      "src/prisma/**",
      "src/safesteps/**",
      "src/screens/**",
      "src/server.ts",
      "safesteps/**",
      "utils/**",
      "page.tsx",
      "App.tsx",
      "dashboard.tsx",
      "settings.tsx",
      "LessonSection.tsx",
      "app/prismaClient.js",
    ],
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["app/programs/lesson.tsx"],
    rules: {
      "react-hooks/static-components": "off",
      "react/no-unescaped-entities": "off",
    },
  }
]);
