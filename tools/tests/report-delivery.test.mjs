import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  requestReportExport,
  prepareReportDelivery,
  requestReportCorrection,
  confirmReportExport,
} = await importTypeScriptModule('../../lib/reports/reportDeliveryService.ts');

test('requestReportExport creates export event with audit logging', async () => {
  const res = await requestReportExport({
    tenantId: '00000000-0000-0000-0000-000000000001',
    caseId: 'case_smith_01',
    releaseEventId: 'rel_001',
    recipientId: 'rec_lawyer_01',
    authority: "Children's Court Section 82 Direction",
    purpose: '12-Week Reunification Progress Assessment Hearing',
  });

  assert.equal(res.success, true);
  assert(res.exportEventId);
  assert(res.auditId);
});

test('prepareReportDelivery issues time-limited challenge with 6-digit code and token', async () => {
  const res = await prepareReportDelivery(
    '00000000-0000-0000-0000-000000000001',
    'case_smith_01',
    'rel_001',
    'rec_lawyer_01',
    30
  );

  assert.equal(res.success, true);
  assert(res.challenge);
  assert(res.challenge.deliveryToken.length > 0);
  assert.match(res.challenge.verificationCode, /^\d{6}$/);
  assert(res.challenge.expiresAt);

  const expiresTime = new Date(res.challenge.expiresAt).getTime();
  const now = Date.now();
  assert(expiresTime > now);
});

test('requestReportCorrection validates description and submits request', async () => {
  const emptyRes = await requestReportCorrection({
    tenantId: '00000000-0000-0000-0000-000000000001',
    caseId: 'case_smith_01',
    reportId: 'rep_001',
    correctionType: 'attendance_record',
    description: '   ',
  });
  assert.equal(emptyRes.success, false);
  assert.match(emptyRes.error, /required/i);

  const validRes = await requestReportCorrection({
    tenantId: '00000000-0000-0000-0000-000000000001',
    caseId: 'case_smith_01',
    reportId: 'rep_001',
    correctionType: 'factual_correction',
    description: 'Parent arrived at 9:55 AM, not 10:20 AM, as confirmed by building security log.',
    materialChange: false,
  });
  assert.equal(validRes.success, true);
  assert(validRes.correctionId);
});

test('confirmReportExport records download confirmation audit entry', async () => {
  const res = await confirmReportExport('exp_001');
  assert.equal(res.success, true);
  assert.equal(res.confirmed, true);
  assert(res.auditId);
});
