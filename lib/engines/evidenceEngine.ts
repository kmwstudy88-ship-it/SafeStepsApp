import { supabase } from "../supabase/client";
import {
  createEvidenceVaultHash,
  getOfflineEvidenceVaultItems,
  markOfflineEvidenceSyncFailed,
  OfflineEvidenceAttachment,
  queueOfflineEvidence,
  removeOfflineEvidenceItem,
} from "./offlineEvidenceVault";
import type { EvidenceReviewAvailability } from "./structuredEvidenceWorkflow";

export type EvidenceItem = {
  id: string;
  owner_id: string;
  title: string;
  notes: string;
  evidence_type?: string | null;
  purpose?: string | null;
  structured_data?: Record<string, unknown> | null;
  review_status?: "draft" | "pending_review" | "reviewed" | "excluded";
  dispute_status?: "not_disputed" | "disputed" | "resolved" | "superseded";
  source_reliability?: string | null;
  file_path: string | null;
  status: "draft" | "stored" | "shared";
  created_at: string;
  integrity_hash?: string | null;
  hash_algorithm?: "sha256";
  vault_hash?: string | null;
  vault_previous_hash?: string | null;
  captured_at?: string | null;
  attachment_sha256?: string | null;
  attachment_byte_size?: number | null;
};

export type CreateEvidenceItemInput = {
  title: string;
  notes?: string;
  evidence_type?: string | null;
  purpose?: string | null;
  structured_data?: Record<string, unknown> | null;
  review_status?: "draft" | "pending_review" | "reviewed" | "excluded";
  dispute_status?: "not_disputed" | "disputed" | "resolved" | "superseded";
  source_reliability?: string | null;
  file_path?: string | null;
  status?: "draft" | "stored" | "shared";
  captured_at?: string | null;
  vault_hash?: string | null;
  vault_previous_hash?: string | null;
  attachment_sha256?: string | null;
  attachment_byte_size?: number | null;
  audit_event_type?: "evidence_created" | "offline_evidence_synced";
};

export type CreateEvidenceWithAttachmentInput = {
  title: string;
  notes?: string;
  evidence_type?: string | null;
  purpose?: string | null;
  structured_data?: Record<string, unknown> | null;
  attachment?: OfflineEvidenceAttachment | null;
};

export type EvidenceCaseReviewAvailability = {
  status: EvidenceReviewAvailability;
  caseIds: string[];
  linkedWorkerCount: number;
};

async function createEvidenceIntegrityHash(input: {
  owner_id: string;
  title: string;
  notes: string;
  evidence_type: string | null;
  purpose: string | null;
  structured_data: Record<string, unknown> | null;
  file_path: string | null;
  status: string;
  captured_at: string | null;
  vault_hash: string | null;
  vault_previous_hash: string | null;
  attachment_sha256: string | null;
  attachment_byte_size: number | null;
}) {
  return createEvidenceVaultHash({
    owner_id: input.owner_id,
    title: input.title,
    notes: input.notes,
    evidence_type: input.evidence_type,
    purpose: input.purpose,
    structured_data: input.structured_data,
    file_path: input.file_path,
    status: input.status,
    captured_at: input.captured_at,
    vault_hash: input.vault_hash,
    vault_previous_hash: input.vault_previous_hash,
    attachment_sha256: input.attachment_sha256,
    attachment_byte_size: input.attachment_byte_size,
  });
}

async function getPreviousEvidenceAuditHash(userId: string) {
  const { data, error } = await supabase
    .from("evidence_audit_log")
    .select("audit_hash")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.audit_hash ?? "evidence-audit-root";
}

async function writeEvidenceAuditLog(input: {
  userId: string;
  evidenceId: string;
  eventType: "evidence_created" | "offline_evidence_synced" | "status_changed";
  payload: Record<string, unknown>;
}) {
  const previousAuditHash = await getPreviousEvidenceAuditHash(input.userId);
  const auditHash = await createEvidenceVaultHash({
    evidence_id: input.evidenceId,
    owner_id: input.userId,
    event_type: input.eventType,
    event_payload: input.payload,
    previous_audit_hash: previousAuditHash,
  });

  const { error } = await supabase.from("evidence_audit_log").insert({
    evidence_id: input.evidenceId,
    owner_id: input.userId,
    event_type: input.eventType,
    event_payload: input.payload,
    previous_audit_hash: previousAuditHash,
    audit_hash: auditHash,
    hash_algorithm: "sha256",
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function getCurrentEvidenceUserId(action: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error(`No logged-in user found. Sign in before ${action}.`);
  }

  return userId;
}

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
  const userId = await getCurrentEvidenceUserId("uploading evidence");

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
  const userId = await getCurrentEvidenceUserId("viewing evidence");

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

export async function fetchEvidenceCaseReviewAvailability(): Promise<EvidenceCaseReviewAvailability> {
  const userId = await getCurrentEvidenceUserId("checking evidence review availability");

  const { data: directCases, error: directCaseError } = await supabase
    .from("reunification_cases")
    .select("id,worker_user_id")
    .or(`owner_id.eq.${userId},parent_user_id.eq.${userId}`);

  if (directCaseError) {
    return { status: "unknown_case_linkage", caseIds: [], linkedWorkerCount: 0 };
  }

  const directCaseIds = (directCases ?? []).map((row) => row.id).filter(Boolean) as string[];
  const directWorkerCount = (directCases ?? []).filter((row) => Boolean(row.worker_user_id)).length;

  const { data: profileRows, error: profileError } = await supabase
    .from("parent_profiles")
    .select("case_id")
    .eq("owner_id", userId);

  const profileCaseIds = profileError
    ? []
    : ((profileRows ?? []).map((row) => row.case_id).filter(Boolean) as string[]);
  const caseIds = Array.from(new Set([...directCaseIds, ...profileCaseIds]));

  if (caseIds.length === 0) {
    return { status: "no_linked_worker", caseIds: [], linkedWorkerCount: 0 };
  }

  const [sessions, documents, referrals] = await Promise.all([
    supabase.from("case_sessions").select("worker_user_id").in("case_id", caseIds),
    supabase.from("case_documents").select("worker_user_id").in("case_id", caseIds),
    supabase.from("case_service_referrals").select("worker_user_id").in("case_id", caseIds),
  ]);

  if (sessions.error || documents.error || referrals.error) {
    return {
      status: directWorkerCount > 0 ? "linked_worker_available" : "unknown_case_linkage",
      caseIds,
      linkedWorkerCount: directWorkerCount,
    };
  }

  const linkedWorkerIds = new Set<string>();
  (directCases ?? []).forEach((row) => {
    if (row.worker_user_id) linkedWorkerIds.add(row.worker_user_id);
  });
  [...(sessions.data ?? []), ...(documents.data ?? []), ...(referrals.data ?? [])].forEach((row) => {
    if (row.worker_user_id) linkedWorkerIds.add(row.worker_user_id);
  });

  return {
    status: linkedWorkerIds.size > 0 ? "linked_worker_available" : "no_linked_worker",
    caseIds,
    linkedWorkerCount: linkedWorkerIds.size,
  };
}

export async function createEvidenceItem(input: CreateEvidenceItemInput) {
  const userId = await getCurrentEvidenceUserId("adding evidence");
  const status = input.status ?? "stored";
  const capturedAt = input.captured_at ?? new Date().toISOString();
  const notes = input.notes ?? "";
  const filePath = input.file_path ?? null;
  const evidenceType = input.evidence_type ?? null;
  const purpose = input.purpose ?? null;
  const structuredData = input.structured_data ?? null;
  const integrityHash = await createEvidenceIntegrityHash({
    owner_id: userId,
    title: input.title,
    notes,
    evidence_type: evidenceType,
    purpose,
    structured_data: structuredData,
    file_path: filePath,
    status,
    captured_at: capturedAt,
    vault_hash: input.vault_hash ?? null,
    vault_previous_hash: input.vault_previous_hash ?? null,
    attachment_sha256: input.attachment_sha256 ?? null,
    attachment_byte_size: input.attachment_byte_size ?? null,
  });

  const { data, error } = await supabase
    .from("evidence_items")
    .insert({
      owner_id: userId,
      title: input.title,
      notes,
      evidence_type: evidenceType,
      purpose,
      structured_data: structuredData,
      review_status: input.review_status ?? "draft",
      dispute_status: input.dispute_status ?? "not_disputed",
      source_reliability: input.source_reliability ?? null,
      file_path: filePath,
      status,
      captured_at: capturedAt,
      integrity_hash: integrityHash,
      hash_algorithm: "sha256",
      vault_hash: input.vault_hash ?? null,
      vault_previous_hash: input.vault_previous_hash ?? null,
      attachment_sha256: input.attachment_sha256 ?? null,
      attachment_byte_size: input.attachment_byte_size ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await writeEvidenceAuditLog({
    userId,
    evidenceId: data.id,
    eventType: input.audit_event_type ?? "evidence_created",
    payload: {
      title: input.title,
      file_path: filePath,
      status,
      captured_at: capturedAt,
      integrity_hash: integrityHash,
      vault_hash: input.vault_hash ?? null,
      attachment_sha256: input.attachment_sha256 ?? null,
    },
  });

  await supabase.from("progress_events").insert({
    owner_id: userId,
    event_type: "evidence_added",
    label: `Evidence added: ${input.title}`,
    metadata: {
      title: input.title,
      notes,
      file_path: filePath,
      status,
      evidence_type: evidenceType,
      purpose,
      captured_at: capturedAt,
      integrity_hash: integrityHash,
    },
  });

  return data as EvidenceItem;
}

function evidenceNotesWithAttachment(input: CreateEvidenceWithAttachmentInput) {
  return [
    input.notes?.trim() ?? "",
    input.attachment ? `Attachment source: ${input.attachment.source}` : "",
    input.attachment ? `Attachment name: ${input.attachment.name}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function createEvidenceItemWithOfflineFallback(input: CreateEvidenceWithAttachmentInput) {
  const userId = await getCurrentEvidenceUserId("adding evidence");

  try {
    const filePath = input.attachment
      ? await uploadEvidenceFile(input.attachment.uri, input.attachment.name, input.attachment.mimeType)
      : null;

    return {
      mode: "online" as const,
      item: await createEvidenceItem({
        title: input.title,
        notes: evidenceNotesWithAttachment(input),
        evidence_type: input.evidence_type ?? null,
        purpose: input.purpose ?? null,
        structured_data: input.structured_data ?? null,
        source_reliability: input.structured_data?.source_reliability as string | null | undefined,
        file_path: filePath,
        status: "stored",
      }),
    };
  } catch (error) {
    const queued = await queueOfflineEvidence({
      ownerId: userId,
      title: input.title,
      notes: evidenceNotesWithAttachment(input),
      evidenceType: input.evidence_type ?? null,
      purpose: input.purpose ?? null,
      structuredData: input.structured_data ?? null,
      attachment: input.attachment ?? null,
    });

    return {
      mode: "offline" as const,
      item: queued,
      error: error instanceof Error ? error.message : "Evidence queued for upload.",
    };
  }
}

export async function getPendingOfflineEvidenceItems() {
  const userId = await getCurrentEvidenceUserId("viewing offline evidence");
  return getOfflineEvidenceVaultItems(userId);
}

export async function syncPendingOfflineEvidence() {
  const userId = await getCurrentEvidenceUserId("syncing offline evidence");
  const pendingItems = await getOfflineEvidenceVaultItems(userId);
  let syncedCount = 0;
  let failedCount = 0;

  for (const pendingItem of pendingItems) {
    try {
      const filePath = pendingItem.attachment
        ? await uploadEvidenceFile(
            pendingItem.attachment.uri,
            pendingItem.attachment.name,
            pendingItem.attachment.mimeType,
          )
        : null;

      await createEvidenceItem({
        title: pendingItem.title,
        notes: [
          pendingItem.notes,
          "Offline vault sync: yes",
          `Offline captured at: ${pendingItem.createdAt}`,
          `Offline vault hash: ${pendingItem.integrityHash}`,
          `Previous vault hash: ${pendingItem.previousHash}`,
        ]
          .filter(Boolean)
          .join("\n"),
        file_path: filePath,
        evidence_type: pendingItem.evidenceType ?? null,
        purpose: pendingItem.purpose ?? null,
        structured_data: pendingItem.structuredData ?? null,
        source_reliability: pendingItem.structuredData?.source_reliability as string | null | undefined,
        status: "stored",
        captured_at: pendingItem.createdAt,
        vault_hash: pendingItem.integrityHash,
        vault_previous_hash: pendingItem.previousHash,
        attachment_sha256: pendingItem.attachment?.sha256 ?? null,
        attachment_byte_size: pendingItem.attachment?.byteSize ?? null,
        audit_event_type: "offline_evidence_synced",
      });

      await removeOfflineEvidenceItem(pendingItem.id);
      syncedCount += 1;
    } catch (error) {
      await markOfflineEvidenceSyncFailed(
        pendingItem.id,
        error instanceof Error ? error.message : "Could not sync offline evidence.",
      );
      failedCount += 1;
    }
  }

  return { syncedCount, failedCount, pendingCount: pendingItems.length - syncedCount };
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

  await Promise.all(
    itemsToUpdate.map((item) =>
      writeEvidenceAuditLog({
        userId,
        evidenceId: item.id,
        eventType: "status_changed",
        payload: {
          evidence_title: item.title,
          previous_status: item.status,
          next_status: status,
        },
      }),
    ),
  );

  return { updatedCount: itemsToUpdate.length };
}
