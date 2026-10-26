const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const repoRoot = path.resolve(__dirname, "..");
const importRoot = path.join(repoRoot, "src", "safesteps", "imports", "curriculum-seeds");
const validKinds = new Set(["program", "course", "module"]);
const forbiddenLearnerDataKeys = new Set([
  "learnerid",
  "learner_id",
  "userid",
  "user_id",
  "caseid",
  "case_id",
  "authuserid",
  "auth_user_id",
  "email",
  "phone",
  "mobile",
  "address",
  "firstname",
  "first_name",
  "lastname",
  "last_name",
  "fullname",
  "full_name",
  "dateofbirth",
  "date_of_birth",
  "dob",
]);

function parseArgs(argv) {
  const args = {
    kind: null,
    source: null,
    version: null,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--kind") args.kind = argv[++index];
    else if (arg === "--source") args.source = argv[++index];
    else if (arg === "--version") args.version = argv[++index];
    else if (arg === "--dry-run") args.dryRun = true;
    else if (!args.kind && validKinds.has(String(arg).toLowerCase())) args.kind = arg;
    else if (!args.source) args.source = arg;
    else if (!args.version) args.version = arg;
  }

  if (!args.source) {
    throw new Error(
      "Usage: node tools/import-curriculum-source.js --kind <program|course|module> --source ./path/to/source.json --version <source version>",
    );
  }

  if (!args.kind) {
    args.kind = inferKindFromPath(args.source);
  }

  args.kind = String(args.kind).toLowerCase();
  if (!validKinds.has(args.kind)) {
    throw new Error(`Invalid --kind "${args.kind}". Use program, course, or module.`);
  }

  return args;
}

function inferKindFromPath(sourcePath) {
  const lowerPath = sourcePath.toLowerCase();
  if (lowerPath.includes("program")) return "program";
  if (lowerPath.includes("module")) return "module";
  return "course";
}

function readJson(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(text);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugify(value, fallback) {
  const slug = String(value || fallback || "curriculum-source")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback || "curriculum-source";
}

function hashRecord(record) {
  return crypto.createHash("sha256").update(JSON.stringify(record)).digest("hex").slice(0, 12);
}

function normalizeVersion(sourceVersion) {
  const value = String(sourceVersion ?? "").trim();
  if (!value) return null;
  return value;
}

function stableLessonId(lesson, sourceSlug, index) {
  return slugify(
    lesson.id || lesson.lessonId || lesson.slug || lesson.title,
    `${sourceSlug}-lesson-${String(index + 1).padStart(3, "0")}`,
  );
}

function isLessonLike(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.title === "string" &&
    (
      value.lessonNumber !== undefined ||
      value.lesson_id !== undefined ||
      value.lessonId !== undefined ||
      value.quiz !== undefined ||
      value.learningOutcomes !== undefined ||
      value.content !== undefined ||
      value.transcript !== undefined ||
      value.teachingTranscript !== undefined ||
      value.evidenceTask !== undefined
    )
  );
}

function collectLessons(value, trail = [], lessons = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLessons(item, [...trail, index], lessons));
    return lessons;
  }

  if (!value || typeof value !== "object") return lessons;

  if (isLessonLike(value)) {
    lessons.push({ lesson: value, sourcePath: trail });
    return lessons;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === "lessons" && Array.isArray(child)) {
      child.forEach((lesson, index) => {
        if (lesson && typeof lesson === "object") {
          lessons.push({ lesson, sourcePath: [...trail, key, index] });
        }
      });
      continue;
    }
    collectLessons(child, [...trail, key], lessons);
  }

  return lessons;
}

function findForbiddenLearnerDataFields(value, trail = [], findings = []) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => findForbiddenLearnerDataFields(child, [...trail, index], findings));
    return findings;
  }

  if (!value || typeof value !== "object") return findings;

  for (const [key, child] of Object.entries(value)) {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (forbiddenLearnerDataKeys.has(normalizedKey)) {
      if (typeof child === "string" ? child.trim().length > 0 : child !== null && child !== undefined) {
        findings.push({
          key,
          path: [...trail, key],
        });
      }
    }

    findForbiddenLearnerDataFields(child, [...trail, key], findings);
  }

  return findings;
}

function normalizeLesson(lesson, context) {
  const lessonId = stableLessonId(lesson, context.sourceSlug, context.index);
  return {
    ...lesson,
    id: lesson.id || lesson.lessonId || lesson.lesson_id || lessonId,
    slug: lesson.slug || lessonId,
    curriculumSource: {
      sourceKind: context.kind,
      sourceId: context.sourceId,
      sourceTitle: context.sourceTitle,
      sourceVersion: context.sourceVersion,
      sourceDigest: context.sourceDigest,
      sourceFile: context.sourceFile,
      sourcePath: context.sourcePath,
      contentHash: hashRecord(lesson),
    },
  };
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourcePath = path.resolve(process.cwd(), args.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }

  const source = readJson(sourcePath);
  const sourceTitle = source.title || source.name || path.basename(sourcePath, path.extname(sourcePath));
  const sourceId = slugify(source.id || source.slug || sourceTitle, path.basename(sourcePath, path.extname(sourcePath)));
  const sourceSlug = slugify(source.slug || sourceId, sourceId);
  const sourceDigest = hashRecord(source);
  const sourceVersion = normalizeVersion(args.version || source.version || source.metadata?.version);
  if (!sourceVersion) {
    throw new Error("Missing source version. Provide --version or include a non-empty `version` value in the source JSON.");
  }

  const forbiddenFields = findForbiddenLearnerDataFields(source);
  if (forbiddenFields.length > 0) {
    const samples = forbiddenFields
      .slice(0, 10)
      .map((item) => `${item.path.join(".")} (key: ${item.key})`)
      .join(", ");
    throw new Error(
      `Source contains learner-data fields that are not allowed in curriculum seeds (${forbiddenFields.length} found): ${samples}`,
    );
  }

  const sourceVersionSlug = slugify(sourceVersion, "unversioned");
  const bucketName = `${args.kind}s`;
  const sourceBucket = path.join(importRoot, "sources", bucketName);
  const copiedSourcePath = path.join(
    sourceBucket,
    `${sourceSlug}--v-${sourceVersionSlug}--${sourceDigest}.json`,
  );
  const lessonBucket = path.join(importRoot, "lessons", "extracted", sourceSlug, `v-${sourceVersionSlug}`);
  const manifestPath = path.join(lessonBucket, "manifest.json");
  const collectedLessons = collectLessons(source);

  const plannedLessons = collectedLessons.map(({ lesson, sourcePath: lessonSourcePath }, index) => {
    const normalized = normalizeLesson(lesson, {
      kind: args.kind,
      sourceId,
      sourceTitle,
      sourceVersion,
      sourceSlug,
      sourceDigest,
      sourceFile: path.relative(repoRoot, copiedSourcePath).replace(/\\/g, "/"),
      sourcePath: lessonSourcePath,
      index,
    });
    const lessonHash = normalized.curriculumSource.contentHash.slice(0, 8);
    return {
      fileName: `${stableLessonId(normalized, sourceSlug, index)}--${lessonHash}.json`,
      lesson: normalized,
    };
  });

  const fileNameCounts = new Map();
  const lessonIdToHashes = new Map();
  for (const planned of plannedLessons) {
    fileNameCounts.set(planned.fileName, (fileNameCounts.get(planned.fileName) ?? 0) + 1);
    const lessonId = planned.lesson.id;
    const hashes = lessonIdToHashes.get(lessonId) ?? new Set();
    hashes.add(planned.lesson.curriculumSource.contentHash);
    lessonIdToHashes.set(lessonId, hashes);
  }
  const duplicateFileNames = [...fileNameCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
  const conflictingLessonVersions = [...lessonIdToHashes.entries()]
    .filter(([, hashes]) => hashes.size > 1)
    .map(([id]) => id);

  if (duplicateFileNames.length > 0) {
    throw new Error(`Import generated duplicate lesson file names: ${duplicateFileNames.join(", ")}`);
  }
  if (conflictingLessonVersions.length > 0) {
    throw new Error(
      `Import generated conflicting lesson versions for the same lesson id: ${conflictingLessonVersions.join(", ")}`,
    );
  }

  if (args.dryRun) {
    console.log(JSON.stringify({
      source: path.relative(repoRoot, sourcePath),
      kind: args.kind,
      sourceVersion,
      sourceDigest,
      destination: path.relative(repoRoot, copiedSourcePath),
      extractedLessonCount: plannedLessons.length,
      lessonFiles: plannedLessons.map((item) =>
        path.posix.join("src/safesteps/imports/curriculum-seeds/lessons/extracted", sourceSlug, `v-${sourceVersionSlug}`, item.fileName),
      ),
    }, null, 2));
    return;
  }

  ensureDir(sourceBucket);
  ensureDir(lessonBucket);
  writeJson(copiedSourcePath, source);

  for (const planned of plannedLessons) {
    const targetPath = path.join(lessonBucket, planned.fileName);
    const existing = readJsonIfExists(targetPath);
    if (existing && JSON.stringify(existing) !== JSON.stringify(planned.lesson)) {
      throw new Error(`Refusing to overwrite non-matching generated lesson file: ${path.relative(repoRoot, targetPath)}`);
    }
    writeJson(targetPath, planned.lesson);
  }

  writeJson(manifestPath, {
    sourceKind: args.kind,
    sourceId,
    sourceTitle,
    sourceVersion,
    sourceDigest,
    copiedSourceFile: path.relative(repoRoot, copiedSourcePath).replace(/\\/g, "/"),
    extractedLessonCount: plannedLessons.length,
    lessonFiles: plannedLessons.map((item) =>
      path.relative(repoRoot, path.join(lessonBucket, item.fileName)).replace(/\\/g, "/"),
    ),
  });

  console.log(`Stored ${args.kind} source at ${path.relative(repoRoot, copiedSourcePath)}`);
  console.log(`Extracted ${plannedLessons.length} lessons into ${path.relative(repoRoot, lessonBucket)}`);
}

main();
