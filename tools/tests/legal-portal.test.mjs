import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getAuthorizedLegalCases,
  getCaseVerifiedChronology,
  getConcernByConcernProgress,
  getDisclosureBundles,
  generateBundleAccessReceipt,
  getLegalAccessReceipts,
  getStatutoryDefenseFilings,
  generateStatutoryDefenseFiling,
  DEFAULT_MOCK_LEGAL_CASES,
} = await importTypeScriptModule('../../lib/legal/legalPortalService.ts');

test('getAuthorizedLegalCases returns authorized matters with court jurisdiction and client role', async () => {
  const cases = await getAuthorizedLegalCases('lawyer_current');
  assert(Array.isArray(cases));
  assert(cases.length >= 2);

  const nswCase = cases.find((c) => c.caseNumber === 'NSW-2026-CH-8910');
  assert(nswCase);
  assert.equal(nswCase.courtJurisdiction, "Children's Court of New South Wales (Parramatta)");
  assert.equal(nswCase.clientRole, 'parent_legal_representative');
  assert(nswCase.children.length >= 2);
  assert.equal(nswCase.statutoryThresholdMet, true);
});

test('getCaseVerifiedChronology returns source-linked events with forensic child voice and hashes', async () => {
  const events = await getCaseVerifiedChronology('case_smith_01');
  assert(Array.isArray(events));
  assert(events.length >= 5);

  // Check event categories
  const orders = events.filter((e) => e.category === 'court_order');
  assert(orders.length >= 1);
  assert(orders[0].evidenceHash);

  // Forensic child words check (verbatim separation)
  const visitEvent = events.find((e) => e.category === 'contact_visit');
  assert(visitEvent);
  assert(visitEvent.verbatimChildWords);
  assert.match(visitEvent.verbatimChildWords, /Mummy look what I drew/);

  // Check provenance source formatting
  for (const ev of events) {
    assert(ev.provenanceSource.length > 0);
  }
});

test('getConcernByConcernProgress tracks demonstrated behavioural change against initial statutory finding', async () => {
  const concerns = await getConcernByConcernProgress('case_smith_01');
  assert(Array.isArray(concerns));
  assert(concerns.length >= 2);

  const medStorage = concerns.find((c) => c.title.includes('Medication Storage'));
  assert(medStorage);
  assert.equal(medStorage.status, 'substantially_resolved');
  assert(medStorage.parentResponseText);
  assert(medStorage.demonstratedChangeSummary);
  assert(Array.isArray(medStorage.supportingVaultEvidenceIds));
  assert(medStorage.supportingVaultEvidenceIds.includes('evd_vault_01'));
});

test('getDisclosureBundles returns sealed evidentiary packages with SHA-256 digests', async () => {
  const bundles = await getDisclosureBundles('case_smith_01');
  assert(Array.isArray(bundles));
  assert(bundles.length >= 1);

  const b = bundles[0];
  assert(b.bundleTitle.includes('Section 82'));
  assert(b.sha256Digest);
  assert.equal(b.sha256Digest.length, 64); // SHA-256 hex string length
  assert(b.itemsCount > 0);
  assert(b.sealedBy);
});

test('generateBundleAccessReceipt issues signed access receipt and records audit record', async () => {
  const res = await generateBundleAccessReceipt('bundle_smith_section82', 'lawyer_current');
  assert.equal(res.success, true);
  assert(res.receipt);
  assert(res.receipt.receiptId.startsWith('rcpt_'));
  assert.equal(res.receipt.bundleId, 'bundle_smith_section82');
  assert(res.receipt.signedTimestamp);

  const receipts = await getLegalAccessReceipts();
  assert(receipts.length >= 1);
  const recorded = receipts.find((r) => r.receiptId === res.receipt.receiptId);
  assert(recorded);
  assert.equal(recorded.lawyerId, 'lawyer_current');
});

test('getStatutoryDefenseFilings and generateStatutoryDefenseFiling support compliance-clock tolling and poverty!=neglect filings', async () => {
  const initialFilings = await getStatutoryDefenseFilings('case_smith_01');
  assert(initialFilings.length >= 2);
  assert(initialFilings.some((f) => f.filingType === 'compliance_clock_tolling_motion'));
  assert(initialFilings.some((f) => f.filingType === 'poverty_not_neglect_contest'));

  const newFilingRes = await generateStatutoryDefenseFiling({
    caseId: 'case_smith_01',
    filingType: 'kinship_licensing_waiver_petition',
    title: 'Petition for Non-Safety Kinship Bedroom Dimension Waiver',
    statutoryAuthority: 'Title IV-E Kinship Equity Standard / Child Placement Principle',
    factualGrounds: 'Maternal grandmother residence meets all fire and health safety checks; requesting waiver of non-safety square-footage rule.',
    filedBy: 'Parent Legal Representative',
  });

  assert.equal(newFilingRes.success, true);
  assert.equal(newFilingRes.filing.filingType, 'kinship_licensing_waiver_petition');
  assert.equal(newFilingRes.filing.sha256Digest.length, 64);
});
