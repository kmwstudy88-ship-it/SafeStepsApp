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
  { route: "/assessments", feature: "reflection and practice", status: "local unvalidated prototypes; forensic scoring removed; no persistence or decision use", backend: "none" },
  { route: "/evidence", feature: "evidence draft workspace", status: "session-only text/photo selection; no upload, case link, or worker verification", backend: "none" },
  { route: "/reports", feature: "progress report preview", status: "export disabled until verified data and review workflows exist", backend: "none" },
  { route: "/voice-coach", feature: "breathing guide", status: "optional local timer; not medical or crisis support", backend: "none" },
  { route: "/sos", feature: "calm support scripts", status: "static non-emergency suggestions; cannot dispatch or contact help", backend: "none" },
  { route: "/fairness", feature: "fairness analyzer", status: "live analyzer UI", backend: "Node local API" },
  { route: "/cases", feature: "case management", status: "authenticated list + realtime updates", backend: "Supabase auth + assignments" },
  { route: "/cases/[id]", feature: "case detail", status: "document + analysis status; case plan hidden until schema and parent authorization contracts are verified", backend: "Supabase cases/documents/analyses" },
  { route: "/family", feature: "family overview", status: "honest unavailable state; no fabricated children or case information", backend: "parent access authorization and case crosswalk are not verified" },
  { route: "/companion", feature: "AI companion / counsellor access", status: "hard-disabled launch gate; no consent or prompts collected", backend: "not production-enabled; consent/catalog adapters and approval required" },
  { route: "/parent", feature: "parent & caregiver portal", status: "local-only guided previews; no delivery, case writes, or sensitive-data persistence", backend: "local app-only preview" },
  { route: "/documents/[id]", feature: "document pipeline", status: "upload + process flow", backend: "Node API + expo-document-picker" },
  { route: "/contact-visit", feature: "family visit guide", status: "example guidance and session-only reflections; no official visit notes", backend: "none" },
  { route: "/discreet", feature: "calculator-style screen", status: "prototype; not a concealment or safety guarantee", backend: "none" },
];

const PARENT_CAREGIVER_FEATURE_AUDIT = [
  { feature: "AI companion / counsellor access", route: "/companion", status: "hard-disabled until consent/catalog adapters, safety review, and launch approval", backend: "Supabase personal_ai_* tables, consents, handoffs, referrals" },
  { feature: "Case plan visibility", route: "/cases/[id]", status: "hidden until case crosswalk, plan data, and parent authorization contracts are verified", backend: "Supabase case_tasks, case_milestones, quest_progress, reunification structures" },
  { feature: "Direct messaging with caseworker", route: "/parent", status: "unsent in-memory message draft only; no inbox, delivery, or persistence", backend: "Supabase messages view + parent_child_messages" },
  { feature: "Scheduling & calendar", route: "/parent", status: "session-only agenda preview; no case write or calendar sync", backend: "Supabase case_appointments + visits view" },
  { feature: "Notifications", route: "/parent", status: "session-only preference preview; no account updates or delivery", backend: "profiles.notification_preferences and related notification infrastructure" },
  { feature: "Court & legal literacy", route: "/parent", status: "general hearing preparation guidance with not-legal-advice notice", backend: "none in app surface today" },
  { feature: "Financial / housing evidence upload", route: "/evidence, /documents/[id] (partial)", status: "generic evidence/document flows exist without parent-specific proof upload journey", backend: "Supabase evidence categories + document pipeline" },
  { feature: "Substance-use self-tracking", route: "/parent", status: "session-only wellbeing check-in, not a treatment or sobriety record", backend: "assessment/evidence foundations only" },
  { feature: "Peer / community support", route: "/parent", status: "guidance to locate verified services; no directory, forum, or referral submission", backend: "community and referral data exists outside parent surface" },
  { feature: "Onboarding & consent", route: "/parent", status: "identity and trusted consent are not collected; sign-in remains separate", backend: "Supabase parent onboarding consent + intake RPCs" },
  { feature: "Dispute / grievance path", route: "/parent", status: "unsent in-memory draft; no submission or supervisor-review request", backend: "governance and decision-review structures only" },
  { feature: "Emergency / crisis escalation", route: "/parent and /sos", status: "local safety guidance only; app cannot dispatch or queue help", backend: "personal AI safety events/referrals exist; no production route" },
  { feature: "Data rights", route: "/parent", status: "explains that export and access-audit adapters are unavailable", backend: "audit/export structures exist in backend domains, not parent-facing app screens" },
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
