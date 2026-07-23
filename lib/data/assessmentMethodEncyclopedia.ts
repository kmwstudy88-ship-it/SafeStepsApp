export type AssessmentMethodDomain = {
  id: string;
  name: string;
  measures: string;
  methods: string[];
};

export const assessmentMethodEncyclopediaTitle = "SafeSteps Assessment Encyclopedia";
export const assessmentMethodEncyclopediaSourceClaim = "Approximately 5,000+ Assessment Methods";

export const assessmentMethodTaxonomy = [
  "Learning",
  "Knowledge",
  "Understanding",
  "Insight",
  "Critical Thinking",
  "Problem Solving",
  "Decision Making",
  "Emotional Intelligence",
  "Parenting Skills",
  "Child Development",
  "Attachment",
  "Trauma",
  "Safety",
  "Communication",
  "Behaviour",
  "Habits",
  "Relationships",
  "Home Environment",
  "Mental Wellbeing",
  "Protective Factors",
  "Risk Factors",
  "Resilience",
  "Executive Function",
  "Social Skills",
  "Cultural Competence",
  "Practical Skills",
  "Daily Living",
  "Community Engagement",
  "Evidence Collection",
  "Longitudinal Change",
  "Professional Review",
  "AI Analysis"
] as const;

export const assessmentMethodDomains: AssessmentMethodDomain[] = [
  {
    "id": "knowledge",
    "name": "Knowledge",
    "measures": "Measures recall.",
    "methods": [
      "Quiz",
      "Flashcards",
      "Matching",
      "Multiple choice",
      "Fill in blank",
      "Teach-back",
      "Oral questioning",
      "Voice response",
      "AI interview",
      "Speed recall",
      "Definitions",
      "Image identification",
      "Video identification",
      "Audio identification",
      "Hotspot questions",
      "Categorisation",
      "Sequencing",
      "Crosswords",
      "Memory games",
      "Knowledge tournaments"
    ]
  },
  {
    "id": "understanding",
    "name": "Understanding",
    "measures": "Measures whether someone truly understands the concept.",
    "methods": [
      "Explain in own words",
      "Explain to child",
      "Explain to worker",
      "Explain to another parent",
      "Explain why",
      "Explain why not",
      "Rewrite simply",
      "Summarise",
      "Compare",
      "Debate",
      "Create analogy",
      "Find misconception",
      "Identify missing information",
      "Correct false statement",
      "Create examples",
      "Create non-examples",
      "Predict outcome",
      "Explain consequences",
      "Apply theory",
      "AI interview"
    ]
  },
  {
    "id": "insight",
    "name": "Insight",
    "measures": "Measures self-awareness.",
    "methods": [
      "Reflection journal",
      "Personal story",
      "Trigger mapping",
      "Parenting strengths",
      "Parenting weaknesses",
      "Personal values",
      "Emotional awareness",
      "Behaviour awareness",
      "Stress awareness",
      "Relationship awareness",
      "Child awareness",
      "Accountability exercise",
      "Responsibility reflection",
      "Growth reflection",
      "Blind spot identification",
      "Motivation assessment",
      "Future planning",
      "Goal review",
      "Self-rating",
      "AI insight interview"
    ]
  },
  {
    "id": "behaviour",
    "name": "Behaviour",
    "measures": "Measures actual behaviour.",
    "methods": [
      "Daily challenge",
      "Weekly challenge",
      "Home challenge",
      "Behaviour log",
      "Mood log",
      "Sleep log",
      "Parenting log",
      "Child interaction log",
      "Evidence uploads",
      "GPS attendance (if explicitly enabled and appropriate)",
      "Task completion",
      "Routine completion",
      "Habit tracking",
      "Reward tracking",
      "Behaviour frequency",
      "Behaviour duration",
      "Behaviour intensity",
      "Before/after comparison",
      "AI trend analysis",
      "Worker observation"
    ]
  },
  {
    "id": "communication",
    "name": "Communication",
    "measures": "Measures communication skills.",
    "methods": [
      "AI conversation",
      "Difficult discussion",
      "Parent-child role play",
      "Phone simulation",
      "Worker meeting",
      "Active listening",
      "Reflective listening",
      "Validation",
      "Repair conversation",
      "Apology practice",
      "Negotiation",
      "Conflict resolution",
      "Family meeting",
      "Email writing",
      "Text response",
      "Conversation ordering",
      "Video response",
      "Audio response",
      "Peer review",
      "Communication analysis"
    ]
  },
  {
    "id": "emotional_regulation",
    "name": "Emotional Regulation",
    "measures": "Measures regulation awareness, strategy use, recovery, and long-term emotional change.",
    "methods": [
      "Window of tolerance",
      "Trigger identification",
      "Body mapping",
      "Stress diary",
      "Regulation planning",
      "Grounding practice",
      "Breathing demonstration",
      "Recovery speed",
      "Emotional flexibility",
      "Self-compassion",
      "Compassion exercise",
      "Perspective taking",
      "Gratitude practice",
      "Emotional vocabulary",
      "Facial recognition",
      "Tone recognition",
      "AI coaching session",
      "Reflection",
      "Regulation log",
      "Long-term tracking"
    ]
  },
  {
    "id": "parenting_skills",
    "name": "Parenting Skills",
    "measures": "Measures practical parenting routines, co-regulation, boundaries, repair, and consistency.",
    "methods": [
      "Bedtime routine",
      "Morning routine",
      "Homework support",
      "Meal preparation",
      "Play interaction",
      "Reading together",
      "Discipline scenario",
      "Attachment exercise",
      "Co-regulation activity",
      "Behaviour support plan",
      "House rules",
      "Safety planning",
      "Family meeting",
      "Child-led play",
      "Praise practice",
      "Boundary setting",
      "Repair conversation",
      "Emotion coaching",
      "Consistency tracker",
      "Video demonstration"
    ]
  },
  {
    "id": "safety",
    "name": "Safety",
    "measures": "Measures safety knowledge, hazard recognition, supervision, emergency planning, and protective action.",
    "methods": [
      "Home hazards",
      "Medication storage",
      "Fire safety",
      "Water safety",
      "Road safety",
      "Car restraints",
      "Online safety",
      "Stranger safety",
      "Supervision",
      "First aid knowledge",
      "Emergency planning",
      "Risk identification",
      "Safe sleep",
      "Safe transport",
      "Family violence safety planning",
      "Protective factor identification",
      "Crisis response",
      "Emergency contacts",
      "Child-proofing audit",
      "AI safety scan (of submitted evidence, with user consent)"
    ]
  },
  {
    "id": "child_development",
    "name": "Child Development",
    "measures": "Measures developmental knowledge, expectations, observation, and planning.",
    "methods": [
      "Milestone recognition",
      "Developmental expectations",
      "Behaviour understanding",
      "Emotional development",
      "Brain development",
      "Language development",
      "Social development",
      "Play understanding",
      "School readiness",
      "Attachment knowledge",
      "Sleep knowledge",
      "Nutrition knowledge",
      "Adolescent development",
      "Trauma effects",
      "Neurodevelopment awareness",
      "Strength identification",
      "Development planning",
      "Development observation",
      "Reflection",
      "Scenario analysis"
    ]
  },
  {
    "id": "professional_competency",
    "name": "Professional Competency",
    "measures": "Designed for practitioners.",
    "methods": [
      "Observation accuracy",
      "Report writing",
      "Evidence weighting",
      "Risk formulation",
      "Safety planning",
      "Cultural responsiveness",
      "Interview skills",
      "Documentation quality",
      "Decision consistency",
      "Ethical reasoning",
      "Bias awareness",
      "Interagency collaboration",
      "Reflective supervision",
      "Case review",
      "Court preparation",
      "Multi-source evidence integration",
      "Threshold decision exercises",
      "Quality assurance review",
      "Peer moderation",
      "Professional development tracking"
    ]
  }
];

export const assessmentMethodCompetencyProfileFields = [
  "Current competency level",
  "Confidence in that estimate",
  "Number and diversity of evidence sources",
  "Recent improvement or decline",
  "Areas requiring more evidence",
  "Conflicting evidence that needs review",
  "Suggested next learning activities"
] as const;

export function getAssessmentMethodCount() {
  return assessmentMethodDomains.reduce((count, domain) => count + domain.methods.length, 0);
}

export function getAssessmentMethodsByDomain(domainId: string) {
  return assessmentMethodDomains.find((domain) => domain.id === domainId)?.methods ?? [];
}
