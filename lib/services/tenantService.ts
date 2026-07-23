import { supabase } from "../supabase";
import type { PlatformTenant } from "../types/tenant";

type TenantMembershipRow = {
  platform_tenants: PlatformTenant | PlatformTenant[] | null;
};

export async function getTenantsForCurrentUser(): Promise<PlatformTenant[]> {
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select(
      `
      platform_tenants (
        id,
        tenant_reference,
        tenant_slug,
        tenant_name,
        legal_entity_name,
        tenant_type,
        primary_jurisdiction_code,
        supported_jurisdiction_codes,
        data_residency_region,
        primary_timezone,
        default_language_code,
        tenant_status,
        activated_at,
        suspended_at,
        terminated_at,
        created_at,
        updated_at
      )
    `,
    )
    .eq("membership_status", "active")
    .is("revoked_at", null)
    .returns<TenantMembershipRow[]>();

  if (error) {
    throw new Error(`Unable to load tenants: ${error.message}`);
  }

  return (data ?? [])
    .flatMap((row) => row.platform_tenants ?? [])
    .filter((tenant): tenant is PlatformTenant => Boolean(tenant));
}
