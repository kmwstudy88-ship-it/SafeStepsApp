import { supabase } from "./supabaseClient"; // your existing initialized Supabase client

const BASE_URL = process.env.EXPO_PUBLIC_DOCINTEL_API_URL || "http://localhost:3000";

async function getAuthHeader() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) {
    throw new Error("No active Supabase session - user must be logged in to call docintel AI routes.");
  }
  return { Authorization: `Bearer ${data.session.access_token}` };
}

async function post(path, body) {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`docintel AI request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function postFile(path, fileUri, fileName, mimeType) {
  const headers = await getAuthHeader();
  const form = new FormData();
  form.append("file", { uri: fileUri, name: fileName, type: mimeType });
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers, // do NOT set Content-Type manually for multipart - fetch sets the boundary
    body: form,
  });
  if (!res.ok) throw new Error(`docintel AI request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function get(path) {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`docintel AI request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export const docintelAiClient = {
  extract: (documentId, documentText, extractionType = null) =>
    post("/api/v1/ai/extract", {
      document_id: documentId,
      document_text: documentText,
      extraction_type: extractionType,
    }),

  ocr: (fileUri, fileName, mimeType) =>
    postFile("/api/v1/ai/ocr", fileUri, fileName, mimeType),

  indexDocument: (documentId, caseId, text) =>
    post("/api/v1/ai/index", { document_id: documentId, case_id: caseId, text }),

  semanticSearch: (query, caseId = null, topK = 10) =>
    post("/api/v1/ai/search", { query, case_id: caseId, top_k: topK }),

  similarDocuments: (documentId, topK = 5) =>
    get(`/api/v1/ai/search/similar/${documentId}?top_k=${topK}`),
};