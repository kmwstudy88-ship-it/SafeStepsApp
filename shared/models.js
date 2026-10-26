const CONTENT_SOURCE_OF_TRUTH = {
  lessons: "lessons/",
  modules: "modules/",
  topics: "topics/",
  storybooks: "storybooks/",
  compatibilityExports: "src/safesteps/",
  generatedImports: "src/safesteps/imports/",
};

const APP_ROUTE_AUDIT = [
  { route: "/", feature: "SafeSteps hub", status: "navigation shell", backend: "none" },
  { route: "/scenarios", feature: "roleplay simulator", status: "demo prototype", backend: "none" },
  { route: "/storybooks", feature: "interactive storybooks", status: "sample content", backend: "none" },
  { route: "/assessments", feature: "assessment runner", status: "local scoring prototype", backend: "none" },
  { route: "/evidence", feature: "evidence vault", status: "device-local prototype", backend: "none" },
  { route: "/reports", feature: "court report export", status: "local PDF generation", backend: "none" },
  { route: "/voice-coach", feature: "box breathing coach", status: "device-local utility", backend: "none" },
  { route: "/sos", feature: "SOS quick reliever", status: "static support content", backend: "none" },
  { route: "/fairness", feature: "fairness analyzer", status: "live analyzer UI", backend: "Node local API" },
  { route: "/cases", feature: "case management", status: "authenticated list + realtime updates", backend: "Supabase auth + assignments" },
  { route: "/cases/[id]", feature: "case detail", status: "document + analysis status view", backend: "Supabase cases/documents/analyses" },
  { route: "/documents/[id]", feature: "document pipeline", status: "upload + process flow", backend: "Node API + expo-document-picker" },
  { route: "/contact-visit", feature: "contact visit companion", status: "static guidance UI", backend: "none" },
  { route: "/discreet", feature: "discreet mode", status: "device-local prototype", backend: "none" },
];

const PARENT_CAREGIVER_FEATURE_AUDIT = [
  { feature: "AI companion / counsellor access", route: "/companion (planned)", status: "backend foundations present; parent route missing", backend: "Supabase personal_ai_* tables, consents, handoffs, referrals" },
  { feature: "Case plan visibility", route: "/cases/[id] (partial)", status: "case detail omits tasks, milestones, checklist completion, and phase progress", backend: "Supabase case_tasks, case_milestones, quest_progress, reunification structures" },
  { feature: "Direct messaging with caseworker", route: "missing", status: "messaging data model exists without parent inbox/chat UI", backend: "Supabase messages view + parent_child_messages" },
  { feature: "Scheduling & calendar", route: "missing", status: "appointments and visits exist without unified parent calendar", backend: "Supabase case_appointments + visits view" },
  { feature: "Notifications", route: "missing", status: "preference fields exist without parent alerts center or delivery flows here", backend: "profiles.notification_preferences and related notification infrastructure" },
  { feature: "Court & legal literacy", route: "missing", status: "no plain-language parent legal guidance surface", backend: "none in app surface today" },
  { feature: "Financial / housing evidence upload", route: "/evidence, /documents/[id] (partial)", status: "generic evidence/document flows exist without parent-specific proof upload journey", backend: "Supabase evidence categories + document pipeline" },
  { feature: "Substance-use self-tracking", route: "missing", status: "assessment content exists without parent log for sobriety, screening, or appointments", backend: "assessment/evidence foundations only" },
  { feature: "Peer / community support", route: "missing", status: "content exists without parent peer-support discovery or community UI", backend: "community and referral data exists outside parent surface" },
  { feature: "Onboarding & consent", route: "/cases (partial sign-in only)", status: "consent and intake persistence exist without dedicated onboarding flow", backend: "Supabase parent onboarding consent + intake RPCs" },
  { feature: "Dispute / grievance path", route: "missing", status: "no parent-facing contestability or supervisor-review request flow", backend: "governance and decision-review structures only" },
  { feature: "Emergency / crisis escalation", route: "missing", status: "SOS calming exists, but no distinct crisis-routing or hotline surface", backend: "personal AI safety events/referrals exist; no dedicated app route" },
  { feature: "Data rights", route: "missing", status: "no parent export/download or access-audit UI", backend: "audit/export structures exist in backend domains, not parent-facing app screens" },
];

const BACKEND_BOUNDARIES = {
  nodeApi: {
    path: "backend/server.js",
    responsibilities: [
      "Local health endpoint for smoke testing",
      "Document analysis schema exposure",
      "Document upload/process/analysis/risk endpoints with OpenAI or Claude + heuristic fallback",
    ],
  },
  supabase: {
    path: "supabase/",
    responsibilities: [
      "Authoritative case, evidence, and report-delivery data model",
      "Authenticated and audited report export flows",
      "Row-level security, migrations, and database contract tests",
    ],
  },
};

module.exports = {
  CONTENT_SOURCE_OF_TRUTH,
  APP_ROUTE_AUDIT,
  PARENT_CAREGIVER_FEATURE_AUDIT,
  BACKEND_BOUNDARIES,
};
