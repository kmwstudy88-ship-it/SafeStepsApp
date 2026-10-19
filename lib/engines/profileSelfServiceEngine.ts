import { supabase } from "../supabase/client";

export type ProfileSelfServiceChanges = {
  display_name?: string | null;
  primary_email?: string | null;
  story_goal?: string;
  strengths?: string;
  support_notes?: string;
  representation_preferences?: Record<string, unknown>;
};

// Never include identity, authorization or workflow fields in client writes.
export async function saveMyProfile(changes: ProfileSelfServiceChanges) {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!auth.user) throw new Error("Sign in before updating your profile.");

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of ["display_name", "primary_email", "story_goal", "strengths", "support_notes", "representation_preferences"] as const) {
    if (changes[key] !== undefined) payload[key] = changes[key];
  }
  // DO NOTHING on conflict avoids needing UPDATE privilege on the identity key.
  const { error: insertError } = await supabase.from("profiles").upsert(
    { id: auth.user.id, ...payload },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (insertError) throw new Error(insertError.message);
  const { data, error } = await supabase.from("profiles")
    .update(payload).eq("id", auth.user.id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
