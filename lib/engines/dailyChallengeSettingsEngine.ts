import AsyncStorage from "@react-native-async-storage/async-storage";

export type DailyChallengeSettings = {
  dailyReminder: boolean;
  eveningCheckIn: boolean;
  streakAlerts: boolean;
  paused: boolean;
};

const DAILY_CHALLENGE_SETTINGS_KEY = "safesteps.parent.dailyChallengeSettings.v1";

export const defaultDailyChallengeSettings: DailyChallengeSettings = {
  dailyReminder: true,
  eveningCheckIn: true,
  streakAlerts: true,
  paused: false,
};

export function normaliseDailyChallengeSettings(value: unknown): DailyChallengeSettings {
  const input =
    value && typeof value === "object"
      ? (value as Partial<DailyChallengeSettings>)
      : {};

  return {
    dailyReminder:
      typeof input.dailyReminder === "boolean"
        ? input.dailyReminder
        : defaultDailyChallengeSettings.dailyReminder,
    eveningCheckIn:
      typeof input.eveningCheckIn === "boolean"
        ? input.eveningCheckIn
        : defaultDailyChallengeSettings.eveningCheckIn,
    streakAlerts:
      typeof input.streakAlerts === "boolean"
        ? input.streakAlerts
        : defaultDailyChallengeSettings.streakAlerts,
    paused:
      typeof input.paused === "boolean"
        ? input.paused
        : defaultDailyChallengeSettings.paused,
  };
}

export async function loadDailyChallengeSettings() {
  const raw = await AsyncStorage.getItem(DAILY_CHALLENGE_SETTINGS_KEY);

  if (!raw) {
    return defaultDailyChallengeSettings;
  }

  try {
    return normaliseDailyChallengeSettings(JSON.parse(raw));
  } catch {
    return defaultDailyChallengeSettings;
  }
}

export async function saveDailyChallengeSettings(settings: DailyChallengeSettings) {
  const normalised = normaliseDailyChallengeSettings(settings);
  await AsyncStorage.setItem(DAILY_CHALLENGE_SETTINGS_KEY, JSON.stringify(normalised));
  return normalised;
}
