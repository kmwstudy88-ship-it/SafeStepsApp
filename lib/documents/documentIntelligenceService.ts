/**
 * SafeSteps Document Intelligence Extraction & Review Service (SS-DOC-005 - SS-DOC-009)
 *
 * Implements:
 * 1. Extracted Concerns Review with source locators (paragraph:N:sentence:M)
 * 2. Extracted Case Plan Goals & Action Items
 * 3. Document Contradiction Detection & Discrepancy Log
 * 4. Procedural fairness correction and dispute logging
 * 5. Strict adherence to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md
 */

export type ExtractedSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type ExtractionStatus =
  | 'pending_review'
  | 'verified_by_practitioner'
  | 'disputed_by_parent'
  | 'dismissed';

export interface ExtractedConcern {
  id: string;
  documentId: string;
  caseId: string;
  concernTitle: string;
  category: string;
  severity: ExtractedSeverity;
  sourceLocator: string; // e.g. "paragraph:3:sentence:2"
  exactQuote: string;
  confidence: number; // 0 to 1
  status: ExtractionStatus;
  verifiedBy?: string;
  parentDisputeNote?: string;
  createdAt: string;
}

export interface ExtractedGoal {
  id: string;
  documentId: string;
  caseId: string;
  goalTitle: string;
  domain: string;
  suggestedAction: string;
  priority: 'essential' | 'high' | 'medium';
  targetDate?: string;
  sourceLocator: string;
  createdAt: string;
}

export interface DocumentContradiction {
  id: string;
  documentId: string;
  caseId: string;
  statementA: string;
  sourceA: string;
  statementB: string;
  sourceB: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  status: 'unresolved' | 'clarified' | 'noted';
  resolutionNotes?: string;
  createdAt: string;
}

export interface DocumentIntelligenceData {
  caseId: string;
  documentTitle: string;
  concerns: ExtractedConcern[];
  goals: ExtractedGoal[];
  contradictions: DocumentContradiction[];
}

// In-memory cache
const localIntelligenceStore = new Map<string, DocumentIntelligenceData>();

export const DEFAULT_MOCK_INTELLIGENCE: DocumentIntelligenceData = {
  caseId: 'demo_case',
  documentTitle: 'Intake Assessment & Contact Supervision Report (2026)',
  concerns: [
    {
      id: 'ext_concern_01',
      documentId: 'doc_intake_01',
      caseId: 'demo_case',
      concernTitle: 'Prescription Medication Accessibility',
      category: 'Environmental Safety',
      severity: 'high',
      sourceLocator: 'paragraph:4:sentence:3',
      exactQuote: 'Prescription medicines were reportedly observed on the open kitchen counter during the unannounced visit.',
      confidence: 0.92,
      status: 'pending_review',
      createdAt: '2026-10-25T10:00:00Z',
    },
    {
      id: 'ext_concern_02',
      documentId: 'doc_intake_01',
      caseId: 'demo_case',
      concernTitle: 'Contact Visit Handover Tension',
      category: 'Emotional Availability',
      severity: 'moderate',
      sourceLocator: 'paragraph:7:sentence:1',
      exactQuote: 'Parent appeared visibly agitated and raised their voice when the visit transition was delayed by ten minutes.',
      confidence: 0.88,
      status: 'pending_review',
      createdAt: '2026-10-25T10:00:00Z',
    },
  ],
  goals: [
    {
      id: 'ext_goal_01',
      documentId: 'doc_intake_01',
      caseId: 'demo_case',
      goalTitle: 'Install Lockable Medicine Storage',
      domain: 'Child Safety',
      suggestedAction: 'Deposit photo proof of locked lockbox in Evidence Vault.',
      priority: 'essential',
      targetDate: '2026-11-05',
      sourceLocator: 'paragraph:9:sentence:2',
      createdAt: '2026-10-25T10:00:00Z',
    },
    {
      id: 'ext_goal_02',
      documentId: 'doc_intake_01',
      caseId: 'demo_case',
      goalTitle: 'Complete Emotional Regulation Practice',
      domain: 'Parental Capacity',
      suggestedAction: 'Practice 4-4-4-4 box breathing resets and complete de-escalation scenarios.',
      priority: 'high',
      targetDate: '2026-11-15',
      sourceLocator: 'paragraph:10:sentence:4',
      createdAt: '2026-10-25T10:00:00Z',
    },
  ],
  contradictions: [
    {
      id: 'contra_01',
      documentId: 'doc_intake_01',
      caseId: 'demo_case',
      statementA: 'Parent failed to notify contact service of absence on 2 September.',
      sourceA: 'Contact Provider Log (paragraph:2:sentence:4)',
      statementB: 'Parent sent written SMS notification at 8:15 AM regarding emergency dentist.',
      sourceB: 'Parent Communication Record (paragraph:8:sentence:1)',
      explanation: 'Provider report asserts no contact was made, but telecommunications log shows SMS delivered at 8:15 AM.',
      severity: 'high',
      status: 'unresolved',
      createdAt: '2026-10-25T10:00:00Z',
    },
  ],
};

localIntelligenceStore.set('demo_case', JSON.parse(JSON.stringify(DEFAULT_MOCK_INTELLIGENCE)));

/**
 * Retrieves extracted document intelligence for a case.
 */
export async function getExtractedIntelligence(
  caseId: string
): Promise<DocumentIntelligenceData> {
  const data = localIntelligenceStore.get(caseId) || localIntelligenceStore.get('demo_case')!;
  return JSON.parse(JSON.stringify(data));
}

/**
 * Practitioner verifies an extracted concern as factual or substantiated.
 */
export async function verifyExtractedConcern(
  caseId: string,
  concernId: string,
  practitionerId: string
): Promise<{ success: boolean; concern?: ExtractedConcern; error?: string }> {
  const data = localIntelligenceStore.get(caseId) || localIntelligenceStore.get('demo_case');
  if (!data) return { success: false, error: 'Case data not found' };

  const concern = data.concerns.find((c) => c.id === concernId);
  if (!concern) return { success: false, error: 'Concern not found' };

  concern.status = 'verified_by_practitioner';
  concern.verifiedBy = practitionerId;

  localIntelligenceStore.set(caseId, data);
  return { success: true, concern: { ...concern } };
}

/**
 * Parent exercises procedural right to dispute an AI extraction non-destructively.
 */
export async function disputeExtractedConcern(
  caseId: string,
  concernId: string,
  parentStatement: string
): Promise<{ success: boolean; concern?: ExtractedConcern; error?: string }> {
  if (!parentStatement.trim()) {
    return { success: false, error: 'Dispute statement cannot be empty' };
  }

  const data = localIntelligenceStore.get(caseId) || localIntelligenceStore.get('demo_case');
  if (!data) return { success: false, error: 'Case data not found' };

  const concern = data.concerns.find((c) => c.id === concernId);
  if (!concern) return { success: false, error: 'Concern not found' };

  concern.status = 'disputed_by_parent';
  concern.parentDisputeNote = parentStatement.trim();

  localIntelligenceStore.set(caseId, data);
  return { success: true, concern: { ...concern } };
}

/**
 * Resolves or adds notes to a detected contradiction.
 */
export async function resolveContradiction(
  caseId: string,
  contradictionId: string,
  notes: string
): Promise<{ success: boolean; contradiction?: DocumentContradiction; error?: string }> {
  const data = localIntelligenceStore.get(caseId) || localIntelligenceStore.get('demo_case');
  if (!data) return { success: false, error: 'Case data not found' };

  const contra = data.contradictions.find((c) => c.id === contradictionId);
  if (!contra) return { success: false, error: 'Contradiction not found' };

  contra.status = 'clarified';
  contra.resolutionNotes = notes.trim();

  localIntelligenceStore.set(caseId, data);
  return { success: true, contradiction: { ...contra } };
}
