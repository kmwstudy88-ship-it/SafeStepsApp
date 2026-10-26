/**
 * SafeSteps Unified Engine Suite
 *
 * Central export barrel for all decision-support engines across the SafeSteps platform:
 *   1. Assessment Scoring Engine (Generic weighted scoring, bands, critical overrides)
 *   2. Recognition Support Engine (Cultural safety & accessibility gap analysis)
 *   3. SAFER Assessment Engine (Multi-category evidence classification & guided judgement)
 *   4. Contact Progression Engine (Graduated contact transitions & prerequisites)
 *   5. Family Meeting Engine (Consensus, circuit-breaker protocols & de-escalation)
 *   6. Psychometric Quality Engine (Multi-source evidence sufficiency & reliability)
 *   7. Kinship Safety Circle Engine (Support network mapping & rapid response checks)
 *   8. Child Development Capacity Engine (Developmental age-band attunement & mismatches)
 *   9. Learning Progression Engine (Curriculum tracking & certificate eligibility)
 *  10. Forensic Assurance Engine (Chain-of-custody, procedural fairness & proportionality)
 *  11. Regulation Scenario Engine (Interactive role-play simulation & co-regulation scoring)
 *
 * All engines adhere to SafeSteps Canonical Governance:
 *   - Decision-support only (never automated placement, contact, or legal decisions).
 *   - Human practitioner and supervisor review required.
 *   - Follows docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md.
 */

// 1. Assessment Scoring Engine
export * from "./assessmentScoringEngine.ts";

// 2. Recognition Support Engine
export * from "./recognitionSupportEngine.ts";

// 3. SAFER Assessment Engine
export * from "./saferAssessmentEngine.ts";

// 4. Contact Progression Engine
export * from "./contactProgressionEngine.ts";

// 5. Family Meeting Engine
export * from "./familyMeetingEngine.ts";

// 6. Psychometric Quality Engine
export * from "./psychometricEngine.ts";

// 7. Kinship Safety Circle Engine
export * from "./kinshipSafetyCircleEngine.ts";

// 8. Child Development Capacity Engine
export * from "./childDevelopmentCapacityEngine.ts";

// 9. Learning Progression Engine
export * from "./learningProgressionEngine.ts";

// 10. Forensic Assurance Engine
export * from "./forensicAssuranceEngine.ts";

// 11. Regulation Scenario Engine
export * from "./regulationScenarioEngine.ts";

export const SAFESTEPS_ENGINE_SUITE_VERSION = "2.0.0";
