import {
  consumeSupportGuideLimit,
  resetSupportGuideLimitsForTests,
} from "../../backend/middleware/supportGuideRateLimit.js";

beforeEach(() => resetSupportGuideLimitsForTests());

test("allows twelve requests per private user window", () => {
  const now = 1_000;
  for (let index = 0; index < 12; index += 1) {
    expect(consumeSupportGuideLimit("user-a", now).allowed).toBe(true);
  }
  expect(consumeSupportGuideLimit("user-a", now).allowed).toBe(false);
});

test("keeps limits isolated by authenticated user", () => {
  const now = 1_000;
  for (let index = 0; index < 13; index += 1) consumeSupportGuideLimit("user-a", now);
  expect(consumeSupportGuideLimit("user-b", now).allowed).toBe(true);
});

test("opens a new window after ten minutes", () => {
  for (let index = 0; index < 13; index += 1) consumeSupportGuideLimit("user-a", 1_000);
  expect(consumeSupportGuideLimit("user-a", 601_000).allowed).toBe(true);
});
