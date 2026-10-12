export type ShareSetting = "family_only" | "worker_supported" | "contact_visit";

export type PrivacyRecord = {
  privacy?: ShareSetting;
  hiddenFromWorker?: boolean;
};

export function applyPrivacy<T extends PrivacyRecord>(
  record: T,
  sessionPrivacy: ShareSetting = "family_only",
  shareSetting: ShareSetting = sessionPrivacy,
): T {
  return {
    ...record,
    privacy: shareSetting,
    hiddenFromWorker: shareSetting === "family_only",
  };
}
