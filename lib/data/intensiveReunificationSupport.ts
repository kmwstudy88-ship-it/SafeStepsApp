export type IntensiveProgramId =
  | "newpin"
  | "hopes"
  | "pfr"
  | "walking-family"
  | "abc-ec"
  | "pcit"
  | "parent-partner";

export type ReunificationTaskId =
  | "kinship_mapping"
  | "graduated_contact"
  | "service_coordination"
  | "coparenting_deescalation";

export type ReunificationChallengeId =
  | "systemic_overload"
  | "parent_child_alienation"
  | "trauma_backslide"
  | "poverty_neglect_conflation"
  | "post_reunification_cliff";

export type SafetyVerificationId =
  | "functional_safety_plan"
  | "boundary_management"
  | "stable_living_environment"
  | "post_reunification_support";

export type IntensiveReunificationProgram = {
  id: IntensiveProgramId;
  name: string;
  deliveryModel: string;
  duration: string;
  targetAgeRange: string;
  safeStepsUse: string;
  coreComponents: string[];
  evidencePrompts: string[];
};

export type ReunificationTaskDefinition = {
  id: ReunificationTaskId;
  title: string;
  purpose: string;
  requiredEvidence: string[];
  reviewQuestions: string[];
};

export type ReunificationChallengeDefinition = {
  id: ReunificationChallengeId;
  title: string;
  riskImpact: string;
  mitigationStrategies: string[];
  warningSignals: string[];
};

export type SafetyVerificationDefinition = {
  id: SafetyVerificationId;
  title: string;
  purpose: string;
  requiredChecks: string[];
  missingEvidenceWarning: string;
};

export type ContactStage = "supervised" | "community" | "overnight" | "trial_at_home" | "full_return";

export const intensiveReunificationPrograms: IntensiveReunificationProgram[] = [
  {
    id: "newpin",
    name: "Newpin-informed attachment repair support",
    deliveryModel: "Centre-based parent-child practice model",
    duration: "Up to 18 months",
    targetAgeRange: "Infants and young children, adjusted by local program criteria",
    safeStepsUse:
      "Model the planning, observation, attachment-practice, and coaching records SafeSteps needs to support a referred family.",
    coreComponents: [
      "Real-time parent-child bonding practice",
      "Attachment repair routines",
      "Trauma-informed observation and coaching",
      "Repeated worker feedback loops",
    ],
    evidencePrompts: [
      "Upload contact observation notes showing attunement and repair attempts.",
      "Record parent reflection after coached bonding practice.",
      "Link child response observations to the current assessment review.",
    ],
  },
  {
    id: "hopes",
    name: "HoPES-informed home-based intensive parenting support",
    deliveryModel: "Short intensive in-home coaching model",
    duration: "8 weeks",
    targetAgeRange: "0 to 4 years",
    safeStepsUse:
      "Track routines, confidence-building, early childhood safety, and practical skill modelling inside the home context.",
    coreComponents: [
      "Home routine modelling",
      "Early childhood developmental alignment",
      "Practical confidence-building",
      "Natural-environment skill reinforcement",
    ],
    evidencePrompts: [
      "Capture weekly home routine evidence.",
      "Record worker notes about food, sleep, hygiene, and supervision routines.",
      "Track parent confidence reflections before and after coaching.",
    ],
  },
  {
    id: "pfr",
    name: "Promoting First Relationships-informed sensitivity support",
    deliveryModel: "Video-feedback informed parent sensitivity model",
    duration: "Targeted post-return or transition-period support",
    targetAgeRange: "Young children and parent-child dyads",
    safeStepsUse:
      "Structure parent sensitivity reflections from consented video review without making automated clinical conclusions.",
    coreComponents: [
      "Video-feedback review",
      "Parental sensitivity reflection",
      "Emotional attunement practice",
      "Repair and response coaching",
    ],
    evidencePrompts: [
      "Link consented video review notes to sensitivity themes.",
      "Record one parent insight and one next practice goal.",
      "Document worker-observed attunement, validation, and repair.",
    ],
  },
  {
    id: "walking-family",
    name: "Walking Family-informed parallel therapy coordination",
    deliveryModel: "Parallel child, parent, and combined family session model",
    duration: "Modular, case-plan dependent",
    targetAgeRange: "Family system, adjusted for child age and needs",
    safeStepsUse:
      "Coordinate separate and combined session records so workers can review emotional climate and home-readiness progress.",
    coreComponents: [
      "Child session tracking",
      "Parent session tracking",
      "Combined family practice sessions",
      "Home environment preparation",
    ],
    evidencePrompts: [
      "Record child session themes using child-safe language.",
      "Record parent session goals and accountability reflections.",
      "Link combined-session observations to the contact progression stage.",
    ],
  },
  {
    id: "abc-ec",
    name: "ABC-EC (Attachment and Biobehavioral Catch-up) In-the-Moment Coaching",
    deliveryModel: "Home or supportive visit dyadic coaching (10 sessions)",
    duration: "10 weeks",
    targetAgeRange: "Infants and toddlers (6 months to 4 years)",
    safeStepsUse:
      "Replace didactic classroom lectures with real-time, positive in-the-moment coaching focused on nurturance, following the child's lead with delight, and non-frightening care.",
    coreComponents: [
      "Providing nurturance when the child is distressed (even when cues are hard to read)",
      "Following the child's lead with delight",
      "Eliminating overwhelming or frightening caregiver behaviors",
      "High-frequency positive in-the-moment coaching comments",
    ],
    evidencePrompts: [
      "Document observed nurturance during a moment of child distress or transition.",
      "Record parent reflection on following the child's lead during free play.",
      "Link supportive coaching observations to contact progression readiness.",
    ],
  },
  {
    id: "pcit",
    name: "PCIT (Parent-Child Interaction Therapy) Dyadic PRIDE Coaching",
    deliveryModel: "Live dyadic play coaching with immediate skill feedback",
    duration: "12 to 20 weeks (mastery-based)",
    targetAgeRange: "2 to 7 years",
    safeStepsUse:
      "Support trauma-informed relationship enhancement (Child-Directed Interaction PRIDE skills) and calm, predictable boundary setting.",
    coreComponents: [
      "Labeled Praise (P)",
      "Reflective Listening (R)",
      "Imitation of child play (I)",
      "Behavioral Description (D) and Enjoyment (E)",
      "Calm, predictable consistency without harsh escalation",
    ],
    evidencePrompts: [
      "Record use of PRIDE skills during 5-minute child-led play check-in.",
      "Document calm parent co-regulation during limit-setting or clean-up transitions.",
    ],
  },
  {
    id: "parent-partner",
    name: "Lived-Experience Parent Partner Peer Mentorship",
    deliveryModel: "Confidential peer advocacy and navigation by reunified parents",
    duration: "Continuous from intake through 12 months post-reunification",
    targetAgeRange: "All family reunification stages",
    safeStepsUse:
      "Counteract institutional distrust, shame, and hyper-surveillance by pairing parents with mentors who have successfully navigated child welfare and reunified.",
    coreComponents: [
      "Confidential, non-surveilled emotional validation and hope-building",
      "Courtroom and Family Team Meeting (FTM) preparation and accompaniment",
      "Translation of statutory jargon into actionable steps",
      "Warm connection to community Economic & Concrete Supports (ECS)",
    ],
    evidencePrompts: [
      "Log Parent Partner attendance date and advocacy domain (session notes remain confidential).",
      "Credit peer mentorship engagement as an active protective factor in case reviews.",
    ],
  },
];

export const highIntensityReunificationTasks: ReunificationTaskDefinition[] = [
  {
    id: "kinship_mapping",
    title: "Kinship Mapping & Safety Circle Builder",
    purpose: "Identify reliable kinship, family, community, and professional supports with clear monitoring roles.",
    requiredEvidence: [
      "Named support people",
      "Role and availability for each person",
      "Escalation pathway",
      "Consent or contact verification where appropriate",
    ],
    reviewQuestions: [
      "Who can respond within 30 minutes if the parent is overwhelmed?",
      "Who is not safe to include in the support circle?",
      "What is the backup plan if the primary support is unavailable?",
    ],
  },
  {
    id: "graduated_contact",
    title: "Graduated Contact Progression Engine",
    purpose: "Track movement from supervised contact to community contact, overnight care, trial at home, and full return.",
    requiredEvidence: [
      "Stage-specific contact records",
      "Incident and repair notes",
      "Child voice or child response records",
      "Supervisor review before stage increase",
    ],
    reviewQuestions: [
      "Has the current stage been stable across repeated contacts?",
      "Are there unresolved incidents or missing observations?",
      "What would trigger a pause or step back?",
    ],
  },
  {
    id: "service_coordination",
    title: "Service Coordination Compliance Tracker",
    purpose: "Track high appointment load, missed-session risk, and multi-agency engagement without hiding context.",
    requiredEvidence: [
      "Appointment schedule",
      "Attendance evidence",
      "Missed-session reason",
      "Consolidation or transport support plan",
    ],
    reviewQuestions: [
      "Is the family expected to attend more services than is realistically sustainable?",
      "Which appointments are mandatory, duplicative, or able to be combined?",
      "What support reduces missed-session risk?",
    ],
  },
  {
    id: "coparenting_deescalation",
    title: "Co-Parenting & De-escalation Verification",
    purpose: "Document whether adult conflict is managed without exposing the child to volatility, blame, or alienation.",
    requiredEvidence: [
      "Handover observations",
      "Communication samples where consented and appropriate",
      "Boundary-management reflections",
      "Worker notes about child exposure to conflict",
    ],
    reviewQuestions: [
      "Does the parent keep adult issues away from the child?",
      "Can the parent de-escalate during handover stress?",
      "Is the child being pressured to take sides?",
    ],
  },
];

export const reunificationChallengeModels: ReunificationChallengeDefinition[] = [
  {
    id: "systemic_overload",
    title: "Systemic Overload",
    riskImpact: "High appointment load can increase missed sessions, shame, disengagement, and practical instability.",
    mitigationStrategies: [
      "Consolidate services where possible.",
      "Assign a single coordinating worker when available.",
      "Record transport, childcare, work, and health barriers before marking non-compliance.",
    ],
    warningSignals: ["Three or more weekly missed or rescheduled appointments", "Parent reports exhaustion", "Conflicting service times"],
  },
  {
    id: "parent_child_alienation",
    title: "Parent-Child Resistance or Alienation Concerns",
    riskImpact: "Child rejection, pressure, or loyalty conflict can destabilise contact and emotional safety.",
    mitigationStrategies: [
      "Use therapeutic contact planning.",
      "Record child voice without pressuring the child.",
      "Review whether adult conflict is reaching the child.",
    ],
    warningSignals: ["Child shows intense fear or rejection", "Parent blames other adults to the child", "Contact transitions escalate repeatedly"],
  },
  {
    id: "trauma_backslide",
    title: "Unresolved Trauma & Backslide Monitoring",
    riskImpact: "Stressful transitions can trigger relapse, emotional dysregulation, avoidance, or unsafe coping.",
    mitigationStrategies: [
      "Create a post-return monitoring plan.",
      "Link adult therapy and recovery supports.",
      "Use early-warning check-ins rather than waiting for crisis.",
    ],
    warningSignals: ["Sudden missed supports", "Escalating conflict", "Substance or mental health risk indicators", "Withdrawal from worker contact"],
  },
  {
    id: "poverty_neglect_conflation",
    title: "Conflation of Material Hardship with Child Neglect",
    riskImpact:
      "Diagnosing structural poverty (eviction, utility shutoffs, food insecurity, lack of transit) as parental unfitness causes unnecessary trauma and delays reunification.",
    mitigationStrategies: [
      "Decouple poverty indicators from child-maltreatment risk scores.",
      "Deploy immediate Economic & Concrete Supports (ECS) for rent, utilities, groceries, childcare, and transport.",
      "Pause compliance clocks when agency waitlists or regional transit gaps block service access.",
    ],
    warningSignals: [
      "Missed visits caused by transit costs or vehicle breakdown",
      "Housing or utility arrears cited as sole barrier to return",
      "Working parent penalized for shift conflicts with weekday classes",
    ],
  },
  {
    id: "post_reunification_cliff",
    title: "Post-Reunification Service Cliff",
    riskImpact:
      "Abrupt termination of child-care subsidies, flexible funding, and peer mentorship upon physical return drives foster care re-entry.",
    mitigationStrategies: [
      "Maintain a mandatory 12-month graduated step-down support schedule (Months 1-3 Intensive, 4-6 Transitional, 7-12 Community Sustained).",
      "Ensure post-reunification requests for concrete or respite aid are treated as protective early help, never automatic re-investigation.",
      "Continue Parent Partner peer mentorship and priority childcare subsidies throughout the 12-month transition.",
    ],
    warningSignals: [
      "Loss of foster-care childcare subsidy immediately upon child's return",
      "Caregiver overwhelm during the first 90 days of full return",
      "Reluctance to ask caseworker for help due to fear of re-removal",
    ],
  },
];

export const preReturnSafetyVerifications: SafetyVerificationDefinition[] = [
  {
    id: "functional_safety_plan",
    title: "Functional Safety Plan Validator",
    purpose: "Check that the safety plan names real people, real duties, and real escalation pathways.",
    requiredChecks: ["Support network named", "Monitoring duties assigned", "Emergency contacts current", "Unsafe people excluded"],
    missingEvidenceWarning: "Safety plan is incomplete or too vague for trial-at-home review.",
  },
  {
    id: "boundary_management",
    title: "Boundary Management Assessment",
    purpose: "Check whether the parent handles distress, transitions, goodbyes, and child resistance calmly.",
    requiredChecks: ["Goodbye transition observed", "Distress response observed", "No adult blame placed on child", "Repair attempt documented"],
    missingEvidenceWarning: "Boundary management evidence is not yet strong enough across contact stages.",
  },
  {
    id: "stable_living_environment",
    title: "Stable Living Environment Verification",
    purpose: "Check housing safety, financial stability, utilities, food, school, health, and childcare access.",
    requiredChecks: ["Safe housing verified", "Utilities active", "Food stability shown", "Universal services connected"],
    missingEvidenceWarning: "Living environment stability needs more current evidence.",
  },
  {
    id: "post_reunification_support",
    title: "Post-Reunification Support Scheduler",
    purpose: "Plan months of follow-up support after return to reduce breakdown or re-removal risk.",
    requiredChecks: ["Assigned family services worker", "Follow-up schedule", "Relapse or crisis plan", "Child check-in pathway"],
    missingEvidenceWarning: "Post-return support is not scheduled clearly enough for transition planning.",
  },
];

export const graduatedContactStages: {
  stage: ContactStage;
  title: string;
  minimumEvidence: string[];
  nextStageGate: string;
}[] = [
  {
    stage: "supervised",
    title: "Supervised contact",
    minimumEvidence: ["Stable attendance", "Safe supervision", "No unresolved high-risk incidents"],
    nextStageGate: "Supervisor review confirms repeated safe, regulated contact.",
  },
  {
    stage: "community",
    title: "Community access",
    minimumEvidence: ["Safe public supervision", "Transition management", "Child response records"],
    nextStageGate: "Community contact remains stable and the child is not exposed to adult conflict.",
  },
  {
    stage: "overnight",
    title: "Overnight care",
    minimumEvidence: ["Sleep space verified", "Morning and bedtime routines", "Emergency plan"],
    nextStageGate: "Overnight care shows stable routines and no unresolved safety concerns.",
  },
  {
    stage: "trial_at_home",
    title: "Trial at home",
    minimumEvidence: ["Functional safety plan", "Stable home environment", "Post-return support schedule"],
    nextStageGate: "Case review confirms support, stability, and child wellbeing across the trial period.",
  },
  {
    stage: "full_return",
    title: "Full return",
    minimumEvidence: ["Ongoing monitoring", "Service engagement", "Child wellbeing review"],
    nextStageGate: "Maintain post-reunification support and review plan.",
  },
];
