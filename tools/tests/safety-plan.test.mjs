import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  getSafetyPlan,
  updateSafetyPlan,
  addTrustedContact,
  formatSafetyPlanSummary,
} = await importTypeScriptModule('../../lib/safety/safetyPlanService.ts');

test('getSafetyPlan returns default safety plan with crisis contacts', async () => {
  const plan = await getSafetyPlan('demo_case');
  assert(plan);
  assert.equal(plan.caseId, 'demo_case');
  assert(plan.warningSigns.length > 0);
  assert(plan.safePlace.length > 0);
  assert(Array.isArray(plan.trustedContacts));
  assert(plan.trustedContacts.length >= 2);

  const dfvContact = plan.trustedContacts.find((c) => c.phone.includes('1800 737 732'));
  assert(dfvContact);
  assert.equal(dfvContact.isQuickDial, true);
});

test('updateSafetyPlan applies changes and updates lastUpdated timestamp', async () => {
  const res = await updateSafetyPlan('demo_case', {
    safePlace: 'Auntie Sarah house (32 Oak Ave) or Westfield quiet room',
    codeWord: 'Pineapple',
  });

  assert.equal(res.success, true);
  assert(res.plan);
  assert.equal(res.plan.codeWord, 'Pineapple');
  assert.match(res.plan.safePlace, /Auntie Sarah/);

  // Persistence check
  const updated = await getSafetyPlan('demo_case');
  assert.equal(updated.codeWord, 'Pineapple');
});

test('addTrustedContact validates fields and adds quick dial contact', async () => {
  const invalid = await addTrustedContact('demo_case', {
    name: '  ',
    phone: '',
    relationship: 'Family',
    isQuickDial: false,
  });
  assert.equal(invalid.success, false);
  assert.match(invalid.error, /required/i);

  const valid = await addTrustedContact('demo_case', {
    name: 'Uncle Dave',
    phone: '0411 999 888',
    relationship: 'Support Driver',
    isQuickDial: true,
  });
  assert.equal(valid.success, true);
  assert(valid.contact);
  assert.equal(valid.contact.name, 'Uncle Dave');

  const updatedPlan = await getSafetyPlan('demo_case');
  const found = updatedPlan.trustedContacts.find((c) => c.name === 'Uncle Dave');
  assert(found);
  assert.equal(found.phone, '0411 999 888');
});

test('formatSafetyPlanSummary creates comprehensive offline readable text', async () => {
  const plan = await getSafetyPlan('demo_case');
  const summary = formatSafetyPlanSummary(plan);

  assert(typeof summary === 'string');
  assert(summary.includes('SAFESTEPS SAFETY PLAN'));
  assert(summary.includes('WARNING SIGNS:'));
  assert(summary.includes('SAFE HAVEN / EXIT LOCATION:'));
  assert(summary.includes('CHILD ACTION STEPS:'));
  assert(summary.includes('000 (24/7)'));
  assert(summary.includes('13 11 14 (24/7)'));
  assert(summary.includes('12-MONTH POST-REUNIFICATION STEP-DOWN & SAFE HARBOR:'));
  assert(summary.includes('Tanya Williams (Certified Parent Partner)'));
  assert(summary.includes('protective early help, never automatic re-removal'));
});
