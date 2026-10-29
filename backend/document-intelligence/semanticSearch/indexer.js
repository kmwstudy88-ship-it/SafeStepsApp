"use strict";

const crypto = require("crypto");
const { embed } = require("./embeddings");

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

// Local in-memory chunk store for offline / local mode
const inMemoryChunks = [];

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

  const rows = chunks.map((chunk, idx) => ({
    document_id: documentId,
    case_id: caseId,
    chunk_index: idx,
    chunk_text: chunk,
    chunk_hash: crypto.createHash("sha256").update(chunk).digest("hex"),
    embedding: vectors[idx],
  }));

  // Attempt database persistence if configured
  try {
    const { admin } = require("../supabase");
    if (admin?.from) {
      await admin.from("document_chunks").delete().eq("document_id", documentId);
      const { error } = await admin.from("document_chunks").insert(rows);
      if (!error) {
        // Also keep in memory for fast local queries
        for (let i = inMemoryChunks.length - 1; i >= 0; i--) {
          if (inMemoryChunks[i].document_id === documentId) inMemoryChunks.splice(i, 1);
        }
        inMemoryChunks.push(...rows);
        return rows.length;
      }
    }
  } catch (_) {}

  // Fallback in-memory indexing
  for (let i = inMemoryChunks.length - 1; i >= 0; i--) {
    if (inMemoryChunks[i].document_id === documentId) inMemoryChunks.splice(i, 1);
  }
  inMemoryChunks.push(...rows);
  return rows.length;
}

function getInMemoryChunks() {
  return inMemoryChunks;
}

module.exports = { indexDocument, chunkText, getInMemoryChunks };
