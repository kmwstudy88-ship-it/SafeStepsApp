/**
 * Canonical Database Row/Insert/Update Types for Reunification Architecture Safeguards
 *
 * Mirrors supabase/migrations/20261030014500_reunification_architecture_safeguards.sql
 * in strict compliance with docs/architecture/SAFESTEPS_CANONICAL_SCHEMA.md:
 * - case_id always references public.cases(id) (never reunification_cases.id)
 * - tenant_id always references public.platform_tenants(id)
 */

export type CaseConcreteSupportRequestRow = {
  id: string;
  case_id: string;
  tenant_id: string;
  requested_by_user_id: string;
  category:
    | 'rent_or_eviction_prevention'
    | 'utility_arrears_relief'
    | 'emergency_groceries_or_formula'
    | 'transport_vouchers_or_vehicle_repair'
    | 'childcare_subsidy_or_voucher'
    | 'beds_cribs_or_safety_hardware';
  amount_aud: number;
  urgency: 'immediate_24h' | 'urgent_72h' | 'standard_7d';
  status: 'requested' | 'approved' | 'disbursed' | 'stabilized_verified';
  rationale: string;
  poverty_decoupled_from_neglect: true;
  disbursed_at: string | null;
  stabilization_note: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseServiceBarrierLogRow = {
  id: string;
  case_id: string;
  tenant_id: string;
  mandated_service_name: string;
  barrier_type:
    | 'agency_waitlist'
    | 'public_transit_deficit'
    | 'work_shift_conflict'
    | 'childcare_unavailability'
    | 'culturally_responsive_provider_shortage';
  waitlist_weeks: number;
  compliance_timer_paused: boolean;
  alternative_interim_support: string;
  documented_by: string;
  documented_at: string;
  resolved_at: string | null;
};

export type CaseParentPartnerSessionRow = {
  id: string;
  case_id: string;
  tenant_id: string;
  mentor_id: string;
  mentor_name: string;
  session_date: string;
  focus_domain:
    | 'system_navigation'
    | 'court_and_ftm_prep'
    | 'shame_resilience_and_hope'
    | 'visit_transition_support'
    | 'concrete_resource_connection';
  parent_reflection_summary: string;
  confidential_from_adversarial_fact_finding: true;
  created_at: string;
};

export type CasePostReunificationStepDownPlanRow = {
  id: string;
  case_id: string;
  tenant_id: string;
  reunification_date: string;
  current_phase:
    | 'months_1_3_intensive'
    | 'months_4_6_transitional'
    | 'months_7_12_community_sustained'
    | 'graduated_complete';
  ecs_continuity_guaranteed: boolean;
  childcare_subsidy_active: boolean;
  respite_care_hours_monthly: number;
  parent_partner_check_in_cadence: string;
  non_punitive_support_only: true;
  last_check_in_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ReunificationSafeguardTables = {
  case_concrete_support_requests: {
    Row: CaseConcreteSupportRequestRow;
    Insert: Omit<CaseConcreteSupportRequestRow, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<CaseConcreteSupportRequestRow>;
  };
  case_service_barrier_logs: {
    Row: CaseServiceBarrierLogRow;
    Insert: Omit<CaseServiceBarrierLogRow, 'id' | 'documented_at'> & {
      id?: string;
      documented_at?: string;
    };
    Update: Partial<CaseServiceBarrierLogRow>;
  };
  case_parent_partner_sessions: {
    Row: CaseParentPartnerSessionRow;
    Insert: Omit<CaseParentPartnerSessionRow, 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<CaseParentPartnerSessionRow>;
  };
  case_post_reunification_step_down_plans: {
    Row: CasePostReunificationStepDownPlanRow;
    Insert: Omit<CasePostReunificationStepDownPlanRow, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<CasePostReunificationStepDownPlanRow>;
  };
};
