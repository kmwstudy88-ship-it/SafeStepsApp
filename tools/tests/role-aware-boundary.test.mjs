import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  evaluateRoleAccess,
} = await importTypeScriptModule('../../lib/auth/roleBoundaryService.ts');

const TENANT_A = 'tenant_nsw_gov_01';
const TENANT_B = 'tenant_vic_gov_02';
const CASE_1 = 'case_smith_01';
const CASE_2 = 'case_unrelated_99';

// Persona 1: Parent
test('Parent Persona: permitted for own case actions, denied supervisor and operational actions', () => {
  const parentActor = {
    userId: 'user_parent_jane',
    role: 'parent',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const caseResource = {
    caseId: CASE_1,
    tenantId: TENANT_A,
  };

  // 1. Can view own case plan
  const viewPlan = evaluateRoleAccess(parentActor, 'view_case_plan', caseResource);
  assert.equal(viewPlan.allowed, true);

  // 2. Can submit parent right of reply
  const reply = evaluateRoleAccess(parentActor, 'submit_parent_reply', caseResource);
  assert.equal(reply.allowed, true);

  // 3. Can upload evidence to vault
  const upload = evaluateRoleAccess(parentActor, 'upload_evidence', caseResource);
  assert.equal(upload.allowed, true);

  // 4. CANNOT recompute case risk
  const risk = evaluateRoleAccess(parentActor, 'recompute_case_risk', caseResource);
  assert.equal(risk.allowed, false);

  // 5. CANNOT sign off serious decisions
  const decision = evaluateRoleAccess(parentActor, 'sign_off_serious_decision', caseResource);
  assert.equal(decision.allowed, false);

  // 6. CANNOT edit caseworker operational notes
  const notes = evaluateRoleAccess(parentActor, 'edit_operational_case_notes', caseResource);
  assert.equal(notes.allowed, false);

  // 7. CANNOT access other parents' cases
  const otherCase = evaluateRoleAccess(parentActor, 'view_case_plan', { caseId: CASE_2, tenantId: TENANT_A });
  assert.equal(otherCase.allowed, false);
});

// Persona 2: Child & Sealed Private Boundary (SS-CHD-018, SS-CHD-015)
test('Child Persona: access to own diary; parent/worker access blocked without child consent or emergency', () => {
  const childActor = {
    userId: 'child_leo',
    role: 'child',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const parentActor = {
    userId: 'user_parent_jane',
    role: 'parent',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const workerActor = {
    userId: 'worker_priya',
    role: 'case_worker',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const privateResource = {
    caseId: CASE_1,
    targetUserId: 'child_leo',
    isChildPrivate: true,
    childSharingConsent: false,
    emergencyDisclosureActive: false,
    tenantId: TENANT_A,
  };

  // 1. Child CAN access their own private diary
  const childOwnAccess = evaluateRoleAccess(childActor, 'access_child_private_diary', privateResource);
  assert.equal(childOwnAccess.allowed, true);

  // 2. Parent CANNOT access child-private diary without child consent
  const parentAccessNoConsent = evaluateRoleAccess(parentActor, 'access_child_private_diary', privateResource);
  assert.equal(parentAccessNoConsent.allowed, false);
  assert.match(parentAccessNoConsent.reason, /Child-private journal boundary/);

  // 3. Worker CANNOT access child-private diary without child consent
  const workerAccessNoConsent = evaluateRoleAccess(workerActor, 'access_child_private_diary', privateResource);
  assert.equal(workerAccessNoConsent.allowed, false);

  // 4. When child GRANTS explicit sharing consent, parent & worker can view
  const consentedResource = { ...privateResource, childSharingConsent: true };
  const parentAccessConsented = evaluateRoleAccess(parentActor, 'access_child_private_diary', consentedResource);
  assert.equal(parentAccessConsented.allowed, true);

  // 5. When emergency safeguarding disclosure is active, worker/supervisor can access
  const emergencyResource = { ...privateResource, emergencyDisclosureActive: true };
  const workerEmergencyAccess = evaluateRoleAccess(workerActor, 'access_child_private_diary', emergencyResource);
  assert.equal(workerEmergencyAccess.allowed, true);
  assert.match(workerEmergencyAccess.reason, /Emergency safeguarding disclosure/);

  // 6. Child CAN submit help request (SS-CHD-008)
  const helpReq = evaluateRoleAccess(childActor, 'submit_child_help_request', privateResource);
  assert.equal(helpReq.allowed, true);
});

// Persona 3: Carer
test('Carer Persona: placement-scoped observations permitted, care plan alteration blocked', () => {
  const carerActor = {
    userId: 'carer_anne',
    role: 'carer',
    caseAssignments: [CASE_1],
    childAssignments: ['child_leo'],
    tenantId: TENANT_A,
  };

  const caseResource = {
    caseId: CASE_1,
    tenantId: TENANT_A,
  };

  // 1. Can log daily routine and care observations
  const obs = evaluateRoleAccess(carerActor, 'create_carer_observation', caseResource);
  assert.equal(obs.allowed, true);

  // 2. CANNOT sign off serious decisions
  const decision = evaluateRoleAccess(carerActor, 'sign_off_serious_decision', caseResource);
  assert.equal(decision.allowed, false);

  // 3. CANNOT edit caseworker field notes
  const notes = evaluateRoleAccess(carerActor, 'edit_operational_case_notes', caseResource);
  assert.equal(notes.allowed, false);
});

// Persona 4: Caseworker vs Supervisor
test('Caseworker vs Supervisor: worker actions permitted, supervisor required for serious decisions', () => {
  const workerActor = {
    userId: 'worker_priya',
    role: 'case_worker',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const supervisorActor = {
    userId: 'supervisor_ellen',
    role: 'supervisor',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const caseResource = {
    caseId: CASE_1,
    tenantId: TENANT_A,
  };

  // 1. Both can edit operational case notes and recompute risk
  assert.equal(evaluateRoleAccess(workerActor, 'edit_operational_case_notes', caseResource).allowed, true);
  assert.equal(evaluateRoleAccess(supervisorActor, 'edit_operational_case_notes', caseResource).allowed, true);
  assert.equal(evaluateRoleAccess(workerActor, 'recompute_case_risk', caseResource).allowed, true);

  // 2. Caseworker CANNOT sign off serious decisions
  const workerDecision = evaluateRoleAccess(workerActor, 'sign_off_serious_decision', caseResource);
  assert.equal(workerDecision.allowed, false);
  assert.match(workerDecision.reason, /supervisor sign-off/);

  // 3. Supervisor CAN sign off serious decisions and dispatch safety check
  assert.equal(evaluateRoleAccess(supervisorActor, 'sign_off_serious_decision', caseResource).allowed, true);
  assert.equal(evaluateRoleAccess(supervisorActor, 'dispatch_safety_check', caseResource).allowed, true);

  // 4. Neither worker nor supervisor (nor AI) can alter legal custody status
  const custodyWorker = evaluateRoleAccess(workerActor, 'change_legal_custody_status', caseResource);
  assert.equal(custodyWorker.allowed, false);
  assert.match(custodyWorker.reason, /Children's Court/);

  const custodySupervisor = evaluateRoleAccess(supervisorActor, 'change_legal_custody_status', caseResource);
  assert.equal(custodySupervisor.allowed, false);
});

// Persona 5: Lawyer & Court Read-Only
test('Court & Lawyer Persona: privileged read-only access to chronologies and bundles, write access blocked', () => {
  const lawyerActor = {
    userId: 'lawyer_michael',
    role: 'lawyer',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const caseResource = {
    caseId: CASE_1,
    tenantId: TENANT_A,
  };

  // 1. Can view case plan and access disclosure bundles
  assert.equal(evaluateRoleAccess(lawyerActor, 'view_case_plan', caseResource).allowed, true);
  assert.equal(evaluateRoleAccess(lawyerActor, 'access_disclosure_bundle', caseResource).allowed, true);

  // 2. CANNOT edit operational case notes
  const editNotes = evaluateRoleAccess(lawyerActor, 'edit_operational_case_notes', caseResource);
  assert.equal(editNotes.allowed, false);
  assert.match(editNotes.reason, /read-only access/);

  // 3. CANNOT sign off internal serious decisions
  assert.equal(evaluateRoleAccess(lawyerActor, 'sign_off_serious_decision', caseResource).allowed, false);
});

// Cross-Tenant Isolation
test('Cross-Tenant Isolation: strictly blocks access across different government tenants', () => {
  const actorTenantA = {
    userId: 'worker_priya',
    role: 'case_worker',
    caseAssignments: [CASE_1],
    tenantId: TENANT_A,
  };

  const resourceTenantB = {
    caseId: CASE_1,
    tenantId: TENANT_B,
  };

  const res = evaluateRoleAccess(actorTenantA, 'view_case_plan', resourceTenantB);
  assert.equal(res.allowed, false);
  assert.match(res.reason, /Cross-tenant access strictly prohibited/);
});
