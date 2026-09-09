const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const masterIndexPath = path.join(repoRoot, "src", "safesteps", "lessons", "master-index.json");

const registries = {
  lessons: loadDirectory("lessons"),
  topics: loadDirectory("topics"),
  courses: loadDirectory(path.join("src", "safesteps", "courses")),
  programs: loadDirectory(path.join("src", "safesteps", "programs")),
};

function loadDirectory(relativeDir) {
  const directory = path.join(repoRoot, relativeDir);
  if (!fs.existsSync(directory)) return {};

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .reduce((collection, entry) => {
      const absolutePath = path.join(directory, entry.name);
      const record = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
      const fallbackId = path.basename(entry.name, ".json");
      collection[record.id || fallbackId] = {
        ...record,
        sourcePath: path.relative(repoRoot, absolutePath).replace(/\\/g, "/"),
      };
      return collection;
    }, {});
}

function readMasterIndex() {
  if (!fs.existsSync(masterIndexPath)) return null;
  return JSON.parse(fs.readFileSync(masterIndexPath, "utf8"));
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
  return readMasterIndex();
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
