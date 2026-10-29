"use strict";

const { embedQuery } = require("./embeddings");
const { getInMemoryChunks } = require("./indexer");

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

async function search(query, caseId = null, topK = 10) {
  const queryVec = await embedQuery(query);

  try {
    const { admin } = require("../supabase");
    if (admin?.rpc) {
      const { data, error } = await admin.rpc("match_document_chunks", {
        query_embedding: queryVec,
        match_case_id: caseId,
        match_count: topK,
      });
      if (!error && Array.isArray(data)) return data;
    }
  } catch (_) {}

  // In-memory vector search fallback
  const chunks = getInMemoryChunks().filter((c) => !caseId || c.case_id === caseId);
  const scored = chunks.map((c) => ({
    id: c.chunk_hash,
    document_id: c.document_id,
    case_id: c.case_id,
    chunk_index: c.chunk_index,
    chunk_text: c.chunk_text,
    similarity: Number(cosineSimilarity(queryVec, c.embedding).toFixed(4)),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

async function similarDocuments(documentId, topK = 5) {
  try {
    const { admin } = require("../supabase");
    if (admin?.rpc) {
      const { data, error } = await admin.rpc("match_similar_documents", {
        target_document_id: documentId,
        match_count: topK,
      });
      if (!error && Array.isArray(data)) return data;
    }
  } catch (_) {}

  // In-memory similarity across document chunks
  const allChunks = getInMemoryChunks();
  const targetChunks = allChunks.filter((c) => c.document_id === documentId);
  if (!targetChunks.length) return [];

  const otherDocs = new Set(allChunks.map((c) => c.document_id).filter((id) => id !== documentId));
  const results = [];

  for (const otherDocId of otherDocs) {
    const candidateChunks = allChunks.filter((c) => c.document_id === otherDocId);
    let maxSim = 0;
    for (const tChunk of targetChunks) {
      for (const cChunk of candidateChunks) {
        const sim = cosineSimilarity(tChunk.embedding, cChunk.embedding);
        if (sim > maxSim) maxSim = sim;
      }
    }
    results.push({
      document_id: otherDocId,
      similarity: Number(maxSim.toFixed(4)),
    });
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

module.exports = { search, similarDocuments, cosineSimilarity };
