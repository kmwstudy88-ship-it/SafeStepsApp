'use strict';

const { fairnessDetectionHandler } = require('./document-intelligence/fairnessDetection');
const { contradictionDetectionHandler } = require('./document-intelligence/contradictionDetection');
const { evidenceExtractionHandler } = require('./document-intelligence/evidenceExtraction');
const { requirementExtractionHandler } = require('./document-intelligence/requirementExtraction');
const { timelineExtractionHandler } = require('./document-intelligence/timelineExtraction');
const { riskAssessmentHandler } = require('./document-intelligence/riskAssessment');
const { concernClassificationHandler } = require('./document-intelligence/concernClassification');
const { unrealisticExpectationDetectionHandler } = require('./document-intelligence/unrealisticExpectationDetection');

const { casePacketBuilderHandler } = require('./workflow-action/casePacketBuilder');
const { multiDocumentComparisonHandler } = require('./workflow-action/multiDocumentComparison');
const { caseUpdateHandler } = require('./workflow-action/caseUpdate');
const { escalationHandler } = require('./workflow-action/escalation');
const { followUpSchedulingHandler } = require('./workflow-action/followUpScheduling');

const { traumaInformedCommunicationHandler } = require('./communication-deescalation/traumaInformedCommunication');
const { emotionLabelingHandler } = require('./communication-deescalation/emotionLabeling');
const { guidedDiscoveryHandler } = require('./communication-deescalation/guidedDiscovery');
const { behaviorMessageInterpretationHandler } = require('./communication-deescalation/behaviorMessageInterpretation');
const { deEscalationStrategyHandler } = require('./communication-deescalation/deEscalationStrategy');

const { childSafeConversationHandler } = require('./child-safe-interaction/childSafeConversation');
const { disclosureSensitiveHandlingHandler } = require('./child-safe-interaction/disclosureSensitiveHandling');
const { developmentalAppropriatenessHandler } = require('./child-safe-interaction/developmentalAppropriateness');
const { safetyPlanningHandler } = require('./child-safe-interaction/safetyPlanning');
const { boundaryPrivacyHandler } = require('./child-safe-interaction/boundaryPrivacy');

const { childSafeStandardsComplianceHandler } = require('./compliance-safeguarding/childSafeStandardsCompliance');
const { biasDiscriminationDetectionHandler } = require('./compliance-safeguarding/biasDiscriminationDetection');
const { culturalSafetyHandler } = require('./compliance-safeguarding/culturalSafety');
const { policyInterpretationHandler } = require('./compliance-safeguarding/policyInterpretation');

const docIntelHandlers = Object.freeze({
  fairness_detection: fairnessDetectionHandler,
  contradiction_detection: contradictionDetectionHandler,
  evidence_extraction: evidenceExtractionHandler,
  requirement_extraction: requirementExtractionHandler,
  timeline_extraction: timelineExtractionHandler,
  risk_assessment: riskAssessmentHandler,
  concern_classification: concernClassificationHandler,
  unrealistic_expectation_detection: unrealisticExpectationDetectionHandler,
});

const workflowHandlers = Object.freeze({
  case_packet_builder: casePacketBuilderHandler,
  multi_document_comparison: multiDocumentComparisonHandler,
  case_update: caseUpdateHandler,
  escalation: escalationHandler,
  follow_up_scheduling: followUpSchedulingHandler,
});

const commHandlers = Object.freeze({
  trauma_informed_communication: traumaInformedCommunicationHandler,
  emotion_labeling: emotionLabelingHandler,
  guided_discovery: guidedDiscoveryHandler,
  behavior_message_interpretation: behaviorMessageInterpretationHandler,
  de_escalation_strategy: deEscalationStrategyHandler,
});

const childSafeHandlers = Object.freeze({
  child_safe_conversation: childSafeConversationHandler,
  disclosure_sensitive_handling: disclosureSensitiveHandlingHandler,
  developmental_appropriateness: developmentalAppropriatenessHandler,
  safety_planning: safetyPlanningHandler,
  boundary_privacy: boundaryPrivacyHandler,
});

const complianceHandlers = Object.freeze({
  child_safe_standards_compliance: childSafeStandardsComplianceHandler,
  bias_discrimination_detection: biasDiscriminationDetectionHandler,
  cultural_safety: culturalSafetyHandler,
  policy_interpretation: policyInterpretationHandler,
});

const ALL_HANDLERS = Object.freeze({
  ...docIntelHandlers,
  ...workflowHandlers,
  ...commHandlers,
  ...childSafeHandlers,
  ...complianceHandlers,
});

module.exports = {
  ALL_HANDLERS,
  docIntelHandlers,
  workflowHandlers,
  commHandlers,
  childSafeHandlers,
  complianceHandlers,
};
