const fs = require("fs");
const path = require("path");

const root = process.cwd();
const candidateRoots = [
  path.join(root, "curriculum"),
  path.join(root, "lessons"),
  path.join(root, "modules"),
  path.join(root, "topics"),
  path.join(root, "src", "safesteps", "lessons"),
  path.join(root, "src", "safesteps", "courses"),
  path.join(root, "src", "safesteps", "programs"),
];

const genericTitlePatterns = [
  /^lesson\s+\d+$/i,
  /^stage\s+\d+\s+-\s+week\s+\d+\s+-\s+lesson\s+\d+$/i,
  /^week\s+\d+\s+-\s+lesson\s+\d+$/i,
  /^module name$/i,
  /^lesson title$/i,
  /^[a-z0-9]+(_[a-z0-9]+)+$/i,
  /^section\s+\d+\s+for\s+/i,
  /^often include$/i,
  /^many people assume these courses/i,
];

const placeholderContentPatterns = [
  /placeholder content/i,
  /^content pending$/i,
  /^add short/i,
  /^todo\b/i,
  /^lesson content goes here\.?$/i,
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name === "source-imports") return [];
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
}

function readJson(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    return { data: JSON.parse(text), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown JSON parse error" };
  }
}

function isGenericTitle(title) {
  return typeof title === "string" && genericTitlePatterns.some((pattern) => pattern.test(title.trim()));
}

function isPlaceholderContent(value) {
  return typeof value === "string" && placeholderContentPatterns.some((pattern) => pattern.test(value.trim()));
}

function inspectRecord(record, filePath, prefix = "", issues = []) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return issues;

  const fieldName = (name) => (prefix ? `${prefix}.${name}` : name);

  if (isGenericTitle(record.title)) {
    issues.push({
      filePath,
      field: fieldName("title"),
      value: record.title,
      problem: "generic or placeholder lesson title",
    });
  }

  for (const field of ["content", "body", "summary", "description"]) {
    if (isPlaceholderContent(record[field])) {
      issues.push({
        filePath,
        field: fieldName(field),
        value: record[field],
        problem: "placeholder lesson content",
      });
    }
  }

  if (Array.isArray(record.sections)) {
    const overviews = [];
    record.sections.forEach((section, index) => {
      if (!section || typeof section !== "object") return;
      const sectionPrefix = fieldName(`sections[${index}]`);
      if (isGenericTitle(section.title)) {
        issues.push({
          filePath,
          field: `${sectionPrefix}.title`,
          value: section.title,
          problem: "placeholder section title",
        });
      }
      const overview = section?.content?.overview ?? section?.body;
      if (isPlaceholderContent(overview)) {
        issues.push({
          filePath,
          field: `${sectionPrefix}.overview`,
          value: overview,
          problem: "placeholder section content",
        });
      }
      if (typeof overview === "string" && overview.trim()) {
        overviews.push(overview.trim());
      }
    });
    if (overviews.length > 1 && new Set(overviews).size < overviews.length) {
      issues.push({
        filePath,
        field: fieldName("sections"),
        value: `${overviews.length} sections (${new Set(overviews).size} unique)`,
        problem: "duplicate section content",
      });
    }
  }

  if (Array.isArray(record.lessons)) {
    record.lessons.forEach((lesson, index) => {
      if (lesson && typeof lesson === "object") {
        inspectRecord(lesson, filePath, fieldName(`lessons[${index}]`), issues);
      }
    });
  }

  if (Array.isArray(record.modules)) {
    record.modules.forEach((mod, index) => {
      if (mod && typeof mod === "object") {
        inspectRecord(mod, filePath, fieldName(`modules[${index}]`), issues);
      }
    });
  }

  return issues;
}

function collectIssues() {
  const allJsonFiles = [
    ...new Set(
      candidateRoots.flatMap((dir) => walk(dir)).filter((filePath) => filePath.endsWith(".json")),
    ),
  ];

  return allJsonFiles.flatMap((filePath) => {
    if (path.basename(filePath) === "master-index.json") return [];
    const { data: record, error } = readJson(filePath);
    if (error) {
      return [
        {
          filePath,
          field: "json",
          value: error,
          problem: "unreadable JSON",
        },
      ];
    }
    if (!record || typeof record !== "object") return [];
    return inspectRecord(record, filePath);
  });
}

if (require.main === module) {
  const issues = collectIssues();

  if (!issues.length) {
    console.log("Curriculum title audit passed: no generic lesson titles or placeholder JSON content found.");
    process.exit(0);
  }

  console.log(`Curriculum title audit found ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) {
    const relativePath = path.relative(root, issue.filePath);
    console.log(`- ${relativePath} :: ${issue.field} :: ${issue.problem} :: ${JSON.stringify(issue.value)}`);
  }

  if (issues.length > 80) {
    console.log(`...and ${issues.length - 80} more issue(s).`);
  }

  process.exit(1);
}

module.exports = {
  collectIssues,
  inspectRecord,
  isGenericTitle,
  isPlaceholderContent,
};
