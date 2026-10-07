# Skill Handler Implementation Plan

## Overview

This document outlines the implementation architecture for the 27 skill handlers that compose the SafeSteps skills foundation. Skill handlers bridge the orchestrator (registry + safety gates) with actual business logic.

## Architecture

### Handler Interface Contract

All skill handlers follow this interface:

```javascript
async function skillHandler({ skill, input, context }) {
  // skill: { id, group, description, input, output, integrations }
  // input: structured input matching skill.input schema
  // context: { authUserId, caseId, documentId, ... }
  
  return {
    // Matches skill.output schema
    status: 'complete' | 'insufficient_evidence' | 'failed',
    findings: [...],
    confidence: 0..1,
    evidence_citations: [...],
    limitations: [...],
    human_review_required: true,
    unsafe_output_flags: [...],
  };
}
```

### Input/Output Mapping

**Document Intelligence Skills:**
- Input: `{ documentId, text }` → Output: findings array + citations
- Examples: fairness_detection, contradiction_detection, evidence_extraction, timeline_extraction

**Workflow/Action Skills:**
- Input: `{ caseId, event | signals | tier }` → Output: structured payload + review notes
- Examples: case_update, escalation, follow_up_scheduling

**Communication/De-escalation Skills:**
- Input: `{ message }` → Output: suggestions + tone notes
- Examples: trauma_informed_communication, emotion_labeling, guided_discovery

**Child-Safe Interaction Skills:**
- Input: `{ message, childAge? }` → Output: safe response + boundaries
- Examples: child_safe_conversation, disclosure_sensitive_handling, safety_planning

**Compliance/Safeguarding Skills:**
- Input: `{ artifact }` → Output: compliance findings + review checkpoints
- Examples: bias_discrimination_detection, cultural_safety, policy_interpretation

---

## Handler Implementation Patterns

### Pattern 1: Document Intelligence (Analysis-Based)

These handlers extract structured signals from document text. They leverage the existing `analysisSkillCatalog` which defines output schemas.

**Location:** `backend/skills/handlers/document-intelligence/`

**Implementation approach:**
1. Parse document text
2. Apply pattern matching, NLP heuristics, or AI-assisted analysis
3. Return findings with source citations (line numbers, section references)
4. Always include confidence scores (0..1)
5. Flag any unsafe patterns or over-confident guesses

**Example: Fairness Detection**
```javascript
// backend/skills/handlers/document-intelligence/fairness-detection.js
async function fairnessDetectionHandler({ skill, input, context }) {
  const { documentId, text } = input;
  if (!text) return { status: 'insufficient_evidence', findings: [], confidence: 0, ... };
  
  const concerns = [];
  const patterns = [
    { pattern: /non-compliant|resistant|refusing/, label: 'behavior-as-disposition' },
    { pattern: /failed to|unable to|despite/, label: 'deficit-framing' },
    // ... more patterns
  ];
  
  // Find matches and cite with source locators
  for (const pattern of patterns) {
    const matches = findWithLineNumbers(text, pattern.pattern);
    for (const match of matches) {
      concerns.push({
        category: pattern.label,
        statement: match.text,
        explanation: 'This language may frame behavior dispositionally rather than contextually.',
        severity: 'medium',
        source_locator: match.lineNumber,
      });
    }
  }
  
  return {
    status: concerns.length ? 'complete' : 'insufficient_evidence',
    findings: concerns,
    confidence: 0.6, // Pattern-match confidence
    evidence_citations: concerns.map(c => `Line ${c.source_locator}`),
    limitations: ['Pattern-based; cannot infer intent or speaker perspective'],
    human_review_required: true,
    unsafe_output_flags: [],
  };
}
```

### Pattern 2: Workflow/Action (Structured Computation)

These handlers generate case-management actions by analyzing case state, risk tiers, or events.

**Location:** `backend/skills/handlers/workflow-action/`

**Implementation approach:**
1. Validate input state (case exists, events present, etc.)
2. Apply business rules (thresholds, templates, automation boundaries)
3. Return structured payload for downstream systems (case events, tasks, alerts)
4. Ensure all outputs are decision-support only (no irreversible actions)

**Example: Follow-Up Scheduling**
```javascript
// backend/skills/handlers/workflow-action/follow-up-scheduling.js
async function followUpSchedulingHandler({ skill, input, context }) {
  const { caseId, tier } = input;
  if (!caseId || !tier) return { status: 'failed', findings: [], confidence: 0, ... };
  
  const templates = {
    low: [
      { task_type: 'routine_follow_up', title: 'Routine case review', due_in_hours: 168 },
    ],
    moderate: [
      { task_type: 'protective_factor_check', title: 'Verify protective factor stability', due_in_hours: 72 },
      { task_type: 'follow_up_visit', title: 'Scheduled follow-up contact', due_in_hours: 120 },
    ],
    high: [
      { task_type: 'supervisor_review', title: 'Supervisor expedited review', due_in_hours: 24 },
      { task_type: 'safety_plan_verification', title: 'Verify safety plan execution', due_in_hours: 48 },
    ],
    critical: [
      { task_type: 'immediate_supervisor_attention', title: 'Immediate safety review', due_in_hours: 4 },
      { task_type: 'urgent_contact', title: 'Urgent contact with family', due_in_hours: 8 },
    ],
  };
  
  const tierTemplates = templates[tier] || templates.low;
  const tasks = tierTemplates.map(template => ({
    task_type: template.task_type,
    title: template.title,
    due_in_hours: template.due_in_hours,
    priority: tier === 'critical' ? 'urgent' : tier === 'high' ? 'high' : 'normal',
  }));
  
  return {
    status: 'complete',
    findings: tasks,
    confidence: 1.0, // Deterministic rule-based
    evidence_citations: [],
    limitations: ['Does not account for external supports or parallel workflows'],
    human_review_required: true,
    unsafe_output_flags: tasks.every(t => !t.task_type.includes('decision')) ? [] : ['automated_action_flag'],
  };
}
```

### Pattern 3: Communication/De-escalation (Guidance)

These handlers provide supportive language guidance and communication strategies.

**Location:** `backend/skills/handlers/communication-deescalation/`

**Implementation approach:**
1. Parse the communication prompt
2. Apply SafeSteps principles (feel-it → own-it → expect-it, ego-down, curiosity-up)
3. Generate non-directive suggestions (not commands or rewrites)
4. Include tone notes and emotional/practical context

**Example: Trauma-Informed Communication**
```javascript
// backend/skills/handlers/communication-deescalation/trauma-informed-communication.js
async function traumaInformedCommunicationHandler({ skill, input, context }) {
  const { message } = input;
  if (!message) return { status: 'insufficient_evidence', findings: [], confidence: 0, ... };
  
  const concerns = [];
  const patterns = [
    {
      detect: /\b(blame|fault|failure|mistake)\b/i,
      guidance: 'Consider shifting from attribution language to observable behavior.',
      tone_note: 'Blame language can trigger defensiveness; curiosity may open dialogue.',
    },
    {
      detect: /\b(must|have to|have no choice)\b/i,
      guidance: 'Autonomy-supportive language increases engagement. Consider: "What would help you move forward?"',
      tone_note: 'Ultimatum language can escalate; choice-honoring language invites collaboration.',
    },
    // ... more patterns
  ];
  
  for (const pattern of patterns) {
    if (pattern.detect.test(message)) {
      concerns.push({
        category: 'communication_style',
        observation: pattern.guidance,
        tone_impact: pattern.tone_note,
      });
    }
  }
  
  return {
    status: concerns.length ? 'complete' : 'insufficient_evidence',
    findings: concerns,
    confidence: 0.5,
    evidence_citations: [],
    limitations: ['Pattern-based guidance; context and relationship matter most'],
    human_review_required: false, // Guidance only
    unsafe_output_flags: [],
  };
}
```

### Pattern 4: Child-Safe Interaction (Protective)

These handlers ensure child-facing communication is developmentally appropriate, safe, and free from adult conflict entanglement.

**Location:** `backend/skills/handlers/child-safe-interaction/`

**Implementation approach:**
1. Detect child-facing context (age range, message type, sensitivity signals)
2. Check against child-safe policy guardrails (no blame, no adult disputes, no threat)
3. Route disclosures to immediate review
4. Return supportive next steps + escalation flags

**Example: Disclosure-Sensitive Handling**
```javascript
// backend/skills/handlers/child-safe-interaction/disclosure-sensitive-handling.js
async function disclosureSensitiveHandlingHandler({ skill, input, context }) {
  const { message, childAge } = input;
  if (!message) return { status: 'insufficient_evidence', findings: [], confidence: 0, ... };
  
  const disclosurePatterns = [
    { detect: /\b(hurt|pain|scared|afraid|abuse|touch|wrong)\b/i, urgency: 'high' },
    { detect: /\b(unsafe|dangerous|threat|weapon)\b/i, urgency: 'critical' },
  ];
  
  const disclosures = [];
  for (const pattern of disclosurePatterns) {
    if (pattern.detect.test(message)) {
      disclosures.push({
        type: 'possible_harm_disclosure',
        excerpt: message.slice(0, 100),
        urgency: pattern.urgency,
        source_locator: 'full_message',
      });
    }
  }
  
  const guidance = disclosures.length
    ? ['Validate the child\'s experience without judgment.', 'Ensure safe adult is present.', 'Document exactly what child said.', 'Route to supervisor/safeguarding immediately.']
    : [];
  
  return {
    status: disclosures.length ? 'complete' : 'insufficient_evidence',
    findings: disclosures,
    confidence: 0.8,
    evidence_citations: disclosures.map(d => d.excerpt),
    limitations: ['Cannot verify truth of disclosure; sensitivity only'],
    human_review_required: disclosures.some(d => d.urgency === 'critical'),
    unsafe_output_flags: disclosures.map(d => `disclosure_${d.urgency}`),
  };
}
```

### Pattern 5: Compliance/Safeguarding (Audit)

These handlers detect policy violations, bias, or unsafe assumptions and route to human review.

**Location:** `backend/skills/handlers/compliance-safeguarding/`

**Implementation approach:**
1. Parse artifact (document, output, plan)
2. Check against policy guardrails (no discrimination, culturally safe, child-safe standards)
3. Flag deviations with rationale
4. Suggest reframes where applicable

**Example: Bias & Discrimination Detection**
```javascript
// backend/skills/handlers/compliance-safeguarding/bias-discrimination-detection.js
async function biasDiscriminationDetectionHandler({ skill, input, context }) {
  const { artifact } = input;
  if (!artifact) return { status: 'insufficient_evidence', findings: [], confidence: 0, ... };
  
  const biasSignals = [];
  const patterns = [
    {
      category: 'stereotype',
      detect: /\b(typical|usual|expected of) (families from|parents with|children who)\b/i,
      impact: 'May rely on stereotypes rather than individual assessment.',
    },
    {
      category: 'protective_factor_bias',
      detect: /despite (\w+) background|overcame their|despite their (race|culture|language)/i,
      impact: 'May frame identity/culture as inherent disadvantage rather than strength.',
    },
    // ... more patterns
  ];
  
  for (const pattern of patterns) {
    const match = artifact.match(pattern.detect);
    if (match) {
      biasSignals.push({
        category: pattern.category,
        phrase: match[0],
        impact: pattern.impact,
        severity: 'medium',
      });
    }
  }
  
  return {
    status: biasSignals.length ? 'complete' : 'insufficient_evidence',
    findings: biasSignals,
    confidence: 0.6,
    evidence_citations: biasSignals.map(s => s.phrase),
    limitations: ['Pattern-based; requires cultural/human review to confirm impact'],
    human_review_required: true,
    unsafe_output_flags: biasSignals.map(s => `bias_signal_${s.severity}`),
  };
}
```

---

## Handler Registration & Wiring

### 1. Create Handler Index

**File:** `backend/skills/handlers/index.js`

```javascript
'use strict';

const docIntelHandlers = {
  fairness_detection: require('./document-intelligence/fairness-detection'),
  contradiction_detection: require('./document-intelligence/contradiction-detection'),
  evidence_extraction: require('./document-intelligence/evidence-extraction'),
  requirement_extraction: require('./document-intelligence/requirement-extraction'),
  timeline_extraction: require('./document-intelligence/timeline-extraction'),
  risk_assessment: require('./document-intelligence/risk-assessment'),
  concern_classification: require('./document-intelligence/concern-classification'),
  unrealistic_expectation_detection: require('./document-intelligence/unrealistic-expectation-detection'),
};

const workflowHandlers = {
  case_packet_builder: require('./workflow-action/case-packet-builder'),
  multi_document_comparison: require('./workflow-action/multi-document-comparison'),
  case_update: require('./workflow-action/case-update'),
  escalation: require('./workflow-action/escalation'),
  follow_up_scheduling: require('./workflow-action/follow-up-scheduling'),
};

const commHandlers = {
  trauma_informed_communication: require('./communication-deescalation/trauma-informed-communication'),
  emotion_labeling: require('./communication-deescalation/emotion-labeling'),
  guided_discovery: require('./communication-deescalation/guided-discovery'),
  behavior_message_interpretation: require('./communication-deescalation/behavior-message-interpretation'),
  de_escalation_strategy: require('./communication-deescalation/de-escalation-strategy'),
};

const childSafeHandlers = {
  child_safe_conversation: require('./child-safe-interaction/child-safe-conversation'),
  disclosure_sensitive_handling: require('./child-safe-interaction/disclosure-sensitive-handling'),
  developmental_appropriateness: require('./child-safe-interaction/developmental-appropriateness'),
  safety_planning: require('./child-safe-interaction/safety-planning'),
  boundary_privacy: require('./child-safe-interaction/boundary-privacy'),
};

const complianceHandlers = {
  child_safe_standards_compliance: require('./compliance-safeguarding/child-safe-standards-compliance'),
  bias_discrimination_detection: require('./compliance-safeguarding/bias-discrimination-detection'),
  cultural_safety: require('./compliance-safeguarding/cultural-safety'),
  policy_interpretation: require('./compliance-safeguarding/policy-interpretation'),
};

const ALL_HANDLERS = {
  ...docIntelHandlers,
  ...workflowHandlers,
  ...commHandlers,
  ...childSafeHandlers,
  ...complianceHandlers,
};

module.exports = {
  ALL_HANDLERS,
  docIntelHandlers,
  workflowHandlers,
  commHandlers,
  childSafeHandlers,
  complianceHandlers,
};
```

### 2. Wire Orchestrator with Handlers

**File:** `backend/server.js` (update)

```javascript
const { ALL_HANDLERS } = require('./skills/handlers');
const { createSkillsOrchestrator } = require('./skills');

const skillsOrchestrator = createSkillsOrchestrator({ handlers: ALL_HANDLERS });
```

### 3. Integrate into Document Analysis Pipeline

**File:** `backend/document-intelligence/pipeline.js` (after analysis completes)

```javascript
// After raw AI analysis is stored, invoke relevant skills
const documentsSkills = [
  'fairness_detection',
  'contradiction_detection',
  'evidence_extraction',
  'requirement_extraction',
  'timeline_extraction',
  'concern_classification',
  'unrealistic_expectation_detection',
];

for (const skillId of documentsSkills) {
  const skillResult = await skillsOrchestrator.runSkill({
    skillId,
    input: { documentId, text: document.extracted_text },
    context: { authUserId },
  });
  // Store skillResult.output in analysis_skills array
}
```

---

## Testing Strategy

### Unit Tests

Each handler should have a test file:

**File:** `tools/tests/skills-handlers-[group].test.mjs`

```javascript
test('fairness_detection handler returns concerns with citations', async () => {
  const result = await fairnessDetectionHandler({
    skill: getSkill('fairness_detection'),
    input: {
      documentId: 'doc-1',
      text: 'Parent is resistant and non-compliant with service requirements.',
    },
    context: { authUserId: 'user-1' },
  });
  
  assert.equal(result.status, 'complete');
  assert.ok(result.findings.length > 0);
  assert.ok(result.confidence > 0);
  assert.ok(result.evidence_citations.length > 0);
  assert(result.human_review_required);
});
```

### Integration Tests

Test handler → orchestrator → safety gates flow:

**File:** `tools/tests/skills-orchestrator-integration.test.mjs`

```javascript
test('orchestrator blocks irreversible actions from case_update skill', async () => {
  const result = await skillsOrchestrator.runSkill({
    skillId: 'case_update',
    input: { caseId: 'case-1', event: { type: 'irreversible_placement_decision' } },
    context: { authUserId: 'user-1' },
  });
  
  assert.equal(result.status, 'blocked');
  assert.ok(result.policy.automationBlockedReasons.length > 0);
});
```

---

## Rollout Phases

### Phase 1: Core Document Intelligence Skills (Week 1-2)
- fairness_detection
- contradiction_detection
- evidence_extraction
- timeline_extraction
- concern_classification

**Validation:** Tests + manual review of extracted findings

### Phase 2: Workflow/Action Skills (Week 3)
- case_update
- follow_up_scheduling
- escalation

**Validation:** Verify task generation, no false escalations, safety gates enforce

### Phase 3: Communication & Child-Safe Skills (Week 4)
- trauma_informed_communication
- disclosure_sensitive_handling
- child_safe_conversation

**Validation:** Guidance quality, escalation routing for high-urgency disclosures

### Phase 4: Compliance & Advanced Skills (Week 5)
- bias_discrimination_detection
- cultural_safety
- policy_interpretation

**Validation:** Compliance coverage, policy mapping accuracy

---

## Deployment Checklist

- [ ] All 27 handler files created and tested
- [ ] Handler index registered with orchestrator
- [ ] Document intelligence pipeline wired to call skills
- [ ] Case events & Track C routes enhanced with skills
- [ ] Personal AI handlers instantiated with skills
- [ ] Safety gates tested for automation boundaries
- [ ] TypeScript validation (`npx tsc --noEmit`) passes
- [ ] Integration tests cover each skill group
- [ ] Readiness gate updated to require skills validation
- [ ] Production environment confirmed with skill handler dependencies

---

## Future Enhancements

1. **AI-Powered Skills:** Replace pattern-matching with LLM-driven analysis for complex skills
2. **Adaptive Confidence:** Track historical accuracy and adjust confidence scores
3. **Skill Composition:** Chain skills (e.g., evidence_extraction → risk_assessment)
4. **Learner-Feedback Loop:** Record human review outcomes and retrain patterns
5. **Skill Versioning:** Track skill version alongside output for reproducibility

