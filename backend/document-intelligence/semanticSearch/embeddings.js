"use strict";

const crypto = require("crypto");

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = process.env.DOCINTEL_EMBED_MODEL || "voyage-3";
const EMBEDDING_DIM = 128;

function createDeterministicEmbedding(text) {
  const vec = new Float64Array(EMBEDDING_DIM);
  const words = String(text || '').toLowerCase().match(/\w+/g) || ['empty'];

  for (const word of words) {
    const hash = crypto.createHash('sha256').update(word).digest();
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      const byte = hash[i % hash.length];
      vec[i] += (byte - 128) / 128;
    }
  }

  // Normalize to unit vector
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  const result = [];
  for (let i = 0; i < EMBEDDING_DIM; i++) result.push(Number((vec[i] / norm).toFixed(6)));
  return result;
}

async function embed(texts, inputType = "document") {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    // Offline deterministic embedding for local development and offline test environments
    return texts.map(createDeterministicEmbedding);
  }

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ input: texts, model: MODEL, input_type: inputType }),
  });
  if (!res.ok) throw new Error(`Voyage embedding failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data.map((d) => d.embedding);
}

async function embedQuery(query) {
  const [vec] = await embed([query], "query");
  return vec;
}

module.exports = { embed, embedQuery, createDeterministicEmbedding };
