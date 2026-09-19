const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.env.SAFESTEPS_REPO_ROOT
  ? path.resolve(process.env.SAFESTEPS_REPO_ROOT)
  : path.resolve(__dirname, "..");
const masterIndexPath = path.join(repoRoot, "src", "safesteps", "lessons", "master-index.json");
const failOnMissingContent = process.env.NODE_ENV === "production" || process.env.SAFESTEPS_STRICT_CONTENT === "1";
const validationIssues = [];

const registryDefinitions = {
  lessons: { relativeDir: "lessons" },
  topics: { relativeDir: "topics" },
  courses: { relativeDir: path.join("src", "safesteps", "courses") },
  programs: { relativeDir: path.join("src", "safesteps", "programs") },
};

const registries = {
  lessons: loadDirectory("lessons", registryDefinitions.lessons),
  topics: loadDirectory("topics", registryDefinitions.topics),
  courses: loadDirectory("courses", registryDefinitions.courses),
  programs: loadDirectory("programs", registryDefinitions.programs),
};
const masterIndex = readMasterIndex();

validateReferences();
validateMasterIndexConsistency(masterIndex);
assertValidationIssues();

function addIssue(code, message, details = {}) {
  validationIssues.push({ code, message, ...details });
}

function normalizePath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function loadDirectory(registryName, definition) {
  const directory = path.join(repoRoot, definition.relativeDir);
  if (!fs.existsSync(directory)) {
    addIssue(
      "CONTENT_DIRECTORY_MISSING",
      `Missing required content directory for "${registryName}": ${normalizePath(directory)}.`,
      { severity: "missing", registryName, directory: normalizePath(directory) },
    );
    return {};
  }

  const jsonFiles = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"));

  if (jsonFiles.length === 0) {
    addIssue(
      "CONTENT_DIRECTORY_EMPTY",
      `Content directory for "${registryName}" has no JSON files: ${normalizePath(directory)}.`,
      { severity: "missing", registryName, directory: normalizePath(directory) },
    );
    return {};
  }

  return jsonFiles.reduce((collection, entry) => {
    const absolutePath = path.join(directory, entry.name);
    const sourcePath = normalizePath(absolutePath);
    let record;

    try {
      record = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
    } catch (error) {
      addIssue(
        "CONTENT_JSON_INVALID",
        `Invalid JSON in ${sourcePath}: ${error instanceof Error ? error.message : "Unknown parse error"}.`,
        { severity: "error", registryName, sourcePath },
      );
      return collection;
    }

    if (!record || typeof record !== "object" || Array.isArray(record)) {
      addIssue(
        "CONTENT_RECORD_INVALID",
        `Expected an object record in ${sourcePath}.`,
        { severity: "error", registryName, sourcePath },
      );
      return collection;
    }

    const stableId = typeof record.id === "string" ? record.id.trim() : "";
    if (!stableId) {
      addIssue(
        "CONTENT_ID_MISSING",
        `Record in ${sourcePath} is missing a stable string "id".`,
        { severity: "error", registryName, sourcePath },
      );
      return collection;
    }

    if (collection[stableId]) {
      addIssue(
        "CONTENT_ID_DUPLICATE",
        `Duplicate "${registryName}" id "${stableId}" found in ${collection[stableId].sourcePath} and ${sourcePath}.`,
        { severity: "error", registryName, sourcePath, duplicateId: stableId },
      );
      return collection;
    }

    collection[stableId] = {
      ...record,
      id: stableId,
      sourcePath,
    };
    return collection;
  }, {});
}

function readMasterIndex() {
  if (!fs.existsSync(masterIndexPath)) {
    addIssue(
      "MASTER_INDEX_MISSING",
      `Missing required content index: ${normalizePath(masterIndexPath)}.`,
      { severity: "missing", sourcePath: normalizePath(masterIndexPath) },
    );
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(masterIndexPath, "utf8"));
  } catch (error) {
    addIssue(
      "MASTER_INDEX_INVALID_JSON",
      `Invalid JSON in ${normalizePath(masterIndexPath)}: ${error instanceof Error ? error.message : "Unknown parse error"}.`,
      { severity: "error", sourcePath: normalizePath(masterIndexPath) },
    );
    return null;
  }
}

function validateArrayReferences({ sourceRegistryName, field, targetRegistryName }) {
  const sourceRegistry = registries[sourceRegistryName];
  const targetRegistry = registries[targetRegistryName];

  for (const record of Object.values(sourceRegistry)) {
    if (!(field in record)) continue;
    if (!Array.isArray(record[field])) {
      addIssue(
        "CONTENT_REFERENCE_FIELD_INVALID",
        `Record "${record.id}" in ${record.sourcePath} must use an array for "${field}".`,
        { severity: "error", sourcePath: record.sourcePath, sourceRegistryName, field },
      );
      continue;
    }

    for (const ref of record[field]) {
      if (typeof ref !== "string" || !ref.trim()) {
        addIssue(
          "CONTENT_REFERENCE_INVALID",
          `Record "${record.id}" in ${record.sourcePath} has a non-string reference in "${field}".`,
          { severity: "error", sourcePath: record.sourcePath, sourceRegistryName, field },
        );
        continue;
      }

      if (!targetRegistry[ref]) {
        addIssue(
          "CONTENT_REFERENCE_MISSING_TARGET",
          `Record "${record.id}" in ${record.sourcePath} references missing ${targetRegistryName} id "${ref}" in "${field}".`,
          { severity: "error", sourcePath: record.sourcePath, sourceRegistryName, targetRegistryName, referenceId: ref },
        );
      }
    }
  }
}

function validateReferences() {
  validateArrayReferences({ sourceRegistryName: "courses", field: "lessons", targetRegistryName: "lessons" });
  validateArrayReferences({ sourceRegistryName: "topics", field: "modules", targetRegistryName: "courses" });
  validateArrayReferences({ sourceRegistryName: "programs", field: "modules", targetRegistryName: "courses" });
}

function validateMasterIndexEntries(registryName, records, manifestEntries, expectedCount) {
  if (!Array.isArray(manifestEntries)) {
    addIssue(
      "MASTER_INDEX_SECTION_INVALID",
      `Master index section "${registryName}" must be an array.`,
      { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath) },
    );
    return;
  }

  if (typeof expectedCount !== "number") {
    addIssue(
      "MASTER_INDEX_COUNT_MISSING",
      `Master index counts.${registryName} must be a number.`,
      { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath) },
    );
  } else if (expectedCount !== Object.keys(records).length) {
    addIssue(
      "MASTER_INDEX_COUNT_MISMATCH",
      `Master index counts.${registryName} is ${expectedCount} but loaded ${Object.keys(records).length} ${registryName}.`,
      { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath) },
    );
  }

  const manifestById = new Map();
  for (const entry of manifestEntries) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      addIssue(
        "MASTER_INDEX_ENTRY_INVALID",
        `Master index ${registryName} contains a non-object entry.`,
        { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath) },
      );
      continue;
    }

    if (typeof entry.id !== "string" || !entry.id.trim()) {
      addIssue(
        "MASTER_INDEX_ENTRY_ID_INVALID",
        `Master index ${registryName} entry is missing a stable string id.`,
        { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath) },
      );
      continue;
    }

    const manifestId = entry.id.trim();
    if (manifestById.has(manifestId)) {
      addIssue(
        "MASTER_INDEX_ENTRY_ID_DUPLICATE",
        `Master index ${registryName} includes duplicate id "${manifestId}".`,
        { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath) },
      );
      continue;
    }

    manifestById.set(manifestId, entry);
  }

  for (const [id, record] of Object.entries(records)) {
    const entry = manifestById.get(id);
    if (!entry) {
      addIssue(
        "MASTER_INDEX_ENTRY_MISSING",
        `Master index ${registryName} is missing id "${id}" from ${record.sourcePath}.`,
        { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath), id },
      );
      continue;
    }

    if (typeof entry.sourcePath !== "string" || !entry.sourcePath) {
      addIssue(
        "MASTER_INDEX_SOURCE_PATH_INVALID",
        `Master index ${registryName} entry "${id}" is missing sourcePath.`,
        { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath), id },
      );
      continue;
    }

    if (entry.sourcePath !== record.sourcePath) {
      addIssue(
        "MASTER_INDEX_SOURCE_PATH_MISMATCH",
        `Master index ${registryName} entry "${id}" has sourcePath "${entry.sourcePath}" but file is "${record.sourcePath}".`,
        { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath), id },
      );
    }
  }

  for (const [id] of manifestById) {
    if (!records[id]) {
      addIssue(
        "MASTER_INDEX_STALE_ENTRY",
        `Master index ${registryName} contains stale id "${id}" not found on disk.`,
        { severity: "error", section: registryName, sourcePath: normalizePath(masterIndexPath), id },
      );
    }
  }
}

function validateMasterIndexConsistency(index) {
  if (!index) return;
  if (!index.counts || typeof index.counts !== "object") {
    addIssue(
      "MASTER_INDEX_COUNTS_INVALID",
      `Master index is missing a valid "counts" object.`,
      { severity: "error", sourcePath: normalizePath(masterIndexPath) },
    );
    return;
  }

  validateMasterIndexEntries("lessons", registries.lessons, index.lessons, index.counts.lessons);
  validateMasterIndexEntries("topics", registries.topics, index.topics, index.counts.topics);
}

function shouldThrowIssues() {
  return validationIssues.some((issue) => issue.severity === "error" || (issue.severity === "missing" && failOnMissingContent));
}

function assertValidationIssues() {
  if (validationIssues.length === 0) return;

  const errorText = validationIssues
    .map((issue, index) => `${index + 1}. [${issue.code}] ${issue.message}`)
    .join("\n");

  if (shouldThrowIssues()) {
    const error = new Error(`Content loading validation failed:\n${errorText}`);
    error.name = "ContentLoadError";
    error.code = "CONTENT_LOAD_ERROR";
    error.issues = validationIssues;
    throw error;
  }

  console.warn(`[loadContent] content validation warnings:\n${errorText}`);
}

function listRegistry(registryName) {
  return Object.values(registries[registryName] || {});
}

function getLesson(id) {
  return registries.lessons[id] || null;
}

function getTopic(id) {
  return registries.topics[id] || null;
}

function getCourse(id) {
  return registries.courses[id] || null;
}

function getProgram(id) {
  return registries.programs[id] || null;
}

function getContentManifest() {
  return masterIndex;
}

module.exports = {
  getLesson,
  getTopic,
  getCourse,
  getProgram,
  getContentManifest,
  listLessons: () => listRegistry("lessons"),
  listTopics: () => listRegistry("topics"),
  listCourses: () => listRegistry("courses"),
  listPrograms: () => listRegistry("programs"),
};
