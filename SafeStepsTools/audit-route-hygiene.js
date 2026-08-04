const fs = require("fs");
const path = require("path");

const appRoot = path.join(process.cwd(), "app");

const implementationPathSegments = new Set([
  "components",
  "engine",
  "family",
  "lobby",
  "parent",
  "session",
  "specs",
  "turns",
]);

const implementationFilePatterns = [
  /Client\.(ts|tsx|js|jsx)$/,
  /Engine\.(ts|tsx|js|jsx)$/,
  /Export\.(ts|tsx|js|jsx)$/,
  /Filter\.(ts|tsx|js|jsx)$/,
  /Manager\.(ts|tsx|js|jsx)$/,
  /Model\.(ts|tsx|js|jsx)$/,
  /Registry\.(ts|tsx|js|jsx)$/,
  /Safety\.(ts|tsx|js|jsx)$/,
  /Types\.(ts|tsx|js|jsx)$/,
];

const routeFileExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const allowedRouteFiles = new Set([
  "+not-found.tsx",
  "_layout.tsx",
  "index.tsx",
]);

const allowedRoutePrefixes = [
  "parent/daily-challenges/",
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolutePath);
    return [absolutePath];
  });
}

function toAppRelative(absolutePath) {
  return path.relative(appRoot, absolutePath).replace(/\\/g, "/");
}

function isRouteCandidate(absolutePath) {
  return routeFileExtensions.has(path.extname(absolutePath));
}

function hasImplementationSegment(relativePath) {
  return relativePath
    .split("/")
    .slice(0, -1)
    .some((segment) => implementationPathSegments.has(segment));
}

function looksLikeImplementationFile(relativePath) {
  const fileName = path.basename(relativePath);
  const baseName = fileName.replace(/\.(ts|tsx|js|jsx)$/, "");
  return /^[A-Z]/.test(baseName) || implementationFilePatterns.some((pattern) => pattern.test(fileName));
}

function isAllowedRoutePrefix(relativePath) {
  return allowedRoutePrefixes.some((prefix) => relativePath.startsWith(prefix));
}

function auditRouteHygiene() {
  const routeCandidates = walk(appRoot).filter(isRouteCandidate).map(toAppRelative).sort();
  const implementationRouteCandidates = routeCandidates.filter((relativePath) => {
    const fileName = path.basename(relativePath);
    if (allowedRouteFiles.has(fileName)) return false;
    if (isAllowedRoutePrefix(relativePath)) return false;
    return hasImplementationSegment(relativePath) || looksLikeImplementationFile(relativePath);
  });

  const summary = {
    routeCandidates: routeCandidates.length,
    implementationRouteCandidates: implementationRouteCandidates.length,
    implementationRouteCandidatePaths: implementationRouteCandidates,
  };

  console.log(JSON.stringify(summary, null, 2));

  return summary;
}

if (require.main === module) {
  auditRouteHygiene();
}

module.exports = { auditRouteHygiene };
