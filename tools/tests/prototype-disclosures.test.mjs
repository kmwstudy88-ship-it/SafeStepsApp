import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('evidence prototype cannot present fabricated worker verification or upload success', () => {
  const screen = source('../../lib/evidence/EvidenceVaultScreen.tsx');
  assert.match(screen, /session only/i);
  assert.match(screen, /not uploaded/i);
  assert.match(screen, /not .*verified/i);
  assert.doesNotMatch(screen, /verified_by_worker|Verified by CSO|queued for caseworker verification|Secure Evidence Vault/);
});

test('report route does not generate a fabricated court report and utility marks values unverified', () => {
  const screen = source('../../lib/reports/ReportGeneratorScreen.tsx');
  const generator = source('../../lib/reports/courtReportGenerator.ts');
  assert.match(screen, /Report generation is disabled/i);
  assert.doesNotMatch(screen, /Sarah Jenkins|CS-QLD-2026-8941|exportCourtReportPdf/);
  assert.match(generator, /UNVERIFIED LOCAL DRAFT/);
  assert.match(generator, /not a court filing/i);
  assert.doesNotMatch(generator, /cryptographically sealed through SafeSteps|Digital Verification Seal/);
  assert.match(generator, /function escapeHtml/);
});

test('visit and forensic screens are session-only and do not claim official or scored outcomes', () => {
  const visit = source('../../lib/contactVisit/ContactVisitCompanionScreen.tsx');
  const forensic = source('../../lib/assessments/ForensicCriteriaAssessmentScreen.tsx');
  assert.match(visit, /not official visit notes/i);
  assert.doesNotMatch(visit, /child: 'Maya'|child: 'Leo'|Save to Progress Documentation/);
  assert.match(forensic, /unvalidated prompts/i);
  assert.match(forensic, /No assessment or decision was made/);
  assert.doesNotMatch(forensic, /scoreForensicCriteriaAssessment|Court defensibility|FORENSIC CRITERIA SCORED/);
});

test('settings does not preload personal records or describe discreet mode as guaranteed protection', () => {
  const settings = source('../../lib/settings/SettingsAccountScreen.tsx');
  const discreet = source('../../lib/privacy/DiscreetModeScreen.tsx');
  assert.doesNotMatch(settings, /Sarah Jenkins|Joanne Foster|Priya Nair|0400 222 111/);
  assert.match(settings, /does not guarantee concealment or safety/i);
  assert.match(discreet, /does not contact or verify a trusted person/i);
});

test('SOS and breathing routes disclose their non-emergency limits', () => {
  const sos = source('../../lib/support/SOSQuickRelieverScreen.tsx');
  const breathing = source('../../lib/voice/VoiceCalmingCoach.tsx');
  assert.match(sos, /Call your local emergency number now/i);
  assert.match(sos, /does not contact emergency services/i);
  assert.match(breathing, /Stop if you feel dizzy/i);
  assert.match(breathing, /not medical care or crisis support/i);
});

test('safety planning route has no fabricated contacts, saved-plan claims, or prescriptive sample steps', () => {
  const safetyPlan = source('../../lib/safety/SafetyPlanScreen.tsx');
  const hub = source('../../app/index.tsx');
  assert.match(safetyPlan, /not a saved or emergency plan/i);
  assert.match(safetyPlan, /only in this screen's memory/i);
  assert.match(safetyPlan, /If you are in immediate danger, contact your local emergency service/i);
  assert.doesNotMatch(safetyPlan, /Joanne|Priya|0400|1800 000 000|Save Safety Plan|saved and ready for review|Use the blue backpack cue/i);
  assert.match(hub, /Family case data unavailable until parent access is verified/i);
  assert.match(hub, /Unavailable pending verified schema and actor authorization/i);
  assert.match(hub, /Temporary on-screen prompts; not saved or an emergency plan/i);
});
