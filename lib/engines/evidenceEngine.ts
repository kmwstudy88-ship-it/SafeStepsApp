import { supabase } from "../supabase/client";
import {
  createEvidenceVaultHash,
  getOfflineEvidenceVaultItems,
  markOfflineEvidenceSyncFailed,
  OfflineEvidenceAttachment,
  queueOfflineEvidence,
  removeOfflineEvidenceItem,
  readOfflineEvidenceAttachment,
  retainOfflineEvidenceDraft,
  getOfflineEvidenceVaultHistory,
  verifyOfflineEvidenceVaultChain,
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
  id?: string;
  expectedOwnerId?: string;
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
  captureDraftId?: string;
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
  auditId?: string;
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
    ...(input.auditId ? { id: input.auditId } : {}),
    evidence_id: input.evidenceId,
    owner_id: input.userId,
    event_type: input.eventType,
    event_payload: input.payload,
    previous_audit_hash: previousAuditHash,
    audit_hash: auditHash,
    hash_algorithm: "sha256",
  });

  if (error?.code === "23505" && input.auditId) {
    const { data: existing, error: readError } = await supabase.from("evidence_audit_log")
      .select("owner_id,evidence_id,event_type,event_payload").eq("id", input.auditId).single();
    if (!readError && existing?.owner_id === input.userId && existing.evidence_id === input.evidenceId
      && existing.event_type === input.eventType
      && await createEvidenceVaultHash(existing.event_payload) === await createEvidenceVaultHash(input.payload)) return;
  }
  if (error) throw new Error(error.message);
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
  if (input.expectedOwnerId && input.expectedOwnerId !== userId) throw new Error("The signed-in account changed. Evidence remains queued.");
  const status = input.status ?? "stored";
  const capturedAt = input.captured_at === undefined ? new Date().toISOString() : input.captured_at;
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

  const { data: inserted, error } = await supabase
    .from("evidence_items")
    .insert({
      ...(input.id ? { id: input.id } : {}),
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

  let data = inserted;
  if (error?.code === "23505" && input.id) {
    const existing = await supabase.from("evidence_items").select("*")
      .eq("id", input.id).eq("owner_id", userId).single();
    if (existing.error || existing.data?.integrity_hash !== integrityHash) {
      throw new Error("Evidence registration conflict. The queued original has been retained.");
    }
    data = existing.data;
  } else if (error) {
    throw new Error(error.message);
  }
  if (!data) throw new Error("Evidence registration returned no receipt.");

  await writeEvidenceAuditLog({
    auditId: input.id,
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

  if (inserted) await supabase.from("progress_events").insert({
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
  const { data: localSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = localSession.session?.user.id;
  if (!userId) throw new Error("Sign in before saving evidence.");
  const captureDraftId = input.captureDraftId ?? input.attachment?.captureDraftId;
  if (captureDraftId) {
    const source = (await getOfflineEvidenceVaultItems(userId)).find((item) => item.id === captureDraftId);
    if (!source?.requiresConfirmation) throw new Error("This capture draft is unavailable for this account.");
  }
  const digest = captureDraftId ? (await createEvidenceVaultHash({ ownerId: userId, captureDraftId, purpose: "confirm-capture" })).replace(/^sha256:/, "") : null;
  const confirmationId = digest ? `${digest.slice(0, 8)}-${digest.slice(8, 12)}-8${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}` : undefined;
  const queued = await queueOfflineEvidence({
    captureId: confirmationId,
    ownerId: userId, title: input.title, notes: evidenceNotesWithAttachment(input),
    evidenceType: input.evidence_type ?? null, purpose: input.purpose ?? null,
    structuredData: { ...input.structured_data, ...(input.attachment ? { source_reliability: "unverified" } : {}), ...(captureDraftId ? { capture_draft_id: captureDraftId } : {}) }, attachment: input.attachment ?? null,
  });
  if (captureDraftId) await retainOfflineEvidenceDraft(captureDraftId, userId);
  const result = await syncPendingOfflineEvidence().catch(() => ({ syncedCount: 0, failedCount: 1, pendingCount: 1 }));
  const pending = await getOfflineEvidenceVaultItems(userId);
  const retained = pending.find((item) => item.id === queued.id);
  return retained
    ? { mode: "offline" as const, item: retained, error: retained.lastError ?? "Evidence saved securely on this device; upload is pending." }
    : { mode: "online" as const, item: { ...queued, id: queued.id.replace("offline-evidence-", "") }, error: result.failedCount ? "Some other evidence items remain pending." : undefined };
}

export async function getPendingOfflineEvidenceItems() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user.id;
  if (!userId) throw new Error("Sign in before viewing local evidence.");
  return getOfflineEvidenceVaultItems(userId);
}

let syncOperation: Promise<{ syncedCount: number; failedCount: number; pendingCount: number }> | null = null;

export function syncPendingOfflineEvidence() {
  if (syncOperation) return syncOperation;
  const operation = syncOfflineEvidence();
  syncOperation = operation;
  void operation.finally(() => { if (syncOperation === operation) syncOperation = null; }).catch(() => undefined);
  return operation;
}

async function uploadSealedEvidence(pendingItem: Awaited<ReturnType<typeof getOfflineEvidenceVaultItems>>[number], userId: string) {
  if (!pendingItem.attachment) return null;
  const attachment = pendingItem.attachment;
  const bytes = await readOfflineEvidenceAttachment(attachment);
  const path = `${userId}/${pendingItem.id}.${getSafeFileExtension(attachment.name, attachment.mimeType)}`;
  const { error } = await supabase.storage.from("evidence").upload(path, bytes, {
    contentType: attachment.mimeType ?? "application/octet-stream", upsert: false,
  });
  if (error) {
    // An interrupted request may already have uploaded this immutable object.
    // Verify the bytes rather than trusting a filename or overwriting it.
    const existing = await supabase.storage.from("evidence").download(path);
    if (existing.error || !existing.data) throw new Error(error.message);
    const stored = new Uint8Array(await existing.data.arrayBuffer());
    if (stored.length !== bytes.length || !stored.every((value, index) => value === bytes[index])) {
      throw new Error("Uploaded evidence conflicts with the queued original.");
    }
  }
  return path;
}

async function syncOfflineEvidence() {
  const userId = await getCurrentEvidenceUserId("syncing offline evidence");
  const history = await getOfflineEvidenceVaultHistory();
  if (!await verifyOfflineEvidenceVaultChain(history)) throw new Error("Evidence history failed verification. Sync stopped; originals retained.");
  const pendingItems = await getOfflineEvidenceVaultItems(userId);
  let syncedCount = 0;
  let failedCount = 0;
  for (const pendingItem of [...pendingItems].reverse()) {
    if (pendingItem.requiresConfirmation) continue;
    try {
      // Recheck the account before each item; never send one account's queue as another.
      if (await getCurrentEvidenceUserId("syncing evidence") !== userId) throw new Error("The signed-in account changed.");
      const filePath = await uploadSealedEvidence(pendingItem, userId);
      // New capture ids are UUIDs; legacy ids without a UUID cannot be retried safely.
      const id = pendingItem.id.replace(/^offline-evidence-/, "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        throw new Error("This legacy capture needs migration before sync.");
      }
      await createEvidenceItem({
        id, expectedOwnerId: userId, title: pendingItem.title, notes: pendingItem.notes, file_path: filePath,
        evidence_type: pendingItem.evidenceType ?? null, purpose: pendingItem.purpose ?? null,
        structured_data: pendingItem.structuredData ?? null,
        source_reliability: pendingItem.structuredData?.source_reliability as string | null | undefined,
        status: "stored", captured_at: pendingItem.attachment?.source === "live" ? pendingItem.attachment.capturedAt ?? pendingItem.createdAt : null,
        vault_hash: pendingItem.integrityHash, vault_previous_hash: pendingItem.previousHash,
        attachment_sha256: pendingItem.attachment?.digestEncoding === "bytes" ? pendingItem.attachment.sha256 : null,
        attachment_byte_size: pendingItem.attachment?.byteSize ?? null,
        audit_event_type: "offline_evidence_synced",
      });
      await removeOfflineEvidenceItem(pendingItem.id);
      syncedCount += 1;
    } catch (error) {
      await markOfflineEvidenceSyncFailed(pendingItem.id, error instanceof Error ? error.message : "Could not sync evidence.");
      failedCount += 1;
    }
  }
  return { syncedCount, failedCount, pendingCount: (await getOfflineEvidenceVaultItems(userId)).length };
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
