import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { sqlFingerprint, sqlTokens } from "./migration-sql-fingerprint.mjs";

const root = new URL("../", import.meta.url);
const recovery = new URL("docs/security/migration-recovery-2026-10-13/", root);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", recovery), "utf8"));
const local = readdirSync(new URL("supabase/migrations/", root)).filter(file => /^\d+_.+\.sql$/.test(file)).map(file => {
  const sql = readFileSync(new URL(`supabase/migrations/${file}`, root), "utf8");
  const expected = manifest.repositoryFiles?.find(row => row.file === file);
  const sha256 = createHash("sha256").update(sql).digest("hex");
  if (expected && expected.sha256 !== sha256) throw new Error(`Repository migration changed since recovery: ${file}`);
  return { version: file.split("_")[0], file, fingerprint: sqlFingerprint(sql), bytes: Buffer.byteLength(sql), executableTokens: sqlTokens(sql).length };
});
const duplicates = local.filter((item, index) => local.findIndex(other => other.version === item.version) !== index);
const projects = {};
for (const [project, data] of Object.entries(manifest.projects)) {
  const versions = new Set(data.history.map(row => row.version));
  const recovered = data.targetOnlyRecovery.map(row => {
    if (!row.file) return row;
    const sql = readFileSync(new URL(row.file, recovery), "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    if (hash !== row.sha256) throw new Error(`Recovery hash mismatch for ${row.file}`);
    const fingerprint = sqlFingerprint(sql);
    return { ...row, lexicalMatches: local.filter(item => item.fingerprint === fingerprint).map(item => item.file) };
  });
  projects[project] = {
    recordedCount: data.history.length,
    missingHistorySql: data.history.filter(row => !row.statement_count).map(row => ({ version: row.version, name: row.name })),
    repositoryOnly: local.filter(row => !versions.has(row.version)).map(({ fingerprint, ...row }) => row),
    targetOnly: recovered,
  };
  console.log(JSON.stringify({ project, recovered: recovered.length, withLexicalMatch: recovered.filter(row => row.lexicalMatches?.length).length, missingHistorySql: projects[project].missingHistorySql.length }));
}
const result = {
  observedDate: manifest.observedDate,
  scope: "Version comparison and conservative lexical matches only. Matching recorded versions or tokens do not establish deployed schema parity, authorization or safe replay ordering.",
  repositoryCount: local.length,
  emptyRepositoryMigrations: local.filter(row => !row.bytes).map(row => row.file),
  commentOnlyRepositoryMigrations: local.filter(row => row.bytes && !row.executableTokens).map(row => row.file),
  duplicateVersions: duplicates,
  projects,
};
writeFileSync(new URL("review.json", recovery), JSON.stringify(result, null, 2) + "\n");
