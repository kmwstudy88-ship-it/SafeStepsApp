export type InteractionFormId =
  | "reflective_dialogue"
  | "sjt_vignette"
  | "stress_roleplay_simulator"
  | "teach_back_perspective_switch"
  | "somatic_body_map"
  | "ema_micro_pulse"
  | "safe_partner_message_bridge"
  | "shared_timeout_contract"
  | "spaced_retention_retest"
  | "easy_read_scaffold";

export type ClinicalPathwayId =
  | "child_feeling_safe_voice"
  | "parent_co_regulation_cos"
  | "couples_dfv_restoration"
  | "family_intergenerational_repair"
  | "dfv_survivor_safety_planning"
  | "dfv_accountability_mbcp"
  | "addiction_mi_relapse_prevention"
  | "mental_health_cbt_dbt_act"
  | "perinatal_infant_bonding"
  | "neurodiversity_abi_scaffolding"
  | "cultural_sewb_yarning"
  | "grief_shame_resilience";

export type CouplesRestorationStageId =
  | "stage_1_containment_individual"
  | "stage_2_parallel_synchronised"
  | "stage_3_conjoint_safety_gated"
  | "stage_4_whole_family_integration";

export type CouplesDfvStageId =
  | CouplesRestorationStageId
  | "stage_1_stabilisation"
  | "stage_4_family_reunification_maintenance";

export type WindowOfToleranceState =
  | "regulated"
  | "hyper_aroused"
  | "hypo_aroused"
  | "crisis_override";

export type InteractionFormDefinition = {
  id: InteractionFormId;
  number: number;
  title: string;
  shortLabel: string;
  modalityBadge: string;
  description: string;
  antiGamingMechanism: string;
  accessibleForLowLiteracy: boolean;
};

export type ClinicalPathwayProtocol = {
  id: ClinicalPathwayId;
  title: string;
  shortLabel: string;
  targetPersonas: ("child" | "parent" | "partner" | "carer" | "family")[];
  evidenceFrameworks: string[];
  coreSkills: string[];
  openingPrompt: string;
  easyReadOpeningPrompt: string;
  microSkillSteps: string[];
  contraindications: string[];
};

export type CouplesRestorationStageProtocol = {
  id: CouplesRestorationStageId;
  stageNumber: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  entryCriteria: string[];
  contraindications: string[];
  permittedForms: InteractionFormId[];
  coachFocus: string[];
  automaticSafetyPivotRule: string;
};

export type SituationalJudgementVignette = {
  id: string;
  title: string;
  pathway: ClinicalPathwayId;
  scenarioText: string;
  easyReadScenarioText: string;
  childAgeContext?: string;
  options: {
    id: string;
    responseText: string;
    authenticityWeight: number; // 0-100
    reflectiveFunctioningLevel: "hostile_pre_mentalizing" | "rehearsed_textbook" | "protective_mentalizing";
    clinicalRationale: string;
  }[];
};

export type StressRoleplayScenario = {
  id: string;
  title: string;
  pathway: ClinicalPathwayId;
  simulatedCounterpartRole: string;
  openingChallengeLine: string;
  escalationCue: string;
  targetSkills: string[];
  successIndicators: string[];
  failureRedFlags: string[];
};

export type TeachBackChallenge = {
  id: string;
  title: string;
  pathway: ClinicalPathwayId;
  prompt: string;
  easyReadPrompt: string;
  perspectiveTarget: "child_eyes" | "partner_safety" | "future_self";
  rubricKeywords: string[];
};

export type SomaticBodyZone = {
  id: string;
  label: string;
  sensations: string[];
  nervousSystemSignal: WindowOfToleranceState;
  sixtySecondResetSkill: string;
};

export type EmaMicroPulseTemplate = {
  id: string;
  timeOfDay: "morning" | "afternoon_transition" | "evening_wind_down";
  title: string;
  prompt: string;
  quickTapAnchors: { value: number; label: string; emoji: string }[];
};

export const TEN_INTERACTION_FORMS: InteractionFormDefinition[] = [
  {
    id: "reflective_dialogue",
    number: 1,
    title: "Trauma-Informed Reflective Coaching Dialogue",
    shortLabel: "Reflective Coach",
    modalityBadge: "Form 1 • Narrative & Voice",
    description:
      "Warm, non-judgemental CBT, DBT, ACT, MI, and Circle of Security coaching tailored to your current Window of Tolerance.",
    antiGamingMechanism:
      "Evaluates linguistic specificity, concrete episode anchors, and genuine child/partner mentalization rather than generic compliance phrases.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "sjt_vignette",
    number: 2,
    title: "Disguised Situational Judgement Vignettes (SJT)",
    shortLabel: "Real-Life Vignettes",
    modalityBadge: "Form 2 • Trade-Off Scenarios",
    description:
      "Realistic, high-stress family moments where every choice involves a trade-off, testing real protective decision-making.",
    antiGamingMechanism:
      "Eliminates obvious textbook options; contrasts defensive ego-protection against child-centred co-regulation.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "stress_roleplay_simulator",
    number: 3,
    title: "Live Stress-Inoculation Roleplay Simulator",
    shortLabel: "Live Roleplay Practice",
    modalityBadge: "Form 3 • Behavioural Rehearsal",
    description:
      "Practise de-escalating a crying child, handling a tense co-parent handover, or calling a respectful Time-Out in real time.",
    antiGamingMechanism:
      "Tests in-the-moment emotional regulation, tone, and boundary-holding under simulated time and interpersonal pressure.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "teach_back_perspective_switch",
    number: 4,
    title: "Teach-Back & Child/Partner Perspective-Switch",
    shortLabel: "Perspective Switch",
    modalityBadge: "Form 4 • Mentalization Check",
    description:
      "Describe a recent moment through your child's eyes or explain a safety skill in your own everyday words.",
    antiGamingMechanism:
      "Detects copy-pasted buzzwords by requiring first-person perspective-taking of the child's sensory and emotional experience.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "somatic_body_map",
    number: 5,
    title: "Somatic Body-Map & Window of Tolerance Reset",
    shortLabel: "Body Map & Reset",
    modalityBadge: "Form 5 • Somatic & Visual",
    description:
      "Tap where stress shows up in your body (jaw, chest, stomach, shoulders) and launch a 60-second polyvagal/DBT TIPP reset.",
    antiGamingMechanism:
      "Links physiological early-warning signs to concrete interruption timing before escalation occurs.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "ema_micro_pulse",
    number: 6,
    title: "15-Second Ecological Momentary Assessment (EMA) Pulse",
    shortLabel: "15s Daily Pulse",
    modalityBadge: "Form 6 • In-Situ Micro-Check",
    description:
      "Ultra-brief morning, school-pickup, and bedtime pulses capturing sleep, cravings, tension, and felt safety in real time.",
    antiGamingMechanism:
      "Captures longitudinal ecological variance across days and times, detecting artificial flat-lining.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "safe_partner_message_bridge",
    number: 7,
    title: "AI-Bridged BIFF & Non-Coercive Partner Message Coach",
    shortLabel: "Safe Message Bridge",
    modalityBadge: "Form 7 • Co-Parent / Partner Bridge",
    description:
      "Transforms tense or emotional drafts into Brief, Informative, Friendly, and Firm (BIFF) child-focused messages.",
    antiGamingMechanism:
      "Screens out subtle guilt-tripping, surveillance demands, child triangulation, or coercive ultimatums before sending.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "shared_timeout_contract",
    number: 8,
    title: "Synchronised De-Escalation & Time-Out Contract Builder",
    shortLabel: "Time-Out Contract",
    modalityBadge: "Form 8 • Mutual Safety Protocol",
    description:
      "Builds a synchronised household Time-Out agreement: early body cues, neutral code word, safe exit rules, and child reassurance.",
    antiGamingMechanism:
      "Verifies both partners agree to zero door-blocking, zero following, zero hostile texting, and mandatory 20-minute physiological cooling.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "spaced_retention_retest",
    number: 9,
    title: "Spaced Cross-Format Retention Re-Test (7/14/30/60/90d)",
    shortLabel: "Spaced Retention",
    modalityBadge: "Form 9 • Longitudinal Decay Check",
    description:
      "Re-tests core safety and co-regulation skills weeks later using a different format to verify durable habit consolidation.",
    antiGamingMechanism:
      "Cross-format transfer prevents rote memorisation of quiz answers.",
    accessibleForLowLiteracy: true,
  },
  {
    id: "easy_read_scaffold",
    number: 10,
    title: "Neuro-Affirming Easy-Read, Visual & Cultural Yarning Mode",
    shortLabel: "Easy-Read & Yarning",
    modalityBadge: "Form 10 • Universal Design",
    description:
      "Plain-language cards, 3-step visual checklists, sensory-low-stimulation pacing, and culturally grounded SEWB yarning.",
    antiGamingMechanism:
      "Separates literacy or executive functioning barriers from genuine protective capacity so neurodivergent parents are never penalised.",
    accessibleForLowLiteracy: true,
  },
];

export const FOUR_STAGE_COUPLES_DFV_RESTORATION_PATHWAY: CouplesRestorationStageProtocol[] = [
  {
    id: "stage_1_containment_individual",
    stageNumber: 1,
    title: "Stage 1: Crisis Containment, Lethality Triage & Individual Stabilisation",
    subtitle: "Conjoint sessions strictly locked while acute fear, coercion, or active violence is present",
    entryCriteria: [
      "Default starting stage whenever DFV, coercive control, or fear of retaliation is identified",
      "Each partner uses an independent, strictly private session space",
    ],
    contraindications: [
      "Conjoint couple coaching is NEVER permitted in Stage 1",
      "Zero cross-disclosure of survivor safety checks or private reflections to the partner",
    ],
    permittedForms: [
      "reflective_dialogue",
      "somatic_body_map",
      "ema_micro_pulse",
      "easy_read_scaffold",
    ],
    coachFocus: [
      "Survivor Track: MARAM safety planning, non-blaming validation of protective efforts, emergency sanctuary plan",
      "Person Using Violence Track: Somatic early-warning interruption, 100% accountability without excuses, sober/regulated routines",
    ],
    automaticSafetyPivotRule:
      "Remains locked in Stage 1 Individual Mode until lethal indicators are absent and both partners demonstrate baseline regulation.",
  },
  {
    id: "stage_2_parallel_synchronised",
    stageNumber: 2,
    title: "Stage 2: Parallel Synchronised Individual Coaching & AI Safe Message Bridge",
    subtitle: "Both partners practise synchronised Time-Out contracts and BIFF co-parent communication separately",
    entryCriteria: [
      "No acute physical violence, strangulation, stalking, or threats to kill",
      "Person using violence acknowledges harmful impacts without blaming the partner",
    ],
    contraindications: [
      "No live conjoint conflict arguments without a verified Time-Out contract",
    ],
    permittedForms: [
      "reflective_dialogue",
      "sjt_vignette",
      "stress_roleplay_simulator",
      "safe_partner_message_bridge",
      "shared_timeout_contract",
      "somatic_body_map",
    ],
    coachFocus: [
      "Practising the Shared Time-Out Contract separately in the Live Stress Roleplay Simulator",
      "Using the AI-Bridged Safe Partner Message Coach (BIFF) to remove blame, surveillance, or child triangulation",
      "Developing child impact mentalization (understanding how adult tension affects the child's nervous system)",
    ],
    automaticSafetyPivotRule:
      "If any message draft or check-in reveals coercion, intimidation, or fear, session stays in Parallel Safe Mode and alerts the clinician.",
  },
  {
    id: "stage_3_conjoint_safety_gated",
    stageNumber: 3,
    title: "Stage 3: Clinician-Cleared Conjoint DVFCT / EFT Restoration Coaching",
    subtitle: "Mandatory Private Pre- and Post-Session Felt-Safety Check-Ins on separate screens",
    entryCriteria: [
      "Clinician Structured Professional Judgement (SPJ) clearance recorded",
      "DVFCT-R Readiness score >= 12/16 and PUV-ACC Accountability score >= 11/16",
      "Both partners pass Private Pre-Session Felt-Safety Check-In (Felt Safety >= 7/10, Fear of Retaliation = false, Coerced = false)",
    ],
    contraindications: [
      "Any private report of fear (< 7/10), coercion, or post-session retaliation risk immediately and silently pivots to Stage 2 Parallel Mode",
    ],
    permittedForms: [
      "reflective_dialogue",
      "shared_timeout_contract",
      "safe_partner_message_bridge",
      "teach_back_perspective_switch",
      "stress_roleplay_simulator",
    ],
    coachFocus: [
      "Domestic Violence-Focused Couples Therapy (Stith et al.) & EFT de-escalation cycle mapping",
      "Speaking in primary vulnerable emotions and child-centred goals rather than secondary attack/defend cycles",
      "Executing live 20-minute Time-Outs with zero door-blocking, zero following, and calm child reassurance",
    ],
    automaticSafetyPivotRule:
      "SILENT SAFETY PIVOT: If either partner marks Felt Safety < 7/10 or Fear = true in the Private Pre/Mid/Post Check-In, the system transitions to 'Individual Reflection Module' without revealing the partner's check-in answer, protecting the survivor from retaliation.",
  },
  {
    id: "stage_4_whole_family_integration",
    stageNumber: 4,
    title: "Stage 4: Whole-of-Family Intergenerational Healing, Repair & Maintenance",
    subtitle: "Child-inclusive safety charters, parent-to-child accountability repair letters, and 90-day relapse prevention",
    entryCriteria: [
      "Sustained Stage 3 dyadic safety across multiple weeks with zero intimidation incidents",
      "Child Felt Safety check-in confirms child feels ready and unpressured",
    ],
    contraindications: [
      "Children are never asked to adjudicate adult disputes or forgive on command",
    ],
    permittedForms: [
      "reflective_dialogue",
      "teach_back_perspective_switch",
      "spaced_retention_retest",
      "shared_timeout_contract",
      "easy_read_scaffold",
    ],
    coachFocus: [
      "Parent-led reparative acknowledgement to the child ('You were never to blame for grown-up loud voices')",
      "Whole-family predictable routines, cultural SEWB connection, and early-warning maintenance radar",
    ],
    automaticSafetyPivotRule:
      "Any regression on child felt safety or adult regulation triggers an immediate supportive step-back to Stage 2/3.",
  },
];

export const CLINICAL_PATHWAY_PROTOCOLS: ClinicalPathwayProtocol[] = [
  {
    id: "child_feeling_safe_voice",
    title: "Child & Youth Felt Safety, Worry Thermometer & Superpower Coach",
    shortLabel: "Child Safety & Feelings Coach",
    targetPersonas: ["child"],
    evidenceFrameworks: ["Signs of Safety Child Voice", "TF-CBT Coping Skills", "Polyvagal Kid-Friendly Grounding"],
    coreSkills: ["Belly Breathing", "5-4-3-2-1 Senses", "Safe Place & Safe Grown-Ups Map", "It Is Never My Fault Reminder"],
    openingPrompt:
      "Hi! I am your SafeSteps Buddy. This is your safe space to share how your body and feelings are doing today. There are no wrong answers.",
    easyReadOpeningPrompt:
      "Hi! You are safe here. Tap a feeling or tell me how your day feels.",
    microSkillSteps: [
      "Check your Feelings & Worry Thermometer (0 to 10)",
      "Notice where big feelings live in your body (butterfly tummy, fast heart, tight shoulders)",
      "Practise a 60-second Superpower Calm Reset together",
      "Remind yourself who your Trusted Safe Grown-Ups are",
    ],
    contraindications: [
      "Never interrogate or ask leading forensic questions",
      "Never promise to keep child danger or abuse a secret from safe protective workers",
    ],
  },
  {
    id: "parent_co_regulation_cos",
    title: "Circle of Security, Co-Regulation & Rupture-and-Repair Coach",
    shortLabel: "Parent Co-Regulation (COS-P)",
    targetPersonas: ["parent", "carer"],
    evidenceFrameworks: ["Circle of Security Parenting (COS-P)", "PACE (Playfulness, Acceptance, Curiosity, Empathy)", "Triple P / PCIT PRIDE"],
    coreSkills: ["Being Bigger, Stronger, Wiser & Kind", "Shark Music Awareness", "Time-In Co-Regulation", "Same-Day Rupture & Repair"],
    openingPrompt:
      "Welcome to your Parenting & Co-Regulation Coach. Let's look at what your child's behaviour might be communicating and how we can steady your nervous system first.",
    easyReadOpeningPrompt:
      "Let's take a breath together and look at what your child needed in that tricky moment.",
    microSkillSteps: [
      "Pause and name your own 'Shark Music' (stress, exhaustion, fear of being judged)",
      "Look underneath the child's behaviour: Do they need protection, comfort, or help organizing big feelings?",
      "Drop your voice volume and get below your child's eye level",
      "If you lost your cool, model a warm, blame-free repair: 'I got too loud earlier. That wasn't okay. You are safe.'",
    ],
    contraindications: ["Avoid punitive isolation or harsh discipline coaching"],
  },
  {
    id: "couples_dfv_restoration",
    title: "Couples & Family DFV Safety-Gated Restoration & Co-Parenting Coach",
    shortLabel: "Couples & Family DFV Restoration",
    targetPersonas: ["parent", "partner", "family"],
    evidenceFrameworks: [
      "Stith et al. Domestic Violence-Focused Couples Therapy (DVFCT)",
      "Safe & Together™ Model",
      "Emotionally Focused Therapy (EFT) De-Escalation",
      "BIFF Co-Parenting Communication",
    ],
    coreSkills: [
      "Private Pre/Post Felt-Safety Check-In",
      "20-Minute Physiological Time-Out Contract",
      "BIFF Child-Focused Message Rewriting",
      "Zero Child Triangulation",
    ],
    openingPrompt:
      "Welcome to the Safety-Gated Couples & Family Restoration Pathway. Every step begins with your private felt-safety check so safety always leads connection.",
    easyReadOpeningPrompt:
      "First, let's check privately that you feel 100% safe today. Safety always comes first.",
    microSkillSteps: [
      "Complete your Private Felt-Safety Check-In (never shown to your partner)",
      "Review or build your Shared Time-Out Contract (early body cue + code word + 20-min space)",
      "Use the Safe Partner Message Bridge to keep communication brief, calm, and child-focused",
      "Practise speaking from primary care for the children rather than blame or surveillance",
    ],
    contraindications: [
      "Strictly blocks conjoint mode if strangulation, weapons, stalking, coercion, or fear of retaliation (<7/10 safety) is present",
    ],
  },
  {
    id: "family_intergenerational_repair",
    title: "Whole-of-Family Intergenerational Healing, Sibling Safety & Kinship Coach",
    shortLabel: "Whole-Family & Kinship Repair",
    targetPersonas: ["parent", "partner", "carer", "family"],
    evidenceFrameworks: ["Attachment-Based Family Therapy (ABFT)", "Non-Violent Resistance (NVR)", "Signs of Safety Family Safety Charter"],
    coreSkills: ["Accountable Parent-to-Child Apology", "Household Safety Charter", "Sibling De-Escalation", "Kinship Contact Handover Buffer"],
    openingPrompt:
      "Let's work on strengthening whole-of-family predictability, repairing past hurts at your child's pace, and keeping contact transitions calm.",
    easyReadOpeningPrompt:
      "Let's build a clear Family Safety Plan that helps everyone in the house feel calm and safe.",
    microSkillSteps: [
      "Ensure adults carry 100% of responsibility for past family tension so children carry zero guilt",
      "Co-design predictable transition rituals before and after family contact visits",
      "Establish calm household peace zones for siblings and carers",
    ],
    contraindications: ["Never pressure a child to validate an adult's apology"],
  },
  {
    id: "dfv_survivor_safety_planning",
    title: "DFV Survivor Safety Planning, Coercive Control Recovery & Protective Capacity Coach",
    shortLabel: "DFV Survivor Safety & Recovery",
    targetPersonas: ["parent", "partner"],
    evidenceFrameworks: ["Safe & Together™ Survivor Strengths", "MARAM Comprehensive Safety Planning", "Herman Trauma Recovery Stage 1"],
    coreSkills: ["Digital & Physical Safety Planning", "Naming Coercive Control without Self-Blame", "Protective Buffering Recognition", "Emergency Code Words with Kids"],
    openingPrompt:
      "You are not to blame for another person's violence or control. Let's honour the ways you have already worked to protect yourself and your children, and strengthen your safety plan.",
    easyReadOpeningPrompt:
      "What happened is not your fault. Let's look at ways to keep you and your kids safe today.",
    microSkillSteps: [
      "Check immediate physical, technology, and location safety",
      "Document all the everyday ways you comfort, shield, and keep routines going for your children",
      "Prepare a discreet go-bag, essential documents checklist, and child-appropriate safety code word",
      "Connect with 1800RESPECT (1800 737 732) or your specialist family violence worker",
    ],
    contraindications: ["Never use mutualised 'relationship conflict' language for coercive control"],
  },
  {
    id: "dfv_accountability_mbcp",
    title: "Person Using Violence Accountability, Somatic Interruption & Non-Violence Coach",
    shortLabel: "Accountability & Non-Violence (MBCP)",
    targetPersonas: ["parent", "partner"],
    evidenceFrameworks: ["Safe & Together™ Perpetrator Pattern Accountability", "Caring Dads", "CBT/DBT Anger & Shame Interruption"],
    coreSkills: ["Early Somatic Cue Detection (3/10 Tension)", "20-Minute Non-Retaliatory Exit", "Unconditional Ownership vs 'Yes-But'", "Child Nervous System Empathy"],
    openingPrompt:
      "Choosing safety means noticing your earliest body signals, taking 100% ownership of your actions without excuses, and becoming a calm, predictable presence for your children.",
    easyReadOpeningPrompt:
      "Let's practise spotting your early stress signs and stepping away calmly so everyone stays safe.",
    microSkillSteps: [
      "Name the exact behaviour (tone, posture, words, pacing) without blaming stress, alcohol, or your partner",
      "Identify your 3/10 body signal (jaw tightness, heat in chest, racing thoughts) before it hits 7/10",
      "Execute a clean 20-minute Time-Out: state you are taking space to stay calm, leave the room, do not text or slam doors",
      "Reflect on what your child sees, hears, and feels in their body when you choose calm over control",
    ],
    contraindications: ["Never collude with victim-blaming, minimisation, or entitlement narratives"],
  },
  {
    id: "addiction_mi_relapse_prevention",
    title: "Addiction (AOD) Recovery, Motivational Interviewing, Craving Surfing & Safe Caregiving Coach",
    shortLabel: "AOD Recovery & Urge Surfing",
    targetPersonas: ["parent", "partner", "carer"],
    evidenceFrameworks: ["Motivational Interviewing (Miller & Rollnick)", "MBRP Urge Surfing (Marlatt)", "SMART Recovery CBA / HALT", "Harm Reduction & Safe Storage"],
    coreSkills: ["10-Minute Ocean Wave Urge Surfing", "HALT Trigger Radar (Hungry, Angry, Lonely, Tired)", "Safe Sober Caregiver Roster", "Shame-Free Lapse Recovery"],
    openingPrompt:
      "Cravings and triggers are waves in the nervous system — they peak and pass. Let's ride this wave safely and keep your recovery and your children's routines protected.",
    easyReadOpeningPrompt:
      "Urges are like ocean waves — they rise and then they go down. Let's ride this wave together for the next 5 minutes.",
    microSkillSteps: [
      "Rate your craving right now (0–10) and check HALT (Hungry, Angry, Lonely, Tired)",
      "Practise 90-second Urge Surfing + Cold Water / Paced Breathing (4s in, 6s out)",
      "Verify your Safe Sober Caregiver & Locked Storage plan for the children tonight",
      "Reach out to your sober support ally or National AOD Hotline (1800 250 015)",
    ],
    contraindications: ["Avoid shaming language around cravings; prioritise immediate child supervision safety"],
  },
  {
    id: "mental_health_cbt_dbt_act",
    title: "Mental Health, Complex Trauma, DBT Distress Tolerance, Sleep & Anxiety Coach",
    shortLabel: "Mental Health & Trauma (CBT/DBT/ACT)",
    targetPersonas: ["parent", "partner", "carer"],
    evidenceFrameworks: ["DBT Distress Tolerance (TIPP / STOP)", "ACT Cognitive Defusion & Values", "Trauma-Informed Polyvagal Grounding", "CBT-I Caregiver Sleep Pacing"],
    coreSkills: ["DBT TIPP (Temperature, Intense Exercise, Paced Breathing, Paired Muscle Relaxation)", "Window of Tolerance Mapping", "ACT 'Unhooking' from Shame Thoughts", "Low-Energy Parenting Survival Plan"],
    openingPrompt:
      "When depression, anxiety, trauma reminders, or exhaustion weigh heavily, small gentle anchors matter most. Let's check your Window of Tolerance and pick one manageable step.",
    easyReadOpeningPrompt:
      "When your mind or body feels exhausted or panicky, let's slow down and do one small, gentle step.",
    microSkillSteps: [
      "Identify whether you are in Hyper-Arousal (racing, panicky, irritable) or Hypo-Arousal (numb, frozen, exhausted)",
      "Use DBT TIPP (cool water on face + slow 4-in/6-out exhale) for hyper-arousal, or gentle sensory orienting for shutdown",
      "Switch to your 'Low-Energy Safe Parenting Menu' (simple meals, floor cushion play, early quiet lights)",
    ],
    contraindications: ["Never attempt deep trauma exposure processing without live clinical containment"],
  },
  {
    id: "perinatal_infant_bonding",
    title: "Perinatal Mental Health, Parent-Infant Bonding & Safe Infant Crying Coach",
    shortLabel: "Perinatal & Infant Bonding Coach",
    targetPersonas: ["parent", "partner", "carer"],
    evidenceFrameworks: ["Perinatal Attachment & Cue Reading", "Period of PURPLE Crying Safety", "PANDA Perinatal Support Protocol"],
    coreSkills: ["Safe Cot Put-Down & 5-Minute Breather", "Reading Infant Engagement vs Disengagement Cues", "Night-Shift Respite Planning", "Unpacking Intrusive Postpartum Worry"],
    openingPrompt:
      "Caring for a baby on broken sleep is intense. If your baby is crying inconsolably or you feel overwhelmed, let's make sure both you and baby are safe and supported right now.",
    easyReadOpeningPrompt:
      "Caring for a crying baby when you are tired is really hard. It is always okay to put baby safely on their back in the cot and take 5 minutes to breathe.",
    microSkillSteps: [
      "If frustration is rising: place baby on their back in a clear, safe cot and step outside the room for 5 minutes",
      "Lower sensory stimulation (dim lights, soft humming, gentle swaddle or skin-to-skin when regulated)",
      "Arrange a 4-hour uninterrupted sleep block with a safe partner, kin carer, or family support service",
    ],
    contraindications: ["Immediate Tier-1 escalation if thoughts of harming self or infant are endorsed"],
  },
  {
    id: "neurodiversity_abi_scaffolding",
    title: "Neuro-Affirming ADHD, Autism, Sensory Overload & ABI Executive Scaffolding Coach",
    shortLabel: "Neuro-Affirming & Executive Scaffold",
    targetPersonas: ["parent", "partner", "carer"],
    evidenceFrameworks: ["Neuro-Affirming Occupational & Executive Scaffolding", "Post-Concussion / Non-Fatal Strangulation ABI Pacing", "Low-Arousal Household Design"],
    coreSkills: ["3-Step Micro-Chunking", "Visual External Brain Checklists", "Household Sensory Decompression Plan", "Body-Doubling & Transition Timers"],
    openingPrompt:
      "Needing external reminders, visual checklists, or quiet sensory breaks is not a parenting failure — it is smart brain scaffolding. Let's break today's tasks into 3 tiny steps.",
    easyReadOpeningPrompt:
      "Let's make things simple: we will pick just 1 small step at a time and use a visual checklist.",
    microSkillSteps: [
      "Reduce sensory load first (turn off background TV, lower bright lights, use noise-reducing earbuds if helpful)",
      "Pick ONE priority task for the next 15 minutes and ignore the rest",
      "Use visual morning/bedtime picture cards so you and your child don't have to hold steps in working memory",
    ],
    contraindications: ["Never frame executive dysfunction or sensory overwhelm as wilful defiance or laziness"],
  },
  {
    id: "cultural_sewb_yarning",
    title: "First Nations Social & Emotional Wellbeing (SEWB), Kinship & Cultural Safety Yarning",
    shortLabel: "Cultural SEWB & Kinship Yarning",
    targetPersonas: ["parent", "partner", "carer", "child", "family"],
    evidenceFrameworks: ["Gee et al. (2014) Aboriginal & Torres Strait Islander SEWB Model", "Growth & Empowerment Measure (GEM)", "Culturally Safe Clinical Yarning"],
    coreSkills: ["Connection to Country, Culture & Spirit", "Kinship & Elder Support Mapping", "Cultural Pride & Story Sharing with Children", "Self-Determination in Case Planning"],
    openingPrompt:
      "Welcome to a culturally safe yarning space honouring your connection to Country, kinship, ancestors, community, mind, body, and spirit.",
    easyReadOpeningPrompt:
      "This is a safe yarning space that respects your culture, family, Elders, and Country.",
    microSkillSteps: [
      "Honour the cultural, kinship, and community strengths that keep your family strong",
      "Identify trusted Elders, Aunties, Uncles, or ACCO workers who walk alongside your family",
      "Weave cultural stories, language, or time on Country into your child's weekly routine",
    ],
    contraindications: ["Never apply Eurocentric nuclear-family biases to collective kinship care structures"],
  },
  {
    id: "grief_shame_resilience",
    title: "Grief, Ambiguous Loss, Contact-Visit Transitions & Shame Resilience Coach",
    shortLabel: "Grief, Contact Visits & Shame Resilience",
    targetPersonas: ["parent", "partner", "carer"],
    evidenceFrameworks: ["Boss Ambiguous Loss Framework", "Neff & Gilbert Compassion-Focused Therapy (CFT)", "Pre/Post Family Time Contact Support"],
    coreSkills: ["Pre-Contact Visit Grounding", "Post-Contact Visit Grief Containment Plan", "Moving from Toxic Shame to Accountable Self-Compassion"],
    openingPrompt:
      "The hours before and after family contact visits or anniversaries can bring intense waves of grief and emptiness. Let's build a gentle containment plan around those moments.",
    easyReadOpeningPrompt:
      "Saying hello and goodbye at family visits can hurt your heart. Let's make a safe plan for before and after visits.",
    microSkillSteps: [
      "Before a contact visit: ground your body so your child experiences your calm, warm delight",
      "During handover: keep focus 100% on reassuring the child ('Have a cosy night, I love you')",
      "After the visit: have a pre-planned safe place, warm meal, and support call for the first 2 hours so grief does not trigger relapse",
    ],
    contraindications: ["Recognise post-contact grief waves as high-vulnerability windows requiring extra care"],
  },
];

export const SITUATIONAL_JUDGEMENT_VIGNETTES: SituationalJudgementVignette[] = [
  {
    id: "sjt_bedtime_escalation",
    title: "7:45 PM Bedtime Spill & Partner Tension",
    pathway: "couples_dfv_restoration",
    scenarioText:
      "It is 7:45 PM. You are exhausted. Your 5-year-old accidentally knocks over a cup of water onto school forms, and your partner snaps loudly: 'Nothing in this house is ever under control!' Your child freezes with wide eyes.",
    easyReadScenarioText:
      "It is bedtime. Your child spills water. Your partner yells loudly and your child looks scared. What do you do first?",
    childAgeContext: "5–8 years",
    options: [
      {
        id: "opt_a_argue_back",
        responseText: "Snap back at your partner immediately to defend yourself and point out they haven't helped all evening.",
        authenticityWeight: 15,
        reflectiveFunctioningLevel: "hostile_pre_mentalizing",
        clinicalRationale: "Escalates adult conflict in front of a frightened child, increasing child nervous system threat.",
      },
      {
        id: "opt_b_blame_child",
        responseText: "Scold the child for being careless so your partner calms down faster.",
        authenticityWeight: 10,
        reflectiveFunctioningLevel: "hostile_pre_mentalizing",
        clinicalRationale: "Displaces adult tension onto the child and erodes child felt safety.",
      },
      {
        id: "opt_c_child_first_timeout",
        responseText: "Drop your voice, kneel by your child ('It's just water, you're safe, let's grab a towel'), and use your agreed Time-Out signal to pause adult discussion until after bedtime.",
        authenticityWeight: 95,
        reflectiveFunctioningLevel: "protective_mentalizing",
        clinicalRationale: "Demonstrates immediate child co-regulation, protective buffering, and non-escalatory Time-Out adherence.",
      },
      {
        id: "opt_d_perfection_denial",
        responseText: "Say nothing at all because in our house nobody ever gets stressed or has any problems.",
        authenticityWeight: 35,
        reflectiveFunctioningLevel: "rehearsed_textbook",
        clinicalRationale: "Reflects unrealistic impression management rather than active protective co-regulation.",
      },
    ],
  },
  {
    id: "sjt_post_visit_craving",
    title: "Post-Contact Visit Empty House & Craving Wave",
    pathway: "addiction_mi_relapse_prevention",
    scenarioText:
      "You have just finished a positive 2-hour supervised contact visit with your children. Returning to a quiet house, a wave of grief hits your chest and an old contact texts offering substances to 'take the edge off'.",
    easyReadScenarioText:
      "After a visit with your kids, the house feels empty and sad. Someone texts offering alcohol or drugs. What is your safest move?",
    options: [
      {
        id: "opt_a_just_one",
        responseText: "Reply to the text and tell yourself you'll only use a small amount tonight and hide it before next week.",
        authenticityWeight: 10,
        reflectiveFunctioningLevel: "hostile_pre_mentalizing",
        clinicalRationale: "High relapse and deception risk during a classic post-contact ambiguous loss trigger.",
      },
      {
        id: "opt_b_white_knuckle_alone",
        responseText: "Stay alone in the dark bedroom scrolling through photos without telling anyone how triggered you are.",
        authenticityWeight: 45,
        reflectiveFunctioningLevel: "rehearsed_textbook",
        clinicalRationale: "Passive isolation leaves the HALT/grief trigger unbuffered.",
      },
      {
        id: "opt_c_urge_surf_ally",
        responseText: "Block/delete the text, do 90 seconds of cold-water TIPP breathing, and call your sober support person to name the post-visit grief wave out loud.",
        authenticityWeight: 95,
        reflectiveFunctioningLevel: "protective_mentalizing",
        clinicalRationale: "Links emotional insight (post-visit grief) with immediate behavioural relapse prevention and help-seeking.",
      },
    ],
  },
  {
    id: "sjt_child_supermarket_meltdown",
    title: "Supermarket Sensory Overload & Public Gaze",
    pathway: "parent_co_regulation_cos",
    scenarioText:
      "Your 7-year-old covers their ears and drops to the floor crying under bright supermarket lights while strangers stare. You feel heat rising in your face and chest.",
    easyReadScenarioText:
      "Your child is crying on the floor at the shops because it is too loud and bright. People are looking. What do you do?",
    childAgeContext: "5–8 years",
    options: [
      {
        id: "opt_a_threaten",
        responseText: "Grab their arm firmly and hiss that they are embarrassing you and will lose their toys.",
        authenticityWeight: 10,
        reflectiveFunctioningLevel: "hostile_pre_mentalizing",
        clinicalRationale: "Prioritises adult shame/public appearance over the child's sensory dysregulation.",
      },
      {
        id: "opt_b_co_regulate_exit",
        responseText: "Take one slow breath, ignore the strangers, crouch low with a calm voice ('It's really loud in here, I've got you'), and step outside to a quiet spot together.",
        authenticityWeight: 95,
        reflectiveFunctioningLevel: "protective_mentalizing",
        clinicalRationale: "Models Circle of Security 'Bigger, Stronger, Wiser, Kind' co-regulation and sensory accommodation.",
      },
      {
        id: "opt_c_give_in_panic",
        responseText: "Buy three bags of lollies immediately while yelling at them to stop crying.",
        authenticityWeight: 30,
        reflectiveFunctioningLevel: "rehearsed_textbook",
        clinicalRationale: "Inconsistent escalation + appeasement cycle.",
      },
    ],
  },
];

export const STRESS_ROLEPLAY_SCENARIOS: StressRoleplayScenario[] = [
  {
    id: "roleplay_timeout_contract",
    title: "Calling a Respectful 20-Minute Time-Out Under Pressure",
    pathway: "couples_dfv_restoration",
    simulatedCounterpartRole: "Co-Parent / Partner Raising Voice Over Finances & Routines",
    openingChallengeLine:
      "Why are you walking away right now?! We need to sort this bill and the school pickup out right now — don't give me that 'taking a breather' excuse!",
    escalationCue: "Notice your jaw and chest tightening while the children are in the next room.",
    targetSkills: [
      "Use calm, non-blaming 'I' language",
      "State the exact return time (20 minutes) so it is not abandonment",
      "Reassure that the children's routine comes first",
      "Exit without slamming doors, insults, or firing off texts",
    ],
    successIndicators: [
      "Names own body tension ('I can feel myself getting heated')",
      "Commits to returning in 20–30 minutes once calm",
      "Refuses to argue in front of or within earshot of the children",
    ],
    failureRedFlags: [
      "Counter-attacks, insults, or blames partner",
      "Demands partner stop talking or blocks doorway",
    ],
  },
  {
    id: "roleplay_child_rupture_repair",
    title: "Same-Day Rupture & Repair With a Frightened Child",
    pathway: "parent_co_regulation_cos",
    simulatedCounterpartRole: "8-Year-Old Child Who Went Quiet After You Snapped Earlier",
    openingChallengeLine:
      "(Looking down at shoes quietly) ...Are you still mad at me? Is it my fault you were shouting this morning?",
    escalationCue: "Your child is carrying self-blame and watching your face for danger.",
    targetSkills: [
      "Take 100% adult ownership without saying 'I yelled because you were slow'",
      "Explicitly lift blame off the child ('It was NEVER your fault')",
      "Validate the child's feelings ('It makes sense you felt scared when my voice got loud')",
      "State what you will do differently next time",
    ],
    successIndicators: [
      "Unconditional ownership ('My loud voice was my mistake, not yours')",
      "Warm validation of the child's scared feeling",
      "No demand for immediate forgiveness",
    ],
    failureRedFlags: [
      "Says 'Well if you had put your shoes on I wouldn't have yelled'",
      "Dismisses the child's fear ('It wasn't a big deal, get over it')",
    ],
  },
  {
    id: "roleplay_caseworker_feedback",
    title: "Responding to Difficult Caseworker Feedback Without Defensiveness",
    pathway: "dfv_accountability_mbcp",
    simulatedCounterpartRole: "Child Safety Practitioner Reviewing Home Visit Notes",
    openingChallengeLine:
      "During Tuesday's visit, the children seemed hesitant to speak when you entered the room, and the school noted two late mornings this week. Help me understand what was happening.",
    escalationCue: "Feeling judged, defensive, or tempted to minimise/blame the school.",
    targetSkills: [
      "Pause and breathe through the defensive spike",
      "Acknowledge the observation with curiosity about the children's experience",
      "Share concrete steps being taken to build morning predictability and child comfort",
    ],
    successIndicators: [
      "Centers the child's emotional experience rather than attacking the worker",
      "Names specific, verifiable adjustments made at home",
    ],
    failureRedFlags: [
      "Accuses worker or child of lying",
      "Uses rehearsed buzzwords with zero concrete detail",
    ],
  },
];

export const TEACH_BACK_CHALLENGES: TeachBackChallenge[] = [
  {
    id: "tb_child_eyes",
    title: "Through My Child's Eyes (Perspective-Switch)",
    pathway: "parent_co_regulation_cos",
    prompt:
      "Think of a stressful 5 minutes at home this week. Describe what that moment looked like, sounded like, and felt like from your child's height and through your child's eyes — and what your child needed most from you.",
    easyReadPrompt:
      "Imagine you are your child during a tricky moment this week. What did your face and voice look and sound like to them? What helped them feel safe?",
    perspectiveTarget: "child_eyes",
    rubricKeywords: ["felt", "scared", "safe", "voice", "eyes", "calm", "needed", "comfort", "body", "kneel", "listen"],
  },
  {
    id: "tb_timeout_contract",
    title: "Explain Your 20-Minute Time-Out Safety Rule",
    pathway: "couples_dfv_restoration",
    prompt:
      "In your own everyday words, explain how you know at a 3-out-of-10 body signal that you need a Time-Out, what you say to pause safely, and what rules you follow during those 20 minutes.",
    easyReadPrompt:
      "In your own words, how do you spot your early stress signs and take a 20-minute break safely?",
    perspectiveTarget: "partner_safety",
    rubricKeywords: ["body", "jaw", "chest", "breath", "20", "minutes", "space", "kids", "safe", "return", "calm", "no text"],
  },
  {
    id: "tb_urge_surf",
    title: "Teach Back Your 10-Minute Craving Wave Plan",
    pathway: "addiction_mi_relapse_prevention",
    prompt:
      "If a strong 8/10 craving or post-visit grief wave hits at 8:00 PM tonight, walk through your exact first 3 actions and how your children's supervision stays 100% protected.",
    easyReadPrompt:
      "If a strong urge hits tonight, what are the 3 things you will do right away to stay safe?",
    perspectiveTarget: "future_self",
    rubricKeywords: ["wave", "breathe", "water", "call", "sober", "safe", "kids", "pass", "10", "minutes", "support"],
  },
];

export const SOMATIC_BODY_MAP_ZONES: SomaticBodyZone[] = [
  {
    id: "head_jaw",
    label: "Head, Jaw & Racing Thoughts",
    sensations: ["Clenched jaw", "Hot face", "Racing thoughts", "Headache / tunnel vision"],
    nervousSystemSignal: "hyper_aroused",
    sixtySecondResetSkill:
      "DBT TIPP Temperature Reset: Splash cool water on your face/wrists, unclench your jaw by dropping your tongue from the roof of your mouth, and exhale slowly for 6 seconds.",
  },
  {
    id: "chest_heart",
    label: "Chest, Throat & Heartbeat",
    sensations: ["Pounding heart", "Tight chest", "Short breath", "Lump in throat"],
    nervousSystemSignal: "hyper_aroused",
    sixtySecondResetSkill:
      "Physiological Sigh: Take two quick inhales through your nose (one deep, one top-up) followed by one long, slow exhale through pursed lips. Repeat 4 times.",
  },
  {
    id: "stomach_gut",
    label: "Stomach & Gut (Butterflies / Nausea / Dread)",
    sensations: ["Knotted stomach", "Butterflies", "Sinking dread", "Shaky inside"],
    nervousSystemSignal: "hyper_aroused",
    sixtySecondResetSkill:
      "5-4-3-2-1 Grounding + Hand on Heart/Belly: Press both feet flat into the floor, name 5 safe things you can see in the room right now, and remind your body: 'Right now, in this moment, I am breathing.'",
  },
  {
    id: "shoulders_hands",
    label: "Shoulders, Arms & Restless Hands",
    sensations: ["Tight shoulders", "Clenched fists", "Restless pacing", "Urge to yell or throw"],
    nervousSystemSignal: "hyper_aroused",
    sixtySecondResetSkill:
      "Paired Muscle Release + Step Back: Open your hands wide, drop your shoulders away from your ears, take 3 steps backward to create physical space, and call a 20-minute Time-Out.",
  },
  {
    id: "heavy_numb_shutdown",
    label: "Heavy, Foggy, Numb or Shut Down (Freeze / Hypo-Arousal)",
    sensations: ["Brain fog", "Heavy limbs", "Spaced out / numb", "Zero energy to move"],
    nervousSystemSignal: "hypo_aroused",
    sixtySecondResetSkill:
      "Gentle Sensory Awakening: Sip a glass of cold water, gently rub your hands together to feel warmth, look around the room at 3 bright colours, and switch to your Low-Energy Safe Parenting Menu.",
  },
];

export const EMA_MICRO_PULSES: EmaMicroPulseTemplate[] = [
  {
    id: "ema_morning_readiness",
    timeOfDay: "morning",
    title: "15-Second Morning Nervous System & Sleep Pulse",
    prompt: "How rested and steady does your body feel heading into this morning's family routine?",
    quickTapAnchors: [
      { value: 1, label: "Exhausted / Overwhelmed", emoji: "🌧️" },
      { value: 2, label: "Running Low — Need Simple Plan", emoji: "⛅" },
      { value: 3, label: "Steady & Managing", emoji: "🌤️" },
      { value: 4, label: "Rested, Calm & Connected", emoji: "☀️" },
    ],
  },
  {
    id: "ema_afternoon_transition",
    timeOfDay: "afternoon_transition",
    title: "15-Second Pickup / Dinner Transition Pulse",
    prompt: "Right now during the late-afternoon transition, where is your stress / craving / tension level?",
    quickTapAnchors: [
      { value: 1, label: "High Tension — Using Reset Now", emoji: "🛑" },
      { value: 2, label: "Stretched — Pacing Slowly", emoji: "🟠" },
      { value: 3, label: "Calm & Using Co-Regulation", emoji: "🟢" },
      { value: 4, label: "Warm & Playful Connection", emoji: "💚" },
    ],
  },
  {
    id: "ema_evening_repair",
    timeOfDay: "evening_wind_down",
    title: "15-Second Bedtime Safety & Repair Pulse",
    prompt: "Looking back on today, how safe, settled, and repaired did bedtime feel for the children and household?",
    quickTapAnchors: [
      { value: 1, label: "Hard Day — Need Support Tomorrow", emoji: "🆘" },
      { value: 2, label: "Had a Rupture — Did a Calm Repair", emoji: "🤝" },
      { value: 3, label: "Predictable & Safe Routine", emoji: "🌙" },
      { value: 4, label: "Peaceful, Connected & Proud", emoji: "✨" },
    ],
  },
];

export const AUSTRALIAN_CRISIS_RESOURCES = [
  {
    id: "emergency_000",
    name: "Emergency Services (Police / Ambulance / Fire)",
    phone: "000",
    availability: "24/7 Immediate Emergency",
    whenToUse: "Immediate life-threatening danger, physical assault, medical emergency, or child in acute danger.",
  },
  {
    id: "1800respect",
    name: "1800RESPECT (National Domestic, Family & Sexual Violence Counselling)",
    phone: "1800 737 732",
    availability: "24/7 Confidential Phone & Text",
    whenToUse: "Domestic & family violence, coercive control, safety planning, and survivor support.",
  },
  {
    id: "lifeline",
    name: "Lifeline Australia (Crisis Support & Suicide Prevention)",
    phone: "13 11 14",
    availability: "24/7 Crisis Support",
    whenToUse: "Suicidal thoughts, self-harm distress, or overwhelming emotional crisis.",
  },
  {
    id: "kids_helpline",
    name: "Kids Helpline (For Children & Young People 5–25)",
    phone: "1800 55 1800",
    availability: "24/7 Free & Confidential for Kids/Teens",
    whenToUse: "Any time a child or young person feels scared, worried, unsafe, or needs a safe adult to talk to.",
  },
  {
    id: "13yarn",
    name: "13YARN (Aboriginal & Torres Strait Islander Crisis Support)",
    phone: "13 92 76",
    availability: "24/7 First Nations Crisis Line",
    whenToUse: "Culturally safe, confidential yarning with an Aboriginal or Torres Strait Islander Crisis Supporter.",
  },
  {
    id: "mensline",
    name: "MensLine Australia / No to Violence (Men's Referral Service)",
    phone: "1300 78 99 78 / 1300 766 491",
    availability: "24/7 Counselling & Behaviour Change",
    whenToUse: "Support for men managing anger, relationship stress, family safety, and stopping family violence.",
  },
  {
    id: "national_aod",
    name: "National Alcohol and Other Drug Hotline",
    phone: "1800 250 015",
    availability: "24/7 Confidential AOD Support",
    whenToUse: "Cravings, relapse prevention, withdrawal guidance, and family AOD support.",
  },
  {
    id: "panda_perinatal",
    name: "PANDA (Perinatal Anxiety & Depression Australia)",
    phone: "1300 726 306",
    availability: "National Perinatal Helpline",
    whenToUse: "Support for expecting and new parents experiencing perinatal anxiety, depression, or infant crying overwhelm.",
  },
];
