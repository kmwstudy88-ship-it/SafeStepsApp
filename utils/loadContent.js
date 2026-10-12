import lessons from "../data/lessons.json";
import topics from "../data/topics.json";
import courses from "../data/courses.json";
import programs from "../data/programs.json";

export function getLesson(id) {
  return lessons[id] || null;
}

export function getTopic(id) {
  return topics[id] || null;
}

export function getCourse(id) {
  return courses[id] || null;
}

export function getProgram(id) {
  return programs[id] || null;
}
