import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lessonsDir = path.join(repoRoot, "lessons");
const modulesDir = path.join(repoRoot, "modules");
const topicsDir = path.join(repoRoot, "topics");
const coursesDir = path.join(repoRoot, "src", "safesteps", "courses");
const programsDir = path.join(repoRoot, "src", "safesteps", "programs");

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function buildRichSections(id, title, focusArea, keyConcepts = [], outcomes = [], activities = [], reflections = []) {
  const cleanTitle = title.replace(/_/g, " ");
  const lowerTitle = cleanTitle.toLowerCase();

  const sectionThemes = [
    {
      suffix: "01",
      heading: `Foundations & Baseline Understanding: ${cleanTitle}`,
      focus: `understanding the core purpose of ${lowerTitle} and how it shapes physical, emotional, and relational safety in daily family life`,
    },
    {
      suffix: "02",
      heading: `Real-Life Application & Calm Scripts: ${cleanTitle}`,
      focus: `applying ${lowerTitle} during high-pressure routines, transitions, and moments of stress without escalation or shame`,
    },
    {
      suffix: "03",
      heading: `Repair, Consistency & Sustained Evidence: ${cleanTitle}`,
      focus: `sustaining ${lowerTitle} over time, repairing after setbacks, and documenting practical evidence of safe change`,
    },
  ];

  return sectionThemes.map((theme, idx) => ({
    id: `section_${id}_${theme.suffix}`,
    title: theme.heading,
    content: {
      title: theme.heading,
      overview: `This section provides a trauma-informed, practical guide to ${theme.focus}. Designed for ${focusArea}, it focuses on realistic, repeatable steps that strengthen safety, predictability, and connection.`,
      psychoeducation: `Why does ${lowerTitle} matter in section ${idx + 1}? Children and families thrive on predictability, nervous-system safety, and attuned repair. When ${lowerTitle} is practised consistently, stress responses decrease and relational trust grows. ${keyConcepts[idx] || keyConcepts[0] || `By focusing on ${theme.focus}, caregivers and practitioners create a calmer, safer environment where children can regulate and develop confidence.`}`,
      learning_goals: outcomes.length >= 3
        ? outcomes.map((item) => `${item} (${theme.heading})`)
        : [
            `Define what ${lowerTitle} means in your own words before and after learning.`,
            `Recognise how ${lowerTitle} supports child safety, emotional wellbeing, and nervous-system regulation.`,
            `Practise simple, non-defensive scripts and responses for ${lowerTitle} during everyday moments.`,
            `Identify early warning signs, barriers, and support pathways related to ${lowerTitle}.`,
          ],
      step_by_step: [
        `Pause & Ground: Notice your own breathing, body tension, and tone before addressing ${lowerTitle}.`,
        `Observe Factually: Notice what is happening in the moment around ${lowerTitle} without blame or judgement.`,
        `Connect & Validate: Acknowledge feelings and safety needs clearly and calmly.`,
        `Respond Simply: Choose one clear, age-appropriate action or boundary for ${lowerTitle}.`,
        `Reflect & Repair: Review what worked, repair any rupture honestly, and record your next small step.`,
      ],
      parent_scripts: [
        `"I can see this moment feels big right now. Let's slow down and take one step together with ${lowerTitle}."`,
        `"Everyone is safe here. We can talk about what happened and work out the next step calmly."`,
        `"I noticed I was getting stressed. I'm taking a breath so I can listen properly."`,
        `"We don't have to get everything perfect today — we are practising ${lowerTitle} one routine at a time."`,
      ],
      practical_examples: [
        `Everyday Routine: Applying ${lowerTitle} during a busy morning or bedtime transition by slowing down, offering two calm choices, and keeping tone steady.`,
        `Moment of Stress: When tension rises around ${lowerTitle}, pausing for 10 seconds before speaking, validating feelings, and focusing on safety first.`,
        `Follow-Through & Review: Recording a factual note after practising ${lowerTitle} to notice what helped the child settle and what support would help next time.`,
      ],
      reflection_questions: reflections.length >= 3
        ? reflections
        : [
            `What does ${lowerTitle} mean to me in my own words right now?`,
            `When is ${lowerTitle} easiest to practise, and what triggers make it hardest?`,
            `How does my child or family respond when I stay calm and predictable around ${lowerTitle}?`,
            `What is one specific, realistic action I will try this week to strengthen ${lowerTitle}?`,
          ],
      practice_ideas: activities.length >= 3
        ? activities
        : [
            `Complete the unassisted starting definition for ${lowerTitle}, then compare it with your end reflection.`,
            `Choose one daily routine this week to practise a calm, 2-sentence script for ${lowerTitle}.`,
            `Identify one trusted person, support service, or caseworker check-in to share your progress on ${lowerTitle}.`,
            `Write a brief, factual reflection note describing one moment you practised ${lowerTitle} and how your child responded.`,
          ],
      closing_message: `Progress in ${lowerTitle} comes from small, consistent moments of safety, honesty, and repair — not perfection. Every time you pause, stay regulated, and choose a safer response, you build lasting trust.`,
    },
    content_variants: {
      toddlers: `For babies & toddlers (0–4): Focus on gentle tone, physical comfort, predictable routines, and simple 3-to-5 word reassurance while practising ${lowerTitle}.`,
      school_age: `For school-age children (5–11): Use clear explanations, visual routines, curiosity about their feelings, and collaborative problem-solving around ${lowerTitle}.`,
      teens: `For adolescents (12–18): Respect autonomy, listen without lecturing, agree on clear safety boundaries, and involve teens in decisions about ${lowerTitle}.`,
      fatherhood: `For fathers & male caregivers: Model calm accountability, steady emotional presence, and non-frightening leadership when practising ${lowerTitle}.`,
    },
    safety_guidance: {
      red_flags: [
        `Immediate physical danger, threats, intimidation, or coercive control observed during ${lowerTitle}.`,
        `A child shows fear, freezing, dissociation, or disclosure of harm related to ${lowerTitle}.`,
        `An adult is unable to regulate or maintain safe supervision while attempting ${lowerTitle}.`,
        `Signs of acute mental health crisis or substance intoxication affecting child safety.`,
      ],
      when_to_escalate: [
        `Pause learning immediately if anyone is in danger and use verified emergency or crisis supports.`,
        `Follow jurisdiction-specific child protection and mandatory reporting obligations when harm is disclosed or suspected.`,
        `Engage a qualified supervisor, specialist DFV practitioner, or clinician when risk exceeds self-directed learning.`,
      ],
    },
    trauma_informed: {
      clinical: `Nervous-system lens for ${lowerTitle}: Recognises fight, flight, freeze, and fawn survival responses, window of tolerance, and the need for co-regulation before cognitive problem-solving.`,
      relational: `Attachment lens for ${lowerTitle}: Prioritises connection before correction, attunement to cues, shame-free accountability, and timely repair after ruptures.`,
      justice: `Fairness & cultural lens for ${lowerTitle}: Respects cultural strengths, kinship networks, neurodiversity, disability access, and structural barriers without equating poverty with neglect.`,
      fatherhood: `Accountable fatherhood lens for ${lowerTitle}: Replaces control or withdrawal with steady, reliable care, honest repair, and child-centred safety.`,
    },
    simplified_parent_version: `What ${lowerTitle} means:\n${cleanTitle} is about keeping daily life safe, calm, and predictable so your child feels supported and understood.\n\nHow to practise it:\n1. Pause and take one slow breath first.\n2. Notice what your child needs right now.\n3. Use a calm voice and one clear step.\n4. Repair kindly if things go off track.`,
  }));
}

// 1. Fix mojibake and typo in existing topics/ and src/safesteps/programs/
const mojibakeFixes = [
  { file: "children_s_experience_of_separation.json", topicName: "children's experience of separation" },
  { file: "following_the_child_s_lead.json", topicName: "following the child's lead" },
  { file: "understanding_children_s_emotions.json", topicName: "understanding children's emotions" },
  { file: "esponsive_interactions.json", topicName: "responsive interactions" },
];

for (const fix of mojibakeFixes) {
  for (const dir of [topicsDir, programsDir]) {
    const filePath = path.join(dir, fix.file);
    if (fs.existsSync(filePath)) {
      const record = readJson(filePath);
      record.topicName = fix.topicName;
      writeJson(filePath, record);
    }
  }
}

// Add canonical responsive_interactions.json alongside esponsive_interactions.json
const responsiveInteractionsTopic = {
  id: "responsive_interactions",
  topicId: "responsive-interactions",
  topicName: "responsive interactions",
  caseworkerSummary:
    "This topic helps parents build practical skills in responsive, attuned interactions with their child. It supports safer, more consistent caregiving by noticing child cues, responding warmly, and strengthening emotional security.",
  modules: ["module_trauma_attachment_and_child_development", "module_relationship_skills"],
};
writeJson(path.join(topicsDir, "responsive_interactions.json"), responsiveInteractionsTopic);
writeJson(path.join(programsDir, "responsive_interactions.json"), responsiveInteractionsTopic);

// 2. Define the 7 New Specialized Modules + 16 Program Course Alias Modules
const newModules = [
  {
    id: "module_substance_use_and_parenting_stability",
    title: "Alcohol and Other Drug Recovery & Safe Parenting",
    description:
      "SS-CURR-004: Supports parents in understanding substance use impacts on children, mapping triggers, building sober care and supervision plans, responding safely to lapse/relapse, and documenting sustained recovery.",
    type: "module",
    level: "intensive",
    tags: ["aod recovery", "sober parenting", "relapse prevention", "child safety", "SS-CURR-004"],
    outcomes: [
      "Understand how alcohol and other drug use affects family routines, emotional availability, and child safety",
      "Build practical trigger maps, craving response plans, and sober supervision arrangements with protective adults",
      "Respond honestly and rapidly to lapses or relapses while maintaining child protection and longitudinal recovery evidence",
    ],
    lessons: [
      "understanding_substance_use_and_family_impact",
      "triggers_cravings_and_safer_choices",
      "recovery_and_treatment_planning",
      "lapse_relapse_and_recovery_response",
      "parenting_safely_during_recovery",
      "sustained_recovery_evidence",
    ],
    content: [],
  },
  {
    id: "module_reunification_and_contact_readiness",
    title: "Reunification Pathways, Contact Readiness & Return Home",
    description:
      "SS-CURR-002: Guides parents through the reunification journey, understanding the child's experience of care, preparing for supervised and unsupervised contact visits, learning from feedback, and sustaining Home Again transitions.",
    type: "module",
    level: "intensive",
    tags: ["reunification", "contact visits", "home again", "child safety", "SS-CURR-002"],
    outcomes: [
      "Understand child safety expectations, parent rights, goals, and the child's emotional experience of placement and transitions",
      "Prepare for family contact visits with child-centred activities, emotional regulation, and constructive use of visit feedback",
      "Demonstrate sustained parenting change and maintain safe, predictable routines during return-home transitions",
    ],
    lessons: [
      "reunification_foundations_and_expectations",
      "understanding_child_experience_of_care",
      "preparing_for_family_contact_visits",
      "learning_from_visit_feedback",
      "demonstrating_sustained_parenting_change",
      "reunification_transition_and_home_again",
    ],
    content: [],
  },
  {
    id: "module_fatherhood_perinatal_and_support_networks",
    title: "Fatherhood, Perinatal Care, Support Networks & Mental Health Planning",
    description:
      "SS-CURR-001 & SS-CURR-003: Covers pregnancy and newborn fourth-trimester care, accountable fatherhood and positive role modelling, building informal and formal support networks, mental health crisis planning, and safe AI coach skills.",
    type: "module",
    level: "general",
    tags: ["perinatal", "newborn care", "fatherhood", "support network", "mental health planning"],
    outcomes: [
      "Support maternal, paternal, and infant wellbeing across pregnancy, the fourth trimester, and early infancy",
      "Practise accountable, non-violent fatherhood and build a reliable village of informal and professional supports",
      "Create clear mental-health and crisis support plans and use the SafeSteps AI Support Coach safely within privacy boundaries",
    ],
    lessons: [
      "pregnancy_and_perinatal_wellbeing",
      "newborn_care_and_fourth_trimester",
      "fatherhood_and_positive_role_modelling",
      "building_your_village_and_support_network",
      "mental_health_support_and_crisis_planning",
      "safe_ai_support_coach_skills",
    ],
    content: [],
  },
  {
    id: "module_child_rights_feelings_and_safety",
    title: "Child Rights, Feelings & Personal Safety Learning (Child Track)",
    description:
      "SS-CHD-009 to SS-CHD-011: Developmentally appropriate child learning track covering personal rights, body safety, safe vs. unsafe secrets, naming big feelings, identifying trusted adults, asking for help, and preparing for family visits.",
    type: "module",
    level: "child",
    tags: ["child track", "body safety", "child voice", "feelings check-in", "safe people"],
    outcomes: [
      "Help children recognise their personal rights, body boundaries, and the difference between safe surprises and unsafe secrets",
      "Build age-appropriate skills for noticing body signals, naming big feelings, and using calming tools",
      "Empower children to identify safe adults, ask for help without fear, and prepare for family contact visits",
    ],
    lessons: [
      "child_rights_and_body_safety",
      "child_feelings_and_calming_tools",
      "child_safe_adults_and_asking_for_help",
      "child_visit_preparation_and_transitions",
    ],
    content: [],
  },
  {
    id: "module_adolescent_safety_and_relationships",
    title: "Adolescent Safety, Consent & Healthy Relationships (Youth Track)",
    description:
      "SS-CRS-PAR-006 & Youth Track: Supports adolescents and parents in navigating healthy peer and dating relationships, consent, digital boundaries, online safety, and emotional independence during family change.",
    type: "module",
    level: "adolescent",
    tags: ["adolescents", "consent", "digital safety", "healthy relationships", "youth track"],
    outcomes: [
      "Recognise the signs of respectful vs. controlling or unhealthy dating and peer relationships",
      "Maintain strong digital boundaries, online consent, and protection against image-based abuse or coercion",
      "Build healthy coping strategies for family stress, emotional independence, and help-seeking",
    ],
    lessons: [
      "adolescent_healthy_dating_and_consent",
      "adolescent_digital_boundaries_and_safety",
      "adolescent_coping_with_family_stress",
    ],
    content: [],
  },
  {
    id: "module_foster_and_kinship_carer_support",
    title: "Foster & Kinship Carer Trauma-Informed Support (Carer Track)",
    description:
      "Carer Track & SS-AST-010: Equips foster, kinship, and family carers to support placement stability, respond to trauma and loyalty conflicts, facilitate safe family contact, and record objective observations separated from interpretation.",
    type: "module",
    level: "carer",
    tags: ["foster care", "kinship care", "placement stability", "contact support", "objective observation"],
    outcomes: [
      "Provide trauma-informed, culturally safe care that honours the child's identity, family connections, and felt safety",
      "Prepare and support children before and after family contact visits without loyalty pressure",
      "Record factual, objective carer observations that clearly separate direct observation and the child's own words from adult interpretation",
    ],
    lessons: [
      "carer_supporting_placement_transitions",
      "carer_facilitating_safe_family_contact",
      "carer_objective_observation_and_child_voice",
    ],
    content: [],
  },
  {
    id: "module_neurodiversity_and_systemic_advocacy",
    title: "Neurodiversity-Affirming Care, Sensory Support & Systemic Advocacy",
    description:
      "Parenting Track 4 & Master Tier Competencies: Covers ADHD and executive function scaffolding, sensory-integrated sleep and home environments, educational/IEP/NDIS advocacy, trauma dissociation de-escalation, case conference literacy, and parallel parenting safety plans.",
    type: "module",
    level: "advanced",
    tags: ["neurodiversity", "ADHD", "autism", "NDIS advocacy", "IEP", "parallel parenting", "master track"],
    outcomes: [
      "Scaffold executive functioning, sensory regulation, and restorative sleep for neurodivergent children and teens",
      "Advocate effectively in school IEP, behaviour support, NDIS, and multi-disciplinary child welfare case conferences",
      "De-escalate trauma-related dissociation or hyperarousal and maintain safe parallel parenting boundaries after DFV",
    ],
    lessons: [
      "adhd_and_executive_function_scaffolding",
      "sensory_processing_and_sleep_architecture",
      "educational_and_ndis_rights_advocacy",
      "deescalating_dissociation_and_hyperarousal",
      "navigating_child_welfare_case_conferences",
      "parallel_parenting_and_dfv_safety_plans",
    ],
    content: [],
  },
];

// Program Course IDs referenced in lib/data/programs.ts
const programCourseAliases = [
  {
    id: "parent-safety-and-stability",
    title: "Parent Safety and Stability",
    description: "Core program course building immediate physical and emotional safety, crisis planning, and household stability.",
    lessons: ["safety_planning", "building_safe_routines", "restoring_routines"],
  },
  {
    id: "child-safety-foundations",
    title: "Child Safety Foundations",
    description: "Core program course focused on child-centred safety planning, recognising risk, and protective caregiving.",
    lessons: ["safety_planning_with_children", "lesson_child_centred_principles", "lesson_recognising_risk_as_a_parent"],
  },
  {
    id: "protective-parenting-foundations",
    title: "Protective Parenting Foundations",
    description: "Core program course developing protective factors, safe boundaries, and attuned supervision.",
    lessons: ["lesson_protective_factors", "taking_responsibility", "understanding_child_cues"],
  },
  {
    id: "demonstrating-change-self-managed-safety",
    title: "Demonstrating Change & Self-Managed Safety",
    description: "Core program course on building consistent behavioural change, relapse prevention, and factual evidence of safe parenting.",
    lessons: ["demonstrating_sustained_parenting_change", "building_new_patterns", "relapse_prevention"],
  },
  {
    id: "emotional-regulation-for-parents",
    title: "Emotional Regulation for Parents",
    description: "Core program course helping parents recognise triggers, calm the nervous system, and co-regulate with children under stress.",
    lessons: ["co_regulation_basics", "regulation_strategies", "lesson_managing_parental_stress"],
  },
  {
    id: "co-parenting-after-separation",
    title: "Co-Parenting After Separation",
    description: "Core program course for child-focused communication, parallel parenting boundaries, and shielding children from adult conflict.",
    lessons: ["parallel_parenting_and_dfv_safety_plans", "conflict_management", "lesson_managing_conflict_and_complexity"],
  },
  {
    id: "substance-use-and-parenting-stability",
    title: "Substance Use and Parenting Stability",
    description: "Core program course supporting sober caregiving, trigger mapping, relapse response, and safe supervision during AOD recovery.",
    lessons: [
      "understanding_substance_use_and_family_impact",
      "triggers_cravings_and_safer_choices",
      "parenting_safely_during_recovery",
    ],
  },
  {
    id: "attachment-and-bonding-foundations",
    title: "Attachment and Bonding Foundations",
    description: "Core program course on responsive caregiving, emotional availability, and repairing parent-child connection.",
    lessons: ["strengthening_family_bonds", "lesson_attachment_and_relationships", "lesson_maintaining_parent_child_connection"],
  },
  {
    id: "family-routines-and-structure",
    title: "Family Routines and Structure",
    description: "Core program course on establishing predictable daily rhythms for mornings, mealtimes, homework, and bedtime.",
    lessons: ["building_safe_routines", "restoring_routines", "lesson_building_safe_routines"],
  },
  {
    id: "safe-conversations",
    title: "Safe Conversations",
    description: "Core program course on active listening, non-defensive communication, and safe boundary setting.",
    lessons: ["active_listening", "communication_skills", "holding_space"],
  },
  {
    id: "child-development-foundations",
    title: "Child Development Foundations",
    description: "Core program course on age-appropriate expectations, developmental milestones, and trauma impacts across childhood.",
    lessons: ["age_appropriate_support", "understanding_child_cues", "lesson_developmental_impacts"],
  },
  {
    id: "communication-skills",
    title: "Communication Skills",
    description: "Core program course on clear, respectful, child-focused communication and repair after misunderstandings.",
    lessons: ["communication_skills", "active_listening", "building_empathy"],
  },
  {
    id: "building-your-village",
    title: "Building Your Village",
    description: "Core program course on overcoming isolation, mapping informal and professional supports, and proactive help-seeking.",
    lessons: ["building_your_village_and_support_network", "encouraging_help_seeking", "lesson_connecting_to_services"],
  },
  {
    id: "behaviour-management-foundations",
    title: "Behaviour Management Foundations",
    description: "Core program course on understanding behaviour as communication, calm limit setting, and teaching instead of punishing.",
    lessons: ["co_regulation_basics", "understanding_child_cues", "lesson_behaviour_change_principles"],
  },
  {
    id: "positive-parenting-foundations",
    title: "Positive Parenting Foundations",
    description: "Core program course on strengths-based parenting, warmth, encouragement, and building child resilience.",
    lessons: ["building_resilience_in_children", "supporting_children_emotionally", "strengths_based_support"],
  },
  {
    id: "accountability-and-responsibility",
    title: "Accountability and Responsibility",
    description: "Core program course on owning impact, challenging minimisation, and practising consistent repair.",
    lessons: ["taking_responsibility", "challenging_minimisation", "understanding_harm"],
  },
];

// 3. Define the 34 New Lessons & Topics
const newLessonAndTopicSpecs = [
  // Track A: AOD Recovery
  {
    id: "understanding_substance_use_and_family_impact",
    title: "Understanding Substance Use and Family Impact",
    moduleId: "module_substance_use_and_parenting_stability",
    focusArea: "parents and caregivers in alcohol and other drug recovery (SS-CRS-AOD-001)",
    summary:
      "Explores how alcohol and other drug use affects household predictability, emotional availability, and children's felt sense of safety, while supporting shame-free accountability.",
  },
  {
    id: "triggers_cravings_and_safer_choices",
    title: "Triggers, Cravings, and Safer Choices",
    moduleId: "module_substance_use_and_parenting_stability",
    focusArea: "parents building a practical trigger map and craving response plan (SS-CRS-AOD-002)",
    summary:
      "Helps parents identify internal and external substance-use triggers, notice early body warning signs, and practise immediate safer choices that protect children and recovery.",
  },
  {
    id: "recovery_and_treatment_planning",
    title: "Recovery and Treatment Planning",
    moduleId: "module_substance_use_and_parenting_stability",
    focusArea: "parents engaging with qualified AOD services and recovery supports (SS-CRS-AOD-003)",
    summary:
      "Guides parents in coordinating qualified AOD treatment, counselling, peer recovery groups, and practical daily routines that sustain recovery alongside family life.",
  },
  {
    id: "lapse_relapse_and_recovery_response",
    title: "Lapse, Relapse, and Rapid Safety Response",
    moduleId: "module_substance_use_and_parenting_stability",
    focusArea: "parents creating honest relapse-prevention and child-safety backup plans (SS-CRS-AOD-004)",
    summary:
      "Prepares parents to distinguish a lapse from a full relapse, activate pre-agreed child safety and sober care arrangements immediately, and re-engage with support honestly.",
  },
  {
    id: "parenting_safely_during_recovery",
    title: "Parenting Safely During Recovery & Sober Care Plans",
    moduleId: "module_substance_use_and_parenting_stability",
    focusArea: "parents establishing sober supervision, safe storage, and protective adult networks (SS-CRS-AOD-005)",
    summary:
      "Focuses on sober caregiving, safe medication/substance storage, nominated protective adults, and rebuilding predictable daily care for children during recovery.",
  },
  {
    id: "sustained_recovery_evidence",
    title: "Sustained Recovery & Longitudinal Stability Evidence",
    moduleId: "module_substance_use_and_parenting_stability",
    focusArea: "parents documenting consistent recovery and parenting stability over time (SS-CRS-AOD-006)",
    summary:
      "Shows parents how to record meaningful, longitudinal evidence of sober routines, service attendance, and reliable care without overclaiming or hiding setbacks.",
  },

  // Track B: Reunification & Contact Readiness
  {
    id: "reunification_foundations_and_expectations",
    title: "Reunification Foundation: Rights, Goals & First Actions",
    moduleId: "module_reunification_and_contact_readiness",
    focusArea: "parents beginning a child safety reunification pathway (SS-CRS-REU-001)",
    summary:
      "Provides clear orientation on stated child protection concerns, parent legal and procedural rights, case-plan goals, evidence expectations, and manageable first steps.",
  },
  {
    id: "understanding_child_experience_of_care",
    title: "Understanding the Child's Experience of Removal & Care",
    moduleId: "module_reunification_and_contact_readiness",
    focusArea: "parents supporting a child living in out-of-home, kinship, or foster care (SS-CRS-REU-002)",
    summary:
      "Helps parents understand grief, confusion, loyalty conflicts, and post-visit behavioural changes from the child's perspective so responses remain patient and child-centred.",
  },
  {
    id: "preparing_for_family_contact_visits",
    title: "Preparing for Family Contact Visits",
    moduleId: "module_reunification_and_contact_readiness",
    focusArea: "parents preparing for supervised or scheduled family contact visits (SS-CRS-REU-003)",
    summary:
      "Covers practical, emotional, and nervous-system preparation before contact visits, choosing age-appropriate activities, reading child cues, and saying goodbye calmly.",
  },
  {
    id: "learning_from_visit_feedback",
    title: "Learning from Visit Feedback & Observations",
    moduleId: "module_reunification_and_contact_readiness",
    focusArea: "parents reviewing contact visit notes and supervisor feedback constructively (SS-CRS-REU-004)",
    summary:
      "Teaches parents how to separate factual observations from opinion in contact logs, exercise their right of reply calmly, and turn feedback into practical next-visit goals.",
  },
  {
    id: "demonstrating_sustained_parenting_change",
    title: "Demonstrating Sustained Parenting Change",
    moduleId: "module_reunification_and_contact_readiness",
    focusArea: "parents moving from short-term compliance to sustained behavioural change (SS-CRS-REU-005)",
    summary:
      "Explains the SafeSteps 7-level Evidence Ladder — moving from exposure and knowledge to real-life application, consistency across time, and repair after setbacks.",
  },
  {
    id: "reunification_transition_and_home_again",
    title: "Reunification Transition & Home Again Maintenance",
    moduleId: "module_reunification_and_contact_readiness",
    focusArea: "families preparing for increased contact, overnight stays, and full-time return home (SS-CRS-REU-007/008)",
    summary:
      "Supports graduated return-home transitions, settling into household routines, managing post-return regression, and maintaining long-term family preservation.",
  },

  // Track C: Perinatal, Fatherhood, Support Networks & Mental Health
  {
    id: "pregnancy_and_perinatal_wellbeing",
    title: "Pregnancy, Perinatal Wellbeing & Preparing for Baby",
    moduleId: "module_fatherhood_perinatal_and_support_networks",
    focusArea: "expectant parents preparing for birth, perinatal safety, and antenatal bonding (SS-LIB-004)",
    summary:
      "Supports physical and emotional wellbeing during pregnancy, antenatal healthcare engagement, perinatal mental health awareness, and preparing a safe home for baby.",
  },
  {
    id: "newborn_care_and_fourth_trimester",
    title: "Newborn Care, Safe Sleep & the Fourth Trimester",
    moduleId: "module_fatherhood_perinatal_and_support_networks",
    focusArea: "parents of newborns navigating crying, safe sleep guidelines, and postpartum recovery (SS-LIB-004)",
    summary:
      "Covers evidence-based infant safe sleep (no weighted blankets for infants), soothing purple crying, responsive feeding, and coping with newborn sleep deprivation.",
  },
  {
    id: "fatherhood_and_positive_role_modelling",
    title: "Fatherhood, Accountability & Positive Role Modelling",
    moduleId: "module_fatherhood_perinatal_and_support_networks",
    focusArea: "fathers and male caregivers building safe, connected, and accountable parenting (SS-CRS-PAR-008)",
    summary:
      "Explores how fathers model respect, emotional regulation, shared caregiving, and non-violent accountability to break intergenerational cycles.",
  },
  {
    id: "building_your_village_and_support_network",
    title: "Building Your Village & Support Network",
    moduleId: "module_fatherhood_perinatal_and_support_networks",
    focusArea: "parents reducing isolation and building informal and formal support networks (SS-AST-009)",
    summary:
      "Helps parents map safe family members, community links, peer supports, and professional services so help is activated early before stress becomes a crisis.",
  },
  {
    id: "mental_health_support_and_crisis_planning",
    title: "Mental Health Support & Personal Crisis Planning",
    moduleId: "module_fatherhood_perinatal_and_support_networks",
    focusArea: "parents managing mental health challenges alongside caregiving responsibilities (SS-CRS-MH-005)",
    summary:
      "Guides parents in recognising early mental-health warning signs, collaborating with qualified clinicians, respecting medication boundaries, and preparing a child-safe crisis plan.",
  },
  {
    id: "safe_ai_support_coach_skills",
    title: "Using the SafeSteps AI Support Coach Safely",
    moduleId: "module_fatherhood_perinatal_and_support_networks",
    focusArea: "learners using AI learning coaches with clear safety and privacy boundaries (SS-CRS-MH-007)",
    summary:
      "Explains what the SafeSteps AI coach can and cannot do (no clinical diagnosis, no autonomous reporting, no legal compliance findings) and how to use it for practice and reflection.",
  },

  // Track D: Child Track
  {
    id: "child_rights_and_body_safety",
    title: "My Rights, Body Safety & Safe Secrets (Child Track)",
    moduleId: "module_child_rights_feelings_and_safety",
    focusArea: "children learning age-appropriate personal safety, boundaries, and rights (SS-CHD-009)",
    summary:
      "Child-friendly lesson teaching that every child has the right to feel safe, own their body boundaries, say no to unwanted touch, and tell a trusted adult about unsafe secrets.",
  },
  {
    id: "child_feelings_and_calming_tools",
    title: "My Feelings, Body Signals & Calming Tools (Child Track)",
    moduleId: "module_child_rights_feelings_and_safety",
    focusArea: "children learning to notice body clues, name feelings, and use calming strategies (SS-CHD-010)",
    summary:
      "Helps children recognise how feelings show up in their body (fast heart, tight tummy), name emotions without shame, and choose comforting calming tools.",
  },
  {
    id: "child_safe_adults_and_asking_for_help",
    title: "Safe People, Trusted Adults & Asking for Help (Child Track)",
    moduleId: "module_child_rights_feelings_and_safety",
    focusArea: "children identifying their Safety Hand of 5 trusted adults and how to ask for help (SS-CHD-007/008)",
    summary:
      "Guides children to identify trusted adults at home, school, and in the community, and practise simple ways to ask for help whenever they feel worried or unsafe.",
  },
  {
    id: "child_visit_preparation_and_transitions",
    title: "Preparing for Family Visits & Big Changes (Child Track)",
    moduleId: "module_child_rights_feelings_and_safety",
    focusArea: "children preparing for family contact visits and transitions between homes (SS-CHD-005/006)",
    summary:
      "Supports children before and after family visits to share their wishes, worries, favourite activities, and what helps them feel comfortable during transitions.",
  },

  // Track E: Adolescent & Youth Track
  {
    id: "adolescent_healthy_dating_and_consent",
    title: "Healthy Dating, Respect & Consent for Teens",
    moduleId: "module_adolescent_safety_and_relationships",
    focusArea: "adolescents and parents exploring respectful relationships, boundaries, and enthusiastic consent",
    summary:
      "Helps young people recognise green flags (respect, equality, honesty) vs. red flags (jealousy, tracking, pressure) in friendships and dating relationships.",
  },
  {
    id: "adolescent_digital_boundaries_and_safety",
    title: "Digital Boundaries, Sextortion Prevention & Online Respect",
    moduleId: "module_adolescent_safety_and_relationships",
    focusArea: "adolescents navigating social media, private images, cyberbullying, and digital safety",
    summary:
      "Equips teens and parents with practical strategies for online privacy, resisting digital pressure, recognising image-based abuse, and seeking help without blame.",
  },
  {
    id: "adolescent_coping_with_family_stress",
    title: "Coping With Family Change, Stress & Independence",
    moduleId: "module_adolescent_safety_and_relationships",
    focusArea: "adolescents navigating family separation, child safety involvement, or household stress",
    summary:
      "Supports teens to build healthy emotional outlets, avoid taking on adult responsibilities, maintain school/peer connections, and plan for independent life skills.",
  },

  // Track F: Foster & Kinship Carer Track
  {
    id: "carer_supporting_placement_transitions",
    title: "Supporting Placement Stability & Trauma-Informed Care",
    moduleId: "module_foster_and_kinship_carer_support",
    focusArea: "foster and kinship carers welcoming and stabilising a child in out-of-home care",
    summary:
      "Provides carers with trauma-informed routines, sensory predictability, cultural connection practices, and strategies for responding to survival behaviours with empathy.",
  },
  {
    id: "carer_facilitating_safe_family_contact",
    title: "Facilitating Safe Family Contact & Supporting Reunification",
    moduleId: "module_foster_and_kinship_carer_support",
    focusArea: "foster and kinship carers supporting children before and after parent contact visits",
    summary:
      "Helps carers speak respectfully about birth family, prepare children calmly for contact visits, and provide warm co-regulation when children return with big feelings.",
  },
  {
    id: "carer_objective_observation_and_child_voice",
    title: "Recording Objective Carer Observations & Honouring Child Voice",
    moduleId: "module_foster_and_kinship_carer_support",
    focusArea: "carers documenting factual care records and child voice under SS-AST-010 standards",
    summary:
      "Trains carers to record clear, fair, bias-free observations that strictly separate direct behavioural observation and the child's exact words from adult assumptions.",
  },

  // Track G: Advanced Neurodiversity & Tier-2 Master Competencies
  {
    id: "adhd_and_executive_function_scaffolding",
    title: "ADHD & Executive Function Scaffolding Across Childhood",
    moduleId: "module_neurodiversity_and_systemic_advocacy",
    focusArea: "parents supporting children and teens with ADHD, working memory, and task initiation needs (Track 4.2)",
    summary:
      "Replaces shame-based discipline with visual prosthetics, body doubling, dopamine-friendly micro-steps, and externalised executive function scaffolding.",
  },
  {
    id: "sensory_processing_and_sleep_architecture",
    title: "Sensory Processing, Regulation & Restorative Sleep Architecture",
    moduleId: "module_neurodiversity_and_systemic_advocacy",
    focusArea: "parents designing sensory-safe home environments and circadian routines for older children (Track 1 Master)",
    summary:
      "Covers sensory profiles (sensory seeking vs. avoiding), proprioceptive input, low-stimulation wind-down routines, and safe age-appropriate sleep environments.",
  },
  {
    id: "educational_and_ndis_rights_advocacy",
    title: "Educational, IEP & NDIS Rights Advocacy for Neurodivergent Children",
    moduleId: "module_neurodiversity_and_systemic_advocacy",
    focusArea: "parents navigating Individual Education Plans (IEPs), behaviour support plans, and NDIS reviews (Track 4 Master)",
    summary:
      "Equips parents to prepare functional evidence, request reasonable school adjustments, collaborate with allied health teams, and prevent exclusionary discipline.",
  },
  {
    id: "deescalating_dissociation_and_hyperarousal",
    title: "De-escalating Trauma-Related Dissociation & Hyperarousal",
    moduleId: "module_neurodiversity_and_systemic_advocacy",
    focusArea: "caregivers supporting children experiencing trauma flashbacks, panic, freeze, or hyperarousal (Track 3 Master)",
    summary:
      "Provides somatic grounding, orienting cues, consent-based comfort, and low-demand recovery protocols when a child's nervous system leaves the window of tolerance.",
  },
  {
    id: "navigating_child_welfare_case_conferences",
    title: "Navigating Child Welfare & Multi-Disciplinary Case Conferences",
    moduleId: "module_neurodiversity_and_systemic_advocacy",
    focusArea: "parents preparing for statutory case conferences, family group meetings, and case-plan reviews (Track 3 Master)",
    summary:
      "Builds case-planning literacy so parents can understand concerns, bring structured questions, present factual evidence of progress, and use support persons effectively.",
  },
  {
    id: "parallel_parenting_and_dfv_safety_plans",
    title: "Parallel Parenting & Co-Parenting Safety Plans in DFV Recovery",
    moduleId: "module_neurodiversity_and_systemic_advocacy",
    focusArea: "survivor parents managing post-separation contact and court orders safely after DFV (Track 3 Master)",
    summary:
      "Covers low-contact parallel parenting protocols, documented communication channels, safe handover arrangements, and protecting children from post-separation coercive control.",
  },
];

// Write the 7 new modules + 16 program course aliases to both modules/ and src/safesteps/courses/
for (const mod of newModules) {
  writeJson(path.join(modulesDir, `${mod.id}.json`), mod);
  writeJson(path.join(coursesDir, `${mod.id}.json`), mod);
}

for (const alias of programCourseAliases) {
  const modRecord = {
    id: alias.id,
    title: alias.title,
    description: alias.description,
    type: "module",
    level: "general",
    tags: ["program-pathway", alias.id],
    outcomes: [
      `Understand the core principles of ${alias.title.toLowerCase()}`,
      `Apply ${alias.title.toLowerCase()} safely in daily family routines`,
      `Document factual reflections and practical evidence of progress`,
    ],
    lessons: alias.lessons,
    content: [],
  };
  writeJson(path.join(modulesDir, `${alias.id}.json`), modRecord);
  writeJson(path.join(coursesDir, `${alias.id}.json`), modRecord);
}

// Write the 34 new lessons to lessons/ and 34 new topics to topics/ and src/safesteps/programs/
for (const spec of newLessonAndTopicSpecs) {
  const lessonRecord = {
    id: spec.id,
    title: spec.title,
    description: spec.summary,
    content: [],
    sections: buildRichSections(spec.id, spec.title, spec.focusArea),
  };
  writeJson(path.join(lessonsDir, `${spec.id}.json`), lessonRecord);

  const topicRecord = {
    id: spec.id,
    topicId: spec.id.replace(/_/g, "-"),
    topicName: spec.title.toLowerCase(),
    caseworkerSummary: `${spec.summary} This topic links directly to ${spec.moduleId} and supports structured reflection, practical skill application, and review-ready evidence.`,
    modules: [spec.moduleId],
  };
  writeJson(path.join(topicsDir, `${spec.id}.json`), topicRecord);
  writeJson(path.join(programsDir, `${spec.id}.json`), topicRecord);
}

// 4. Populate rich 3-section content and clean snake_case/placeholder titles across lessons/*.json
function formatTitleFromId(rawId) {
  const acronyms = new Set(["dfv", "aod", "cpr", "ai", "adhd", "asd", "ptsd", "lgbtq", "icwa", "fetal"]);
  const minorWords = new Set(["and", "or", "in", "on", "of", "for", "to", "with", "at", "by", "from", "the", "a", "an"]);
  const words = String(rawId || "")
    .replace(/^lesson_/, "")
    .split(/[_\s-]+/)
    .filter(Boolean);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (lower === "dfv") return "DFV";
      if (lower === "aod") return "AOD";
      if (lower === "cpr") return "CPR";
      if (lower === "ai") return "AI";
      if (lower === "adhd") return "ADHD";
      if (lower === "asd") return "ASD";
      if (lower === "ptsd") return "PTSD";
      if ( index > 0 && minorWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function hasPlaceholderSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return true;
  if (sections.some((sec) => /^section\s+\d+\s+for\s+/i.test(String(sec?.title || "").trim()))) {
    return true;
  }
  const overviews = sections
    .map((sec) => String(sec?.content?.overview || sec?.body || "").trim())
    .filter(Boolean);
  if (overviews.length > 1 && new Set(overviews).size < overviews.length) {
    return true;
  }
  return false;
}

const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".json"));
let populatedCount = 0;

for (const fileName of lessonFiles) {
  if (fileName === "family_conflict_psychoeducation_program.json") {
    // Keep canonical structure required by family-conflict-program-config.test.mjs
    continue;
  }

  const filePath = path.join(lessonsDir, fileName);
  const record = readJson(filePath);
  const baseId = record.id || path.basename(fileName, ".json");
  let modified = false;

  if (
    typeof record.title !== "string" ||
    !record.title.trim() ||
    /^[a-z0-9]+(_[a-z0-9]+)+$/i.test(record.title.trim()) ||
    /^lesson\s+\d+$/i.test(record.title.trim())
  ) {
    record.title = formatTitleFromId(baseId);
    modified = true;
  }

  const lowerTitle = record.title.toLowerCase();
  if (
    typeof record.description === "string" &&
    (!record.description.trim() || /placeholder content|content pending|lesson content goes here/i.test(record.description))
  ) {
    record.description = `Practical, trauma-informed guidance on ${lowerTitle} to strengthen child safety, emotional regulation, and consistent daily caregiving routines.`;
    modified = true;
  }

  if (hasPlaceholderSections(record.sections)) {
    const existingContent = record.content && typeof record.content === "object" && !Array.isArray(record.content)
      ? record.content
      : {};
    const keyConcepts = Array.isArray(existingContent.key_concepts) ? existingContent.key_concepts : [];
    const outcomes = Array.isArray(existingContent.learning_outcomes) ? existingContent.learning_outcomes : [];
    const activities = Array.isArray(existingContent.practice_activities) ? existingContent.practice_activities : [];
    const reflections = Array.isArray(existingContent.reflection_prompts) ? existingContent.reflection_prompts : [];

    record.sections = buildRichSections(
      baseId,
      record.title,
      "parents, caregivers, and family support practitioners",
      keyConcepts,
      outcomes,
      activities,
      reflections,
    );
    modified = true;
  }

  if (modified) {
    writeJson(filePath, record);
    populatedCount += 1;
  }
}

console.log(`Populated or cleaned multi-section content for ${populatedCount} lessons.`);
console.log(`Added ${newLessonAndTopicSpecs.length} new lessons and topics, plus ${newModules.length + programCourseAliases.length} modules/courses.`);

// 5. Clean src/safesteps/lessons top-level JSONs and program week*.json files
const srcLessonsDir = path.join(repoRoot, "src", "safesteps", "lessons");
if (fs.existsSync(srcLessonsDir)) {
  const programThemes = {
    "anger-management": {
      name: "Anger Management & Calm Leadership",
      lessonFocuses: [
        "Recognising Early Body Signals & Triggers",
        "Creating a Safe Pause Before Reacting",
        "De-Escalating Conflict & Lowering Tone",
        "Repairing After Tension & Restoring Safety",
        "Accountable Communication Under Stress",
        "Building Predictable Calm Routines",
        "Sustaining Emotional Regulation & Support",
      ],
    },
    "back-on-track": {
      name: "Back on Track Recovery & Stability",
      lessonFocuses: [
        "Building Daily Stability & Safe Routines",
        "Identifying Triggers, Stressors & Safer Choices",
        "Maintaining Child-Safe Supervision & Boundaries",
        "Strengthening Support Networks & Help-Seeking",
        "Honest Reflection, Accountability & Repair",
        "Sustaining Recovery Through Practical Evidence",
        "Reviewing Weekly Progress & Next Safe Steps",
      ],
    },
    "child-protection-awareness": {
      name: "Child Protection Awareness & Protective Care",
      lessonFocuses: [
        "Understanding Child Safety & Developmental Needs",
        "Recognising Risk, Harm & Cumulative Impact",
        "Working Constructively with Caseworkers & Plans",
        "Demonstrating Protective Capacity in Daily Care",
        "Transparent Communication & Safety Planning",
        "Documenting Observable Evidence of Safe Care",
        "Sustaining Long-Term Child-Centred Stability",
      ],
    },
    "domestic-violence-awareness": {
      name: "Domestic & Family Violence Safety & Accountability",
      lessonFocuses: [
        "Understanding Coercive Control, Fear & Child Impact",
        "Prioritising Non-Violence & Emotional Safety",
        "Replacing Control with Respectful Boundaries",
        "Supporting Children's Healing & Predictability",
        "Safe Parallel Parenting & Handover Protocols",
        "Taking Responsibility Without Blame or Minimisation",
        "Sustaining Safe, Non-Frightening Caregiving",
      ],
    },
    "home-again": {
      name: "Home Again Transition & Reunification Care",
      lessonFocuses: [
        "Preparing Predictable Home Routines & Transitions",
        "Supporting Children Through Big Adjustment Feelings",
        "Maintaining Calm Structure During Testing Moments",
        "Collaborating with Schools, Carers & Support Teams",
        "Repairing Early Ruptures & Rebuilding Trust",
        "Monitoring Stress Signals & Using Respite Safely",
        "Recording Weekly Stability & Family Connection",
      ],
    },
    "keeping-families-together": {
      name: "Keeping Families Together Preservation Practice",
      lessonFocuses: [
        "Strengthening Daily Caregiving & Home Safety",
        "Attuned Listening & Co-Regulation with Children",
        "Reducing Household Stress & Predictable Transitions",
        "Positive Boundary Setting Without Fear or Shame",
        "Using Family & Community Supports Early",
        "Repairing Conflict & Keeping Children Out of Adult Disputes",
        "Documenting Consistent Care & Weekly Family Wins",
      ],
    },
    "my-custom-plan": {
      name: "Tailored Family Safety & Growth Plan",
      lessonFocuses: [
        "Clarifying Weekly Case Goals & Observable Actions",
        "Practising Regulated Responses in Daily Routines",
        "Strengthening Parent-Child Connection & Trust",
        "Applying Safety Strategies & Support Check-Ins",
        "Capturing Factual Evidence & Reflection Notes",
        "Reviewing Barriers & Adjusting Next Steps",
        "Consolidating Sustainable Parenting Habits",
      ],
    },
    "parenting-skills": {
      name: "Core Trauma-Informed Parenting Skills",
      lessonFocuses: [
        "Connection Before Correction in Everyday Moments",
        "Age-Appropriate Expectations & Developmental Cues",
        "Calm Instructions, Limited Choices & Visual Routines",
        "Co-Regulation During Meltdowns & Big Emotions",
        "Logical, Related & Respectful Boundaries",
        "Consistent Repair After Parenting Mistakes",
        "Building Long-Term Confidence & Emotional Security",
      ],
    },
    "reunification": {
      name: "Reunification Readiness & Sustained Safe Care",
      lessonFocuses: [
        "Understanding the Child's Experience of Care & Contact",
        "Preparing Calm, Child-Centred Contact Visits",
        "Reading Cues & Pacing Affection Safely",
        "Managing Goodbye Transitions & Post-Visit Emotions",
        "Applying Caseworker Feedback Without Defensiveness",
        "Demonstrating Reliable Routines & Safe Housing Readiness",
        "Building aVerifiable Timeline of Protective Change",
      ],
    },
  };

  let cleanedSrcLessons = 0;
  let cleanedWeekFiles = 0;

  for (const entry of fs.readdirSync(srcLessonsDir, { withFileTypes: true })) {
    const fullPath = path.join(srcLessonsDir, entry.name);
    if (entry.isDirectory()) {
      const theme = programThemes[entry.name] || {
        name: formatTitleFromId(entry.name),
        lessonFocuses: [
          "Foundations of Safe & Predictable Care",
          "Emotional Regulation & Calm Communication",
          "Practical Application in Daily Routines",
          "Reflection, Repair & Evidence of Progress",
        ],
      };

      const weekFiles = fs.readdirSync(fullPath).filter((f) => f.endsWith(".json"));
      for (const wf of weekFiles) {
        const wfPath = path.join(fullPath, wf);
        const weekData = readJson(wfPath);
        const weekNum = weekData.week || Number(wf.replace(/\D+/g, "")) || 1;
        if (Array.isArray(weekData.lessons)) {
          let weekModified = false;
          weekData.lessons = weekData.lessons.map((lesson, idx) => {
            const focus = theme.lessonFocuses[idx % theme.lessonFocuses.length];
            const nextTitle = `Week ${weekNum} Part ${idx + 1}: ${focus}`;
            const nextContent = `In Week ${weekNum} of ${theme.name}, this lesson focuses on ${focus.toLowerCase()}. Parents and carers practise pausing to notice stress cues, responding with calm and predictable language, maintaining child-safe boundaries, and recording one observable example of how this skill supported their child's safety and emotional wellbeing this week.`;
            const needsTitle =
              typeof lesson.title !== "string" ||
              !lesson.title.trim() ||
              /^lesson\s+\d+$/i.test(lesson.title.trim()) ||
              /^stage\s+\d+/i.test(lesson.title.trim()) ||
              /^week\s+\d+\s+-\s+lesson\s+\d+$/i.test(lesson.title.trim());
            const needsContent =
              typeof lesson.content !== "string" ||
              !lesson.content.trim() ||
              /lesson content goes here|placeholder content|content pending/i.test(lesson.content.trim());

            if (needsTitle || needsContent) {
              weekModified = true;
              return {
                ...lesson,
                title: needsTitle ? nextTitle : lesson.title,
                content: needsContent ? nextContent : lesson.content,
              };
            }
            return lesson;
          });
          if (weekModified) {
            writeJson(wfPath, weekData);
            cleanedWeekFiles += 1;
          }
        }
      }
      continue;
    }

    if (!entry.name.endsWith(".json") || entry.name === "master-index.json") continue;
    const canonicalLessonPath = path.join(lessonsDir, entry.name);
    if (fs.existsSync(canonicalLessonPath)) {
      const canonicalRecord = readJson(canonicalLessonPath);
      writeJson(fullPath, canonicalRecord);
      cleanedSrcLessons += 1;
      continue;
    }

    const record = readJson(fullPath);
    if (!record || typeof record !== "object" || Array.isArray(record)) continue;
    const baseId = record.id || path.basename(entry.name, ".json");
    let modified = false;

    if (
      typeof record.title === "string" &&
      (/^[a-z0-9]+(_[a-z0-9]+)+$/i.test(record.title.trim()) || /^lesson\s+\d+$/i.test(record.title.trim()))
    ) {
      record.title = formatTitleFromId(baseId);
      modified = true;
    }

    if (Array.isArray(record.sections) && hasPlaceholderSections(record.sections)) {
      const titleForSections = record.title || formatTitleFromId(baseId);
      record.title = titleForSections;
      record.sections = buildRichSections(
        baseId,
        titleForSections,
        "parents, caregivers, and family support practitioners",
      );
      if (typeof record.description === "string" && !record.description.trim()) {
        record.description = `Practical, trauma-informed guidance on ${titleForSections.toLowerCase()} to strengthen child safety, emotional regulation, and consistent daily caregiving routines.`;
      }
      modified = true;
    }

    if (modified) {
      writeJson(fullPath, record);
      cleanedSrcLessons += 1;
    }
  }

  console.log(`Synchronized/cleaned ${cleanedSrcLessons} top-level files and ${cleanedWeekFiles} program week files in src/safesteps/lessons.`);
}


