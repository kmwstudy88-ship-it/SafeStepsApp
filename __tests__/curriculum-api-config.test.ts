import { isCurriculumApiEnabled } from "../lib/curriculumApi";

const originalEnabled = process.env.EXPO_PUBLIC_SAFESTEPS_CURRICULUM_API_ENABLED;
const originalUrl = process.env.EXPO_PUBLIC_SAFESTEPS_API_URL;

afterEach(() => {
  if (originalEnabled === undefined) {
    delete process.env.EXPO_PUBLIC_SAFESTEPS_CURRICULUM_API_ENABLED;
  } else {
    process.env.EXPO_PUBLIC_SAFESTEPS_CURRICULUM_API_ENABLED = originalEnabled;
  }

  if (originalUrl === undefined) {
    delete process.env.EXPO_PUBLIC_SAFESTEPS_API_URL;
  } else {
    process.env.EXPO_PUBLIC_SAFESTEPS_API_URL = originalUrl;
  }
});

test("keeps the incomplete external curriculum API disabled by default", () => {
  delete process.env.EXPO_PUBLIC_SAFESTEPS_CURRICULUM_API_ENABLED;
  process.env.EXPO_PUBLIC_SAFESTEPS_API_URL = "http://localhost:3000";

  expect(isCurriculumApiEnabled()).toBe(false);
});

test("requires both the explicit flag and an API URL", () => {
  process.env.EXPO_PUBLIC_SAFESTEPS_CURRICULUM_API_ENABLED = "true";
  delete process.env.EXPO_PUBLIC_SAFESTEPS_API_URL;
  expect(isCurriculumApiEnabled()).toBe(false);

  process.env.EXPO_PUBLIC_SAFESTEPS_API_URL = "https://api.example.test";
  expect(isCurriculumApiEnabled()).toBe(true);
});
