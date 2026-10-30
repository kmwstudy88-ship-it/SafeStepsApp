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

test('buildCourtReportHtml renders Section 4 Structural Fairness, ECS & Compliance-Clock Tolling when provided', () => {
  const mockReportWithFairness = {
    caseReference: 'QLD-2026-8941',
    parentName: 'Sarah Jenkins',
    childrenNames: ['Leo (Age 6)'],
    caseworkerName: 'Mark Henderson (CSO)',
    reportPeriod: 'June 2026 - September 2026',
    completedCurriculumModules: [],
    assessmentTrajectories: [],
    contactVisitStats: [{ totalVisits: 10, attendedVisits: 10, punctualityRate: '100%' }],
    verifiedEvidenceCount: 12,
    workerObservationSummary: 'Strong relational attunement observed.',
    structuralFairnessContext: {
      povertyDecoupledAttestation: true,
      concreteSupportSummary: {
        totalDisbursedAud: 540,
        stabilizedCategories: ['Utility Arrears ($420)', 'Transit Passes ($120)'],
      },
      complianceClockTolling: {
        totalDaysTolledForWaitlists: 28,
        activeBarrierNotes: ['Regional Trauma Therapist 4-week waitlist'],
      },
      relationalAndPeerSupport: {
        parentPartnerSessionsCompleted: 6,
        abcPcitCoachingVerified: true,
        fatherhoodInclusionVerified: true,
        kinshipEquityVerified: true,
      },
    },
  };

  const html = buildCourtReportHtml(mockReportWithFairness);
  assert(html.includes('4. Structural Fairness, Concrete Supports (ECS) & Compliance-Clock Tolling'));
  assert(html.includes('$540 AUD'));
  assert(html.includes('28 days tolled due to agency/provider barriers'));
  assert(html.includes('Parent Partner Sessions: 6'));
});
