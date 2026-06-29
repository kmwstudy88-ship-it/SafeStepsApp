import { supabase } from "../supabase/client";

export type EvidenceItem = {
  id: string;
  owner_id: string;
  title: string;
  notes: string;
  file_path: string | null;
  status: "draft" | "stored" | "shared";
  created_at: string;
};

export type CreateEvidenceItemInput = {
  title: string;
  notes?: string;
  file_path?: string | null;
  status?: "draft" | "stored" | "shared";
};

export async function fetchEvidenceItems() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before viewing evidence.");
  }

  const { data, error } = await supabase
    .from("evidence_items")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EvidenceItem[];
}

export async function createEvidenceItem(input: CreateEvidenceItemInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before adding evidence.");
  }

  const { data, error } = await supabase
    .from("evidence_items")
    .insert({
      owner_id: userId,
      title: input.title,
      notes: input.notes ?? "",
      file_path: input.file_path ?? null,
      status: input.status ?? "stored",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "evidence_added",
    label: `Evidence added: ${input.title}`,
    metadata: {
      title: input.title,
      notes: input.notes ?? "",
      file_path: input.file_path ?? null,
      status: input.status ?? "stored",
    },
  });

  return data as EvidenceItem;
}