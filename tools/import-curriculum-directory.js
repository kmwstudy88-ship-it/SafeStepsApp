const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const defaultImportRoot = path.resolve(
  __dirname,
  "..",
  "src",
  "safesteps",
  "imports",
  "curriculum-seeds",
  "directory-import",
);

const forbiddenLearnerDataKeys = new Set([
  "learnerid",
  "userid",
  "authuserid",
  "caseid",
  "email",
  "phone",
  "mobile",
  "address",
  "firstname",
  "lastname",
  "fullname",
  "dateofbirth",
  "dob",
]);

function parseArgs(argv) {
  const args = { sources: [], output: defaultImportRoot, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") args.sources.push(argv[++index]);
    else if (arg === "--output") args.output = path.resolve(process.cwd(), argv[++index]);
    else if (arg === "--dry-run") args.dryRun = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.sources.length === 0) {
    throw new Error(
      "Usage: node tools/import-curriculum-directory.js --source <directory> [--source <directory>] [--output <directory>] [--dry-run]",
    );
  }
  args.sources = args.sources.map((source) => path.resolve(process.cwd(), source));
  return args;
}

function slugify(value, fallback = "curriculum") {
  const slug = String(value || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {});
}

function digest(value) {
  return crypto
    .createHash("sha256")
    .update(typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function toPortablePath(value) {
  return value.replace(/\\/g, "/");
}

function walk(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
    });
}

function isJsonCandidate(filePath) {
  const extension = path.extname(filePath);
  return (
    (/^\.json$/i.test(extension) || /^\.txt$/i.test(extension) || extension === "") &&
    path.basename(filePath).toLowerCase() !== "desktop.ini"
  );
}

function findForbiddenFields(value, trail = [], findings = []) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => findForbiddenFields(child, [...trail, index], findings));
    return findings;
  }
  if (!value || typeof value !== "object") return findings;

  for (const [key, child] of Object.entries(value)) {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (
      forbiddenLearnerDataKeys.has(normalizedKey) &&
      (typeof child === "string" ? child.trim() : child !== null && child !== undefined)
    ) {
      findings.push([...trail, key].join("."));
    }
    findForbiddenFields(child, [...trail, key], findings);
  }
  return findings;
}

function splitConcatenatedObjects(text) {
  const values = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === "{") {
      if (depth === 0) start = index;
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        values.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return depth === 0 ? values : [];
}

function parseJsonWithRepairs(text, sourcePath) {
  try {
    return { payload: JSON.parse(text), repair: null };
  } catch (originalError) {
    const withoutTrailingBackticks = text.replace(/`+\s*$/, "").trim();
    if (withoutTrailingBackticks !== text) {
      try {
        return {
          payload: JSON.parse(withoutTrailingBackticks),
          repair: "removed-trailing-backticks",
        };
      } catch {}
    }

    if (/^"[^"]+"\s*:/.test(text)) {
      try {
        return {
          payload: JSON.parse(`{${text}}`),
          repair: "wrapped-top-level-property",
        };
      } catch {}
    }

    const concatenated = splitConcatenatedObjects(text);
    if (concatenated.length > 1) {
      try {
        return {
          payload: Object.assign({}, ...concatenated.map((value) => JSON.parse(value))),
          repair: "merged-concatenated-objects",
        };
      } catch {}
    }

    if (
      /co_regulation_basics\.json$/i.test(sourcePath) ||
      /"lessonId"\s*:\s*"co_regulation_basics"/i.test(text)
    ) {
      const completed = `${text.replace(/,\s*$/, "")}\n      ]\n    }\n  ]\n}`;
      try {
        return {
          payload: JSON.parse(completed),
          repair: "closed-truncated-co-regulation-structure",
        };
      } catch {}
    }

    throw originalError;
  }
}

function humanize(value) {
  return String(value || "")
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function sourceTitle(payload, filePath) {
  return (
    payload.title ||
    payload.courseTitle ||
    payload.lessonTitle ||
    payload.name ||
    payload.metadata?.title ||
    humanize(path.basename(filePath))
  );
}

function isFacilitatorSource(relativePath, payload) {
  const lowerName = path.basename(relativePath).toLowerCase();
  return (
    /facilitator|ai teacher|system prompt/.test(lowerName) ||
    payload.role === "ai_facilitator" ||
    (payload.systemPrompt !== undefined &&
      payload.lessonId === undefined &&
      payload.courseId === undefined)
  );
}

function classifySource(relativePath, payload) {
  const lowerPath = relativePath.toLowerCase();
  if (/content-schema|schema\.json$/.test(lowerPath)) return "schema";
  if (lowerPath.includes("/engines/")) return "engine";
  if (isFacilitatorSource(relativePath, payload)) return "facilitator";
  if (/evidence system|assessment|marking|safeguard|portfolio|rubric/.test(lowerPath)) {
    return "learning-package";
  }
  if (
    payload.lessonId !== undefined ||
    payload.lesson_id !== undefined ||
    payload.learningGoal !== undefined ||
    payload.microLesson !== undefined ||
    payload.openingReflection !== undefined ||
    payload.guidedActivities !== undefined ||
    payload.teachingTranscript !== undefined ||
    payload.evidenceTask !== undefined
  ) {
    return "lesson";
  }
  if (Array.isArray(payload.lessons) || Array.isArray(payload.modules) || Array.isArray(payload.sections)) {
    return lowerPath.includes("/lessons/lessons/") ? "lesson" : "course";
  }
  if (payload.courseId !== undefined || payload.course_id !== undefined) return "lesson";
  if (/\/lessons( with ai facilitator|\/lesson & ai facilitator script|\/lessons)\//.test(lowerPath)) {
    return "lesson";
  }
  return "learning-package";
}

function inferCourseId(relativePath, payload, role) {
  const normalizedPath = toPortablePath(relativePath);
  const segments = normalizedPath.split("/");
  const aiCourseIndex = segments.findIndex((segment) => segment.toLowerCase() === "courses with ai facilitator");
  if (aiCourseIndex >= 0 && segments[aiCourseIndex + 1]) {
    return slugify(segments[aiCourseIndex + 1]);
  }

  if (
    /\/understanding harm\//i.test(normalizedPath) ||
    /understanding-harm-basic\.(json|txt)$/i.test(normalizedPath)
  ) {
    return "understanding-harm-basic-imported";
  }

  const explicitId =
    payload.courseId ||
    payload.course_id ||
    payload.metadata?.courseId ||
    (role === "course" ? payload.id : null);
  if (explicitId) return slugify(explicitId);

  if (/mastery courses/i.test(normalizedPath)) return slugify(payload.id || sourceTitle(payload, relativePath));
  return null;
}

function lessonId(payload, title, hash) {
  return slugify(payload.lessonId || payload.lesson_id || payload.id || title, `lesson-${hash.slice(0, 12)}`);
}

function choosePrimaryPath(paths) {
  return [...paths].sort((left, right) => {
    const score = (value) => {
      let total = 0;
      if (/^lessons\/lessons with ai facilitator\//i.test(value)) total += 20;
      if (/^courses\//i.test(value)) total += 10;
      if (/\.json$/i.test(value)) total += 5;
      if (/facilitator/i.test(value)) total -= 2;
      return total;
    };
    return score(right) - score(left) || left.localeCompare(right);
  })[0];
}

function pairKey(relativePath) {
  return slugify(path.dirname(relativePath));
}

function summarizeContent(payload) {
  const summary =
    payload.description ||
    payload.summary ||
    payload.learningGoal ||
    payload.learningObjective ||
    payload.metadata?.description ||
    "";
  return typeof summary === "string" ? summary.trim() : "";
}

function embeddedLessons(payload) {
  const candidates = [
    ...(Array.isArray(payload.lessons) ? payload.lessons : []),
    ...(Array.isArray(payload.modules) ? payload.modules : []),
    ...(Array.isArray(payload.sections) ? payload.sections : []),
  ];
  return candidates.filter((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
}

function durationMinutes(payload) {
  const candidate =
    payload.durationMinutes ||
    payload.duration_minutes ||
    payload.metadata?.durationMinutes ||
    payload.metadata?.estimatedDurationMinutes;
  const numeric = Number(candidate);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function buildCatalog(records, report) {
  const facilitatorsByPair = new Map();
  records
    .filter((record) => record.role === "facilitator")
    .forEach((record) => {
      const keys = new Set(record.sourcePaths.map(pairKey));
      keys.forEach((key) => {
        const collection = facilitatorsByPair.get(key) || [];
        collection.push(record);
        facilitatorsByPair.set(key, collection);
      });
    });

  const courses = new Map();
  const ensureCourse = (id, title) => {
    if (!courses.has(id)) {
      courses.set(id, {
        id,
        title: humanize(title || id),
        level: /master/i.test(`${id} ${title}`) ? "mastery" : "foundations",
        reviewStatus: "Imported draft — not validated or approved",
        description: "",
        lessons: [],
        sourcePaths: [],
      });
    }
    return courses.get(id);
  };

  const standaloneLessons = [];
  const courseRecords = records.filter((record) => record.role === "course");
  for (const record of courseRecords) {
    const courseId = record.courseId || slugify(record.title, `course-${record.contentHash.slice(0, 12)}`);
    const course = ensureCourse(courseId, record.title);
    course.description ||= record.summary;
    course.sourcePaths.push(...record.sourcePaths);
    course.sourceDocument = record.payload;
    embeddedLessons(record.payload).forEach((lesson, index) => {
      const contentHash = digest(lesson);
      const title =
        lesson.title ||
        lesson.lessonTitle ||
        lesson.name ||
        `Lesson ${String(index + 1).padStart(2, "0")}`;
      course.lessons.push({
        id: lessonId(lesson, title, contentHash),
        title,
        summary: summarizeContent(lesson),
        durationMinutes: durationMinutes(lesson),
        reviewStatus: "Imported draft — not validated or approved",
        content: lesson,
        facilitatorProfiles: [],
        sourcePaths: record.sourcePaths,
        contentHash,
      });
    });
  }

  for (const record of records.filter((item) => item.role === "lesson")) {
    const attachedFacilitators = new Map();
    record.sourcePaths.forEach((sourcePath) => {
      (facilitatorsByPair.get(pairKey(sourcePath)) || []).forEach((facilitator) => {
        attachedFacilitators.set(facilitator.contentHash, facilitator);
      });
    });

    const normalizedLesson = {
      id: lessonId(record.payload, record.title, record.contentHash),
      title: record.title,
      summary: record.summary,
      durationMinutes: record.durationMinutes,
      reviewStatus: "Imported draft — not validated or approved",
      content: record.payload,
      facilitatorProfiles: [...attachedFacilitators.values()].map((facilitator) => ({
        id: `facilitator-${facilitator.contentHash.slice(0, 12)}`,
        title: facilitator.title,
        sourcePaths: facilitator.sourcePaths,
        content: facilitator.payload,
      })),
      sourcePaths: record.sourcePaths,
      contentHash: record.contentHash,
    };

    if (record.courseId) {
      ensureCourse(record.courseId, record.courseTitle || record.courseId).lessons.push(normalizedLesson);
    } else {
      standaloneLessons.push(normalizedLesson);
    }
  }

  const normalizedCourses = [...courses.values()]
    .map((course) => ({
      ...course,
      sourcePaths: [...new Set(course.sourcePaths)].sort(),
      lessons: course.lessons.sort((left, right) => left.title.localeCompare(right.title)),
    }))
    .sort((left, right) => left.title.localeCompare(right.title));

  return {
    schemaVersion: 1,
    title: "SafeSteps Imported Curriculum Library",
    reviewStatus: "Imported draft — not validated or approved",
    notice:
      "Imported material is for review and learning support. Completion or automated scoring is not proof of behaviour change, parenting fitness, legal compliance, or safety.",
    generatedFrom: report.sourceRoots,
    counts: {
      courses: normalizedCourses.length,
      courseLessons: normalizedCourses.reduce((total, course) => total + course.lessons.length, 0),
      standaloneLessons: standaloneLessons.length,
      learningPackages: records.filter((record) =>
        ["learning-package", "engine", "schema"].includes(record.role),
      ).length,
    },
    courses: normalizedCourses,
    standaloneLessons: standaloneLessons.sort((left, right) => left.title.localeCompare(right.title)),
    learningPackages: records
      .filter((record) => ["learning-package", "engine", "schema"].includes(record.role))
      .map((record) => ({
        id: `${record.role}-${record.contentHash.slice(0, 12)}`,
        type: record.role,
        title: record.title,
        sourcePaths: record.sourcePaths,
        contentHash: record.contentHash,
        content: record.payload,
      }))
      .sort((left, right) => left.title.localeCompare(right.title)),
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function importDirectories({ sources, output, dryRun = false }) {
  sources.forEach((source) => {
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
      throw new Error(`Source directory does not exist: ${source}`);
    }
  });

  const labels = new Map();
  sources.forEach((source) => {
    const base = slugify(path.basename(source));
    let label = base;
    let suffix = 2;
    while ([...labels.values()].includes(label)) label = `${base}-${suffix++}`;
    labels.set(source, label);
  });

  const parsedSources = [];
  const malformed = [];
  const repaired = [];
  const rejected = [];
  const ignored = [];

  for (const sourceRoot of sources) {
    const label = labels.get(sourceRoot);
    for (const filePath of walk(sourceRoot)) {
      const relativeWithinRoot = toPortablePath(path.relative(sourceRoot, filePath));
      const sourcePath = `${label}/${relativeWithinRoot}`;
      if (!isJsonCandidate(filePath)) {
        ignored.push({ sourcePath, reason: "Unsupported file type" });
        continue;
      }

      const raw = fs.readFileSync(filePath);
      const text = raw.toString("utf8").replace(/^\uFEFF/, "").trim();
      if (!text) {
        ignored.push({ sourcePath, reason: text ? "Text is not JSON" : "Empty file" });
        continue;
      }
      const looksLikeRepairableProperty = /^"[^"]+"\s*:/.test(text);
      if (!text.startsWith("{") && !text.startsWith("[") && !looksLikeRepairableProperty) {
        if (/\.json$/i.test(filePath)) {
          malformed.push({ sourcePath, error: "JSON file does not begin with an object or array" });
        } else {
          ignored.push({ sourcePath, reason: "Text is not JSON" });
        }
        continue;
      }

      let payload;
      try {
        const parsed = parseJsonWithRepairs(text, sourcePath);
        payload = parsed.payload;
        if (parsed.repair) repaired.push({ sourcePath, repair: parsed.repair });
      } catch (error) {
        malformed.push({
          sourcePath,
          error: error instanceof Error ? error.message : "Unknown JSON parse error",
        });
        continue;
      }
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        rejected.push({ sourcePath, reason: "Top-level curriculum source must be an object" });
        continue;
      }

      const forbiddenFields = findForbiddenFields(payload);
      if (forbiddenFields.length > 0) {
        rejected.push({
          sourcePath,
          reason: `Learner-scoped fields are not allowed: ${forbiddenFields.slice(0, 5).join(", ")}`,
        });
        continue;
      }

      parsedSources.push({
        sourceRoot,
        sourcePath,
        relativeWithinRoot,
        raw,
        payload,
        rawHash: digest(raw),
        contentHash: digest(payload),
        snapshotRelativePath: toPortablePath(
          path.join(
            "sources",
            label,
            `${digest(raw).slice(0, 16)}--${(slugify(path.basename(filePath, path.extname(filePath))) || "source").slice(0, 32)}${path.extname(filePath) || ".source"}`,
          ),
        ),
      });
    }
  }

  const groups = new Map();
  for (const source of parsedSources) {
    const group = groups.get(source.contentHash) || [];
    group.push(source);
    groups.set(source.contentHash, group);
  }

  const records = [...groups.entries()]
    .map(([contentHash, sourcesForContent]) => {
      const sourcePaths = sourcesForContent.map((source) => source.sourcePath).sort();
      const primaryPath = choosePrimaryPath(sourcePaths);
      const primary = sourcesForContent.find((source) => source.sourcePath === primaryPath);
      const role = classifySource(primaryPath, primary.payload);
      const inferredCourseId = inferCourseId(primaryPath, primary.payload, role);
      const courseSegment = primaryPath.split("/").find((segment, index, all) => {
        return index > 0 && all[index - 1].toLowerCase() === "courses with ai facilitator";
      });
      return {
        role,
        title: sourceTitle(primary.payload, primaryPath),
        summary: summarizeContent(primary.payload),
        durationMinutes: durationMinutes(primary.payload),
        courseId: inferredCourseId,
        courseTitle: courseSegment || (role === "course" ? sourceTitle(primary.payload, primaryPath) : null),
        contentHash,
        primarySourcePath: primaryPath,
        sourcePaths,
        payload: primary.payload,
      };
    })
    .sort((left, right) => left.primarySourcePath.localeCompare(right.primarySourcePath));

  const report = {
    schemaVersion: 1,
    sourceRoots: sources.map((source) => labels.get(source)),
    counts: {
      discoveredFiles: sources.reduce((total, source) => total + walk(source).length, 0),
      parsedJsonFiles: parsedSources.length,
      uniqueDocuments: records.length,
      duplicateGroups: [...groups.values()].filter((group) => group.length > 1).length,
      malformedFiles: malformed.length,
      repairedFiles: repaired.length,
      rejectedFiles: rejected.length,
      ignoredFiles: ignored.length,
    },
    malformed: malformed.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
    repaired: repaired.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
    rejected: rejected.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
    ignored: ignored.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
    sourceSnapshots: parsedSources
      .map((source) => ({
        sourcePath: source.sourcePath,
        snapshotFile: source.snapshotRelativePath,
        rawHash: source.rawHash,
      }))
      .sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
    duplicateGroups: [...groups.entries()]
      .filter(([, group]) => group.length > 1)
      .map(([contentHash, group]) => ({
        contentHash,
        sourcePaths: group.map((source) => source.sourcePath).sort(),
      }))
      .sort((left, right) => left.sourcePaths[0].localeCompare(right.sourcePaths[0])),
  };

  const catalog = buildCatalog(records, report);
  if (dryRun) return { catalog, report, records };

  fs.mkdirSync(output, { recursive: true });
  const snapshotsRoot = path.resolve(output, "sources");
  for (const source of parsedSources) {
    const resolvedSourceRoot = path.resolve(source.sourceRoot);
    if (
      resolvedSourceRoot === snapshotsRoot ||
      resolvedSourceRoot.startsWith(`${snapshotsRoot}${path.sep}`)
    ) {
      continue;
    }
    const targetPath = path.join(output, source.snapshotRelativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    const existing = fs.existsSync(targetPath) ? fs.readFileSync(targetPath) : null;
    if (existing && digest(existing) !== source.rawHash) {
      throw new Error(`Refusing to overwrite changed source snapshot: ${targetPath}`);
    }
    fs.writeFileSync(targetPath, source.raw);
  }

  writeJson(path.join(output, "catalog.json"), catalog);
  writeJson(path.join(output, "import-report.json"), report);
  writeJson(
    path.join(output, "manifest.json"),
    records.map(({ payload, ...record }) => record),
  );
  return { catalog, report, records };
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = importDirectories(args);
    console.log(JSON.stringify({ output: path.relative(process.cwd(), args.output), ...result.report.counts, catalog: result.catalog.counts }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

module.exports = {
  buildCatalog,
  canonicalize,
  classifySource,
  findForbiddenFields,
  importDirectories,
  parseArgs,
  parseJsonWithRepairs,
  slugify,
};
