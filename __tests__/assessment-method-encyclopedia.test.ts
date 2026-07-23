import {
  assessmentMethodCompetencyProfileFields,
  assessmentMethodDomains,
  assessmentMethodEncyclopediaSourceClaim,
  assessmentMethodTaxonomy,
  getAssessmentMethodCount,
  getAssessmentMethodsByDomain,
} from "../lib/data/assessmentMethodEncyclopedia";
import { assessmentRoutes } from "../lib/data/assessmentSystem";

describe("assessment method encyclopedia", () => {
  test("captures the attached SafeSteps assessment-method domains without inventing 5000 records", () => {
    expect(assessmentMethodEncyclopediaSourceClaim).toBe("Approximately 5,000+ Assessment Methods");
    expect(assessmentMethodTaxonomy).toHaveLength(32);
    expect(assessmentMethodDomains).toHaveLength(10);
    expect(getAssessmentMethodCount()).toBe(200);
    expect(getAssessmentMethodsByDomain("knowledge")).toEqual(expect.arrayContaining(["Multiple choice", "Sequencing", "AI interview"]));
    expect(getAssessmentMethodsByDomain("safety")).toEqual(expect.arrayContaining(["Home hazards", "Family violence safety planning", "AI safety scan (of submitted evidence, with user consent)"]));
    expect(getAssessmentMethodsByDomain("professional_competency")).toEqual(expect.arrayContaining(["Evidence weighting", "Court preparation", "Peer moderation"]));
  });

  test("frames assessment output as a dynamic competency profile", () => {
    expect(assessmentMethodCompetencyProfileFields).toEqual(
      expect.arrayContaining([
        "Current competency level",
        "Confidence in that estimate",
        "Number and diversity of evidence sources",
        "Conflicting evidence that needs review",
        "Suggested next learning activities",
      ]),
    );
  });

  test("links the method encyclopedia from assessment-system navigation data", () => {
    expect(assessmentRoutes.some((route) => route.href === "/assessment-system/method-encyclopedia")).toBe(true);
  });
});
