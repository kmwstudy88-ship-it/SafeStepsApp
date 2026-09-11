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
  { route: "/cases/[id]/documents", feature: "document pipeline", status: "upload + process flow", backend: "Node API + expo-document-picker" },
  { route: "/contact-visit", feature: "contact visit companion", status: "static guidance UI", backend: "none" },
  { route: "/discreet", feature: "discreet mode", status: "device-local prototype", backend: "none" },
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
  BACKEND_BOUNDARIES,
};
