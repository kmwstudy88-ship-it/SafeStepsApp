import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { ChildAgeBand } from "./engines/parentingCoachEngine";

export type ParentingCoachProfile = {
  schemaVersion: 1;
  ageBand: ChildAgeBand;
  values: Array<"calm" | "connection" | "consistency" | "independence" | "culture">;
  helpfulApproaches: Array<"visual_cues" | "two_choices" | "movement_break" | "quiet_space" | "advance_warning">;
};

const STORAGE_KEY = "safesteps.parenting-coach.profile.v1";
let webSessionProfile: ParentingCoachProfile | null = null;

export async function loadParentingCoachProfile() {
  if (Platform.OS === "web") return { profile: webSessionProfile, storage: "session" as const };
  const stored = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!stored) return { profile: null, storage: "encrypted_device" as const };
  try {
    return { profile: JSON.parse(stored) as ParentingCoachProfile, storage: "encrypted_device" as const };
  } catch {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return { profile: null, storage: "encrypted_device" as const };
  }
}

export async function saveParentingCoachProfile(profile: ParentingCoachProfile) {
  const payload = JSON.stringify(profile);
  if (payload.length > 1800) throw new Error("The coaching preference profile is too large to store safely.");
  if (Platform.OS === "web") {
    webSessionProfile = profile;
    return "session" as const;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, payload);
  return "encrypted_device" as const;
}

export async function clearParentingCoachProfile() {
  webSessionProfile = null;
  if (Platform.OS !== "web") await SecureStore.deleteItemAsync(STORAGE_KEY);
}
