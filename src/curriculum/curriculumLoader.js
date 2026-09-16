// curriculumLoader.js
// Loads curriculum from the SafeSteps bundled JSON files

import bundle from "../../safesteps/assets/SafeSteps.bundle.json";
import master from "../../safesteps/assets/SafeSteps.master.index.json";
import programMap from "../../safesteps/assets/SafeSteps.program.map.json";

export function loadLessons() {
  return Object.values(bundle).filter(item => item.type === "lesson");
}

export function loadWeeks() {
  return Object.values(bundle).filter(item => item.type === "week");
}

export function loadPrograms() {
  return Object.values(bundle).filter(item => item.type === "program");
}

export function getLessonById(id) {
  return bundle[id] || null;
}

export function getProgramLessons(programId) {
  const lessonIds = programMap[programId] || [];
  return lessonIds.map(id => bundle[id]);
}