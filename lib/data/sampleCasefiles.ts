export type SampleParentProfile = {
  parent_id: string;
  role: "mother" | "father" | "other";
  account_linked: boolean;
  identity: {
    name: string;
    legal_status: string;
    primary_responsibilities: string[];
  };
  protective_capacities: Record<string, string>;
  risk_indicators: Record<string, string>;
  parenting_behaviors: Record<string, string>;
  engagement: Record<string, string>;
};

export type SampleCasefile = {
  case_id: string;
  account_mode: "single" | "joint" | "dual";
  children: unknown[];
  parents: SampleParentProfile[];
};

export const sampleCasefiles: SampleCasefile[] = [
  {
    case_id: "CASE_001",
    account_mode: "joint",
    children: [],
    parents: [
      {
        parent_id: "MOTHER_001",
        role: "mother",
        account_linked: true,
        identity: {
          name: "",
          legal_status: "",
          primary_responsibilities: [],
        },
        protective_capacities: {
          emotional_regulation: "",
          supervision_quality: "",
          safety_planning_behavior: "",
          trauma_awareness: "",
        },
        risk_indicators: {
          coercive_control_patterns: "",
          substance_use_flags: "",
          mental_health_risk: "",
          exposure_to_violence: "",
        },
        parenting_behaviors: {
          attunement_examples: "",
          discipline_style: "",
          responsiveness_to_child_distress: "",
        },
        engagement: {
          attendance: "",
          homework_completion: "",
          reflective_insights: "",
        },
      },
      {
        parent_id: "FATHER_001",
        role: "father",
        account_linked: true,
        identity: {
          name: "",
          legal_status: "",
          primary_responsibilities: [],
        },
        protective_capacities: {
          emotional_regulation: "",
          supervision_quality: "",
          safety_planning_behavior: "",
          trauma_awareness: "",
        },
        risk_indicators: {
          coercive_control_patterns: "",
          substance_use_flags: "",
          mental_health_risk: "",
          exposure_to_violence: "",
        },
        parenting_behaviors: {
          attunement_examples: "",
          discipline_style: "",
          responsiveness_to_child_distress: "",
        },
        engagement: {
          attendance: "",
          homework_completion: "",
          reflective_insights: "",
        },
      },
    ],
  },
  {
    case_id: "CASE_002",
    account_mode: "dual",
    children: [],
    parents: [
      {
        parent_id: "MOTHER_002",
        role: "mother",
        account_linked: false,
        identity: {
          name: "",
          legal_status: "",
          primary_responsibilities: [],
        },
        protective_capacities: {
          emotional_regulation: "",
          supervision_quality: "",
          safety_planning_behavior: "",
          trauma_awareness: "",
        },
        risk_indicators: {
          coercive_control_patterns: "",
          substance_use_flags: "",
          mental_health_risk: "",
          exposure_to_violence: "",
        },
        parenting_behaviors: {
          attunement_examples: "",
          discipline_style: "",
          responsiveness_to_child_distress: "",
        },
        engagement: {
          attendance: "",
          homework_completion: "",
          reflective_insights: "",
        },
      },
      {
        parent_id: "FATHER_002",
        role: "father",
        account_linked: false,
        identity: {
          name: "",
          legal_status: "",
          primary_responsibilities: [],
        },
        protective_capacities: {
          emotional_regulation: "",
          supervision_quality: "",
          safety_planning_behavior: "",
          trauma_awareness: "",
        },
        risk_indicators: {
          coercive_control_patterns: "",
          substance_use_flags: "",
          mental_health_risk: "",
          exposure_to_violence: "",
        },
        parenting_behaviors: {
          attunement_examples: "",
          discipline_style: "",
          responsiveness_to_child_distress: "",
        },
        engagement: {
          attendance: "",
          homework_completion: "",
          reflective_insights: "",
        },
      },
    ],
  },
];

export function getSampleCasefile(caseId: string) {
  return sampleCasefiles.find((casefile) => casefile.case_id === caseId) ?? null;
}
