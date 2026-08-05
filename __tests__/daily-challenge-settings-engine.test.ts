jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  defaultDailyChallengeSettings,
  loadDailyChallengeSettings,
  normaliseDailyChallengeSettings,
  saveDailyChallengeSettings,
} from "../lib/engines/dailyChallengeSettingsEngine";

describe("daily challenge settings engine", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test("returns defaults when no settings are saved", async () => {
    await expect(loadDailyChallengeSettings()).resolves.toEqual(defaultDailyChallengeSettings);
  });

  test("normalises partial or invalid saved settings", () => {
    expect(
      normaliseDailyChallengeSettings({
        dailyReminder: false,
        eveningCheckIn: "yes",
        streakAlerts: false,
      }),
    ).toEqual({
      dailyReminder: false,
      eveningCheckIn: true,
      streakAlerts: false,
      paused: false,
    });
  });

  test("persists challenge settings on the device", async () => {
    const saved = await saveDailyChallengeSettings({
      dailyReminder: false,
      eveningCheckIn: false,
      streakAlerts: true,
      paused: true,
    });

    expect(saved).toEqual({
      dailyReminder: false,
      eveningCheckIn: false,
      streakAlerts: true,
      paused: true,
    });
    await expect(loadDailyChallengeSettings()).resolves.toEqual(saved);
  });
});
