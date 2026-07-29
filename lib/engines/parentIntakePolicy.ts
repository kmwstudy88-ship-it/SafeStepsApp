export const PARENT_INTAKE_SECTION_KEYS = [
  "about_you",
  "cultural_identity",
  "communication_preferences",
  "family_household",
  "children",
  "parenting_circumstances",
  "child_safety_court",
  "current_strengths",
  "support_needs",
  "immediate_safety",
  "goals_program",
  "review",
] as const;

export type ParentIntakeSectionKey = (typeof PARENT_INTAKE_SECTION_KEYS)[number];
export type ParentIntakeAnswers = Record<string, string>;

export type ParentIntakeField = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  optional?: boolean;
  options?: readonly { label: string; value: string }[];
};

export type ParentIntakeSection = {
  key: ParentIntakeSectionKey;
  eyebrow: string;
  title: string;
  description: string;
  fields: readonly ParentIntakeField[];
};

const preferenceOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
] as const;

export const PARENT_INTAKE_SECTIONS: readonly ParentIntakeSection[] = [
  {
    key: "about_you",
    eyebrow: "About you",
    title: "Your parent profile",
    description:
      "Tell SafeSteps what name to use. This information stays connected to your protected parent profile.",
    fields: [
      { key: "displayName", label: "Name shown in SafeSteps", placeholder: "Your name" },
      {
        key: "preferredName",
        label: "Preferred name",
        placeholder: "Leave blank if it is the same",
        optional: true,
      },
      {
        key: "phone",
        label: "Safe contact phone",
        placeholder: "Optional",
        optional: true,
      },
    ],
  },
  {
    key: "cultural_identity",
    eyebrow: "Identity and preferences",
    title: "Culture, language and identity",
    description:
      "Share only what helps SafeSteps represent you and your family respectfully. Choosing not to say is valid.",
    fields: [
      {
        key: "culturalChoice",
        label: "Would you like cultural identity considered?",
        options: preferenceOptions,
      },
      {
        key: "culturalNotes",
        label: "Culture, community, Country, faith or identity preferences",
        placeholder: "Optional details in your own words",
        multiline: true,
        optional: true,
      },
      {
        key: "language",
        label: "Preferred language",
        placeholder: "Example: English",
      },
      {
        key: "interpreter",
        label: "Would an interpreter help?",
        options: preferenceOptions,
      },
    ],
  },
  {
    key: "communication_preferences",
    eyebrow: "Communication",
    title: "How SafeSteps should contact you",
    description:
      "Choose a safe contact method. Record any method that could put your privacy or safety at risk.",
    fields: [
      {
        key: "preferredContact",
        label: "Preferred contact method",
        options: [
          { label: "In-app only", value: "in_app" },
          { label: "Email", value: "email" },
          { label: "Phone call", value: "phone" },
          { label: "Text message", value: "sms" },
        ],
      },
      {
        key: "unsafeContact",
        label: "Contact methods or times that are unsafe",
        placeholder: "Optional safety note",
        multiline: true,
        optional: true,
      },
      {
        key: "communicationNotes",
        label: "Anything that makes communication easier",
        placeholder: "Optional",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    key: "family_household",
    eyebrow: "Family and household",
    title: "Your family setup",
    description:
      "Describe your family as it is now. SafeSteps does not assume that every family lives in one household.",
    fields: [
      {
        key: "familyLabel",
        label: "Family name or label",
        placeholder: "Example: Watts family",
      },
      {
        key: "householdMembers",
        label: "Who currently lives in your household?",
        placeholder: "Names, relationships or initials",
        multiline: true,
      },
      {
        key: "familyNotes",
        label: "Important family or household context",
        placeholder: "Optional",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    key: "children",
    eyebrow: "Children",
    title: "Children connected to this journey",
    description:
      "Add each child on a new line. Use a preferred name or initials if that is safer.",
    fields: [
      {
        key: "childNames",
        label: "Child or children",
        placeholder: "One name or initials per line",
        multiline: true,
      },
      {
        key: "childDetails",
        label: "Ages, needs or communication preferences",
        placeholder: "Optional and only what is relevant",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    key: "parenting_circumstances",
    eyebrow: "Parenting circumstances",
    title: "What brings you to SafeSteps?",
    description:
      "Describe the current situation in your own words. This is a parent account, not a professional finding.",
    fields: [
      {
        key: "circumstances",
        label: "Current parenting circumstances",
        placeholder: "What is happening and what would you like support with?",
        multiline: true,
      },
      {
        key: "services",
        label: "Services or programs already involved",
        placeholder: "Optional",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    key: "child_safety_court",
    eyebrow: "Case context",
    title: "Child Safety or court involvement",
    description:
      "Record factual context only. Leaving optional reference details blank will not stop progress.",
    fields: [
      {
        key: "involvement",
        label: "Is Child Safety or a court currently involved?",
        options: preferenceOptions,
      },
      {
        key: "caseReference",
        label: "Case or court reference",
        placeholder: "Optional",
        optional: true,
      },
      {
        key: "caseContext",
        label: "Relevant dates, orders or current stage",
        placeholder: "Optional factual details",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    key: "current_strengths",
    eyebrow: "Strengths",
    title: "What is already working?",
    description:
      "SafeSteps records strengths as well as needs. Include routines, relationships, skills or changes you value.",
    fields: [
      {
        key: "strengths",
        label: "Current strengths",
        placeholder: "Write in your own words",
        multiline: true,
      },
    ],
  },
  {
    key: "support_needs",
    eyebrow: "Support needs",
    title: "What support would help?",
    description:
      "Support needs are context, not proof that a parent is unsafe. Include practical and service-system barriers.",
    fields: [
      {
        key: "supportNotes",
        label: "Support that would make progress more achievable",
        placeholder: "Housing, transport, health, parenting, legal or other support",
        multiline: true,
      },
      {
        key: "barriers",
        label: "Barriers outside your control",
        placeholder: "Optional",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    key: "immediate_safety",
    eyebrow: "Immediate safety",
    title: "Safety check",
    description:
      "SafeSteps is not an emergency service. This step helps the app use safer communication and support settings.",
    fields: [
      {
        key: "safetyNow",
        label: "Which best describes today?",
        options: [
          { label: "I feel safe right now", value: "safe_now" },
          { label: "I am watching warning signs", value: "watching_signs" },
          { label: "I need support with safety", value: "needs_support" },
          { label: "Prefer not to say", value: "prefer_not_to_say" },
        ],
      },
      {
        key: "safetyContact",
        label: "Safest way to show sensitive notifications",
        options: [
          { label: "Hide all details", value: "hide_details" },
          { label: "Show general reminder only", value: "general_only" },
          { label: "Use my saved preference", value: "saved_preference" },
        ],
      },
      {
        key: "safetyNotes",
        label: "Private safety note",
        placeholder: "Optional",
        multiline: true,
        optional: true,
      },
    ],
  },
  {
    key: "goals_program",
    eyebrow: "Goals",
    title: "Your goals and starting pathway",
    description:
      "Choose the pathway that currently fits best. Recommendations can change after review without erasing your answers.",
    fields: [
      {
        key: "storyGoal",
        label: "Main goal",
        placeholder: "What are you working toward?",
        multiline: true,
      },
      {
        key: "caseGoals",
        label: "Other goals",
        placeholder: "One goal per line",
        multiline: true,
      },
      {
        key: "programStream",
        label: "Starting pathway",
        options: [
          { label: "24 Month Reunification", value: "24 Month Reunification" },
          {
            label: "18 Month Keeping Families Together",
            value: "18 Month Keeping Families Together",
          },
          { label: "12 Month Back on Track", value: "12 Month Back on Track" },
          {
            label: "6 Month Build Stronger Families",
            value: "6 Month Build Stronger Families",
          },
          {
            label: "12 Week Child Safety Contact Program",
            value: "12 Week Child Safety Contact Program",
          },
          { label: "Custom Program", value: "Custom Program" },
        ],
      },
    ],
  },
  {
    key: "review",
    eyebrow: "Review",
    title: "Review and complete intake",
    description:
      "Your answers remain labelled as parent-provided information. Assessments, observations and evidence stay separate.",
    fields: [
      {
        key: "reviewConfirmed",
        label: "I have reviewed my answers and they are accurate to the best of my knowledge.",
        options: [{ label: "Confirm and complete", value: "confirmed" }],
      },
    ],
  },
] as const;

export const PARENT_INTAKE_TOTAL_SECTIONS = PARENT_INTAKE_SECTIONS.length;

export function isParentIntakeSectionKey(value: unknown): value is ParentIntakeSectionKey {
  return (
    typeof value === "string" &&
    PARENT_INTAKE_SECTION_KEYS.includes(value as ParentIntakeSectionKey)
  );
}

export function getParentIntakeSection(key: ParentIntakeSectionKey) {
  return PARENT_INTAKE_SECTIONS.find((section) => section.key === key)!;
}

export function getParentIntakeSectionIndex(key: ParentIntakeSectionKey) {
  return PARENT_INTAKE_SECTION_KEYS.indexOf(key);
}

export function getParentIntakeResumeSection(
  completedKeys: readonly string[],
  currentSection: unknown,
): ParentIntakeSectionKey {
  const completed = new Set(completedKeys.filter(isParentIntakeSectionKey));
  if (isParentIntakeSectionKey(currentSection) && !completed.has(currentSection)) {
    return currentSection;
  }

  return (
    PARENT_INTAKE_SECTION_KEYS.find((sectionKey) => !completed.has(sectionKey)) ??
    "review"
  );
}

export function getNextParentIntakeSection(
  key: ParentIntakeSectionKey,
): ParentIntakeSectionKey {
  const index = getParentIntakeSectionIndex(key);
  return PARENT_INTAKE_SECTION_KEYS[Math.min(index + 1, PARENT_INTAKE_SECTION_KEYS.length - 1)];
}

export function getPreviousParentIntakeSection(
  key: ParentIntakeSectionKey,
): ParentIntakeSectionKey {
  const index = getParentIntakeSectionIndex(key);
  return PARENT_INTAKE_SECTION_KEYS[Math.max(index - 1, 0)];
}

export function getParentIntakeValidationError(
  sectionKey: ParentIntakeSectionKey,
  answers: ParentIntakeAnswers,
) {
  const section = getParentIntakeSection(sectionKey);
  const missing = section.fields.find(
    (field) => !field.optional && !answers[field.key]?.trim(),
  );

  return missing ? `Complete “${missing.label}” before continuing.` : null;
}

export function calculateParentIntakePercent(completedKeys: readonly string[]) {
  const completed = new Set(completedKeys.filter(isParentIntakeSectionKey));
  return Math.round((completed.size / PARENT_INTAKE_TOTAL_SECTIONS) * 100);
}

export function splitParentIntakeLines(value: string | undefined) {
  return (value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
