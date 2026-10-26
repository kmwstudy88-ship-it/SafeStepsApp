"use strict";

const { admin } = require("../supabase");
const { embedQuery } = require("./embeddings");

async function search(query, caseId = null, topK = 10) {
  const queryVec = await embedQuery(query);
  const { data, error } = await admin.rpc("match_document_chunks", {
    query_embedding: queryVec,
    match_case_id: caseId,
    match_count: topK,
  });
  if (error) throw error;
  return data;
}

async function similarDocuments(documentId, topK = 5) {
  const { data, error } = await admin.rpc("match_similar_documents", {
    target_document_id: documentId,
    match_count: topK,
  });
  if (error) throw error;
  return data;
}

module.exports = { search, similarDocuments };