/**
 * SafeSteps Canonical Role Boundary & Access Control Engine
 * (SS-PLAT-001, SS-AUTH-001 - 005, SS-CHD-018, SS-SUP-001, SS-LEG-001)
 *
 * Enforces strict statutory access boundaries across all 5 user personas:
 * 1. Parent (self-case, right of reply, evidence deposit; no supervisor or cross-family access)
 * 2. Child (child-safe login, feelings check-ins, sealed private boundary from parent/caseworker)
 * 3. Carer (placement-scoped routine and observation logs; no care plan alteration)
 * 4. Caseworker & Supervisor (casework actions, mandatory supervisor rationale, no automated custody alteration)
 * 5. Lawyer & Court (privileged read-only chronology and sealed bundles; no operational editing)
 *
 * Adheres strictly to docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md
 */

export type CanonicalRole =
  | 'parent'
  | 'child'
  | 'carer'
  | 'case_worker'
  | 'supervisor'
  | 'lawyer'
  | 'court_viewer'
  | 'admin';

export type ProtectedAction =
  | 'view_case_plan'
  | 'submit_parent_reply'
  | 'upload_evidence'
  | 'access_child_private_diary'
  | 'submit_child_help_request'
  | 'create_carer_observation'
  | 'dispatch_safety_check'
  | 'sign_off_serious_decision'
  | 'recompute_case_risk'
  | 'access_disclosure_bundle'
  | 'edit_operational_case_notes'
  | 'change_legal_custody_status';

export interface ActorContext {
  userId: string;
  role: CanonicalRole;
  caseAssignments: string[]; // cases this user is actively assigned/linked to
  childAssignments?: string[]; // children assigned to this carer or parent
  tenantId: string;
}

export interface ResourceContext {
  caseId: string;
  targetUserId?: string;
  childId?: string;
  isChildPrivate?: boolean;
  childSharingConsent?: boolean;
  emergencyDisclosureActive?: boolean;
  tenantId: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  auditRequired: boolean;
}

/**
 * Validates whether an actor has lawful authority to perform a protected action on a case resource.
 */
export function evaluateRoleAccess(
  actor: ActorContext,
  action: ProtectedAction,
  resource: ResourceContext
): AccessDecision {
  // 1. Mandatory Tenant Boundary
  if (actor.tenantId !== resource.tenantId && actor.role !== 'admin') {
    return {
      allowed: false,
      reason: 'Cross-tenant access strictly prohibited under multi-tenant isolation.',
      auditRequired: true,
    };
  }

  // 2. Automated Custody Alteration is ABSOLUTELY PROHIBITED
  if (action === 'change_legal_custody_status') {
    return {
      allowed: false,
      reason: 'Under SAFESTEPS_CANONICAL_SCHEMA.md, SafeSteps never alters legal custody or statutory status. All custody orders require a Children\'s Court judicial decree.',
      auditRequired: true,
    };
  }

  // 3. Child-Private Boundary (SS-CHD-018)
  if (action === 'access_child_private_diary') {
    if (actor.role === 'child' && actor.userId === resource.targetUserId) {
      return { allowed: true, auditRequired: false };
    }
    // Only accessible by others if explicit child consent or emergency disclosure
    if (resource.childSharingConsent) {
      const allowedRoles: CanonicalRole[] = ['parent', 'case_worker', 'supervisor', 'carer'];
      if (allowedRoles.includes(actor.role) && actor.caseAssignments.includes(resource.caseId)) {
        return { allowed: true, auditRequired: true };
      }
    }
    if (resource.emergencyDisclosureActive) {
      if (['case_worker', 'supervisor', 'admin'].includes(actor.role)) {
        return {
          allowed: true,
          reason: 'Emergency safeguarding disclosure override invoked with minimum-necessary disclosure.',
          auditRequired: true,
        };
      }
    }
    return {
      allowed: false,
      reason: 'Child-private journal boundary: Entries cannot be inspected without child consent or emergency safeguarding threshold.',
      auditRequired: true,
    };
  }

  // 4. Case Association Check
  const isAssigned = actor.role === 'admin' || actor.caseAssignments.includes(resource.caseId);
  if (!isAssigned) {
    return {
      allowed: false,
      reason: 'Actor is not assigned to this case file.',
      auditRequired: true,
    };
  }

  // 5. Role-Specific Action Policy
  switch (action) {
    case 'view_case_plan':
      // Parents, workers, supervisors, lawyers, and carers (placement view)
      return { allowed: true, auditRequired: false };

    case 'submit_parent_reply':
      if (actor.role === 'parent' || actor.role === 'admin') {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Only parents or their authorized legal representatives can submit procedural right of reply.', auditRequired: false };

    case 'upload_evidence':
      if (['parent', 'carer', 'case_worker', 'supervisor', 'admin'].includes(actor.role)) {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Read-only court roles cannot upload evidence directly.', auditRequired: false };

    case 'submit_child_help_request':
      if (actor.role === 'child' || actor.role === 'admin') {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Only the child or child-facilitated session can submit a child help request.', auditRequired: false };

    case 'create_carer_observation':
      if (['carer', 'admin'].includes(actor.role)) {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Only verified carers can submit placement routine and observation logs.', auditRequired: false };

    case 'dispatch_safety_check':
      if (['case_worker', 'supervisor', 'admin'].includes(actor.role)) {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Only frontline caseworkers or supervisors can dispatch safety checks.', auditRequired: true };

    case 'sign_off_serious_decision':
      if (['supervisor', 'admin'].includes(actor.role)) {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Serious casework decisions require qualified supervisor sign-off authority.', auditRequired: true };

    case 'recompute_case_risk':
      if (['case_worker', 'supervisor', 'admin'].includes(actor.role)) {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Case risk recomputation is restricted to professional case workers and supervisors.', auditRequired: true };

    case 'access_disclosure_bundle':
      if (['lawyer', 'court_viewer', 'supervisor', 'admin'].includes(actor.role)) {
        return { allowed: true, auditRequired: true };
      }
      return { allowed: false, reason: 'Disclosure bundles require authorized court or supervisor credentials.', auditRequired: true };

    case 'edit_operational_case_notes':
      if (['case_worker', 'supervisor', 'admin'].includes(actor.role)) {
        return { allowed: true, auditRequired: true };
      }
      if (['lawyer', 'court_viewer', 'parent', 'child', 'carer'].includes(actor.role)) {
        return { allowed: false, reason: 'Court representatives and parents have read-only access to official caseworker field notes.', auditRequired: true };
      }
      return { allowed: false, reason: 'Unauthorized role.', auditRequired: true };

    default:
      return { allowed: false, reason: 'Unknown protected action', auditRequired: true };
  }
}
