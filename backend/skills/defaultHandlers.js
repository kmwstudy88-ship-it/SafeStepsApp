import { analyzeFairnessDocument } from '../Services/DocumentIntelligence/FairnessEngine.js';
import { buildChildSafeResponse, deriveAgeBand, detectDisclosureSignals, hasImmediateDanger, safetyPlanLines } from '../personal-ai/child-safe-policy.js';
import { createDefaultDocumentSkillHandlers } from './documentIntelligenceAdapter.js';

const REVIEW_ONLY = 'Decision support only. A qualified practitioner must review before taking action.';
const SENSITIVE_DATA_PATTERN = /\b(?:full name|address|street|suburb|postcode|school|phone|email|social security|date of birth)\b/i;

function asText(value) {
  return typeof value === 'string' ? value : '';
}

function findQuotedEvidence(text, pattern, category, explanation) {
  const matches = [];
  pattern.lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    matches.push({
      category,
      evidence: match[0],
      source_span: { start: match.index, end: match.index + match[0].length },
      explanation,
    });
  }
  pattern.lastIndex = 0;
  return matches;
}

function makeCommunicationHandlers() {
  const emotionWords = {
    anger: /\b(?:angry|frustrated|furious|irritated)\b/gi,
    fear: /\b(?:afraid|scared|worried|anxious|terrified)\b/gi,
    sadness: /\b(?:sad|lonely|grieving|disappointed|hurt)\b/gi,
    shame: /\b(?:ashamed|embarrassed|guilty)\b/gi,
    relief: /\b(?:relieved|hopeful|calm)\b/gi,
  };
  const blameWords = /\b(?:your fault|you should have|why didn't you|prove it|bad parent)\b/gi;

  return {
    trauma_informed_communication: async ({ input }) => {
      const message = asText(input.message);
      const concerns = findQuotedEvidence(
        message,
        blameWords,
        'potentially_blaming_language',
        'Consider replacing blame or judgment with a specific, non-leading support question.',
      );
      return {
        rewrite: message,
        tone_notes: concerns.map(({ explanation, evidence }) => ({ evidence, suggestion: explanation })),
        requiresPractitionerEdit: concerns.length > 0,
        limitations: 'No substantive rewrite is generated; suggestions require context and practitioner review.',
      };
    },
    emotion_labeling: async ({ input }) => {
      const message = asText(input.message);
      const labels = Object.entries(emotionWords).flatMap(([label, pattern]) =>
        findQuotedEvidence(message, pattern, label, 'Possible emotion signal; confirm gently rather than assume.'),
      );
      return {
        labels,
        validation_phrases: labels.length
          ? labels.map(({ category }) => `It sounds like you may be feeling ${category}. Is that close, or would you describe it differently?`)
          : [],
        limitations: 'Emotion words are language signals, not a psychological assessment.',
      };
    },
    guided_discovery: async () => ({
      questions: [
        'What feels most important for you to talk about today?',
        'What would help you feel safer or more supported right now?',
        'Would you like to share more, take a break, or come back to this later?',
      ],
      opt_out_prompts: ['You can skip any question.', 'Would you prefer a different topic or another support person?'],
      leadingQuestionCheck: 'Questions are optional and do not presume that an event occurred.',
    }),
    behaviour_message_interpretation: async ({ input }) => {
      const text = asText(input.message);
      const observations = findQuotedEvidence(
        text,
        /\b(?:withdrawn|quiet|agitated|distressed|missed (?:a|the) visit|refused|left early)\b/gi,
        'observable_behaviour',
        'Record the context, source, and alternative explanations; do not infer motive or diagnosis.',
      );
      return {
        possible_meanings: observations,
        uncertainties: ['A single behaviour does not establish its cause or meaning.'],
        decisionSupportOnly: true,
      };
    },
    de_escalation_strategy: async ({ input }) => {
      const text = asText(input.message);
      const immediateDanger = hasImmediateDanger(text);
      return {
        de_escalation_steps: [
          'Feel it: notice the emotion and pause before responding.',
          'Own it: take responsibility for your own words and actions.',
          'Expect it: anticipate that stress can affect communication; stay curious.',
          'Keep compassion and curiosity ahead of blame or winning the argument.',
        ],
        pause_options: ['Take a short break and agree when to resume.', 'Use a calm, brief message focused on the immediate need.'],
        safety_note: immediateDanger ? 'Possible immediate danger detected; prioritize local emergency and safeguarding procedures.' : null,
        principle: 'When ego goes up, safety goes down.',
      };
    },
  };
}

function makeChildSafeHandlers() {
  return {
    child_safe_conversation: async ({ input, context }) => {
      const safe = buildChildSafeResponse({
        userMessage: input.message,
        draftResponse: input.draftResponse,
        context: { ...context, ...(input.context || {}) },
      });
      return {
        child_safe_response: safe.response,
        boundaries: {
          privacyNoticeIncluded: safe.metadata.boundaryNoticeIncluded,
          keepChildrenOutOfAdultDisputes: true,
          noPressureToDisclose: true,
        },
        review_required: safe.metadata.requiresHumanReview,
      };
    },
    disclosure_sensitive: async ({ input, context }) => {
      const safe = buildChildSafeResponse({
        userMessage: input.message,
        draftResponse: '',
        context: { ...context, ...(input.context || {}) },
      });
      return {
        supportive_response: safe.response,
        matched_signals: safe.metadata.matchedSignals,
        immediate_danger: safe.metadata.immediateDanger,
        review_route: safe.metadata.requiresHumanReview ? 'immediate_safeguarding_review' : 'practitioner_review',
        stop_downstream_processing: safe.metadata.disclosureSensitive || safe.metadata.immediateDanger,
      };
    },
    developmental_appropriateness: async ({ input, context }) => {
      const ageBand = deriveAgeBand({ ...context, ...(input.context || {}) });
      const safe = buildChildSafeResponse({
        userMessage: '',
        draftResponse: asText(input.message),
        context: { ...context, ...(input.context || {}) },
      });
      return {
        age_band: ageBand,
        adaptations: ageBand === 'unknown' ? [] : [{ text: safe.response, basis: 'age-band language simplification' }],
        limitations: ageBand === 'unknown' ? 'Age or developmental band was not supplied; no age-specific adaptation was made.' : REVIEW_ONLY,
      };
    },
    safety_planning: async ({ input, context }) => {
      const text = asText(input.message);
      const immediateDanger = hasImmediateDanger(text);
      const ageBand = deriveAgeBand({ ...context, ...(input.context || {}) });
      const signals = detectDisclosureSignals(text);
      return {
        plan_steps: safetyPlanLines({ immediateDanger, ageBand }),
        escalation_flags: {
          immediate_danger: immediateDanger,
          disclosure_signals: signals,
          human_review_required: immediateDanger || signals.length > 0,
        },
        limitations: 'Prompt suggestions only; a practitioner must confirm suitability and local procedures.',
      };
    },
    boundary_privacy: async ({ input }) => {
      const message = asText(input.message);
      const privacyFlags = findQuotedEvidence(
        message,
        SENSITIVE_DATA_PATTERN,
        'identifying_information',
        'Remove or minimize identifying information unless it is necessary and authorized.',
      );
      return {
        privacy_flags: privacyFlags,
        minimization_guidance: privacyFlags.length
          ? 'Redact identifying details before sharing or analysis.'
          : 'Continue to avoid adding unnecessary identifying details.',
      };
    },
  };
}

function makeActionHandlers() {
  return {
    case_packet_builder: async ({ input }) => {
      const sections = ['case_context', 'evidence', 'timeline', 'requirements', 'risk_and_protective_factors']
        .filter((key) => input[key] !== undefined)
        .map((key) => ({ section: key, content: input[key], source: 'supplied_input' }));
      return {
        packet_sections: sections,
        open_questions: sections.length ? [] : ['Supply reviewed case records before a packet can be assembled.'],
        human_review_queue: ['Verify source attribution, completeness, and audience permissions before use.'],
        draft_only: true,
      };
    },
    multi_document_comparison: async ({ input }) => {
      const documents = Array.isArray(input.documents) ? input.documents.filter((document) => typeof document?.text === 'string') : [];
      const sentences = documents.map((document) => {
        const id = document.id || document.documentId || null;
        let cursor = 0;
        return {
          id,
          statements: document.text.split(/(?<=[.!?])\s+/).map((sentence) => {
            const text = sentence.trim();
            const start = document.text.indexOf(text, cursor);
            cursor = start + text.length;
            return { text, normalized: text.toLowerCase(), source_span: { doc_id: id, start, end: cursor } };
          }).filter((statement) => statement.text),
        };
      });
      const normalized = sentences.map(({ id, statements }) => ({
        id,
        statements: new Map(statements.map((statement) => [statement.normalized, statement])),
      }));
      const agreements = normalized.length > 1
        ? [...normalized[0].statements.keys()]
          .filter((statement) => normalized.slice(1).every((document) => document.statements.has(statement)))
          .map((statement) => ({
            statement: normalized[0].statements.get(statement).text,
            sources: normalized.map((document) => ({
              doc_id: document.id,
              source_span: document.statements.get(statement).source_span,
            })),
          }))
        : [];
      const allStatements = [...new Set(normalized.flatMap((document) => [...document.statements.keys()]))];
      const agreedStatements = new Set(agreements.map(({ statement }) => statement.toLowerCase()));
      const unmatched = allStatements.filter((statement) => !agreedStatements.has(statement));
      return {
        agreements,
        contradictions: [],
        evidence_gaps: documents.length < 2
          ? ['Provide text for at least two documents; identifiers alone are not compared.']
          : unmatched.map((statement) => ({
            statement: normalized.find((document) => document.statements.has(statement)).statements.get(statement).text,
            sources: normalized.filter((document) => document.statements.has(statement)).map((document) => ({
              doc_id: document.id,
              source_span: document.statements.get(statement).source_span,
            })),
          })),
        limitations: 'Unmatched statements are not contradictions; this comparison does not determine which account is accurate.',
      };
    },
    case_update: async ({ input }) => ({
      event_payload: input.event,
      review_notes: ['Draft only; confirm dates, source, consent/authority, and case scope before recording.'],
      write_performed: false,
    }),
    escalation: async ({ input }) => {
      const serialized = JSON.stringify(input.signals || {});
      const immediateDanger = hasImmediateDanger(serialized);
      const disclosureSignals = detectDisclosureSignals(serialized);
      return {
        severity: immediateDanger ? 'critical' : disclosureSignals.length ? 'high' : 'review',
        rationale: immediateDanger ? ['possible_immediate_danger'] : disclosureSignals,
        review_actions: immediateDanger
          ? ['Pause automated processing.', 'Contact the designated safeguarding lead or local emergency service under local procedure.']
          : ['Route to the responsible practitioner for review.'],
        notification_sent: false,
      };
    },
    follow_up_scheduling: async ({ input }) => {
      const dueWindows = {
        tier_1_immediate: { priority: 'immediate', days: 1 },
        tier_2_urgent: { priority: 'high', days: 3 },
        tier_3_standard: { priority: 'standard', days: 7 },
      };
      const escalations = Array.isArray(input.escalations) ? input.escalations : [];
      const activeEscalations = escalations.filter((item) => item && item.active !== false);
      const tasks = activeEscalations.map((item) => {
        const tier = item.tier || item.escalation_tier;
        const window = dueWindows[tier];
        const dueDate = window && !Number.isNaN(Date.parse(input.reference_date))
          ? new Date(Date.parse(input.reference_date) + window.days * 24 * 60 * 60 * 1000).toISOString()
          : window
            ? new Date(Date.now() + window.days * 24 * 60 * 60 * 1000).toISOString()
            : null;
        return {
          task: 'Review active escalation with the responsible practitioner.',
          priority: window?.priority || 'standard',
          due_date: dueDate,
          source_escalation_id: item.id || null,
          status: 'suggested',
        };
      });
      const riskLevel = String(input.risk_output?.risk_level || input.risk_output?.riskLevel || '').toLowerCase();
      if (['high', 'critical'].includes(riskLevel)) {
        const referenceDate = Date.parse(input.reference_date);
        tasks.push({
          task: 'Arrange a practitioner-led safety and wellbeing check-in.',
          priority: 'high',
          due_date: new Date((Number.isNaN(referenceDate) ? Date.now() : referenceDate) + 48 * 60 * 60 * 1000).toISOString(),
          status: 'suggested',
        });
      }
      return {
        tasks: tasks.length ? tasks : [{
          task: 'Review outstanding case requirements with the responsible practitioner.',
          priority: 'standard',
          due_date: null,
          status: 'suggested',
        }],
        due_windows: Object.entries(dueWindows).map(([tier, window]) => ({ tier, days: window.days })),
        scheduling_performed: false,
        limitations: REVIEW_ONLY,
      };
    },
  };
}

function makeComplianceHandlers() {
  return {
    child_safe_standards_compliance: async ({ input }) => ({
      compliance_flags: [],
      review_requirements: [
        { standard: 'child-safe culture', status: 'not_assessed' },
        { standard: 'child participation and empowerment', status: 'not_assessed' },
        { standard: 'family and community involvement', status: 'not_assessed' },
        { standard: 'equity and diverse needs', status: 'not_assessed' },
        { standard: 'suitable and supported personnel', status: 'not_assessed' },
        { standard: 'complaints and concerns processes', status: 'not_assessed' },
        { standard: 'training, physical and online environments, and review', status: 'not_assessed' },
      ],
      artifact_supplied: Boolean(input.artifact),
      limitations: 'This is not a compliance audit; a qualified reviewer must assess evidence against the applicable jurisdiction and standard version.',
    }),
    bias_discrimination_detection: async ({ input }) => {
      const analysis = analyzeFairnessDocument(asText(input.artifact));
      return {
        bias_signals: [...analysis.bias_indicators, ...analysis.discrimination_risks],
        reframes: analysis.remediation_recommendations,
        decisionSupportOnly: true,
      };
    },
    cultural_safety: async ({ input }) => {
      const artifact = asText(input.artifact);
      const concerns = findQuotedEvidence(
        artifact,
        /\b(?:primitive|backward|those people|not our way|their culture)\b/gi,
        'potential_cultural_safety_concern',
        'Ask the person and relevant community what is meaningful; do not infer cultural beliefs from identity.',
      );
      return {
        cultural_safety_concerns: concerns,
        alternatives: ['Seek the person’s preferred supports and language.', 'Consult an appropriate cultural liaison with consent.', 'Describe specific evidence rather than generalizing about a community.'],
        limitations: 'Text screening cannot determine whether a practice or response is culturally safe.',
      };
    },
    policy_interpretation: async ({ input }) => {
      const artifact = asText(input.artifact);
      const obligations = findQuotedEvidence(
        artifact,
        /\b(?:must|shall|required to|is required to|within \d+ (?:hours?|days?))\b[^.!?\n]*/gi,
        'possible_obligation',
        'Verify this excerpt against the current policy, jurisdiction, and source document.',
      );
      return {
        policy_summary: obligations,
        human_review_checkpoints: ['Confirm the source is current and applicable.', 'Have an authorized practitioner interpret scope, exceptions, and deadlines.'],
        legal_advice_provided: false,
      };
    },
  };
}

export function createDefaultSkillHandlers() {
  return {
    ...createDefaultDocumentSkillHandlers(),
    ...makeActionHandlers(),
    ...makeCommunicationHandlers(),
    ...makeChildSafeHandlers(),
    ...makeComplianceHandlers(),
  };
}

export default { createDefaultSkillHandlers };
