import { supabase } from "../supabase";

export type FamilyListItem = {
  id: string;
  family_reference: string;
  family_display_name: string | null;
  family_status: string;
};

export async function getFamiliesForTenant(tenantId: string): Promise<FamilyListItem[]> {
  const { data, error } = await supabase
    .from("families")
    .select(
      `
      id,
      family_reference,
      family_display_name,
      family_status
    `,
    )
    .eq("tenant_id", tenantId)
    .eq("family_status", "active")
    .order("family_display_name", { ascending: true })
    .returns<FamilyListItem[]>();

  if (error) {
    throw new Error(`Unable to load families: ${error.message}`);
  }

  return data ?? [];
}

export async function getFamilyWithMembers(familyId: string) {
  const { data, error } = await supabase
    .from("families")
    .select(
      `
      id,
      tenant_id,
      family_reference,
      family_display_name,
      family_type,
      family_status,
      primary_language_code,
      cultural_context,
      accessibility_requirements,
      family_members (
        id,
        member_reference,
        member_type,
        display_name,
        preferred_name,
        date_of_birth,
        member_status,
        children (
          id,
          child_reference,
          developmental_stage,
          child_status,
          child_voice_enabled
        ),
        adult_participants (
          id,
          adult_reference,
          participant_category,
          account_status
        )
      )
    `,
    )
    .eq("id", familyId)
    .single();

  if (error) {
    throw new Error(`Unable to load family: ${error.message}`);
  }

  return data;
}
