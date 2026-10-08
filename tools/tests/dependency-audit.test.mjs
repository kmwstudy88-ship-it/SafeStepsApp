import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { classifyAuditReport } from '../check-npm-audit.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const checkerPath = path.resolve(__dirname, '..', 'check-npm-audit.mjs');

function vulnerability(severity, fixAvailable, via = [{ title: 'advisory' }]) {
  return { severity, fixAvailable, via };
}

test('critical production vulnerabilities block regardless of fix availability', () => {
  const report = {
    auditReportVersion: 2,
    vulnerabilities: {
      critical: vulnerability('critical', false, ['transitive advisory']),
    },
  };

  assert.deepEqual(classifyAuditReport(report), {
    blocking: ['critical'],
    unfixableHigh: [],
  });
});

test('high vulnerabilities block only when a compatible fix applies to a direct advisory', () => {
  const report = {
    auditReportVersion: 2,
    vulnerabilities: {
      booleanFix: vulnerability('high', true),
      nonMajorFix: vulnerability('high', { name: 'patched', isSemVerMajor: false }),
      majorFix: vulnerability('high', { name: 'patched', isSemVerMajor: true }),
      noFix: vulnerability('high', false),
      transitiveOnly: vulnerability('high', true, ['transitive advisory']),
    },
  };

  assert.deepEqual(classifyAuditReport(report), {
    blocking: ['booleanFix', 'nonMajorFix'],
    unfixableHigh: ['majorFix', 'noFix', 'transitiveOnly'],
  });
});

test('moderate and low vulnerabilities do not block the audit', () => {
  const report = {
    auditReportVersion: 2,
    vulnerabilities: {
      moderate: vulnerability('moderate', true),
      low: vulnerability('low', true),
    },
  };

  assert.deepEqual(classifyAuditReport(report), {
    blocking: [],
    unfixableHigh: [],
  });
});

test('invalid audit reports fail closed', () => {
  assert.throws(() => classifyAuditReport({}), /did not return a valid report/);
  assert.throws(
    () => classifyAuditReport({ auditReportVersion: 2, error: { code: 'EUSAGE' } }),
    /EUSAGE/,
  );
});

test('the audit checker exits unsuccessfully for blocking findings', () => {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-audit-'));
  const reportPath = path.join(tempDirectory, 'audit.json');
  try {
    fs.writeFileSync(reportPath, JSON.stringify({
      auditReportVersion: 2,
      vulnerabilities: { vulnerable: vulnerability('high', true) },
    }));

    const result = spawnSync(process.execPath, [checkerPath, reportPath], { encoding: 'utf8' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /vulnerable/);
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
});
