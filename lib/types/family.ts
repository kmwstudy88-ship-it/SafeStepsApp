export type FamilyStatus =
  | "pending"
  | "active"
  | "inactive"
  | "archived"
  | "closed";

export type FamilyMemberType =
  | "child"
  | "parent"
  | "carer"
  | "guardian"
  | "sibling"
  | "grandparent"
  | "relative"
  | "household_member"
  | "significant_person"
  | "unborn_child"
  | "other";

export interface Family {
  id: string;
  tenant_id: string;
  family_reference: string;
  family_display_name: string | null;
  family_type: string;
  family_status: FamilyStatus;
  primary_language_code: string;
  preferred_contact_method: string | null;
  cultural_context: Record<string, unknown>;
  accessibility_requirements: unknown[];
  family_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  tenant_id: string;
  family_id: string;
  profile_id: string | null;
  member_reference: string;
  member_type: FamilyMemberType;
  legal_first_name: string | null;
  legal_middle_names: string | null;
  legal_last_name: string | null;
  preferred_name: string | null;
  display_name: string | null;
  date_of_birth: string | null;
  primary_language_code: string | null;
  interpreter_required: boolean;
  member_status: string;
}

export interface Child {
  id: string;
  tenant_id: string;
  family_member_id: string;
  child_reference: string;
  developmental_stage: string | null;
  school_year_level: string | null;
  child_status: string;
  communication_preferences: Record<string, unknown>;
  sensory_preferences: Record<string, unknown>;
  accessibility_requirements: unknown[];
  child_account_status: string;
  child_voice_enabled: boolean;
  independent_login_allowed: boolean;
}
