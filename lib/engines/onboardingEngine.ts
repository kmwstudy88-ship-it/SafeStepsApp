import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import { supabase } from "../supabase/client";
import {
  normaliseParentAccessibilityPreferences,
  normaliseParentOnboardingStatus,
  type ParentAccessibilityPreferences,
  type ParentOnboardingStatus,
} from "./onboardingPolicy";
import { isParentIntakeComplete } from "./parentIntakeEngine";

export const PARENT_PRIVACY_NOTICE_VERSION = "2026-07-29.1";
export const PARENT_TERMS_VERSION = "2026-07-29.1";
export const PARENT_INFORMATION_SHARING_VERSION = "2026-07-29.1";

export type ParentConsentChoices = {
  privacyNoticeRead: boolean;
  termsAccepted: boolean;
  shareProgressWithAssignedWorkers: boolean;
  includeChosenEvidenceInSharedReports: boolean;
};

async function requireCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign in to continue onboarding.");

  return data.user;
}

async function readProfileFields(userId: string) {
  const selectProfile = () =>
    supabase
      .from("profiles")
      .select("role, onboarding_status, accessibility_preferences, notification_preferences")
      .eq("id", userId)
      .maybeSingle();

  const firstAttempt = await selectProfile();
  if (firstAttempt.error) throw new Error(firstAttempt.error.message);
  if (firstAttempt.data) return firstAttempt.data;

  // The auth trigger can finish after the first app render. Create the minimum
  // parent profile idempotently so onboarding never dead-ends while waiting for it.
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: authData.user?.email ?? null,
      display_name: authData.user?.user_metadata?.display_name ?? authData.user?.email ?? "Parent",
      role: "parent",
      onboarding_status: "not_started",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (profileError) throw new Error(profileError.message);

  const retry = await selectProfile();
  if (retry.error) throw new Error(retry.error.message);
  if (!retry.data) throw new Error("Your SafeSteps parent profile could not be prepared.");

  return retry.data;
}

export async function loadParentOnboardingStatus(): Promise<ParentOnboardingStatus> {
  const user = await requireCurrentUser();
  const profile = await readProfileFields(user.id);
  if (profile.role !== "parent") return "onboarding_complete";

  const status = normaliseParentOnboardingStatus(profile.onboarding_status);

  if (status === "onboarding_complete") {
    return (await isParentIntakeComplete())
      ? "onboarding_complete"
      : "intake_in_progress";
  }

  if (status !== "account_protected") return status;

  const { data, error } = await supabase
    .from("parent_onboarding_consent_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("document_key", "terms_of_use")
    .eq("event_type", "accepted")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? "consent_recorded" : status;
}

export async function configureParentAccountProtection(input: {
  pin: string;
  preferBiometrics: boolean;
  hideNotificationContent: boolean;
}) {
  const user = await requireCurrentUser();
  const profile = await readProfileFields(user.id);
  const secureStoreAvailable = await SecureStore.isAvailableAsync();

  const biometricAvailable =
    secureStoreAvailable && SecureStore.canUseBiometricAuthentication();
  if (input.preferBiometrics && !biometricAvailable) {
    throw new Error("Biometric protection is not available on this device. Turn it off to continue.");
  }

  // Web and some preview clients do not expose a secure device keystore. Do not
  // store a PIN insecurely; record that native device protection is still pending
  // and allow the account onboarding flow to continue.
  if (!secureStoreAvailable) {
    const notificationPreferences = {
      ...(profile.notification_preferences ?? {}),
      hide_sensitive_content: input.hideNotificationContent,
      biometric_unlock_preferred: false,
      local_pin_configured: false,
      device_pin_pending: true,
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        notification_preferences: notificationPreferences,
        onboarding_status: "account_protected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw new Error(error.message);
    return { deviceProtectionPending: true };
  }

  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const salt = Array.from(saltBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${input.pin}`,
  );
  const pinRecord = JSON.stringify({ version: 1, salt, digest });

  try {
    await SecureStore.setItemAsync(`safesteps.parent.pin.${user.id}`, pinRecord, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      requireAuthentication: input.preferBiometrics,
      authenticationPrompt: "Verify your identity to protect SafeSteps",
    });
  } catch {
    throw new Error(
      input.preferBiometrics
        ? "Biometric PIN protection needs a SafeSteps device build. Turn biometrics off to continue in Expo Go."
        : "SafeSteps could not securely store the device PIN.",
    );
  }

  const notificationPreferences = {
    ...(profile.notification_preferences ?? {}),
    hide_sensitive_content: input.hideNotificationContent,
    biometric_unlock_preferred: input.preferBiometrics,
    local_pin_configured: true,
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      notification_preferences: notificationPreferences,
      onboarding_status: "account_protected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  return { deviceProtectionPending: false };
}

export async function recordParentOnboardingConsent(choices: ParentConsentChoices) {
  if (!choices.privacyNoticeRead || !choices.termsAccepted) {
    throw new Error("Read the privacy notice and accept the Terms of Use to continue.");
  }

  const user = await requireCurrentUser();
  const recordedAt = new Date().toISOString();
  const { error: consentError } = await supabase
    .from("parent_onboarding_consent_events")
    .insert([
      {
        user_id: user.id,
        event_type: "accepted",
        document_key: "privacy_parent_rights",
        document_version: PARENT_PRIVACY_NOTICE_VERSION,
        choices: { notice_read: true },
        client_recorded_at: recordedAt,
      },
      {
        user_id: user.id,
        event_type: "accepted",
        document_key: "terms_of_use",
        document_version: PARENT_TERMS_VERSION,
        choices: { terms_accepted: true },
        client_recorded_at: recordedAt,
      },
      {
        user_id: user.id,
        event_type: "accepted",
        document_key: "information_sharing",
        document_version: PARENT_INFORMATION_SHARING_VERSION,
        choices: {
          share_progress_with_assigned_workers: choices.shareProgressWithAssignedWorkers,
          include_chosen_evidence_in_shared_reports:
            choices.includeChosenEvidenceInSharedReports,
        },
        client_recorded_at: recordedAt,
      },
    ]);

  if (consentError) throw new Error(consentError.message);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      onboarding_status: "consent_recorded",
      updated_at: recordedAt,
    })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);
}

export async function loadParentAccessibilityPreferences() {
  const user = await requireCurrentUser();
  const profile = await readProfileFields(user.id);
  return normaliseParentAccessibilityPreferences(profile.accessibility_preferences);
}

export async function saveParentAccessibilityPreferences(
  preferences: ParentAccessibilityPreferences,
) {
  const user = await requireCurrentUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      accessibility_preferences: preferences,
      onboarding_status: "intake_in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}
