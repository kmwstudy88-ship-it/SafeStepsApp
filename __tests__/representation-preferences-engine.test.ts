import {
  defaultRepresentationPreferences,
  normaliseRepresentationPreferences,
  parseCommaSeparatedPreferences,
  representationSafeguards,
  selectRepresentationIllustrationTags,
} from "../lib/engines/representationPreferencesEngine";

describe("representationPreferencesEngine", () => {
  test("defaults to choose-later artwork without inferring identity", () => {
    const selection = selectRepresentationIllustrationTags(defaultRepresentationPreferences);

    expect(selection.mode).toBe("choose_later");
    expect(selection.tags).toEqual(["default_safe_steps_artwork"]);
    expect(selection.contentPolicy).toContain("Lesson content remains identical");
  });

  test("uses people-free illustrations when selected", () => {
    const selection = selectRepresentationIllustrationTags({
      ...defaultRepresentationPreferences,
      setupChoice: "personalise_now",
      culturalIdentity: "Samoan",
      preferPeopleFreeIllustrations: true,
    });

    expect(selection.mode).toBe("people_free");
    expect(selection.tags).toEqual(["people_free", "home_scene", "routine_objects", "activity_based"]);
  });

  test("creates illustration tags only from explicit user preferences", () => {
    const selection = selectRepresentationIllustrationTags({
      ...defaultRepresentationPreferences,
      setupChoice: "personalise_now",
      culturalIdentity: "Aboriginal",
      aboriginalTorresStraitIslanderRepresentation: "Aboriginal representation",
      languagesSpoken: ["English", "Yumplatok"],
      parentCarerRoles: ["Kinship carer"],
      familyStructure: "Single parent household",
      householdMembers: ["Grandparent"],
      preferredSkinTones: ["Mixed family skin tones"],
      characterAppearance: ["Natural hair"],
      culturalClothingSettingsPractices: ["On Country family setting"],
    });

    expect(selection.tags).toEqual(
      expect.arrayContaining([
        "personalised_representation",
        "culture_aboriginal",
        "aboriginal_torres_strait_islander_aboriginal_representation",
        "language_yumplatok",
        "carer_role_kinship_carer",
        "family_structure_single_parent_household",
        "household_grandparent",
        "skin_tone_mixed_family_skin_tones",
        "appearance_natural_hair",
        "practice_on_country_family_setting",
      ]),
    );
  });

  test("keeps safeguards explicit", () => {
    expect(representationSafeguards.join(" ")).toContain("never identifies culture from a photograph");
    expect(representationSafeguards.join(" ")).toContain("do not affect assessments");
    expect(representationSafeguards.join(" ")).toContain("stored separately from assessment");
  });

  test("normalises unknown stored values and comma-separated entry", () => {
    expect(normaliseRepresentationPreferences(null)).toEqual(defaultRepresentationPreferences);
    expect(parseCommaSeparatedPreferences("English, Spanish,  , Auslan")).toEqual(["English", "Spanish", "Auslan"]);
  });
});
