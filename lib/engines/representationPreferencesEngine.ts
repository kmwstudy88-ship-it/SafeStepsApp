export type RepresentationSetupChoice =
  | "personalise_now"
  | "choose_later"
  | "diverse_rotating"
  | "people_free";

export type RepresentationPreferenceValue =
  | "no_preference"
  | "prefer_not_to_say"
  | string;

export type RepresentationPreferences = {
  setupChoice: RepresentationSetupChoice;
  culturalIdentity: RepresentationPreferenceValue;
  aboriginalTorresStraitIslanderRepresentation: RepresentationPreferenceValue;
  languagesSpoken: string[];
  parentCarerRoles: string[];
  familyStructure: RepresentationPreferenceValue;
  householdMembers: string[];
  preferredSkinTones: string[];
  characterAppearance: string[];
  culturalClothingSettingsPractices: string[];
  preferPeopleFreeIllustrations: boolean;
  updatedAt?: string;
};

export type RepresentationIllustrationSelection = {
  mode: "personalised" | "choose_later" | "diverse_rotating" | "people_free";
  tags: string[];
  safeguards: string[];
  contentPolicy: string;
};

export const representationSetupOptions: {
  id: RepresentationSetupChoice;
  label: string;
  description: string;
}[] = [
  {
    id: "personalise_now",
    label: "Yes, personalise my experience",
    description: "Use my choices to select lesson illustrations that feel more familiar.",
  },
  {
    id: "choose_later",
    label: "Let me choose later",
    description: "Keep the default artwork until I update these settings.",
  },
  {
    id: "diverse_rotating",
    label: "Use diverse rotating illustrations",
    description: "Rotate varied family illustrations without storing personal details.",
  },
  {
    id: "people_free",
    label: "Use illustrations without identifiable people",
    description: "Prefer scenes, objects, homes, routines, and activity-based artwork.",
  },
];

export const parentCarerRoleOptions = [
  "Mum",
  "Dad",
  "Grandparent",
  "Foster carer",
  "Kinship carer",
  "Same-sex parents",
  "Step-parent",
  "Guardian",
  "Other carer",
];

export const skinToneOptions = [
  "No preference",
  "Light",
  "Medium",
  "Dark",
  "Mixed family skin tones",
  "Prefer not to say",
];

export const representationSafeguards = [
  "SafeSteps never identifies culture from a photograph, name, location, or case record.",
  "These choices personalise illustrations only. They do not affect assessments, risk scores, case decisions, or child-protection evidence.",
  "Preferences are stored separately from assessment and child-protection evidence and can be changed at any time.",
  "Culturally specific image sets should be reviewed by people from those communities before production use.",
];

export const defaultRepresentationPreferences: RepresentationPreferences = {
  setupChoice: "choose_later",
  culturalIdentity: "no_preference",
  aboriginalTorresStraitIslanderRepresentation: "no_preference",
  languagesSpoken: [],
  parentCarerRoles: [],
  familyStructure: "no_preference",
  householdMembers: [],
  preferredSkinTones: ["No preference"],
  characterAppearance: [],
  culturalClothingSettingsPractices: [],
  preferPeopleFreeIllustrations: false,
};

function normaliseToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function addToken(tags: string[], prefix: string, value: string) {
  const token = normaliseToken(value);
  if (token && token !== "no_preference" && token !== "prefer_not_to_say") {
    tags.push(`${prefix}_${token}`);
  }
}

function normaliseList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function normaliseRepresentationPreferences(value: unknown): RepresentationPreferences {
  if (!value || typeof value !== "object") return defaultRepresentationPreferences;
  const input = value as Partial<RepresentationPreferences>;

  return {
    setupChoice: input.setupChoice ?? defaultRepresentationPreferences.setupChoice,
    culturalIdentity: input.culturalIdentity ?? defaultRepresentationPreferences.culturalIdentity,
    aboriginalTorresStraitIslanderRepresentation:
      input.aboriginalTorresStraitIslanderRepresentation ??
      defaultRepresentationPreferences.aboriginalTorresStraitIslanderRepresentation,
    languagesSpoken: normaliseList(input.languagesSpoken),
    parentCarerRoles: normaliseList(input.parentCarerRoles),
    familyStructure: input.familyStructure ?? defaultRepresentationPreferences.familyStructure,
    householdMembers: normaliseList(input.householdMembers),
    preferredSkinTones: normaliseList(input.preferredSkinTones),
    characterAppearance: normaliseList(input.characterAppearance),
    culturalClothingSettingsPractices: normaliseList(input.culturalClothingSettingsPractices),
    preferPeopleFreeIllustrations: Boolean(input.preferPeopleFreeIllustrations),
    updatedAt: input.updatedAt,
  };
}

export function selectRepresentationIllustrationTags(
  preferences: RepresentationPreferences,
): RepresentationIllustrationSelection {
  const normalised = normaliseRepresentationPreferences(preferences);

  if (normalised.preferPeopleFreeIllustrations || normalised.setupChoice === "people_free") {
    return {
      mode: "people_free",
      tags: ["people_free", "home_scene", "routine_objects", "activity_based"],
      safeguards: representationSafeguards,
      contentPolicy: "Lesson content remains identical. Only people-free illustration assets should be selected.",
    };
  }

  if (normalised.setupChoice === "diverse_rotating") {
    return {
      mode: "diverse_rotating",
      tags: ["diverse_rotating", "mixed_family_representations"],
      safeguards: representationSafeguards,
      contentPolicy: "Lesson content remains identical. Rotate diverse reviewed artwork without inferring identity.",
    };
  }

  if (normalised.setupChoice === "choose_later") {
    return {
      mode: "choose_later",
      tags: ["default_safe_steps_artwork"],
      safeguards: representationSafeguards,
      contentPolicy: "Lesson content remains identical. Use default artwork until the user chooses preferences.",
    };
  }

  const tags = ["personalised_representation"];
  addToken(tags, "culture", normalised.culturalIdentity);
  addToken(
    tags,
    "aboriginal_torres_strait_islander",
    normalised.aboriginalTorresStraitIslanderRepresentation,
  );
  normalised.languagesSpoken.forEach((language) => addToken(tags, "language", language));
  normalised.parentCarerRoles.forEach((role) => addToken(tags, "carer_role", role));
  addToken(tags, "family_structure", normalised.familyStructure);
  normalised.householdMembers.forEach((member) => addToken(tags, "household", member));
  normalised.preferredSkinTones.forEach((skinTone) => addToken(tags, "skin_tone", skinTone));
  normalised.characterAppearance.forEach((appearance) => addToken(tags, "appearance", appearance));
  normalised.culturalClothingSettingsPractices.forEach((practice) => addToken(tags, "practice", practice));

  return {
    mode: "personalised",
    tags: Array.from(new Set(tags)),
    safeguards: representationSafeguards,
    contentPolicy: "Lesson content remains identical. Preferences select only reviewed illustration variants.",
  };
}

export function parseCommaSeparatedPreferences(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
