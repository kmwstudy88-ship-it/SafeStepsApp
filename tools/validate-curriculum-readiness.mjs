import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(repoRoot, "docs", "content-readiness", "evidence.json");
const masterIndexPath = path.join(repoRoot, "src", "safesteps", "lessons", "master-index.json");
const schemaPath = path.join(repoRoot, "schema", "curriculum-schema.json");
const sharedApiClientPath = path.join(repoRoot, "shared", "apiClient.js");
const sharedModelsPath = path.join(repoRoot, "shared", "models.js");

const externalRoot = path.join(os.homedir(), "Downloads", "NEW READY TO UPLOAD Courses &  Content");
const externalSources = [
  {
    label: "Lessons 1 to 47",
    path: path.join(externalRoot, "LESSONS", "safesteps_lessons_1_to_47.json"),
    selector: (payload) => payload?.lessons,
  },
  {
    label: "Lessons 252 to 466",
    path: path.join(externalRoot, "LESSONS", "safesteps_lessons_30_to_40_min_batch_252_to_466.json"),
    selector: (payload) => payload?.lessons ?? payload,
  },
  {
    label: "Lessons 468 to 780",
    path: path.join(externalRoot, "LESSONS", "safesteps_lessons_30_to_40_min_batch_468_to_780.json"),
    selector: (payload) => payload?.lessons ?? payload,
  },
  {
    label: "Parent challenges",
    path: path.join(externalRoot, "safesteps_parent_challenges_pack", "safesteps_parent_challenges.json"),
    selector: (payload) => payload,
  },
];

const assetPathPattern = /(?:^|\s|["'(])([A-Za-z0-9_\-./]+\.(?:png|jpg|jpeg|gif|webp|svg|mp3|wav|mp4|pdf|json|txt))(?:$|\s|["')])/g;

function readJson(absolutePath) {
  return JSON.parse(fs.readFileSync(absolutePath, "utf8").replace(/^\uFEFF/, ""));
}

function listJsonRecords(relativeDirectory) {
  const absoluteDirectory = path.join(repoRoot, relativeDirectory);
  return fs
    .readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
      const absolutePath = path.join(absoluteDirectory, entry.name);
      return {
        absolutePath,
        relativePath: path.relative(repoRoot, absolutePath).replace(/\\/g, "/"),
        basename: path.basename(entry.name, ".json"),
        record: readJson(absolutePath),
      };
    });
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function hashObject(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function flattenStringValues(value, strings = []) {
  if (typeof value === "string") {
    strings.push(value);
    return strings;
  }
  if (Array.isArray(value)) {
    for (const item of value) flattenStringValues(item, strings);
    return strings;
  }
  if (!value || typeof value !== "object") return strings;
  for (const child of Object.values(value)) flattenStringValues(child, strings);
  return strings;
}

function collectAssetRefs(recordsByType) {
  const missing = [];
  const found = [];

  for (const [group, records] of Object.entries(recordsByType)) {
    for (const entry of records) {
      const content = flattenStringValues(entry.record);
      for (const text of content) {
        for (const match of text.matchAll(assetPathPattern)) {
          const candidate = match[1];
          if (!candidate || candidate.startsWith("http://") || candidate.startsWith("https://")) continue;
          if (!candidate.includes("/") && !candidate.startsWith(".")) continue;

          const absoluteCandidate = path.resolve(repoRoot, candidate);
          const relativeCandidate = path.relative(repoRoot, absoluteCandidate).replace(/\\/g, "/");
          if (relativeCandidate.startsWith("..")) continue;

          if (fs.existsSync(absoluteCandidate)) {
            found.push({ group, record: entry.relativePath, asset: relativeCandidate });
          } else {
            missing.push({ group, record: entry.relativePath, asset: relativeCandidate });
          }
        }
      }
    }
  }

  return {
    foundCount: found.length,
    missingCount: missing.length,
    missing: missing.slice(0, 50),
  };
}

function validateLessonContentShape(lesson) {
  if (Array.isArray(lesson.sections) && lesson.sections.length > 0) {
    return lesson.sections.every((section) =>
      isNonEmptyString(section?.id) &&
      isNonEmptyString(section?.title) &&
      isNonEmptyString(section?.content?.title) &&
      isNonEmptyString(section?.content?.overview),
    );
  }

  if (lesson.content && typeof lesson.content === "object" && !Array.isArray(lesson.content)) {
    return isNonEmptyString(lesson.content.overview);
  }

  return false;
}

function validateExternalSources(lessonIds) {
  const results = externalSources.map((external) => {
    if (!fs.existsSync(external.path)) {
      return {
        label: external.label,
        path: external.path,
        available: false,
        error: "missing",
      };
    }

    try {
      const payload = readJson(external.path);
      const records = external.selector(payload);
      if (!Array.isArray(records)) {
        return {
          label: external.label,
          path: external.path,
          available: true,
          error: "unsupported-shape",
        };
      }

      const ids = records
        .map((record) => String(record?.id ?? "").trim())
        .filter(Boolean);
      const duplicateIds = duplicateValues(ids);
      const missingInRepo = ids.filter((id) => !lessonIds.has(id));

      return {
        label: external.label,
        path: external.path,
        available: true,
        recordCount: records.length,
        idsCount: ids.length,
        duplicateIds,
        missingInRepoCount: missingInRepo.length,
        missingInRepoSample: missingInRepo.slice(0, 25),
      };
    } catch (error) {
      return {
        label: external.label,
        path: external.path,
        available: true,
        error: error.message,
      };
    }
  });

  return {
    availableCount: results.filter((item) => item.available).length,
    totalCount: results.length,
    sources: results,
  };
}

function validateImportVersions() {
  const importBase = path.join(repoRoot, "src", "safesteps", "imports", "curriculum-seeds", "lessons", "extracted");
  if (!fs.existsSync(importBase)) {
    return {
      hasImports: false,
      manifests: [],
      conflictingVersionSets: [],
    };
  }

  const manifests = [];
  const conflictingVersionSets = [];
  const sourceToLessonHashes = new Map();

  for (const sourceSlug of fs.readdirSync(importBase)) {
    const sourceDir = path.join(importBase, sourceSlug);
    if (!fs.statSync(sourceDir).isDirectory()) continue;

    for (const versionDirName of fs.readdirSync(sourceDir)) {
      const versionDir = path.join(sourceDir, versionDirName);
      if (!fs.statSync(versionDir).isDirectory()) continue;

      const manifestPath = path.join(versionDir, "manifest.json");
      if (!fs.existsSync(manifestPath)) continue;

      const manifest = readJson(manifestPath);
      manifests.push({
        sourceSlug,
        versionDir: versionDirName,
        manifestPath: path.relative(repoRoot, manifestPath).replace(/\\/g, "/"),
        sourceId: manifest.sourceId,
        sourceVersion: manifest.sourceVersion,
        extractedLessonCount: manifest.extractedLessonCount,
      });

      for (const lessonRelativePath of manifest.lessonFiles ?? []) {
        const lessonPath = path.join(repoRoot, lessonRelativePath);
        if (!fs.existsSync(lessonPath)) continue;
        const lesson = readJson(lessonPath);
        const lessonId = String(lesson.id ?? "").trim();
        if (!lessonId) continue;
        const hash = lesson.curriculumSource?.contentHash ?? hashObject(lesson);
        const key = `${manifest.sourceId}::${lessonId}`;
        const values = sourceToLessonHashes.get(key) ?? new Set();
        values.add(`${manifest.sourceVersion}::${hash}`);
        sourceToLessonHashes.set(key, values);
      }
    }
  }

  for (const [key, values] of sourceToLessonHashes.entries()) {
    const versions = [...new Set([...values].map((value) => value.split("::")[0]))];
    const hashes = [...new Set([...values].map((value) => value.split("::")[1]))];
    if (versions.length > 1 && hashes.length > 1) {
      conflictingVersionSets.push({
        key,
        versions,
      });
    }
  }

  return {
    hasImports: true,
    manifests,
    conflictingVersionSets,
  };
}

function main() {
  const lessons = listJsonRecords("lessons");
  const modules = listJsonRecords("modules");
  const topics = listJsonRecords("topics");

  const lessonIds = lessons.map((entry) => String(entry.record.id ?? entry.basename));
  const moduleIds = modules.map((entry) => String(entry.record.id ?? entry.basename));
  const topicIds = topics.map((entry) => String(entry.record.id ?? entry.basename));

  const duplicateLessonIds = duplicateValues(lessonIds);
  const duplicateModuleIds = duplicateValues(moduleIds);
  const duplicateTopicIds = duplicateValues(topicIds);

  const lessonContentHashEntries = lessons.map((entry) => ({
    id: String(entry.record.id ?? entry.basename),
    hash: hashObject(entry.record),
    path: entry.relativePath,
  }));
  const lessonHashDuplicates = duplicateValues(lessonContentHashEntries.map((entry) => entry.hash));

  const moduleIdSet = new Set(moduleIds);
  const lessonIdSet = new Set(lessonIds);

  const unresolvedTopicModules = [];
  const topicEmptyModules = [];
  const topicRequiredFieldFailures = [];
  const secureAttachment = topics.find((entry) => entry.basename === "secure_attachment");

  for (const topic of topics) {
    if (!isNonEmptyString(topic.record.id) || !isNonEmptyString(topic.record.topicId) || !isNonEmptyString(topic.record.topicName)) {
      topicRequiredFieldFailures.push(topic.relativePath);
    }

    const modulesList = Array.isArray(topic.record.modules) ? topic.record.modules : null;
    if (!modulesList) {
      topicRequiredFieldFailures.push(topic.relativePath);
      continue;
    }

    if (modulesList.length === 0) {
      topicEmptyModules.push(topic.relativePath);
    }

    for (const moduleRef of modulesList) {
      if (!moduleIdSet.has(String(moduleRef))) {
        unresolvedTopicModules.push({
          topic: topic.relativePath,
          moduleRef,
        });
      }
    }
  }

  const unresolvedModuleLessons = [];
  const moduleEmptyLessons = [];
  const moduleRequiredFieldFailures = [];
  const moduleOutOfOrderLessons = [];

  for (const moduleEntry of modules) {
    const moduleRecord = moduleEntry.record;
    if (
      !isNonEmptyString(moduleRecord.id) ||
      !isNonEmptyString(moduleRecord.title) ||
      moduleRecord.type !== "module" ||
      !isNonEmptyString(moduleRecord.description)
    ) {
      moduleRequiredFieldFailures.push(moduleEntry.relativePath);
    }

    if (!Array.isArray(moduleRecord.lessons)) {
      moduleRequiredFieldFailures.push(moduleEntry.relativePath);
      continue;
    }

    if (moduleRecord.lessons.length === 0) {
      moduleEmptyLessons.push(moduleEntry.relativePath);
      continue;
    }

    const seenNumbers = [];
    for (const lessonRef of moduleRecord.lessons) {
      const lessonId = typeof lessonRef === "string" ? lessonRef : lessonRef?.id;
      if (lessonId && !lessonIdSet.has(String(lessonId))) {
        unresolvedModuleLessons.push({
          module: moduleEntry.relativePath,
          lessonRef: lessonId,
        });
      }
      if (typeof lessonRef?.lessonNumber === "number") {
        seenNumbers.push(lessonRef.lessonNumber);
      }
    }

    if (seenNumbers.length > 1) {
      const sorted = [...seenNumbers].sort((a, b) => a - b);
      const inOrder = seenNumbers.every((value, index) => value === sorted[index]);
      if (!inOrder) {
        moduleOutOfOrderLessons.push({
          module: moduleEntry.relativePath,
          lessonNumbers: seenNumbers,
        });
      }
    }
  }

  const lessonRequiredFieldFailures = lessons
    .filter((lesson) => {
      const record = lesson.record;
      if (!isNonEmptyString(record.id) || !isNonEmptyString(record.title)) return true;
      return !validateLessonContentShape(record);
    })
    .map((lesson) => lesson.relativePath);

  const lessonIdFileNameMismatches = lessons
    .filter((lesson) => String(lesson.record.id ?? "") !== lesson.basename)
    .map((lesson) => ({
      path: lesson.relativePath,
      id: lesson.record.id,
      fileBase: lesson.basename,
    }));

  const assets = collectAssetRefs({ lessons, modules, topics });

  const masterIndex = fs.existsSync(masterIndexPath) ? readJson(masterIndexPath) : null;
  const masterIndexIssues = [];
  if (!masterIndex) {
    masterIndexIssues.push("missing-master-index");
  } else {
    if (masterIndex.counts?.lessons !== lessons.length) masterIndexIssues.push("lessons-count-mismatch");
    if (masterIndex.counts?.modules !== modules.length) masterIndexIssues.push("modules-count-mismatch");
    if (masterIndex.counts?.topics !== topics.length) masterIndexIssues.push("topics-count-mismatch");

    const sourcePaths = [
      ...(masterIndex.lessons ?? []).map((entry) => entry.sourcePath),
      ...(masterIndex.modules ?? []).map((entry) => entry.sourcePath),
      ...(masterIndex.topics ?? []).map((entry) => entry.sourcePath),
      ...(masterIndex.storybooks ?? []).map((entry) => entry.sourcePath),
    ].filter(Boolean);

    for (const sourcePath of sourcePaths) {
      const absolute = path.join(repoRoot, sourcePath);
      if (!fs.existsSync(absolute)) {
        masterIndexIssues.push(`missing-index-source:${sourcePath}`);
      }
    }
  }

  const schema = fs.existsSync(schemaPath) ? readJson(schemaPath) : null;
  const schemaIssues = [];
  if (!schema) {
    schemaIssues.push("missing-curriculum-schema");
  } else {
    if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
      schemaIssues.push("invalid-schema-draft");
    }
    if (!schema.$defs?.lesson || !schema.$defs?.module || !schema.$defs?.topic || !schema.$defs?.masterIndex) {
      schemaIssues.push("missing-schema-definitions");
    }
  }

  const sharedFiles = {
    apiClientBytes: fs.existsSync(sharedApiClientPath) ? fs.statSync(sharedApiClientPath).size : 0,
    modelsBytes: fs.existsSync(sharedModelsPath) ? fs.statSync(sharedModelsPath).size : 0,
  };

  const importVersions = validateImportVersions();
  const external = validateExternalSources(lessonIdSet);

  const blockingIssues = [];
  if (duplicateLessonIds.length > 0) blockingIssues.push("duplicate-lesson-ids");
  if (duplicateModuleIds.length > 0) blockingIssues.push("duplicate-module-ids");
  if (duplicateTopicIds.length > 0) blockingIssues.push("duplicate-topic-ids");
  if (lessonHashDuplicates.length > 0) blockingIssues.push("duplicate-lessons-by-content");
  if (lessonRequiredFieldFailures.length > 0) blockingIssues.push("lesson-required-fields-incomplete");
  if (moduleRequiredFieldFailures.length > 0) blockingIssues.push("module-required-fields-incomplete");
  if (topicRequiredFieldFailures.length > 0) blockingIssues.push("topic-required-fields-incomplete");
  if (topicEmptyModules.length > 0) blockingIssues.push("topics-missing-module-links");
  if (unresolvedTopicModules.length > 0) blockingIssues.push("unresolved-topic-module-links");
  if (unresolvedModuleLessons.length > 0) blockingIssues.push("unresolved-module-lesson-links");
  if (assets.missingCount > 0) blockingIssues.push("missing-referenced-assets");
  if (masterIndexIssues.length > 0) blockingIssues.push("master-index-mismatch");
  if (schemaIssues.length > 0) blockingIssues.push("invalid-curriculum-schema");
  if (importVersions.conflictingVersionSets.length > 0) blockingIssues.push("conflicting-import-versions");
  if (external.availableCount < external.totalCount) blockingIssues.push("external-source-files-unavailable");

  const report = {
    generatedAt: new Date().toISOString(),
    status: blockingIssues.length === 0 ? "ready" : "incomplete",
    summary: {
      blockingIssueCount: blockingIssues.length,
      blockingIssues,
      counts: {
        lessons: lessons.length,
        modules: modules.length,
        topics: topics.length,
      },
    },
    validations: {
      ids: {
        duplicateLessonIds,
        duplicateModuleIds,
        duplicateTopicIds,
        lessonIdFileNameMismatches,
      },
      duplicateLessons: {
        duplicateHashes: lessonHashDuplicates,
        duplicateHashSample: lessonHashDuplicates
          .slice(0, 20)
          .map((hash) => lessonContentHashEntries.filter((entry) => entry.hash === hash).map((entry) => entry.path)),
      },
      lessonOrdering: {
        modulesWithOutOfOrderLessonNumbers: moduleOutOfOrderLessons,
        modulesWithNoLessonLinks: moduleEmptyLessons.length,
      },
      requiredTextFields: {
        lessonsMissingRequiredFields: lessonRequiredFieldFailures,
        modulesMissingRequiredFields: moduleRequiredFieldFailures,
        topicsMissingRequiredFields: topicRequiredFieldFailures,
      },
      topicModuleLinks: {
        unresolvedTopicModules,
        topicsWithEmptyModules: topicEmptyModules.length,
      },
      moduleLessonLinks: {
        unresolvedModuleLessons,
      },
      assets,
      masterIndex: {
        path: path.relative(repoRoot, masterIndexPath).replace(/\\/g, "/"),
        issues: masterIndexIssues,
      },
      schema: {
        path: path.relative(repoRoot, schemaPath).replace(/\\/g, "/"),
        issues: schemaIssues,
      },
      secureAttachment: secureAttachment
        ? {
            path: secureAttachment.relativePath,
            moduleCount: Array.isArray(secureAttachment.record.modules) ? secureAttachment.record.modules.length : null,
            modules: secureAttachment.record.modules,
          }
        : null,
      sharedFiles,
      externalSources: external,
      importVersions,
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (report.status === "ready") {
    console.log(`Content readiness evidence written to ${path.relative(repoRoot, outputPath)} (ready)`);
    return;
  }

  console.error(`Content readiness evidence written to ${path.relative(repoRoot, outputPath)} (incomplete)`);
  process.exitCode = 1;
}

main();
