export const safestepsLessonTheme = {
  colors: {
    background: "#FFFCFA",
    navy: "#17245B",
    purple: "#7453A6",
    purpleDark: "#49317F",
    lavender: "#D9C8EC",
    teal: "#22AEB5",
    aqua: "#A8E0E8",
    pink: "#E99BC2",
    peach: "#F4B48E",
    white: "#FFFFFF",
    card: "rgba(255,255,255,0.94)",
    border: "rgba(126, 91, 171, 0.25)",
    muted: "#74758A",
    line: "#D8CDE7",
  },

  radius: {
    small: 14,
    medium: 22,
    large: 32,
    pill: 999,
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },

  shadow: {
    boxShadow: "0 6px 12px rgba(92, 67, 126, 0.12)",
    elevation: 5,
  },
} as const;

export type SafeStepsLessonWatercolorPalette = {
  wash: string;
  washStrong: string;
  accent: string;
  accentDark: string;
  highlight: string;
};

export const safestepsLessonWatercolorPalettes: SafeStepsLessonWatercolorPalette[] = [
  {
    wash: "#F6EAF8",
    washStrong: "#D9C8EC",
    accent: "#7453A6",
    accentDark: "#49317F",
    highlight: "#F4B48E",
  },
  {
    wash: "#EAF8FA",
    washStrong: "#A8E0E8",
    accent: "#22AEB5",
    accentDark: "#176B78",
    highlight: "#E99BC2",
  },
  {
    wash: "#FFF0E8",
    washStrong: "#F4B48E",
    accent: "#D66F7D",
    accentDark: "#874256",
    highlight: "#D9C8EC",
  },
  {
    wash: "#F8EDF3",
    washStrong: "#E99BC2",
    accent: "#B85688",
    accentDark: "#74365E",
    highlight: "#A8E0E8",
  },
  {
    wash: "#F0EFFB",
    washStrong: "#C8C7F0",
    accent: "#6267B2",
    accentDark: "#363B83",
    highlight: "#F4B48E",
  },
];

export function getSafeStepsLessonWatercolorPalette(seed: string) {
  const hash = Array.from(seed || "safesteps").reduce((total, character) => total + character.charCodeAt(0), 0);
  return safestepsLessonWatercolorPalettes[hash % safestepsLessonWatercolorPalettes.length];
}
