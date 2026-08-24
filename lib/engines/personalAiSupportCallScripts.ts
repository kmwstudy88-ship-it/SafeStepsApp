export type SupportCallType = "crisis" | "dv" | "caseworker" | "trusted_adult" | "child_protection" | "substance_use" | "general";
export interface SupportCallScript { type: SupportCallType; safeLabel: string; openingScript: string; followUpQuestions: string[]; closingScript: string; monitoredDeviceVersion?: string; tags: string[] }

export const SUPPORT_CALL_SCRIPTS: Record<SupportCallType, SupportCallScript> = {
  crisis: { type: "crisis", safeLabel: "Support call", openingScript: "I need immediate support and help with the next step.", followUpQuestions: ["What should I do right now?", "What is the safest next step?"], closingScript: "Thank you. I will do that now.", monitoredDeviceVersion: "I need immediate help right now. Please keep this brief.", tags: ["critical", "short"] },
  dv: { type: "dv", safeLabel: "Safety help", openingScript: "I need confidential safety planning.", followUpQuestions: ["Is there a safer way to contact you?", "What is the safest next step right now?"], closingScript: "Thank you. I understand the next step.", monitoredDeviceVersion: "I need help with the next safe step and I cannot explain more on this device.", tags: ["dv", "monitored-device"] },
  caseworker: { type: "caseworker", safeLabel: "Next step", openingScript: "I need help with my case plan and the next concrete step.", followUpQuestions: ["What do you need from me next?", "What is the deadline?"], closingScript: "Thank you. I understand the next step.", tags: ["case-plan"] },
  trusted_adult: { type: "trusted_adult", safeLabel: "Trusted adult", openingScript: "I need you with me right now. Can you help me take the next safe step?", followUpQuestions: ["Can you come to me now?", "Can you help me call support?"], closingScript: "Thank you. Please stay with me.", tags: ["human-support"] },
  child_protection: { type: "child_protection", safeLabel: "Safety help", openingScript: "I need help with a child safety concern and the next step.", followUpQuestions: ["What information do you need right now?", "What should I do immediately to keep the child safe?"], closingScript: "Thank you. I will follow that step now.", monitoredDeviceVersion: "I need urgent support with a personal safety issue.", tags: ["child-safety"] },
  substance_use: { type: "substance_use", safeLabel: "Support call", openingScript: "I need support after a substance use issue and help with the safest next step.", followUpQuestions: ["How do I access support today?", "Does a sober adult need to take over care?"], closingScript: "Thank you. I will do the safest step now.", tags: ["aod", "sober-care"] },
  general: { type: "general", safeLabel: "Support call", openingScript: "Hello. I need support and help with the next step.", followUpQuestions: ["What should I do next?"], closingScript: "Thank you. I understand the next step.", tags: ["plain-language"] },
};

export function getSupportCallScript(type: SupportCallType, monitoredDevice = false) {
  const script = SUPPORT_CALL_SCRIPTS[type];
  return { ...script, visibleLabel: monitoredDevice ? script.safeLabel : type.replaceAll("_", " "), openingScript: monitoredDevice && script.monitoredDeviceVersion ? script.monitoredDeviceVersion : script.openingScript };
}
