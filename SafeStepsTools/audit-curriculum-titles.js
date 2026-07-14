const fs = require("fs");
const path = require("path");

const root = process.cwd();
const curriculumRoot = path.join(root, "curriculum");

const genericTitlePatterns = [
  /^lesson\s+\d+$/i,
  /^stage\s+\d+\s+-\s+week\s+\d+\s+-\s+lesson\s+\d+$/i,
  /^week\s+\d+\s+-\s+lesson\s+\d+$/i,
  /^module name$/i,
  /^lesson title$/i,
];

const placeholderContentPatterns = [
  /placeholder content/i,
  /^content pending$/i,
  /^add short/i,
  /^todo\b/i,
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
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

function collectIssues() {
  return walk(curriculumRoot)
    .filter((filePath) => filePath.endsWith(".json"))
    .flatMap((filePath) => {
      const { data: record, error } = readJson(filePath);
      if (error) {
        return [{
          filePath,
          field: "json",
          value: error,
          problem: "unreadable JSON",
        }];
      }
      if (!record || typeof record !== "object") return [];

      const issues = [];
      if (isGenericTitle(record.title)) {
        issues.push({
          filePath,
          field: "title",
          value: record.title,
          problem: "generic lesson title",
        });
      }

      for (const field of ["content", "body", "summary", "description"]) {
        if (isPlaceholderContent(record[field])) {
          issues.push({
            filePath,
            field,
            value: record[field],
            problem: "placeholder lesson content",
          });
        }
      }

      return issues;
    });
}

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
