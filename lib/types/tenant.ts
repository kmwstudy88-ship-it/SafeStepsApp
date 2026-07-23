export type TenantStatus =
  | "provisioning"
  | "active"
  | "restricted_grace"
  | "suspended"
  | "migration"
  | "terminated";

export interface PlatformTenant {
  id: string;
  tenant_reference: string;
  tenant_slug: string;
  tenant_name: string;
  legal_entity_name: string | null;
  tenant_type: string;
  primary_jurisdiction_code: string | null;
  supported_jurisdiction_codes: string[];
  data_residency_region: string;
  primary_timezone: string;
  default_language_code: string;
  tenant_status: TenantStatus;
  activated_at: string | null;
  suspended_at: string | null;
  terminated_at: string | null;
  created_at: string;
  updated_at: string;
}
