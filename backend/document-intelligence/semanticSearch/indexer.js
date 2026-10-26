"use strict";

const crypto = require("crypto");
const { admin } = require("../supabase");
const { embed } = require("./embeddings");

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

async function indexDocument(documentId, caseId, text) {
  if (!text || !text.trim()) return 0;
  const chunks = chunkText(text);
  if (!chunks.length) return 0;
  const vectors = await embed(chunks, "document");

  await admin.from("document_chunks").delete().eq("document_id", documentId);

  const rows = chunks.map((chunk, idx) => ({
    document_id: documentId,
    case_id: caseId,
    chunk_index: idx,
    chunk_text: chunk,
    chunk_hash: crypto.createHash("sha256").update(chunk).digest("hex"),
    embedding: vectors[idx],
  }));

  const { error } = await admin.from("document_chunks").insert(rows);
  if (error) throw error;
  return rows.length;
}

module.exports = { indexDocument, chunkText };