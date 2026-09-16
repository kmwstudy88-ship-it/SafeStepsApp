const fs = require("fs");
const path = require("path");

function loadAllLessons() {
  const file = path.join(__dirname, "lessons", "all-lessons.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadCourses() {
  const file = path.join(__dirname, "courses", "registry.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadPrograms() {
  const file = path.join(__dirname, "programs", "registry.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = {
  loadAllLessons,
  loadCourses,
  loadPrograms
};
