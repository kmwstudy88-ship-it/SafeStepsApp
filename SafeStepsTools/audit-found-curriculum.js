const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const downloadRoot = path.join(
  os.homedir(),
  "Downloads",
  "NEW READY TO UPLOAD Courses &  Content",
);

const externalFiles = [
  {
    label: "Lessons 1 to 47",
    path: path.join(downloadRoot, "LESSONS", "safesteps_lessons_1_to_47.json"),
    kind: "lessonBundle",
  },
  {
    label: "Lessons 252 to 466",
    path: path.join(downloadRoot, "LESSONS", "safesteps_lessons_30_to_40_min_batch_252_to_466.json"),
    kind: "lessonBundle",
  },
  {
    label: "Lessons 468 to 780",
    path: path.join(downloadRoot, "LESSONS", "safesteps_lessons_30_to_40_min_batch_468_to_780.json"),
    kind: "lessonBundle",
  },
  {
    label: "Parent challenges",
    path: path.join(downloadRoot, "safesteps_parent_challenges_pack", "safesteps_parent_challenges.json"),
    kind: "array",
  },
];

const repoFiles = [
  {
    label: "Lessons 1 to 47",
    path: path.join(repoRoot, "lib", "data", "safestepsLessonCurriculum1To47.ts"),
    kind: "tsData",
  },
  {
    label: "Expanded lessons 252 to 780",
    path: path.join(repoRoot, "lib", "data", "safestepsExpandedLessonCurriculum252To780.ts"),
    kind: "tsData",
  },
  {
    label: "Parent challenges",
    path: path.join(repoRoot, "lib", "data", "safestepsParentChallenges.ts"),
    kind: "tsData",
  },
  {
    label: "Reflection worksheets",
    path: path.join(repoRoot, "lib", "data", "safestepsReflectionWorksheets.ts"),
    kind: "tsData",
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getExternalRecords(file) {
  const data = readJson(file.path);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.lessons)) return data.lessons;
  throw new Error(`Unsupported JSON shape in ${file.path}`);
}

function readTsDataSummary(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const ids = [...source.matchAll(/"id":\s*"([^"]+)"/g)].map((match) => match[1]);
  const numericIds = [...source.matchAll(/"id":\s*(\d+)/g)].map((match) => match[1]);
  const titles = [...source.matchAll(/"title":\s*"([^"]+)"/g)].map((match) => match[1]);
  const allIds = [...ids, ...numericIds];

  return {
    ids: allIds,
    titles,
    duplicateIds: findDuplicates(allIds),
    rawLength: source.length,
  };
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates].sort();
}

function summarizeExternal(file) {
  const records = getExternalRecords(file);
  const ids = records.map((record) => record.id).filter(Boolean);
  const titles = records.map((record) => record.title ?? record.displayTitle).filter(Boolean);
  const missingRequiredFields = records
    .map((record, index) => ({
      index,
      id: record.id ?? "(missing id)",
      missing: ["id", "title", "evidenceTask"].filter((field) => !record[field]),
    }))
    .filter((item) => item.missing.length > 0);

  return {
    file,
    records,
    ids,
    titles,
    duplicateIds: findDuplicates(ids),
    missingRequiredFields,
  };
}

function printSection(title) {
  console.log("");
  console.log(title);
  console.log("-".repeat(title.length));
}

function printExternalSummary(summaries) {
  printSection("External Curriculum Files");

  for (const summary of summaries) {
    const relativePath = path.relative(os.homedir(), summary.file.path);
    console.log(`${summary.file.label}: ${summary.records.length} records`);
    console.log(`  ${relativePath}`);
    console.log(`  ids: ${summary.ids.length}, duplicate ids: ${summary.duplicateIds.length}`);
    console.log(`  missing required fields: ${summary.missingRequiredFields.length}`);

    if (summary.missingRequiredFields.length > 0) {
      const sample = summary.missingRequiredFields.slice(0, 5);
      for (const item of sample) {
        console.log(`    ${item.id} missing ${item.missing.join(", ")}`);
      }
      if (summary.missingRequiredFields.length > sample.length) {
        console.log(`    ...${summary.missingRequiredFields.length - sample.length} more`);
      }
    }
  }
}

function printRepoSummary(summaries) {
  printSection("Workspace Data Files");

  for (const summary of summaries) {
    const relativePath = path.relative(repoRoot, summary.file.path);
    console.log(`${summary.file.label}: ${summary.ids.length} ids, ${summary.titles.length} titles`);
    console.log(`  ${relativePath}`);
    console.log(`  duplicate ids: ${summary.duplicateIds.length}`);
  }
}

function printReconciliation(externalSummaries, repoSummaries) {
  printSection("Reconciliation");

  const externalExpandedIds = new Set(
    externalSummaries
      .filter((summary) => summary.file.label === "Lessons 252 to 466" || summary.file.label === "Lessons 468 to 780")
      .flatMap((summary) => summary.ids),
  );
  const repoExpanded = repoSummaries.find((summary) => summary.file.label === "Expanded lessons 252 to 780");
  const repoExpandedIds = new Set(repoExpanded?.ids ?? []);

  const missingExpanded = [...externalExpandedIds].filter((id) => !repoExpandedIds.has(id));
  const extraExpanded = [...repoExpandedIds].filter((id) => !externalExpandedIds.has(id));

  console.log(`Expanded lesson external ids: ${externalExpandedIds.size}`);
  console.log(`Expanded lesson repo ids: ${repoExpandedIds.size}`);
  console.log(`Expanded lesson ids missing from repo: ${missingExpanded.length}`);
  console.log(`Expanded lesson ids in repo but not external source: ${extraExpanded.length}`);

  const externalChallenges = externalSummaries.find((summary) => summary.file.label === "Parent challenges");
  const repoChallenges = repoSummaries.find((summary) => summary.file.label === "Parent challenges");
  const externalChallengeIds = new Set(externalChallenges?.ids ?? []);
  const repoChallengeIds = new Set(repoChallenges?.ids ?? []);

  console.log(`Parent challenge external ids: ${externalChallengeIds.size}`);
  console.log(`Parent challenge repo ids: ${repoChallengeIds.size}`);
  console.log(
    `Parent challenge ids missing from repo: ${
      [...externalChallengeIds].filter((id) => !repoChallengeIds.has(id)).length
    }`,
  );

  const firstBatch = externalSummaries.find((summary) => summary.file.label === "Lessons 1 to 47");
  const repoFirstBatch = repoSummaries.find((summary) => summary.file.label === "Lessons 1 to 47");
  const firstBatchExternalIds = new Set(firstBatch?.ids.map(String) ?? []);
  const firstBatchRepoIds = new Set(repoFirstBatch?.ids.map(String) ?? []);

  console.log(`Lessons 1 to 47 external ids: ${firstBatchExternalIds.size}`);
  console.log(`Lessons 1 to 47 repo ids: ${firstBatchRepoIds.size}`);
  console.log(
    `Lessons 1 to 47 ids missing from repo: ${
      [...firstBatchExternalIds].filter((id) => !firstBatchRepoIds.has(id)).length
    }`,
  );
}

function main() {
  const missingFiles = [...externalFiles, ...repoFiles].filter((file) => !fs.existsSync(file.path));
  if (missingFiles.length > 0) {
    console.error("Missing files:");
    for (const file of missingFiles) console.error(`- ${file.path}`);
    process.exitCode = 1;
    return;
  }

  const externalSummaries = externalFiles.map(summarizeExternal);
  const repoSummaries = repoFiles.map((file) => ({
    file,
    ...readTsDataSummary(file.path),
  }));

  printExternalSummary(externalSummaries);
  printRepoSummary(repoSummaries);
  printReconciliation(externalSummaries, repoSummaries);
}

main();
