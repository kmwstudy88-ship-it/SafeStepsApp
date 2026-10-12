import {
  advancedAssessmentPreviewsEnabled,
  isAdvancedAssessmentPreviewPath,
} from "../components/security/AdvancedAssessmentPreviewBoundary";

const originalFlag = process.env.EXPO_PUBLIC_SAFESTEPS_ENABLE_ADVANCED_ASSESSMENT_PREVIEWS;

afterEach(() => {
  if (originalFlag === undefined) {
    delete process.env.EXPO_PUBLIC_SAFESTEPS_ENABLE_ADVANCED_ASSESSMENT_PREVIEWS;
  } else {
    process.env.EXPO_PUBLIC_SAFESTEPS_ENABLE_ADVANCED_ASSESSMENT_PREVIEWS = originalFlag;
  }
});

test("identifies calibration assessment preview routes", () => {
  expect(isAdvancedAssessmentPreviewPath("/assessment-system/scoring")).toBe(true);
  expect(isAdvancedAssessmentPreviewPath("/assessment-system/readiness-index?caseId=1")).toBe(true);
  expect(isAdvancedAssessmentPreviewPath("/assessment-system/report-output")).toBe(true);
  expect(isAdvancedAssessmentPreviewPath("/assessment-system/records")).toBe(false);
});

test("keeps advanced assessment previews disabled unless explicitly enabled", () => {
  delete process.env.EXPO_PUBLIC_SAFESTEPS_ENABLE_ADVANCED_ASSESSMENT_PREVIEWS;
  expect(advancedAssessmentPreviewsEnabled()).toBe(false);

  process.env.EXPO_PUBLIC_SAFESTEPS_ENABLE_ADVANCED_ASSESSMENT_PREVIEWS = "true";
  expect(advancedAssessmentPreviewsEnabled()).toBe(true);
});
