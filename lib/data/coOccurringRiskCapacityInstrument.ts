export type AssessmentStream = "victim_survivor" | "person_using_violence";
export type ResponseLevel = "not_identified" | "possible" | "present" | "critical";

export type CoOccurringInstrumentItem = {
  id: string;
  domain: "aod" | "mental_health" | "dfv" | "capacity";
  prompt: string;
  guidance: string;
  criticalWhen: readonly ResponseLevel[];
};

export const CO_OCCURRING_INSTRUMENT_ID = "co-occurring-aod-mh-dfv-risk-capacity";
export const CO_OCCURRING_INSTRUMENT_VERSION = "1.0.0";

const sharedCapacity: readonly CoOccurringInstrumentItem[] = [
  {
    id: "capacity-immediate-plan",
    domain: "capacity",
    prompt: "Capacity to understand, retain and act on the immediate safety and support plan",
    guidance: "Record observed or corroborated capacity, accommodations used, and uncertainty.",
    criticalWhen: ["critical"],
  },
  {
    id: "capacity-service-engagement",
    domain: "capacity",
    prompt: "Current capacity to engage safely with AOD, mental-health and DFV supports",
    guidance: "Do not equate attendance, disclosure, relapse or distress with readiness.",
    criticalWhen: [],
  },
];

export const coOccurringItems: Record<AssessmentStream, readonly CoOccurringInstrumentItem[]> = {
  victim_survivor: [
    {
      id: "vs-aod-overdose-withdrawal",
      domain: "aod",
      prompt: "Overdose, severe withdrawal or substance-related medical risk",
      guidance: "Consider coercive substance use, medication access and barriers to care.",
      criticalWhen: ["critical"],
    },
    {
      id: "vs-mh-acute-distress",
      domain: "mental_health",
      prompt: "Acute distress, suicidality, psychosis or inability to meet immediate needs",
      guidance: "Record the person's account and clinical evidence separately.",
      criticalWhen: ["critical"],
    },
    {
      id: "vs-dfv-imminent-harm",
      domain: "dfv",
      prompt: "Imminent DFV harm, stalking, strangulation, weapons, threats or escalating control",
      guidance: "Never disclose this stream to the person using violence through this workflow.",
      criticalWhen: ["present", "critical"],
    },
    ...sharedCapacity,
  ],
  person_using_violence: [
    {
      id: "puv-aod-disinhibition",
      domain: "aod",
      prompt: "AOD use linked with escalation, disinhibition, threats or breached conditions",
      guidance: "AOD use does not cause DFV; document choices, patterns and accountability.",
      criticalWhen: ["critical"],
    },
    {
      id: "puv-mh-escalation",
      domain: "mental_health",
      prompt: "Acute mental-health concerns affecting immediate risk management",
      guidance: "Mental illness does not cause DFV; keep clinical need and responsibility distinct.",
      criticalWhen: ["critical"],
    },
    {
      id: "puv-dfv-current-pattern",
      domain: "dfv",
      prompt: "Current coercive control, surveillance, threats, stalking, strangulation or weapon access",
      guidance: "Use victim-survivor-informed and corroborated evidence without exposing protected material.",
      criticalWhen: ["present", "critical"],
    },
    ...sharedCapacity,
  ],
};

export const responseLevels: readonly { value: ResponseLevel; label: string }[] = [
  { value: "not_identified", label: "Not identified" },
  { value: "possible", label: "Possible / unclear" },
  { value: "present", label: "Present" },
  { value: "critical", label: "Critical / immediate" },
];

export function criticalOverridesFor(
  stream: AssessmentStream,
  responses: Record<string, ResponseLevel>,
) {
  return coOccurringItems[stream]
    .filter((item) => item.criticalWhen.includes(responses[item.id]))
    .map((item) => ({ itemId: item.id, domain: item.domain, prompt: item.prompt, response: responses[item.id] }));
}
