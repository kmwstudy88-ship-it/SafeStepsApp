import {
  getPasswordResetValidationError,
  parseAuthRecoveryUrl,
} from "../lib/engines/authRecoveryPolicy";

describe("password recovery policy", () => {
  test("reads recovery tokens from a mobile deep-link fragment", () => {
    expect(
      parseAuthRecoveryUrl("safesteps://reset-password#access_token=access-1&refresh_token=refresh-1&type=recovery"),
    ).toEqual({ access_token: "access-1", refresh_token: "refresh-1" });
  });

  test("reads recovery tokens from query parameters", () => {
    expect(
      parseAuthRecoveryUrl("https://app.example/reset-password?access_token=access-2&refresh_token=refresh-2"),
    ).toEqual({ access_token: "access-2", refresh_token: "refresh-2" });
  });

  test("rejects links without a complete session", () => {
    expect(parseAuthRecoveryUrl("safesteps://reset-password?type=recovery")).toBeNull();
  });

  test("surfaces provider errors from expired links", () => {
    expect(() =>
      parseAuthRecoveryUrl("safesteps://reset-password#error_description=Link%20has%20expired"),
    ).toThrow("Link has expired");
  });

  test("validates password length and matching confirmation", () => {
    expect(getPasswordResetValidationError("short", "short")).toContain("8 characters");
    expect(getPasswordResetValidationError("long-enough", "different")).toBe("The passwords do not match.");
    expect(getPasswordResetValidationError("long-enough", "long-enough")).toBeNull();
  });
});
