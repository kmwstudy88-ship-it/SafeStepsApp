export const assessmentRoutes = [
  {
    title: "Case Setup",
    href: "/assessment-system/case-setup",
    description:
      "Create or update the family case profile, program stream, review dates, and assessment purpose.",
  },
  {
    title: "Assessment Records",
    href: "/assessment-system/records",
    description:
      "View all assessments connected to this case, including drafts, completed reviews, and upcoming reassessments.",
  },
  {
    title: "Rubric Scoring",
    href: "/assessment-system/rubric-scoring",
    description:
      "Score each safety and progress domain using a clear 0-4 evidence-based rubric.",
  },
  {
    title: "Evidence Uploads",
    href: "/assessment-system/evidence-uploads",
    description:
      "Upload photos, videos, documents, certificates, routines, and support records linked to assessment domains.",
  },
  {
    title: "Report Output",
    href: "/assessment-system/report-output",
    description:
      "Generate structured progress reports for workers, court, programs, and parent records.",
  },
] as const;

export const activeCase = {
  caseName: "Katrina Watts Family Case",
  program: "24 Month Reunification Program",
  phase: "Month 3",
  riskLevel: "High",
  nextReviewDue: "23 July 2026",
  assessment: "3 Month Review",
  overallProgress: "Moderate to Strong",
};

export const progressItems = [
  { label: "Case Setup", value: "Complete" },
  { label: "Records", value: "In Progress" },
  { label: "Rubric Scoring", value: "Not Started" },
  { label: "Evidence", value: "5 uploads added" },
  { label: "Report", value: "Draft" },
];

export const recentAssessments = [
  "Parenting Capacity Review",
  "Home Safety Assessment",
  "Child Voice Check-In",
  "Family Stability Review",
];

export const programStreams = [
  "24 Month Reunification",
  "18 Month Keeping Families Together",
  "12 Month Back on Track",
  "6 Month Build Stronger Families",
  "12 Week Child Safety Contact Program",
  "Custom Program",
];

export const assessmentTypes = [
  "Intake Assessment",
  "Monthly Review",
  "3 Month Review",
  "Safety Review",
  "Court Report Review",
  "Exit Assessment",
];

export const caseGoals = [
  "Reunification",
  "Home stability",
  "Parenting capacity",
  "Child safety",
  "Emotional wellbeing",
  "Domestic violence recovery",
  "AOD recovery",
  "Mental health stability",
];

export const assignedPeople = [
  "Parent / carer",
  "Support worker",
  "Caseworker",
  "Supervisor",
  "Court/legal contact",
];

export const assessmentRecords = [
  {
    name: "Parenting Capacity Review",
    status: "Draft",
    dateStarted: "2 July 2026",
    due: "9 July 2026",
    completion: 45,
    type: "3 Month Review",
    dateCompleted: "Not completed",
    riskLevel: "High",
    overallScore: "2.6 / 4",
    evidenceCount: 8,
    notesCount: 4,
    childVoiceIncluded: "Yes",
    reportGenerated: "No",
    domains: [
      "Safety",
      "Parenting routines",
      "Emotional regulation",
      "Home environment",
      "Child voice",
      "Evidence uploads",
    ],
  },
  {
    name: "Home Safety Assessment",
    status: "Requires Evidence",
    dateStarted: "28 June 2026",
    due: "5 July 2026",
    completion: 70,
    type: "Safety Review",
    dateCompleted: "Not completed",
    riskLevel: "Medium",
    overallScore: "3.0 / 4",
    evidenceCount: 5,
    notesCount: 2,
    childVoiceIncluded: "No",
    reportGenerated: "No",
    domains: ["Home environment", "Child sleep space", "Food and utilities", "Hazards"],
  },
  {
    name: "Child Voice Check-In",
    status: "Complete",
    dateStarted: "20 June 2026",
    due: "27 June 2026",
    completion: 100,
    type: "Monthly Review",
    dateCompleted: "27 June 2026",
    riskLevel: "Medium",
    overallScore: "3.2 / 4",
    evidenceCount: 3,
    notesCount: 5,
    childVoiceIncluded: "Yes",
    reportGenerated: "Yes",
    domains: ["Child voice", "Safety feelings", "Family contact", "Routine stability"],
  },
];

export const rubricScale = [
  {
    score: 0,
    description: "Immediate safety concerns. No evidence of change.",
  },
  {
    score: 1,
    description: "Major concerns remain. Limited engagement or inconsistent evidence.",
  },
  {
    score: 2,
    description: "Some progress. Concerns still present. More support required.",
  },
  {
    score: 3,
    description: "Good progress. Mostly consistent evidence of safe routines.",
  },
  {
    score: 4,
    description: "Strong and sustained progress. Safe, stable, and well documented.",
  },
];

export const rubricDomains = [
  {
    domain: "Home Safety",
    score: 3,
    strengths:
      "The home appears clean, organised, and child-safe across multiple uploads.",
    concerns:
      "More evidence is needed showing consistency over weekends and school mornings.",
    evidence: ["5 photos", "2 videos", "1 routine checklist"],
    nextAction: "Upload weekly home routine evidence for the next 4 weeks.",
    reviewerNotes:
      "Evidence is promising. Continue checking that routines remain stable outside scheduled reviews.",
  },
  {
    domain: "Parenting Capacity",
    score: 2,
    strengths:
      "Parent can describe age-appropriate routines and has completed parenting modules.",
    concerns:
      "Skills are clearer in sessions than in contact observations. More generalisation evidence is needed.",
    evidence: ["2 contact notes", "1 module reflection", "3 worker notes"],
    nextAction: "Observe two structured parenting scenarios before the next review.",
    reviewerNotes:
      "Score should stay provisional until observed practice is more consistent.",
  },
  {
    domain: "Insight and Accountability",
    score: 3,
    strengths:
      "Parent gives factual explanations for safety concerns without blaming the child or other workers.",
    concerns:
      "Some minimising language still appears when discussing earlier missed appointments.",
    evidence: ["4 reflection entries", "2 supervision notes"],
    nextAction: "Complete accountability reflection before report finalisation.",
    reviewerNotes:
      "Look for consistency between self-report, attendance, and collateral sources.",
  },
];

export const suggestedDomains = [
  "Child Safety",
  "Home Environment",
  "Parenting Capacity",
  "Routines and Stability",
  "Emotional Regulation",
  "Mental Health Stability",
  "AOD Recovery",
  "Domestic Violence Recovery",
  "Child Voice",
  "Engagement With Services",
  "Insight and Accountability",
  "Protective Capacity",
  "Family Support Network",
  "School and Community Stability",
];

export const evidenceTypes = [
  "Photo",
  "Video",
  "Document",
  "Receipt",
  "Certificate",
  "Court document",
  "School document",
  "Medical document",
  "Support letter",
  "Journal entry",
  "Routine checklist",
];

export const linkedDomains = [
  "Home Safety",
  "Parenting Routines",
  "Child Wellbeing",
  "Mental Health",
  "AOD Recovery",
  "Domestic Violence Recovery",
  "Education",
  "Contact Visits",
  "Financial Stability",
  "Housing Stability",
];

export const privacyLevels = [
  "Parent only",
  "Support worker",
  "Caseworker",
  "Court report",
];

export const evidenceCards = [
  {
    title: "Home Safety Photo",
    uploaded: "2 July 2026",
    linkedTo: "Home Environment",
    usedIn: "3 Month Review",
    status: "Accepted",
    description:
      "Kitchen, bedrooms, bathroom, and child sleep space shown clean and safe.",
  },
  {
    title: "Weekly Routine Checklist",
    uploaded: "1 July 2026",
    linkedTo: "Parenting Routines",
    usedIn: "3 Month Review",
    status: "Reviewed",
    description:
      "Morning, school, meal, cleaning, and bedtime routines completed across the week.",
  },
  {
    title: "Food Shopping Receipt",
    uploaded: "30 June 2026",
    linkedTo: "Financial Stability",
    usedIn: "Family Stability Review",
    status: "Needs Clarification",
    description:
      "Grocery purchase shows child-focused food items. Quantities need to be checked against household size.",
  },
];

export const evidenceStatuses = [
  "Draft",
  "Submitted",
  "Reviewed",
  "Accepted",
  "Needs Clarification",
  "Not Relevant",
  "Excluded From Report",
];

export const reportTypes = [
  "Internal Progress Summary",
  "Caseworker Review",
  "Court Progress Report",
  "Parent Copy",
  "Child Safety Review",
  "Program Completion Report",
];

export const reportSections = [
  "Case Summary",
  "Assessment Purpose",
  "Program Participation",
  "Rubric Score Summary",
  "Evidence Summary",
  "Child Voice Summary",
  "Strengths",
  "Remaining Concerns",
  "Progress Since Last Review",
  "Recommended Next Steps",
  "Attachments / Evidence List",
  "Reviewer Declaration",
];
