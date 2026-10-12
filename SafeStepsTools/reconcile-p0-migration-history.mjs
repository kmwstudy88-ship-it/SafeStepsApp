import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const evidence = JSON.parse(readFileSync(new URL("docs/security/p0-deployment-evidence-2026-10-13.json", root), "utf8"));
const files = readdirSync(new URL("supabase/migrations/", root)).filter(name => /^\d+_.+\.sql$/.test(name));
const local = files.map(file => ({ version: file.split("_")[0], file }));
const versions = new Set(local.map(item => item.version));
const projects = Object.fromEntries(Object.entries(evidence.projects).map(([id, project]) => {
  const deployed = new Set(project.history.map(item => item.version));
  return [id, {
    latestRecordedVersion: project.history.at(-1)?.version,
    deployedCount: project.history.length,
    repositoryCount: local.length,
    repositoryOnly: local.filter(item => !deployed.has(item.version)),
    targetOnly: project.history.filter(item => !versions.has(item.version)),
  }];
}));
const result = {observedDate:evidence.observedDate, baseCommit:evidence.baseCommit,
  scope:"Version comparison only; matching versions do not prove SQL or schema parity.", projects};
writeFileSync(new URL("docs/security/p0-migration-reconciliation-2026-10-13.json", root), JSON.stringify(result,null,2)+"\n");
for (const [id, item] of Object.entries(projects)) {
  console.log(JSON.stringify({project:id,latest:item.latestRecordedVersion,repositoryOnly:item.repositoryOnly.length,targetOnly:item.targetOnly.length}));
}
