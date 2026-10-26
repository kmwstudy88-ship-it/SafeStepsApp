import assert from 'node:assert/strict';
import test from 'node:test';
import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  protectiveCapacityContentLimitations,
  protectiveCapacityDomainContent,
  protectiveCapacityItemContent,
} = await importTypeScriptModule('../../lib/data/safeStepsProtectiveCapacityContent.ts');
const {
  safeStepsProtectiveCapacityDomains,
  safeStepsProtectiveCapacityItems,
} = await importTypeScriptModule('../../lib/data/safeStepsAssessmentInstrument.ts');
const { ALL_ASSESSMENTS } = await importTypeScriptModule('../../lib/assessments/assessmentDefinitions.ts');

test('every protective-capacity domain has complete reflection guidance', () => {
  assert.deepEqual(
    Object.keys(protectiveCapacityDomainContent).sort(),
    safeStepsProtectiveCapacityDomains.map((domain) => domain.id).sort(),
  );

  for (const content of Object.values(protectiveCapacityDomainContent)) {
    assert.ok(content.summary.length > 30);
    assert.ok(content.reflectionPrompt.endsWith('?'));
    assert.ok(content.nextStep.length > 40);
  }
});

test('every instrument item has a contextual, respondent-facing prompt', () => {
  assert.deepEqual(
    Object.keys(protectiveCapacityItemContent).sort(),
    safeStepsProtectiveCapacityItems.map((item) => item.id).sort(),
  );

  for (const item of safeStepsProtectiveCapacityItems) {
    const content = protectiveCapacityItemContent[item.id];
    assert.ok(content.prompt.length > 30, `Missing or short prompt for ${item.id}`);
    assert.ok(content.context.length > 30, `Missing context for ${item.id}`);
  }
});

test('the screen limitations clearly prohibit decision use and claim no persistence', () => {
  const limitations = protectiveCapacityContentLimitations.join(' ').toLowerCase();
  assert.match(limitations, /not a clinical or statutory assessment/);
  assert.match(limitations, /not saved or shared/);
  assert.match(limitations, /must never be used alone/);
});

test('self-check-in labels do not claim validated or standardized administrations', () => {
  for (const assessment of ALL_ASSESSMENTS) {
    assert.match(assessment.description, /not the standardized|not a validated/);
    assert.match(assessment.clinicalPurpose, /personal reflection only/i);
  }
});
