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

function getSafeFileExtension(fileName?: string, mimeType?: string) {
  const fallbackByMime: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "text/plain": "txt",
    "text/csv": "csv",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
  };
  const extension = fileName?.split(".").pop() ?? (mimeType ? fallbackByMime[mimeType] : undefined) ?? "bin";

  return extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
}

export async function uploadEvidenceFile(uri: string, fileName?: string, mimeType?: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before uploading evidence.");
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const safeExtension = getSafeFileExtension(fileName, mimeType ?? blob.type);
  const path = `${userId}/evidence-${Date.now()}.${safeExtension}`;

  const { error } = await supabase.storage.from("evidence").upload(path, blob, {
    contentType: mimeType ?? (blob.type || "application/octet-stream"),
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

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

export async function updateEvidenceItemsStatus(
  items: Pick<EvidenceItem, "id" | "title" | "status">[],
  status: EvidenceItem["status"],
) {
  const itemsToUpdate = items.filter((item) => item.status !== status);

  if (itemsToUpdate.length === 0) {
    return { updatedCount: 0 };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("No logged-in user found. Sign in before updating evidence.");
  }

  const evidenceIds = itemsToUpdate.map((item) => item.id);

  const { error } = await supabase
    .from("evidence_items")
    .update({ status })
    .eq("owner_id", userId)
    .in("id", evidenceIds);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "evidence_bulk_status_updated",
    label: `${itemsToUpdate.length} evidence records marked ${status}`,
    metadata: {
      evidence_ids: evidenceIds,
      evidence_titles: itemsToUpdate.map((item) => item.title),
      status,
    },
  });

  return { updatedCount: itemsToUpdate.length };
}
