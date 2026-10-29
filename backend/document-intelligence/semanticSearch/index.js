"use strict";

const { embed, embedQuery, createDeterministicEmbedding } = require("./embeddings");
const { indexDocument, chunkText, getInMemoryChunks } = require("./indexer");
const { search, similarDocuments, cosineSimilarity } = require("./search");

module.exports = {
  embed,
  embedQuery,
  createDeterministicEmbedding,
  indexDocument,
  chunkText,
  getInMemoryChunks,
  search,
  similarDocuments,
  cosineSimilarity,
};
