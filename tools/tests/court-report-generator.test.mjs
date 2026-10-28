import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  buildCourtReportHtml,
} = await importTypeScriptModule('../../lib/reports/courtReportGenerator.ts');

test('buildCourtReportHtml generates structured court-ready report with cryptographic seal', () => {
  const mockReportData = {
    caseReference: 'NSW-2026-CH-8910',
    parentName: 'Jane Smith',
    childrenNames: ['Leo (Age 6)', 'Maya (Age 4)'],
    caseworkerName: 'Sarah Jenkins (CSO)',
    reportPeriod: '1 August 2026 - 28 October 2026',
    completedCurriculumModules: [
      { title: 'Taking Responsibility & Accountability', completedDate: '2026-09-02', hours: 4 },
      { title: 'Strengthening Family Bond & Attunement', completedDate: '2026-09-20', hours: 6 },
    ],
    assessmentTrajectories: [
      { name: 'Parental Reflective Functioning', baselineScore: 42, currentScore: 78, deltaLabel: '+36% Significant Growth' },
      { name: 'Emotional Regulation Capacity', baselineScore: 50, currentScore: 82, deltaLabel: '+32% Sustained Competence' },
    ],
    contactVisitStats: [
      { totalVisits: 12, attendedVisits: 12, punctualityRate: '100%' },
    ],
    verifiedEvidenceCount: 8,
    workerObservationSummary: 'Consistent positive engagement observed across all supervised contacts. Routine and boundary setting demonstrated reliably.',
  };

  const html = buildCourtReportHtml(mockReportData);

  assert(typeof html === 'string');
  assert(html.includes('NSW-2026-CH-8910'));
  assert(html.includes('Jane Smith'));
  assert(html.includes('Leo (Age 6), Maya (Age 4)'));
  assert(html.includes('Taking Responsibility &amp; Accountability') || html.includes('Taking Responsibility & Accountability'));
  assert(html.includes('+36% Significant Growth'));
  assert(html.includes('8 records verified'));
  assert(html.includes('Digital Verification Seal'));
  assert(html.includes('All curriculum logs, timestamps, and psychometric scores match canonical case storage'));
});
