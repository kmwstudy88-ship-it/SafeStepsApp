import { supabase } from "./supabaseClient";

const DEFAULT_API_URL = "http://localhost:3000";

export type DocumentIntelligenceSource = {
  mode: "text" | "file";
  fileName: string | null;
  mimeType: string | null;
  textLength: number;
};

export type DocumentIntelligenceSection = {
  summary: string;
  signals: string[];
  evidenceRefs: string[];
  gaps: string[];
  reviewPrompts: string[];
  confidence: "low" | "medium" | "high";
};

export type DocumentIntelligenceResult = {
  schemaVersion: string;
  model: string;
  generatedAt: string;
  input: {
    characterCount: number;
    truncated: boolean;
  };
  overallSummary: string;
  priorityReview: string[];
  safetyFlags: string[];
  evidenceGaps: string[];
  workerReviewActions: string[];
  sections: Record<string, DocumentIntelligenceSection>;
  disclaimer: string;
};

export type DocumentIntelligenceResponse = {
  source: DocumentIntelligenceSource;
  result: DocumentIntelligenceResult;
};

export type DocumentIntelligenceFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

function apiBaseUrl() {
  return (process.env.EXPO_PUBLIC_SAFESTEPS_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

async function authenticatedHeaders(extraHeaders: Record<string, string> = {}) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("Sign in before using SafeSteps document intelligence.");
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${accessToken}`,
  };
}

async function readDocumentIntelligenceResponse(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? `SafeSteps document intelligence returned ${response.status}`);
  }

  return payload as DocumentIntelligenceResponse;
}

export async function analyzeDocumentText(text: string) {
  const response = await fetch(`${apiBaseUrl()}/documents/analyze`, {
    method: "POST",
    headers: await authenticatedHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ text }),
  });

  return readDocumentIntelligenceResponse(response);
}

export async function analyzeDocumentFile(file: DocumentIntelligenceFile, fallbackText = "") {
  const formData = new FormData();

  if (!file.uri.startsWith("file:") && fallbackText.trim()) {
    formData.append("text", fallbackText.trim());
  }

  if (file.uri.startsWith("file:")) {
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? "application/octet-stream",
    } as unknown as Blob);
  }

  const response = await fetch(`${apiBaseUrl()}/documents/analyze`, {
    method: "POST",
    headers: await authenticatedHeaders(),
    body: formData,
  });

  return readDocumentIntelligenceResponse(response);
}
