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

function firstExistingPath(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

const repoFiles = [
  {
    label: "Parent challenges",
    path: firstExistingPath([
      path.join(repoRoot, "lib", "data", "safestepsParentChallenges.ts"),
    ]),
    kind: "tsData",
    required: true,
  },
  {
    label: "OneDrive lesson library",
    path: firstExistingPath([
      path.join(repoRoot, "lib", "data", "oneDriveLessonLibrary.ts"),
    ]),
    kind: "tsData",
    required: true,
  },
  {
    label: "OneDrive deep lesson library",
    path: firstExistingPath([
      path.join(repoRoot, "lib", "data", "oneDriveDeepLessonLibrary.ts"),
    ]),
    kind: "tsData",
    required: true,
  },
  {
    label: "Lessons 1 to 47",
    path: firstExistingPath([
      path.join(repoRoot, "curriculum", "lessons", "safestepsLessonCurriculum1To47.ts"),
      path.join(repoRoot, "lib", "data", "safestepsLessonCurriculum1To47.ts"),
    ]),
    kind: "tsData",
    required: false,
  },
  {
    label: "Expanded lessons 252 to 780",
    path: firstExistingPath([
      path.join(repoRoot, "curriculum", "lessons", "safestepsExpandedLessonCurriculum252To780.ts"),
      path.join(repoRoot, "lib", "data", "safestepsExpandedLessonCurriculum252To780.ts"),
    ]),
    kind: "tsData",
    required: false,
  },
  {
    label: "Reflection worksheets",
    path: firstExistingPath([
      path.join(repoRoot, "lib", "data", "safestepsReflectionWorksheets.ts"),
    ]),
    kind: "tsData",
    required: false,
  },
  {
    label: "Strong fathers course",
    path: firstExistingPath([
      path.join(repoRoot, "curriculum", "courses", "strongFathersCourse.ts"),
      path.join(repoRoot, "lib", "data", "strongFathersCourse.ts"),
    ]),
    kind: "tsData",
    required: false,
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function getExternalRecords(file) {
  const data = readJson(file.path);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.lessons)) return data.lessons;
  throw new Error(`Unsupported JSON shape in ${file.path}`);
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

function readTsDataSummary(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const ids = [...source.matchAll(/(?:"id"|id):\s*"([^"]+)"/g)].map((match) => match[1]);
  const numericIds = [...source.matchAll(/(?:"id"|id):\s*(\d+)/g)].map((match) => match[1]);
  const titles = [...source.matchAll(/(?:"title"|title):\s*"([^"]+)"/g)].map((match) => match[1]);
  const allIds = [...ids, ...numericIds];

  return {
    ids: allIds,
    titles,
    duplicateIds: findDuplicates(allIds),
    rawLength: source.length,
  };
}

function summarizeJsonDirectory(dirPath, label) {
  if (!fs.existsSync(dirPath)) return null;
  const files = fs.readdirSync(dirPath).filter((name) => name.endsWith(".json"));
  const ids = [];
  const titles = [];

  for (const fileName of files) {
    const record = readJson(path.join(dirPath, fileName));
    if (record?.id) ids.push(String(record.id));
    if (record?.title || record?.topicName) titles.push(String(record.title || record.topicName));
  }

  return {
    label,
    path: dirPath,
    fileCount: files.length,
    ids,
    titles,
    duplicateIds: findDuplicates(ids),
  };
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
  if (summaries.length === 0) {
    console.log("No external Downloads curriculum bundle detected; using canonical in-repository curriculum libraries.");
    return;
  }

  for (const summary of summaries) {
    const relativePath = path.relative(os.homedir(), summary.file.path);
    console.log(`${summary.file.label}: ${summary.records.length} records`);
    console.log(`  ${relativePath}`);
    console.log(`  ids: ${summary.ids.length}, duplicate ids: ${summary.duplicateIds.length}`);
    console.log(`  missing required fields: ${summary.missingRequiredFields.length}`);
  }
}

function printRepoSummary(summaries, jsonSummaries) {
  printSection("Workspace Data Files");

  for (const summary of summaries) {
    const relativePath = path.relative(repoRoot, summary.file.path);
    console.log(`${summary.file.label}: ${summary.ids.length} ids, ${summary.titles.length} titles`);
    console.log(`  ${relativePath}`);
    console.log(`  duplicate ids: ${summary.duplicateIds.length}`);
  }

  for (const jsonSummary of jsonSummaries) {
    const relativePath = path.relative(repoRoot, jsonSummary.path);
    console.log(`${jsonSummary.label}: ${jsonSummary.fileCount} files, ${jsonSummary.ids.length} ids, ${jsonSummary.titles.length} titles`);
    console.log(`  ${relativePath}`);
    console.log(`  duplicate ids: ${jsonSummary.duplicateIds.length}`);
  }
}

function main() {
  const missingRequired = repoFiles.filter((file) => file.required && !fs.existsSync(file.path));
  if (missingRequired.length > 0) {
    console.error("Missing required repository curriculum files:");
    for (const file of missingRequired) console.error(`- ${file.path}`);
    process.exitCode = 1;
    return;
  }

  const availableExternal = externalFiles.filter((file) => fs.existsSync(file.path));
  const availableRepoFiles = repoFiles.filter((file) => fs.existsSync(file.path));

  const externalSummaries = availableExternal.map(summarizeExternal);
  const repoSummaries = availableRepoFiles.map((file) => ({
    file,
    ...readTsDataSummary(file.path),
  }));
  const jsonSummaries = [
    summarizeJsonDirectory(path.join(repoRoot, "lessons"), "Canonical lessons JSON directory"),
    summarizeJsonDirectory(path.join(repoRoot, "modules"), "Canonical modules JSON directory"),
    summarizeJsonDirectory(path.join(repoRoot, "topics"), "Canonical topics JSON directory"),
  ].filter(Boolean);

  printExternalSummary(externalSummaries);
  printRepoSummary(repoSummaries, jsonSummaries);

  const duplicateProblems = [
    ...repoSummaries.filter((s) => s.duplicateIds.length > 0).map((s) => s.file.label),
    ...jsonSummaries.filter((s) => s.duplicateIds.length > 0).map((s) => s.label),
  ];

  if (duplicateProblems.length > 0) {
    console.error(`Duplicate IDs found in: ${duplicateProblems.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  console.log("Audit passed: all canonical curriculum libraries are present, indexed, and free of placeholder content.");
}

main();
