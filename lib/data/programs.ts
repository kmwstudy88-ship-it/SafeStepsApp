export type ProgramLesson = {
  day: number;
  title: string;
  durationMinutes: number;
  requiresStartReflection: boolean;
  requiresKnowledgeCheckpoint: boolean;
  requiresScenarioCheckpoint: boolean;
  requiresPracticalActivity: boolean;
  requiresEndReflection: boolean;
};

export type ProgramWeek = {
  weekNumber: number;
  subTopic: string;
  startReflectionRequired: boolean;
  endReflectionRequired: boolean;
  lessons: ProgramLesson[];
};

export type ProgramMonth = {
  monthNumber: number;
  topic: string;
  startReflectionRequired: boolean;
  endReflectionRequired: boolean;
  weeks: ProgramWeek[];
};

export type ProgramPathway = {
  id: string;
  title: string;
  durationMonths: number;
  description: string;
  launchStatus: "launch" | "structured_draft" | "custom";
  launchLabel: string;
  curationNote: string;
  curation: ProgramCuration;
  months: ProgramMonth[];
  requiredLessonIds?: string[];
  workshopIds?: string[];
  featuredCourseIds?: string[];
};

export type CourseAssignmentRule = {
  courseId: string;
  reason: string;
};

export type ChallengeAssignmentRule = {
  context: string;
  assignWhen: string[];
  excludeWhen: string[];
  evidenceExpectation: string;
};

export type ProgramCuration = {
  targetCohort: string;
  riskLevel: "low" | "medium" | "high" | "very_high" | "custom";
  entryCriteria: string[];
  assessmentTriggers: string[];
  requiredCourseIds: string[];
  assessmentAssignedCourses: CourseAssignmentRule[];
  recommendedCourseIds: string[];
  lessonSequencingStrategy: string;
  deduplicationStrategy: string;
  challengeAssignmentRules: ChallengeAssignmentRule[];
  taskReflectionEvidenceProgressFlow: string[];
  reviewCadence: string;
  completionRules: string[];
  transitionRules: string[];
};

const generalMonthTopics = [
  "Communication",
  "Child Development",
  "Positive Parenting",
  "Attachment and Bonding",
  "Emotional Regulation",
  "Behaviour Management",
  "Child Safety",
  "Protective Parenting",
  "Family Routines",
  "Co-Parenting",
  "Reunification Parenting",
  "Trauma-Informed Parenting",
];

const generatedWeekFocus = [
  "Understanding the topic",
  "Practising the skill",
  "Using the skill under pressure",
  "Reviewing growth and next steps",
];

const generatedLessonFocus = [
  "What this means to my family",
  "What I already do well",
  "What gets difficult",
  "A safer way to practise",
  "What changed this week",
];

const keepingFamiliesTogetherMonthTopics = [
  "Immediate Safety and Family Preservation",
  "Protective Parenting at Home",
  "Stabilising Daily Routines",
  "Communication Without Escalation",
  "Child Emotional Safety",
  "Support Network and Help-Seeking",
  "Parent Regulation Under Pressure",
  "Home Environment and Practical Stability",
  "Repair, Accountability, and Trust",
  "Co-Parenting and Adult Boundaries",
  "School, Health, and Community Links",
  "Evidence of Protective Change",
  "Responding to New Concerns Early",
  "Sustaining Safe Home Patterns",
  "Child Voice and Family Participation",
  "Relapse Prevention and Support Plans",
  "Long-Term Preservation Review",
  "Transition to Maintenance Support",
];

const backOnTrackMonthTopics = [
  "Resetting Family Priorities",
  "Parent Regulation and Stress",
  "Consistent Routines",
  "Connection Before Correction",
  "Behaviour Guidance and Boundaries",
  "Safe Communication",
  "Repair After Conflict",
  "School and Community Stability",
  "Support Network Activation",
  "Evidence of Everyday Change",
  "Preparing for Step-Down Support",
  "Maintenance and Early Warning Signs",
];

const buildStrongerFamiliesMonthTopics = [
  "Parenting Confidence and Strengths",
  "Connection and Child-Led Time",
  "Positive Routines",
  "Calm Communication",
  "Boundaries and Problem Solving",
  "Family Maintenance Plan",
];

const childSafetyContactMonthTopics = [
  "Understanding Current Child Safety Expectations",
  "Contact, Communication, and Evidence",
  "Next-Step Planning and Review",
];

const reunificationMonthTopics = [
  "Beginning the Reunification Journey",
  "Safety, Accountability, and Trust",
  "Repairing Parent-Child Connection",
  "Predictable Parenting Time",
  "Preparing for Increased Contact",
  "Parenting Time Transitions",
  "Re-Establishing Family Identity",
  "Full-Time Family Adjustment",
  "Long-Term Family Stability",
  "Family Communication Practice",
  "Problem-Solving Skills",
  "Sustaining Reunification Progress",
  "Strengthening Trust After Reunification",
  "Building Long-Term Routines",
  "Supporting Emotional Development",
  "Guiding Behaviour With Safety",
  "Managing Stress and Setbacks",
  "Deepening Parent-Child Connection",
  "Strengthening Long-Term Safety",
  "Supporting Family Growth",
  "Long-Term Emotional Stability",
  "Life Skills and Independence",
  "Future-Focused Family Planning",
  "Celebrating the Reunification Journey",
];

const reunificationWeekFocus = [
  "Safety, accountability, and case-plan clarity",
  "Child experience, attachment, and repair",
  "Regulation, routines, and parenting under pressure",
  "Evidence review, support coordination, and next steps",
];

const reunificationLessonFocus = [
  "Understand the current reunification expectation",
  "Name what this means for my child",
  "Practise one safe parenting behaviour",
  "Prepare for contact, transition, or home routine",
  "Use support before stress escalates",
  "Record factual evidence of safe change",
  "Reflect on progress, repair, and next steps",
];

const homeAgainMonthTopics = [
  "Returning Home Safely",
  "Settling Into Home Routines",
  "Rebuilding Trust at Home",
  "Supporting Child Adjustment",
  "Managing Stress After Return Home",
  "Strengthening Family Communication",
  "Keeping Home Stable",
  "Repairing Connection After Setbacks",
  "Building Confidence in Daily Parenting",
  "Preparing for Long-Term Stability",
  "Reviewing Progress and Support Needs",
  "Sustaining Home Again Success",
];

const homeAgainWeekFocus = [
  "Creating safety at home",
  "Supporting routines and adjustment",
  "Practising repair and connection",
  "Reviewing stability and next steps",
];

const homeAgainLessonFocus = [
  "Making home feel predictable",
  "Supporting your child's feelings",
  "Practising a calm parenting response",
  "Building evidence of safe change",
  "Reflecting on home stability this week",
];

function createGeneratedLesson(day: number, topic: string, focus: string): ProgramLesson {
  return {
    day,
    title: `${topic}: ${focus}`,
    durationMinutes: 30,
    requiresStartReflection: true,
    requiresKnowledgeCheckpoint: true,
    requiresScenarioCheckpoint: true,
    requiresPracticalActivity: true,
    requiresEndReflection: true,
  };
}

function createProgramLesson(day: number, topic: string, focus: string): ProgramLesson {
  return {
    day,
    title: `${focus} during ${topic.toLowerCase()}`,
    durationMinutes: 30,
    requiresStartReflection: true,
    requiresKnowledgeCheckpoint: true,
    requiresScenarioCheckpoint: true,
    requiresPracticalActivity: true,
    requiresEndReflection: true,
  };
}

function createReunificationLesson(day: number, topic: string, focus: string): ProgramLesson {
  return createProgramLesson(day, topic, focus);
}

function createGeneratedMonth(monthNumber: number, topics = generalMonthTopics): ProgramMonth {
  const topic = topics[(monthNumber - 1) % topics.length];

  return {
    monthNumber,
    topic,
    startReflectionRequired: true,
    endReflectionRequired: true,
    weeks: generatedWeekFocus.map((focus, index) => ({
      weekNumber: index + 1,
      subTopic: `${topic}: ${focus}`,
      startReflectionRequired: true,
      endReflectionRequired: true,
      lessons: generatedLessonFocus.map((lessonFocus, lessonIndex) =>
        createGeneratedLesson(lessonIndex + 1, topic, lessonFocus),
      ),
    })),
  };
}

function createReunificationMonth(monthNumber: number): ProgramMonth {
  const topic = reunificationMonthTopics[monthNumber - 1] ?? `Reunification Month ${monthNumber}`;

  return {
    monthNumber,
    topic,
    startReflectionRequired: true,
    endReflectionRequired: true,
    weeks: reunificationWeekFocus.map((focus, index) => ({
      weekNumber: index + 1,
      subTopic: `${topic}: ${focus}`,
      startReflectionRequired: true,
      endReflectionRequired: true,
      lessons: reunificationLessonFocus.map((lessonFocus, lessonIndex) =>
        createReunificationLesson(lessonIndex + 1, topic, lessonFocus),
      ),
    })),
  };
}

function createHomeAgainMonth(monthNumber: number): ProgramMonth {
  const topic = homeAgainMonthTopics[monthNumber - 1] ?? `Home Again Month ${monthNumber}`;

  return {
    monthNumber,
    topic,
    startReflectionRequired: true,
    endReflectionRequired: true,
    weeks: homeAgainWeekFocus.map((focus, index) => ({
      weekNumber: index + 1,
      subTopic: `${topic}: ${focus}`,
      startReflectionRequired: true,
      endReflectionRequired: true,
      lessons: homeAgainLessonFocus.map((lessonFocus, lessonIndex) =>
        createProgramLesson(lessonIndex + 1, topic, lessonFocus),
      ),
    })),
  };
}

export function getProgramMonths(program: ProgramPathway) {
  if (program.months.length > 0) return program.months;

  const totalMonths = program.durationMonths > 0 ? program.durationMonths : 1;
  if (program.id === "intensive-reunification") {
    return Array.from({ length: totalMonths }, (_, index) => createReunificationMonth(index + 1));
  }

  if (program.id === "home-again") {
    return Array.from({ length: totalMonths }, (_, index) => createHomeAgainMonth(index + 1));
  }

  if (program.id === "keeping-families-together") {
    return Array.from({ length: totalMonths }, (_, index) => createGeneratedMonth(index + 1, keepingFamiliesTogetherMonthTopics));
  }

  if (program.id === "back-on-track") {
    return Array.from({ length: totalMonths }, (_, index) => createGeneratedMonth(index + 1, backOnTrackMonthTopics));
  }

  if (program.id === "build-stronger-families") {
    return Array.from({ length: totalMonths }, (_, index) => createGeneratedMonth(index + 1, buildStrongerFamiliesMonthTopics));
  }

  if (program.id === "child-safety-contact") {
    return Array.from({ length: totalMonths }, (_, index) => createGeneratedMonth(index + 1, childSafetyContactMonthTopics));
  }

  return Array.from({ length: totalMonths }, (_, index) => createGeneratedMonth(index + 1));
}

export function getProgramMonth(program: ProgramPathway, monthNumber: number) {
  return getProgramMonths(program).find((month) => month.monthNumber === monthNumber) ?? null;
}

export function getProgramWeek(program: ProgramPathway, monthNumber: number, weekNumber: number) {
  return getProgramMonth(program, monthNumber)?.weeks.find((week) => week.weekNumber === weekNumber) ?? null;
}

export const programs: ProgramPathway[] = [
  {
    id: "intensive-reunification",
    title: "24-Month Intensive Reunification Program",
    durationMonths: 24,
    description: "Long-term reunification pathway for parents working toward safe, sustained family restoration after serious child safety concerns.",
    launchStatus: "launch",
    launchLabel: "Launch program",
    curationNote: "Official long-form SafeSteps reunification pathway. Uses curated month topics for sustained, evidence-based change.",
    curation: {
      targetCohort: "Parents working toward safe reunification after child removal or extended separation.",
      riskLevel: "very_high",
      entryCriteria: ["Child not living with parent", "Reunification goal active", "Worker review confirms suitability"],
      assessmentTriggers: ["Safety and protective capacity", "Parent-child relationship repair", "Contact readiness", "Home stability", "Support network"],
      requiredCourseIds: ["parent-safety-and-stability", "child-safety-foundations", "protective-parenting-foundations", "demonstrating-change-self-managed-safety"],
      assessmentAssignedCourses: [
        { courseId: "emotional-regulation-for-parents", reason: "Assigned when stress, escalation, or regulation indicators are a barrier to safer contact." },
        { courseId: "co-parenting-after-separation", reason: "Assigned when adult conflict or separation dynamics affect child safety or contact planning." },
        { courseId: "substance-use-and-parenting-stability", reason: "Assigned only when assessment identifies substance-use stability needs." },
      ],
      recommendedCourseIds: ["attachment-and-bonding-foundations", "family-routines-and-structure", "safe-conversations"],
      lessonSequencingStrategy: "Move from safety and accountability to contact preparation, increased parenting time, home adjustment, then long-term maintenance.",
      deduplicationStrategy: "Keep overlapping safety, repair, and routine lessons as staged practice only when they introduce a new context or evidence expectation.",
      challengeAssignmentRules: [
        {
          context: "Reunification contact preparation",
          assignWhen: ["Supervised or planned contact is active", "Parent can practise safely before or after contact"],
          excludeWhen: ["Immediate safety crisis", "No current contact plan", "Challenge would pressure the child for reassurance"],
          evidenceExpectation: "Contact preparation note, factual reflection, or worker-approved upload linked to the relevant week.",
        },
      ],
      taskReflectionEvidenceProgressFlow: ["Assessment identifies priority domains", "Program month sets the focus", "Lesson reflection names parent meaning", "Challenge creates a real-world task", "Evidence upload documents practice", "Progress indicators update during review"],
      reviewCadence: "Weekly reflection, monthly review, 12-week worker review",
      completionRules: ["Required courses completed", "Monthly reflections and evidence are consistent", "Worker review confirms demonstrated safe change", "Transition or maintenance plan is documented"],
      transitionRules: ["Transition to Home Again after return home", "Continue intensive pathway if reunification is delayed", "Move to custom pathway if assessment identifies specialist needs outside the standard sequence"],
    },
    months: []
  },
  {
    id: "home-again",
    title: "Home Again Program",
    durationMonths: 12,
    description: "Flexible 6–12 month reunification transition pathway focused on rebuilding safe routines, home stability, connection, and child adjustment after return home. Duration is tailored to the family's pace — most families complete in 6 months; complex transitions may use the full 12.",
    launchStatus: "launch",
    launchLabel: "Launch program",
    curationNote: "Official return-home transition pathway. Uses curated topics for home stability, adjustment, repair, and ongoing review.",
    curation: {
      targetCohort: "Families where a child has returned home or is in a planned return-home transition.",
      riskLevel: "high",
      entryCriteria: ["Child has recently returned home or return-home planning is active", "Home routines and adjustment need structured support", "Worker review confirms a transition pathway is appropriate"],
      assessmentTriggers: ["Home stability", "Child adjustment", "Routine consistency", "Repair after separation", "Stress and support needs"],
      requiredCourseIds: ["family-routines-and-structure", "parent-safety-and-stability", "attachment-and-bonding-foundations"],
      assessmentAssignedCourses: [
        { courseId: "emotional-regulation-for-parents", reason: "Assigned when stress after return home is affecting calm parenting." },
        { courseId: "child-development-foundations", reason: "Assigned when expectations need to be reset to the child's age, stage, or adjustment needs." },
      ],
      recommendedCourseIds: ["communication-skills", "safe-conversations", "building-your-village"],
      lessonSequencingStrategy: "Start with home safety and routines, then child adjustment, repair, confidence, and stability maintenance.",
      deduplicationStrategy: "Use repeated routine and repair topics as home-context practice, not duplicate standalone lessons.",
      challengeAssignmentRules: [
        {
          context: "Home adjustment",
          assignWhen: ["Child is living at home or trial home time is active", "Routine practice can be observed safely"],
          excludeWhen: ["Child is not yet spending meaningful time at home", "A task would conflict with a safety plan"],
          evidenceExpectation: "Routine log, reflection note, or practical upload showing stable home adjustment.",
        },
      ],
      taskReflectionEvidenceProgressFlow: ["Return-home assessment sets priority needs", "Weekly lesson builds one home skill", "Task practises the skill in routine life", "Reflection records child response and parent adjustment", "Evidence supports the review conversation", "Progress updates focus on stability and repair"],
      reviewCadence: "Weekly reflection, monthly stability review, and 12-week transition review.",
      completionRules: ["Home stability goals met", "Required courses and reflections completed", "Evidence shows repeated safe routines", "Maintenance plan is agreed"],
      transitionRules: ["Step down to Build Stronger Families when risk reduces", "Return to Intensive Reunification if return-home stability breaks down", "Move to custom pathway for specialist needs"],
    },
    months: []
  },
  {
    id: "keeping-families-together",
    title: "Keeping Families Together",
    durationMonths: 18,
    description: "18-month intensive family preservation program for families at the highest risk of child removal. Focuses on protective parenting, safety planning, stability, evidence of change, and sustained family preservation where the child remains in the home.",
    launchStatus: "structured_draft",
    launchLabel: "Structured draft",
    curationNote: "Curated structured draft for the highest-risk families where children remain at home and removal risk is significant. Requires final governance review before launch.",
    curation: {
      targetCohort: "Families at the highest risk of child removal where the child remains at home — statutory concerns are active and sustained protective change must be demonstrated.",
      riskLevel: "very_high",
      entryCriteria: ["Child remains in the home", "Removal risk or statutory concern is active", "Parent can safely practise preservation tasks with review"],
      assessmentTriggers: ["Protective parenting", "Home stability", "Routine consistency", "Adult conflict", "Support network strength"],
      requiredCourseIds: ["protective-parenting-foundations", "parent-safety-and-stability", "family-routines-and-structure"],
      assessmentAssignedCourses: [
        { courseId: "emotional-regulation-for-parents", reason: "Assigned when escalation or stress responses affect child emotional safety." },
        { courseId: "safe-conversations", reason: "Assigned when difficult conversations or adult conflict need safer boundaries." },
        { courseId: "building-your-village", reason: "Assigned when the support network is weak or crisis-dependent." },
      ],
      recommendedCourseIds: ["communication-skills", "child-development-foundations", "demonstrating-change-self-managed-safety"],
      lessonSequencingStrategy: "Start with immediate preservation safety, then protective parenting, routines, communication, child emotional safety, support, evidence, and maintenance.",
      deduplicationStrategy: "Merge overlapping communication and connection topics into staged preservation contexts: safety first, routine practice, repair, then maintenance.",
      challengeAssignmentRules: [
        {
          context: "Family preservation",
          assignWhen: ["Child is living at home", "Parent can practise without increasing conflict", "Task directly supports a current safety or stability goal"],
          excludeWhen: ["Child is removed from home", "Immediate violence, intoxication, or unmanaged crisis is present", "Challenge would ask the child to carry adult responsibility"],
          evidenceExpectation: "Weekly factual evidence note or upload showing protective action, routine stability, support use, or repair.",
        },
      ],
      taskReflectionEvidenceProgressFlow: ["Assessment identifies preservation priorities", "Required course builds the safety concept", "Lesson reflection converts it to parent meaning", "Challenge assigns one home practice", "Evidence captures what changed", "Progress review updates protective capacity and next focus"],
      reviewCadence: "Weekly reflection and evidence check, monthly goal review, 12-week preservation review.",
      completionRules: ["Required courses completed", "Home safety and routine goals demonstrate sustained change", "Evidence is consistent across at least one review cycle", "Transition plan names supports and early warning signs"],
      transitionRules: ["Step down to Back on Track when removal risk reduces", "Move to Intensive Reunification if the child is removed", "Move to custom pathway when specialist assessment needs dominate"],
    },
    months: []
  },
  {
    id: "back-on-track",
    title: "Back on Track",
    durationMonths: 6,
    description: "Focused 6-month medium-risk family support program to reset parenting skills, stabilise routines, improve emotional regulation, and prevent escalation to higher-risk pathways.",
    launchStatus: "structured_draft",
    launchLabel: "Structured draft",
    curationNote: "Curated structured draft for medium-risk escalating concerns. Requires final governance review before launch.",
    curation: {
      targetCohort: "Medium-risk families with escalating parenting, routine, regulation, or support concerns before high-risk preservation is needed.",
      riskLevel: "medium",
      entryCriteria: ["Concerns are escalating but child removal is not the current pathway", "Parent can participate in skills practice", "Assessment shows two or more priority domains"],
      assessmentTriggers: ["Emotional regulation", "Routines", "Communication", "Behaviour guidance", "Support network"],
      requiredCourseIds: ["emotional-regulation-for-parents", "family-routines-and-structure", "communication-skills"],
      assessmentAssignedCourses: [
        { courseId: "behaviour-management-foundations", reason: "Assigned when behaviour guidance and boundaries are a priority." },
        { courseId: "child-development-foundations", reason: "Assigned when parent expectations need development-aware adjustment." },
        { courseId: "building-your-village", reason: "Assigned when support is isolated, inconsistent, or crisis-only." },
      ],
      recommendedCourseIds: ["positive-parenting-foundations", "safe-conversations", "accountability-and-responsibility"],
      lessonSequencingStrategy: "Over 6 months: reset priorities and stabilise parent regulation (months 1–2), build routines and connection (months 3–4), then consolidate boundaries, repair, evidence, and maintenance planning (months 5–6).",
      deduplicationStrategy: "Keep repeated regulation and routine lessons only when the scenario changes from learning to pressure practice to maintenance.",
      challengeAssignmentRules: [
        {
          context: "Escalation prevention",
          assignWhen: ["Assessment identifies a practical routine or regulation target", "Parent can complete a short daily or weekly task"],
          excludeWhen: ["Risk has escalated to active removal planning", "Challenge requires unsupervised practice that contradicts a case plan"],
          evidenceExpectation: "Short practice note, routine tracker, or reflection linked to the weekly focus.",
        },
      ],
      taskReflectionEvidenceProgressFlow: ["Assessment chooses the top two domains", "Required course starts the pathway", "Weekly lesson teaches one behaviour", "Task practises it in a low-risk moment", "Reflection records what helped and what escalated", "Progress review decides whether to step up, continue, or step down"],
      reviewCadence: "Weekly self-review, monthly progress review, and 12-week escalation-prevention review.",
      completionRules: ["Required courses complete", "Priority domains show stable or improving progress", "Parent completes review reflections", "Next support level is documented"],
      transitionRules: ["Step up to Keeping Families Together if risk increases", "Step down to Build Stronger Families when routines and regulation stabilise", "Move to custom pathway for specialist issues"],
    },
    months: []
  },
  {
    id: "build-stronger-families",
    title: "Build Stronger Families",
    durationMonths: 12,
    description: "12-month early support program focused on strengthening parenting confidence, connection, routines, and communication — designed for lower-risk families building towards sustained positive change.",
    launchStatus: "structured_draft",
    launchLabel: "Structured draft",
    curationNote: "Curated structured draft for lower-risk early intervention and confidence building. Requires final governance review before launch.",
    curation: {
      targetCohort: "Lower-risk parents seeking early support, parenting confidence, stronger connection, and predictable family routines.",
      riskLevel: "low",
      entryCriteria: ["No active high-risk safety pathway", "Parent wants structured early support", "Assessment indicates confidence, connection, routine, or communication goals"],
      assessmentTriggers: ["Parent confidence", "Connection", "Routine consistency", "Communication", "Problem solving"],
      requiredCourseIds: ["positive-parenting-foundations", "communication-skills"],
      assessmentAssignedCourses: [
        { courseId: "family-routines-and-structure", reason: "Assigned when routines or household predictability are a priority." },
        { courseId: "child-development-foundations", reason: "Assigned when development knowledge would improve expectations and confidence." },
      ],
      recommendedCourseIds: ["attachment-and-bonding-foundations", "building-your-village", "safe-conversations"],
      lessonSequencingStrategy: "Over 12 months: begin with strengths and confidence (months 1–3), build connection and routines (months 4–6), develop calm communication and boundaries (months 7–9), then consolidate and plan long-term maintenance (months 10–12).",
      deduplicationStrategy: "Combine similar connection and communication lessons into one progressive skills sequence with fewer evidence demands.",
      challengeAssignmentRules: [
        {
          context: "Early support",
          assignWhen: ["Task is strengths-based and low intensity", "Parent can practise in ordinary family routines"],
          excludeWhen: ["Assessment identifies high-risk safety concerns", "Challenge would replace needed professional or statutory review"],
          evidenceExpectation: "Optional reflection or simple evidence note focused on consistency and parent learning.",
        },
      ],
      taskReflectionEvidenceProgressFlow: ["Assessment identifies growth goals", "Course introduces the skill", "Lesson reflection connects it to family strengths", "Challenge creates a small practice task", "Evidence is optional unless enrolled evidence mode is active", "Progress updates confidence and consistency"],
      reviewCadence: "Fortnightly self-review and monthly progress check.",
      completionRules: ["Required courses complete", "Parent identifies repeatable family strengths", "Maintenance routine is documented", "Optional evidence supports progress where relevant"],
      transitionRules: ["Step up to Back on Track if concerns escalate", "Continue in learning library for maintenance", "Move to custom pathway for specific support needs"],
    },
    months: []
  },
  {
    id: "quick-start",
    title: "3-Month Quick Start Program",
    durationMonths: 3,
    description: "A focused 3-month (12-week) foundations pathway for parents who are new to structured family support. Builds core parenting awareness, communication, protective habits, and evidence of early change — suitable as a starting point for any parent entering a support service.",
    launchStatus: "structured_draft",
    launchLabel: "Structured draft",
    curationNote: "Curated structured draft as a general 3-month entry and orientation pathway. Suitable for parents new to support regardless of involvement type. Requires governance review before launch.",
    curation: {
      targetCohort: "Parents who are new to structured family support and need a short, accessible pathway to build foundations, understand expectations, and begin demonstrating change.",
      riskLevel: "custom",
      entryCriteria: ["Parent is entering structured family support", "A short entry pathway is more suitable than enrolling directly in a longer program", "Worker or self-referral confirms foundational need"],
      assessmentTriggers: ["Parenting foundations", "Communication and engagement", "Safety awareness", "Evidence readiness", "Short-term goal setting"],
      requiredCourseIds: ["parent-safety-and-stability", "protective-parenting-foundations", "communication-skills"],
      assessmentAssignedCourses: [
        { courseId: "co-parenting-after-separation", reason: "Assigned when separated-parent communication affects contact or child safety." },
        { courseId: "demonstrating-change-self-managed-safety", reason: "Assigned when the main need is clearer evidence of practical change." },
      ],
      recommendedCourseIds: ["positive-parenting-foundations", "building-your-village", "child-development-foundations"],
      lessonSequencingStrategy: "12 weeks: build safety and protective awareness (weeks 1–4), practise communication and engagement with support (weeks 5–8), then document early evidence and plan the next step (weeks 9–12).",
      deduplicationStrategy: "Keep only lessons tied to core foundations, communication, evidence, and goal-setting. Avoid duplication with longer pathway content that will follow.",
      challengeAssignmentRules: [
        {
          context: "Foundations entry",
          assignWhen: ["The task aligns with a current support goal", "Parent can complete it safely and factually in daily life"],
          excludeWhen: ["Task conflicts with court, contact, or safety directions", "Immediate risk requires professional response"],
          evidenceExpectation: "Factual note, short reflection, or upload showing early foundations practice.",
        },
      ],
      taskReflectionEvidenceProgressFlow: ["Assessment clarifies current entry needs and goals", "Required course builds core safety and communication foundations", "Reflection names what the parent understands now", "Challenge creates one practical task", "Evidence is factual and review-ready", "Progress review identifies the right next pathway"],
      reviewCadence: "Weekly check-in across 12 weeks, with a transition review at completion.",
      completionRules: ["Required short-pathway courses complete", "Parent can name current goals and next steps", "Evidence is factual and organised", "Worker or self-review confirms readiness to transition to a longer pathway"],
      transitionRules: ["Move to Intensive Reunification when removal/reunification work is active", "Move to Keeping Families Together when child remains home and removal risk is high", "Move to Back on Track when medium-level support is the right fit", "Move to Build Stronger Families for lower-risk continued growth"],
    },
    months: []
  },
  {
    id: "custom-program",
    title: "Specialised Personal Custom Program",
    durationMonths: 0,
    description: "Flexible program pathway tailored to family needs, goals, risk level, and support requirements.",
    launchStatus: "custom",
    launchLabel: "Custom pathway",
    curationNote: "Assessment-led pathway placeholder. Should be built per family from selected courses, lessons, challenges, evidence goals, and worker review.",
    curation: {
      targetCohort: "Families whose assessment profile does not fit one fixed pathway or needs a worker-built specialist plan.",
      riskLevel: "custom",
      entryCriteria: ["Assessment-led routing identifies mixed or specialist needs", "Worker review is available", "Selected content can be tied to clear goals"],
      assessmentTriggers: ["Any assessed priority domain", "Specialist support needs", "Court or service requirements", "Accessibility or cultural support needs"],
      requiredCourseIds: [],
      assessmentAssignedCourses: [
        { courseId: "parent-safety-and-stability", reason: "Assigned when safety and practical stability are priority domains." },
        { courseId: "emotional-regulation-for-parents", reason: "Assigned when regulation is a priority domain." },
        { courseId: "family-routines-and-structure", reason: "Assigned when routines are a priority domain." },
      ],
      recommendedCourseIds: [],
      lessonSequencingStrategy: "Build only from assessed priorities, sequencing safety before skill practice and skill practice before evidence-heavy tasks.",
      deduplicationStrategy: "Choose one best-fit lesson per learning objective unless a later stage adds a new context, review point, or evidence requirement.",
      challengeAssignmentRules: [
        {
          context: "Assessment-led custom tasking",
          assignWhen: ["Challenge maps to an assessment priority", "Context exclusions have been checked", "Evidence expectation is clear"],
          excludeWhen: ["Challenge is generic filler", "Task conflicts with safety, contact, or court directions"],
          evidenceExpectation: "Worker-selected evidence note or upload tied to the custom goal.",
        },
      ],
      taskReflectionEvidenceProgressFlow: ["Assessment identifies needs", "Worker selects courses and lessons", "Reflection sets family meaning", "Challenge is assigned only when contextually suitable", "Evidence links to the custom goal", "Progress review adjusts the pathway"],
      reviewCadence: "Worker-defined, with at least monthly review while active.",
      completionRules: ["Custom goals are met or revised", "Selected required items are completed", "Evidence and reflections support the review decision"],
      transitionRules: ["Move to a fixed pathway when the family profile clearly matches one", "Close to maintenance when goals are stable", "Escalate to higher-intensity pathway if risk increases"],
    },
    months: []
  }
];

export function getProgramById(programId: string) {
  return programs.find((program) => program.id === programId) ?? null;
}

export function getLaunchPrograms() {
  return programs.filter((program) => program.launchStatus === "launch");
}

export function getStructuredDraftPrograms() {
  return programs.filter((program) => program.launchStatus === "structured_draft");
}

export function getCustomProgramPathways() {
  return programs.filter((program) => program.launchStatus === "custom");
}
