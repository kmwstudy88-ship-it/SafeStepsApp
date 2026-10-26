"use strict";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = process.env.DOCINTEL_EMBED_MODEL || "voyage-3";

async function embed(texts, inputType = "document") {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY is not configured");
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

module.exports = { embed, embedQuery };