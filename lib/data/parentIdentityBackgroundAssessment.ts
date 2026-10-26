export type ParentIdentityQuestion = {
  questionId: string;
  prompt: string;
};

export type ParentIdentityAssessmentItem = {
  itemId: string;
  title: string;
  itemType: "narrative_group";
  assessmentQuestions: ParentIdentityQuestion[];
  whatThisMayShowAboutTheParent: string[];
  implicationsForParentingAndTheChild: string[];
  scoringDimensions: string[];
  workerNote: string;
};

export type ParentIdentityAssessmentSection = {
  sectionId: string;
  title: string;
  items: ParentIdentityAssessmentItem[];
};

export type ParentIdentityBackgroundAssessment = {
  moduleId: string;
  version: string;
  title: string;
  description: string;
  branching: {
    path: string;
    options: ParentRoleOption[];
  };
  sections: ParentIdentityAssessmentSection[];
  scoring: {
    dimensions: string[];
    rules: ParentIdentityScoringRule[];
  };
  curriculumMapping: {
    routes: ParentIdentityCurriculumRoute[];
  };
  ingestionSchema: {
    fields: ParentIdentityIngestionField[];
  };
};

export type ParentRoleOption = "mother" | "father" | "joint" | "other_carer";

export type ParentIdentityScoringRule = {
  id: string;
  itemId: string;
  dimension: string;
  interpretation: string;
  reviewPrompt: string;
};

export type ParentIdentityCurriculumRoute = {
  id: string;
  itemId: string;
  when: string;
  suggestedFocus: string[];
};

export type ParentIdentityIngestionField = {
  key: string;
  label: string;
  target: string;
  fieldType: "text" | "textarea" | "select";
  required: boolean;
};

export const parentIdentityBackgroundAssessment: ParentIdentityBackgroundAssessment = {
  moduleId: "parent_identity_background",
  version: "1.0.0",
  title: "Parent Identity & Background",
  description: "Foundational identity, history, and contextual background for the parent.",
  branching: {
    path: "parent_role",
    options: ["mother", "father", "joint", "other_carer"],
  },
  sections: [
    {
      sectionId: "background_history",
      title: "Background & History",
      items: [
        {
          itemId: "reflection_parenting_impact_school_experiences",
          title: "Reflection & Parenting Impact",
          itemType: "narrative_group",
          assessmentQuestions: [
            {
              questionId: "school_experiences_adult_life",
              prompt: "How have your school experiences affected your life as an adult?",
            },
            {
              questionId: "school_experiences_parenting_influence",
              prompt: "Do you think your school experiences influence how you raise your child? In what ways?",
            },
            {
              questionId: "school_experience_child_hopes_and_avoidance",
              prompt: "Are there parts of your school experience you hope your child will have, or avoid?",
            },
          ],
          whatThisMayShowAboutTheParent: [
            "Linking past experiences to current parenting demonstrates reflective capacity, which is a key protective factor.",
            "Parents may want to protect their child from similar pain or provide opportunities they missed.",
            "If a parent denies any impact, this may indicate unresolved issues or limited insight into how early experiences shape behaviour.",
          ],
          implicationsForParentingAndTheChild: [
            "Reflective parents are more intentional in supporting their child's learning, friendships, and emotional wellbeing.",
            "Their hopes and fears for their child often mirror their own school experiences.",
            "Positive reflection strengthens resilience; avoidance may risk repeating patterns.",
          ],
          scoringDimensions: ["identity_stability", "support_strength", "risk_flags"],
          workerNote:
            "Use this item to explore insight and reflective capacity. Do not treat denial of impact as a finding on its own; consider cultural context, safety, literacy, trauma history, and the parent's readiness to discuss school experiences.",
        },
      ],
    },
  ],
  scoring: {
    dimensions: [
      "identity_stability",
      "life_stressors",
      "support_strength",
      "cultural_alignment",
      "risk_flags",
    ],
    rules: [
      {
        id: "school_reflection_capacity",
        itemId: "reflection_parenting_impact_school_experiences",
        dimension: "identity_stability",
        interpretation:
          "Parent can connect past school experiences with present adult functioning and parenting choices.",
        reviewPrompt:
          "Look for specific examples, balanced reflection, and ability to name both strengths and pain without relying on blame or avoidance.",
      },
      {
        id: "school_protective_intent",
        itemId: "reflection_parenting_impact_school_experiences",
        dimension: "support_strength",
        interpretation:
          "Parent identifies opportunities they want to preserve for the child and experiences they want to protect the child from.",
        reviewPrompt:
          "Check whether protective intent translates into practical, child-focused support for learning, friendships, attendance, and emotional wellbeing.",
      },
      {
        id: "school_avoidance_or_limited_insight",
        itemId: "reflection_parenting_impact_school_experiences",
        dimension: "risk_flags",
        interpretation:
          "Parent cannot yet explore how early school experiences may shape behaviour, expectations, or responses to the child's education.",
        reviewPrompt:
          "Do not score denial alone as risk. Review trauma, culture, literacy, safety, trust, and readiness before forming a concern.",
      },
    ],
  },
  curriculumMapping: {
    routes: [
      {
        id: "school_reflection_to_parenting_identity",
        itemId: "reflection_parenting_impact_school_experiences",
        when: "Parent shows emerging insight into how school history affects parenting identity.",
        suggestedFocus: [
          "parenting-identity-statement",
          "reflective-practice",
          "supporting-children-emotionally",
        ],
      },
      {
        id: "school_pain_to_child_support",
        itemId: "reflection_parenting_impact_school_experiences",
        when: "Parent describes painful school experiences they want the child to avoid.",
        suggestedFocus: [
          "building-resilience-in-children",
          "strengthening-protective-relationships",
          "school-and-community-stability",
        ],
      },
    ],
  },
  ingestionSchema: {
    fields: [
      {
        key: "parent_role",
        label: "Parent role",
        target: "parent_profiles.parent_role",
        fieldType: "select",
        required: true,
      },
      {
        key: "schoolExperienceAdultImpact",
        label: "School experiences and adult life",
        target: "parent_profiles.identity.schoolExperienceAdultImpact",
        fieldType: "textarea",
        required: false,
      },
      {
        key: "schoolExperienceParentingInfluence",
        label: "School experiences and parenting",
        target: "parent_profiles.identity.schoolExperienceParentingInfluence",
        fieldType: "textarea",
        required: false,
      },
      {
        key: "schoolExperienceChildHopesAndAvoidance",
        label: "Hopes and avoidance for child",
        target: "parent_profiles.identity.schoolExperienceChildHopesAndAvoidance",
        fieldType: "textarea",
        required: false,
      },
    ],
  },
};

export function getParentIdentityAssessmentItem(itemId: string) {
  for (const section of parentIdentityBackgroundAssessment.sections) {
    const item = section.items.find((candidate) => candidate.itemId === itemId);
    if (item) return item;
  }

  return null;
}
