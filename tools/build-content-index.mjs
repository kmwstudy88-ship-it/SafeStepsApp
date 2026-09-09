import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalRoots = {
  lessons: path.join(repoRoot, "lessons"),
  modules: path.join(repoRoot, "modules"),
  topics: path.join(repoRoot, "topics"),
  storybooks: path.join(repoRoot, "storybooks"),
};
const outputPath = path.join(repoRoot, "src", "safesteps", "lessons", "master-index.json");

function readJsonDirectory(directory, mapRecord) {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
      const absolutePath = path.join(directory, entry.name);
      const record = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
      return mapRecord(record, absolutePath);
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function relative(absolutePath) {
  return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}

const manifest = {
  schemaVersion: "2026-09-09",
  generatedAt: new Date().toISOString(),
  repositoryPurpose:
    "SafeSteps is both a runnable Expo prototype and a curriculum/content repository with backend and Supabase support tooling.",
  sourceOfTruth: {
    lessons: "lessons/",
    modules: "modules/",
    topics: "topics/",
    storybooks: "storybooks/",
    compatibilityExports: "src/safesteps/",
    generatedImports: "src/safesteps/imports/",
  },
  counts: {},
  lessons: readJsonDirectory(canonicalRoots.lessons, (record, absolutePath) => ({
    id: record.id || path.basename(absolutePath, ".json"),
    title: record.title || record.topicName || path.basename(absolutePath, ".json"),
    sectionCount: Array.isArray(record.sections) ? record.sections.length : 0,
    sourcePath: relative(absolutePath),
  })),
  modules: readJsonDirectory(canonicalRoots.modules, (record, absolutePath) => ({
    id: record.id || path.basename(absolutePath, ".json"),
    title: record.title || path.basename(absolutePath, ".json"),
    lessonRefCount: Array.isArray(record.lessons) ? record.lessons.length : 0,
    contentBlockCount: Array.isArray(record.content) ? record.content.length : 0,
    sourcePath: relative(absolutePath),
  })),
  topics: readJsonDirectory(canonicalRoots.topics, (record, absolutePath) => ({
    id: record.id || path.basename(absolutePath, ".json"),
    topicName: record.topicName || record.title || path.basename(absolutePath, ".json"),
    moduleCount: Array.isArray(record.modules) ? record.modules.length : 0,
    sourcePath: relative(absolutePath),
  })),
  storybooks: walkFiles(canonicalRoots.storybooks).map((absolutePath) => ({
    id: path.basename(absolutePath),
    sourcePath: relative(absolutePath),
    fileType: path.extname(absolutePath).replace(".", "") || "unknown",
  })),
};

manifest.counts = {
  lessons: manifest.lessons.length,
  modules: manifest.modules.length,
  topics: manifest.topics.length,
  storybookAssets: manifest.storybooks.length,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Wrote content index to ${relative(outputPath)}`);
