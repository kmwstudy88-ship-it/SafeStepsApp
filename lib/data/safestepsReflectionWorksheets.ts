export type ReflectionWorksheetField = {
  key: string;
  label: string;
  type: "text_long";
  required: boolean;
};

export type SafeStepsReflectionWorksheet = {
  id: string;
  title: string;
  section: "personal_growth";
  purpose: string;
  prompts: string[];
  fields: ReflectionWorksheetField[];
  scoring: { enabled: boolean };
  tags: string[];
};

export const safestepsReflectionWorksheets: SafeStepsReflectionWorksheet[] = [
  {
    "id": "ws_001_self-awareness-snapshot",
    "title": "Self‑awareness snapshot",
    "section": "personal_growth",
    "purpose": "Notice emotional patterns and triggers.",
    "prompts": [
      "Most frequent emotion",
      "trigger",
      "response",
      "desired change."
    ],
    "fields": [
      {
        "key": "emotion_primary",
        "label": "Most frequent emotion",
        "type": "text_long",
        "required": true
      },
      {
        "key": "trigger_event",
        "label": "trigger",
        "type": "text_long",
        "required": true
      },
      {
        "key": "response_style",
        "label": "response",
        "type": "text_long",
        "required": true
      },
      {
        "key": "desired_change",
        "label": "desired change.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "self-awareness-snapshot"
    ]
  },
  {
    "id": "ws_002_values-alignment-check",
    "title": "Values alignment check",
    "section": "personal_growth",
    "purpose": "Link actions to core values.",
    "prompts": [
      "Top 3 values",
      "aligned moment",
      "misaligned moment."
    ],
    "fields": [
      {
        "key": "value_1",
        "label": "Top 3 values",
        "type": "text_long",
        "required": true
      },
      {
        "key": "value_2",
        "label": "aligned moment",
        "type": "text_long",
        "required": true
      },
      {
        "key": "value_3",
        "label": "misaligned moment.",
        "type": "text_long",
        "required": true
      },
      {
        "key": "alignment_example",
        "label": "alignment example",
        "type": "text_long",
        "required": true
      },
      {
        "key": "misalignment_example",
        "label": "misalignment example",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "values-alignment-check"
    ]
  },
  {
    "id": "ws_003_strengths-inventory",
    "title": "Strengths inventory",
    "section": "personal_growth",
    "purpose": "Identify strengths/protective capacities.",
    "prompts": [
      "What you handled well",
      "strength used",
      "future use."
    ],
    "fields": [
      {
        "key": "strength_selected",
        "label": "What you handled well",
        "type": "text_long",
        "required": true
      },
      {
        "key": "strength_application",
        "label": "strength used",
        "type": "text_long",
        "required": true
      },
      {
        "key": "future_use_plan",
        "label": "future use.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "strengths-inventory"
    ]
  },
  {
    "id": "ws_004_parenting-wins-tracker",
    "title": "Parenting wins tracker",
    "section": "personal_growth",
    "purpose": "Reinforce positive parenting behaviours.",
    "prompts": [
      "Win description",
      "success factor",
      "child response."
    ],
    "fields": [
      {
        "key": "win_description",
        "label": "Win description",
        "type": "text_long",
        "required": true
      },
      {
        "key": "success_factor",
        "label": "success factor",
        "type": "text_long",
        "required": true
      },
      {
        "key": "child_response",
        "label": "child response.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-wins-tracker"
    ]
  },
  {
    "id": "ws_005_emotional-regulation-reflection",
    "title": "Emotional regulation reflection",
    "section": "personal_growth",
    "purpose": "Build regulation awareness.",
    "prompts": [
      "Challenging situation",
      "strategy used",
      "next‑time strategy."
    ],
    "fields": [
      {
        "key": "challenge_event",
        "label": "Challenging situation",
        "type": "text_long",
        "required": true
      },
      {
        "key": "strategy_used",
        "label": "strategy used",
        "type": "text_long",
        "required": true
      },
      {
        "key": "strategy_future",
        "label": "next‑time strategy.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "emotional-regulation-reflection"
    ]
  },
  {
    "id": "ws_006_communication-audit",
    "title": "Communication audit",
    "section": "personal_growth",
    "purpose": "Improve communication quality.",
    "prompts": [
      "Conversation that went well",
      "one that didn’t",
      "skill needed."
    ],
    "fields": [
      {
        "key": "good_convo",
        "label": "Conversation that went well",
        "type": "text_long",
        "required": true
      },
      {
        "key": "hard_convo",
        "label": "one that didn’t",
        "type": "text_long",
        "required": true
      },
      {
        "key": "skill_needed",
        "label": "skill needed.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "communication-audit"
    ]
  },
  {
    "id": "ws_007_boundary-setting",
    "title": "Boundary setting",
    "section": "personal_growth",
    "purpose": "Support healthy boundaries.",
    "prompts": [
      "Boundary set",
      "others’ response",
      "feelings after."
    ],
    "fields": [
      {
        "key": "boundary_type",
        "label": "Boundary set",
        "type": "text_long",
        "required": true
      },
      {
        "key": "others_response",
        "label": "others’ response",
        "type": "text_long",
        "required": true
      },
      {
        "key": "self_feeling",
        "label": "feelings after.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "boundary-setting"
    ]
  },
  {
    "id": "ws_008_stress-mapping",
    "title": "Stress mapping",
    "section": "personal_growth",
    "purpose": "Map stress and coping.",
    "prompts": [
      "Stress source",
      "coping used",
      "healthier option."
    ],
    "fields": [
      {
        "key": "stress_source",
        "label": "Stress source",
        "type": "text_long",
        "required": true
      },
      {
        "key": "coping_used",
        "label": "coping used",
        "type": "text_long",
        "required": true
      },
      {
        "key": "coping_alternative",
        "label": "healthier option.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "stress-mapping"
    ]
  },
  {
    "id": "ws_009_relationship-reflection-co-parenting",
    "title": "Relationship reflection (co‑parenting)",
    "section": "personal_growth",
    "purpose": "Reflect on partner/co‑parent dynamics.",
    "prompts": [
      "Supportive interaction",
      "tense interaction",
      "connection plan."
    ],
    "fields": [
      {
        "key": "supportive_interaction",
        "label": "Supportive interaction",
        "type": "text_long",
        "required": true
      },
      {
        "key": "tense_interaction",
        "label": "tense interaction",
        "type": "text_long",
        "required": true
      },
      {
        "key": "connection_plan",
        "label": "connection plan.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "relationship-reflection-co-parenting"
    ]
  },
  {
    "id": "ws_010_future-self-vision",
    "title": "Future self vision",
    "section": "personal_growth",
    "purpose": "Create future parenting identity.",
    "prompts": [
      "Future parent description",
      "habit forward",
      "habit backward."
    ],
    "fields": [
      {
        "key": "future_self_description",
        "label": "Future parent description",
        "type": "text_long",
        "required": true
      },
      {
        "key": "habit_forward",
        "label": "habit forward",
        "type": "text_long",
        "required": true
      },
      {
        "key": "habit_backward",
        "label": "habit backward.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "future-self-vision"
    ]
  },
  {
    "id": "ws_011_triggers-and-choices",
    "title": "Triggers and choices",
    "section": "personal_growth",
    "purpose": "Separate trigger from behaviour.",
    "prompts": [
      "Recent trigger",
      "automatic reaction",
      "alternative choice."
    ],
    "fields": [
      {
        "key": "trigger",
        "label": "Recent trigger",
        "type": "text_long",
        "required": true
      },
      {
        "key": "auto_reaction",
        "label": "automatic reaction",
        "type": "text_long",
        "required": true
      },
      {
        "key": "alternative_choice",
        "label": "alternative choice.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "triggers-and-choices"
    ]
  },
  {
    "id": "ws_012_safety-mindset-check",
    "title": "Safety mindset check",
    "section": "personal_growth",
    "purpose": "Link decisions to child safety.",
    "prompts": [
      "Recent safety‑related decision",
      "impact on child",
      "improvement."
    ],
    "fields": [
      {
        "key": "safety_decision",
        "label": "Recent safety‑related decision",
        "type": "text_long",
        "required": true
      },
      {
        "key": "child_impact",
        "label": "impact on child",
        "type": "text_long",
        "required": true
      },
      {
        "key": "safety_improvement",
        "label": "improvement.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "safety-mindset-check"
    ]
  },
  {
    "id": "ws_013_coping-skills-review",
    "title": "Coping skills review",
    "section": "personal_growth",
    "purpose": "Evaluate coping strategies.",
    "prompts": [
      "Coping used",
      "short‑term effect",
      "long‑term effect."
    ],
    "fields": [
      {
        "key": "coping_strategy",
        "label": "Coping used",
        "type": "text_long",
        "required": true
      },
      {
        "key": "short_term_effect",
        "label": "short‑term effect",
        "type": "text_long",
        "required": true
      },
      {
        "key": "long_term_effect",
        "label": "long‑term effect.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "coping-skills-review"
    ]
  },
  {
    "id": "ws_014_parenting-identity-statement",
    "title": "Parenting identity statement",
    "section": "personal_growth",
    "purpose": "Clarify “who I am as a parent”.",
    "prompts": [
      "3 words describing you",
      "example of each",
      "desired change."
    ],
    "fields": [
      {
        "key": "identity_word_1",
        "label": "3 words describing you",
        "type": "text_long",
        "required": true
      },
      {
        "key": "identity_word_2",
        "label": "example of each",
        "type": "text_long",
        "required": true
      },
      {
        "key": "identity_word_3",
        "label": "desired change.",
        "type": "text_long",
        "required": true
      },
      {
        "key": "identity_examples",
        "label": "identity examples",
        "type": "text_long",
        "required": true
      },
      {
        "key": "identity_change",
        "label": "identity change",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-identity-statement"
    ]
  },
  {
    "id": "ws_015_repair-after-conflict",
    "title": "Repair after conflict",
    "section": "personal_growth",
    "purpose": "Support repair with child.",
    "prompts": [
      "Conflict description",
      "repair attempt",
      "child response",
      "next step."
    ],
    "fields": [
      {
        "key": "conflict_event",
        "label": "Conflict description",
        "type": "text_long",
        "required": true
      },
      {
        "key": "repair_action",
        "label": "repair attempt",
        "type": "text_long",
        "required": true
      },
      {
        "key": "child_response",
        "label": "child response",
        "type": "text_long",
        "required": true
      },
      {
        "key": "repair_next_step",
        "label": "next step.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "repair-after-conflict"
    ]
  },
  {
    "id": "ws_016_listening-habits",
    "title": "Listening habits",
    "section": "personal_growth",
    "purpose": "Improve listening to child.",
    "prompts": [
      "Time you listened well",
      "time you interrupted",
      "change plan."
    ],
    "fields": [
      {
        "key": "good_listening_example",
        "label": "Time you listened well",
        "type": "text_long",
        "required": true
      },
      {
        "key": "poor_listening_example",
        "label": "time you interrupted",
        "type": "text_long",
        "required": true
      },
      {
        "key": "listening_plan",
        "label": "change plan.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "listening-habits"
    ]
  },
  {
    "id": "ws_017_routine-stability-check",
    "title": "Routine stability check",
    "section": "personal_growth",
    "purpose": "Reflect on daily routines.",
    "prompts": [
      "Morning routine",
      "bedtime routine",
      "what supports stability."
    ],
    "fields": [
      {
        "key": "morning_routine",
        "label": "Morning routine",
        "type": "text_long",
        "required": true
      },
      {
        "key": "bedtime_routine",
        "label": "bedtime routine",
        "type": "text_long",
        "required": true
      },
      {
        "key": "stability_factor",
        "label": "what supports stability.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "routine-stability-check"
    ]
  },
  {
    "id": "ws_018_support-network-map",
    "title": "Support network map",
    "section": "personal_growth",
    "purpose": "Identify supportive adults/resources.",
    "prompts": [
      "Who supports you",
      "how they help",
      "how to use them more."
    ],
    "fields": [
      {
        "key": "support_persons",
        "label": "Who supports you",
        "type": "text_long",
        "required": true
      },
      {
        "key": "support_types",
        "label": "how they help",
        "type": "text_long",
        "required": true
      },
      {
        "key": "support_plan",
        "label": "how to use them more.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "support-network-map"
    ]
  },
  {
    "id": "ws_019_risk-awareness-reflection",
    "title": "Risk awareness reflection",
    "section": "personal_growth",
    "purpose": "Notice risk factors in environment.",
    "prompts": [
      "Current risk",
      "how it affects child",
      "step to reduce risk."
    ],
    "fields": [
      {
        "key": "risk_factor",
        "label": "Current risk",
        "type": "text_long",
        "required": true
      },
      {
        "key": "risk_impact",
        "label": "how it affects child",
        "type": "text_long",
        "required": true
      },
      {
        "key": "risk_reduction_step",
        "label": "step to reduce risk.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "risk-awareness-reflection"
    ]
  },
  {
    "id": "ws_020_self-care-reality-check",
    "title": "Self‑care reality check",
    "section": "personal_growth",
    "purpose": "Connect self‑care to parenting capacity.",
    "prompts": [
      "Self‑care done this week",
      "effect on patience",
      "next self‑care action."
    ],
    "fields": [
      {
        "key": "self_care_activity",
        "label": "Self‑care done this week",
        "type": "text_long",
        "required": true
      },
      {
        "key": "patience_effect",
        "label": "effect on patience",
        "type": "text_long",
        "required": true
      },
      {
        "key": "self_care_next",
        "label": "next self‑care action.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "self-care-reality-check"
    ]
  },
  {
    "id": "ws_021_boundaries-with-substances",
    "title": "Boundaries with substances",
    "section": "personal_growth",
    "purpose": "Reflect on substance use and parenting.",
    "prompts": [
      "Use pattern",
      "impact on parenting",
      "boundary you want."
    ],
    "fields": [
      {
        "key": "substance_pattern",
        "label": "Use pattern",
        "type": "text_long",
        "required": true
      },
      {
        "key": "parenting_impact",
        "label": "impact on parenting",
        "type": "text_long",
        "required": true
      },
      {
        "key": "substance_boundary",
        "label": "boundary you want.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "boundaries-with-substances"
    ]
  },
  {
    "id": "ws_022_crisis-response-reflection",
    "title": "Crisis response reflection",
    "section": "personal_growth",
    "purpose": "Review response to a recent crisis.",
    "prompts": [
      "Crisis event",
      "what you did",
      "what helped",
      "what you’d change."
    ],
    "fields": [
      {
        "key": "crisis_event",
        "label": "Crisis event",
        "type": "text_long",
        "required": true
      },
      {
        "key": "response_actions",
        "label": "what you did",
        "type": "text_long",
        "required": true
      },
      {
        "key": "helpful_elements",
        "label": "what helped",
        "type": "text_long",
        "required": true
      },
      {
        "key": "change_plan",
        "label": "what you’d change.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "crisis-response-reflection"
    ]
  },
  {
    "id": "ws_023_trust-building-with-child",
    "title": "Trust building with child",
    "section": "personal_growth",
    "purpose": "Strengthen trust.",
    "prompts": [
      "Moment child trusted you",
      "moment trust was strained",
      "repair idea."
    ],
    "fields": [
      {
        "key": "trust_moment",
        "label": "Moment child trusted you",
        "type": "text_long",
        "required": true
      },
      {
        "key": "trust_strain",
        "label": "moment trust was strained",
        "type": "text_long",
        "required": true
      },
      {
        "key": "trust_repair_plan",
        "label": "repair idea.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "trust-building-with-child"
    ]
  },
  {
    "id": "ws_024_emotional-literacy-practice",
    "title": "Emotional literacy practice",
    "section": "personal_growth",
    "purpose": "Name and share feelings.",
    "prompts": [
      "Feelings you showed",
      "feelings you hid",
      "one feeling to share next time."
    ],
    "fields": [
      {
        "key": "feelings_shown",
        "label": "Feelings you showed",
        "type": "text_long",
        "required": true
      },
      {
        "key": "feelings_hidden",
        "label": "feelings you hid",
        "type": "text_long",
        "required": true
      },
      {
        "key": "feeling_to_share",
        "label": "one feeling to share next time.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "emotional-literacy-practice"
    ]
  },
  {
    "id": "ws_025_discipline-reflection",
    "title": "Discipline reflection",
    "section": "personal_growth",
    "purpose": "Reflect on discipline style.",
    "prompts": [
      "Recent discipline decision",
      "child’s experience",
      "alternative approach."
    ],
    "fields": [
      {
        "key": "discipline_event",
        "label": "Recent discipline decision",
        "type": "text_long",
        "required": true
      },
      {
        "key": "child_experience",
        "label": "child’s experience",
        "type": "text_long",
        "required": true
      },
      {
        "key": "discipline_alternative",
        "label": "alternative approach.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "discipline-reflection"
    ]
  },
  {
    "id": "ws_026_parenting-under-stress",
    "title": "Parenting under stress",
    "section": "personal_growth",
    "purpose": "Notice how stress changes parenting.",
    "prompts": [
      "Stressful day",
      "how you parented",
      "one adjustment."
    ],
    "fields": [
      {
        "key": "stress_day_description",
        "label": "Stressful day",
        "type": "text_long",
        "required": true
      },
      {
        "key": "parenting_behaviours",
        "label": "how you parented",
        "type": "text_long",
        "required": true
      },
      {
        "key": "stress_adjustment",
        "label": "one adjustment.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-under-stress"
    ]
  },
  {
    "id": "ws_027_hope-and-motivation",
    "title": "Hope and motivation",
    "section": "personal_growth",
    "purpose": "Anchor change in hope.",
    "prompts": [
      "What gives you hope",
      "what makes change hard",
      "one motivator."
    ],
    "fields": [
      {
        "key": "hope_source",
        "label": "What gives you hope",
        "type": "text_long",
        "required": true
      },
      {
        "key": "change_barrier",
        "label": "what makes change hard",
        "type": "text_long",
        "required": true
      },
      {
        "key": "motivator",
        "label": "one motivator.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "hope-and-motivation"
    ]
  },
  {
    "id": "ws_028_boundaries-with-family-of-origin",
    "title": "Boundaries with family of origin",
    "section": "personal_growth",
    "purpose": "Reflect on extended family influence.",
    "prompts": [
      "Helpful involvement",
      "harmful involvement",
      "boundary needed."
    ],
    "fields": [
      {
        "key": "family_help",
        "label": "Helpful involvement",
        "type": "text_long",
        "required": true
      },
      {
        "key": "family_harm",
        "label": "harmful involvement",
        "type": "text_long",
        "required": true
      },
      {
        "key": "family_boundary",
        "label": "boundary needed.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "boundaries-with-family-of-origin"
    ]
  },
  {
    "id": "ws_029_digital-safety-reflection",
    "title": "Digital safety reflection",
    "section": "personal_growth",
    "purpose": "Consider child’s digital environment.",
    "prompts": [
      "Child’s main online activity",
      "risk you notice",
      "safety step."
    ],
    "fields": [
      {
        "key": "online_activity",
        "label": "Child’s main online activity",
        "type": "text_long",
        "required": true
      },
      {
        "key": "online_risk",
        "label": "risk you notice",
        "type": "text_long",
        "required": true
      },
      {
        "key": "online_safety_step",
        "label": "safety step.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "digital-safety-reflection"
    ]
  },
  {
    "id": "ws_030_consistency-check",
    "title": "Consistency check",
    "section": "personal_growth",
    "purpose": "Review consistency in rules and follow‑through.",
    "prompts": [
      "Rule you kept",
      "rule you didn’t",
      "impact on child."
    ],
    "fields": [
      {
        "key": "consistent_rule",
        "label": "Rule you kept",
        "type": "text_long",
        "required": true
      },
      {
        "key": "inconsistent_rule",
        "label": "rule you didn’t",
        "type": "text_long",
        "required": true
      },
      {
        "key": "consistency_impact",
        "label": "impact on child.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "consistency-check"
    ]
  },
  {
    "id": "ws_031_attachment-and-connection",
    "title": "Attachment and connection",
    "section": "personal_growth",
    "purpose": "Reflect on emotional closeness.",
    "prompts": [
      "Moment of closeness",
      "moment of distance",
      "connection action."
    ],
    "fields": [
      {
        "key": "closeness_moment",
        "label": "Moment of closeness",
        "type": "text_long",
        "required": true
      },
      {
        "key": "distance_moment",
        "label": "moment of distance",
        "type": "text_long",
        "required": true
      },
      {
        "key": "connection_action",
        "label": "connection action.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "attachment-and-connection"
    ]
  },
  {
    "id": "ws_032_apology-and-accountability",
    "title": "Apology and accountability",
    "section": "personal_growth",
    "purpose": "Practice owning mistakes.",
    "prompts": [
      "Time you apologised",
      "time you didn’t",
      "next apology needed."
    ],
    "fields": [
      {
        "key": "apology_event",
        "label": "Time you apologised",
        "type": "text_long",
        "required": true
      },
      {
        "key": "missed_apology_event",
        "label": "time you didn’t",
        "type": "text_long",
        "required": true
      },
      {
        "key": "planned_apology",
        "label": "next apology needed.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "apology-and-accountability"
    ]
  },
  {
    "id": "ws_033_parenting-beliefs-check",
    "title": "Parenting beliefs check",
    "section": "personal_growth",
    "purpose": "Examine core beliefs about parenting.",
    "prompts": [
      "Belief you hold",
      "where it came from",
      "does it help or harm."
    ],
    "fields": [
      {
        "key": "parenting_belief",
        "label": "Belief you hold",
        "type": "text_long",
        "required": true
      },
      {
        "key": "belief_origin",
        "label": "where it came from",
        "type": "text_long",
        "required": true
      },
      {
        "key": "belief_effect",
        "label": "does it help or harm.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-beliefs-check"
    ]
  },
  {
    "id": "ws_034_safety-planning-micro-steps",
    "title": "Safety planning micro‑steps",
    "section": "personal_growth",
    "purpose": "Break safety plan into small actions.",
    "prompts": [
      "Safety goal",
      "smallest next step",
      "when you’ll do it."
    ],
    "fields": [
      {
        "key": "safety_goal",
        "label": "Safety goal",
        "type": "text_long",
        "required": true
      },
      {
        "key": "safety_micro_step",
        "label": "smallest next step",
        "type": "text_long",
        "required": true
      },
      {
        "key": "safety_timeline",
        "label": "when you’ll do it.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "safety-planning-micro-steps"
    ]
  },
  {
    "id": "ws_035_co-parenting-communication",
    "title": "Co‑parenting communication",
    "section": "personal_growth",
    "purpose": "Improve communication with co‑parent.",
    "prompts": [
      "Helpful interaction",
      "unhelpful interaction",
      "one change."
    ],
    "fields": [
      {
        "key": "coparent_helpful",
        "label": "Helpful interaction",
        "type": "text_long",
        "required": true
      },
      {
        "key": "coparent_unhelpful",
        "label": "unhelpful interaction",
        "type": "text_long",
        "required": true
      },
      {
        "key": "coparent_change",
        "label": "one change.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "co-parenting-communication"
    ]
  },
  {
    "id": "ws_036_child-s-perspective",
    "title": "Child’s perspective",
    "section": "personal_growth",
    "purpose": "Take child’s point of view.",
    "prompts": [
      "Situation",
      "how child might have felt",
      "what they needed."
    ],
    "fields": [
      {
        "key": "situation",
        "label": "Situation",
        "type": "text_long",
        "required": true
      },
      {
        "key": "child_feelings_guess",
        "label": "how child might have felt",
        "type": "text_long",
        "required": true
      },
      {
        "key": "child_need_guess",
        "label": "what they needed.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "child-s-perspective"
    ]
  },
  {
    "id": "ws_037_boundaries-with-conflict",
    "title": "Boundaries with conflict",
    "section": "personal_growth",
    "purpose": "Reflect on conflict style.",
    "prompts": [
      "How you handle conflict",
      "impact on child",
      "boundary for future."
    ],
    "fields": [
      {
        "key": "conflict_style",
        "label": "How you handle conflict",
        "type": "text_long",
        "required": true
      },
      {
        "key": "conflict_impact",
        "label": "impact on child",
        "type": "text_long",
        "required": true
      },
      {
        "key": "conflict_boundary",
        "label": "boundary for future.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "boundaries-with-conflict"
    ]
  },
  {
    "id": "ws_038_parenting-goals-for-this-week",
    "title": "Parenting goals for this week",
    "section": "personal_growth",
    "purpose": "Set short‑term goals.",
    "prompts": [
      "2–3 goals",
      "why they matter",
      "first action."
    ],
    "fields": [
      {
        "key": "goal_1",
        "label": "2–3 goals",
        "type": "text_long",
        "required": true
      },
      {
        "key": "goal_2",
        "label": "why they matter",
        "type": "text_long",
        "required": true
      },
      {
        "key": "goal_3",
        "label": "first action.",
        "type": "text_long",
        "required": true
      },
      {
        "key": "goal_reasons",
        "label": "goal reasons",
        "type": "text_long",
        "required": true
      },
      {
        "key": "goal_first_action",
        "label": "goal first action",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-goals-for-this-week"
    ]
  },
  {
    "id": "ws_039_gratitude-towards-child",
    "title": "Gratitude towards child",
    "section": "personal_growth",
    "purpose": "Notice positives in child.",
    "prompts": [
      "3 things you appreciate",
      "how you’ll show it."
    ],
    "fields": [
      {
        "key": "gratitude_items",
        "label": "3 things you appreciate",
        "type": "text_long",
        "required": true
      },
      {
        "key": "gratitude_action",
        "label": "how you’ll show it.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "gratitude-towards-child"
    ]
  },
  {
    "id": "ws_040_emotional-safety-at-home",
    "title": "Emotional safety at home",
    "section": "personal_growth",
    "purpose": "Reflect on emotional climate.",
    "prompts": [
      "When home felt safe",
      "when it felt tense",
      "one change."
    ],
    "fields": [
      {
        "key": "safe_moment",
        "label": "When home felt safe",
        "type": "text_long",
        "required": true
      },
      {
        "key": "tense_moment",
        "label": "when it felt tense",
        "type": "text_long",
        "required": true
      },
      {
        "key": "emotional_safety_change",
        "label": "one change.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "emotional-safety-at-home"
    ]
  },
  {
    "id": "ws_041_boundaries-with-technology-parent",
    "title": "Boundaries with technology (parent)",
    "section": "personal_growth",
    "purpose": "Reflect on your own tech use.",
    "prompts": [
      "Tech habit",
      "impact on connection",
      "boundary you want."
    ],
    "fields": [
      {
        "key": "tech_habit",
        "label": "Tech habit",
        "type": "text_long",
        "required": true
      },
      {
        "key": "connection_impact",
        "label": "impact on connection",
        "type": "text_long",
        "required": true
      },
      {
        "key": "tech_boundary",
        "label": "boundary you want.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "boundaries-with-technology-parent"
    ]
  },
  {
    "id": "ws_042_parenting-under-shame",
    "title": "Parenting under shame",
    "section": "personal_growth",
    "purpose": "Notice shame and its effects.",
    "prompts": [
      "Time you felt like a “bad parent”",
      "what you did",
      "kinder self‑view."
    ],
    "fields": [
      {
        "key": "shame_event",
        "label": "Time you felt like a “bad parent”",
        "type": "text_long",
        "required": true
      },
      {
        "key": "shame_behaviour",
        "label": "what you did",
        "type": "text_long",
        "required": true
      },
      {
        "key": "kinder_reframe",
        "label": "kinder self‑view.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-under-shame"
    ]
  },
  {
    "id": "ws_043_learning-from-your-child",
    "title": "Learning from your child",
    "section": "personal_growth",
    "purpose": "See child as teacher.",
    "prompts": [
      "What your child taught you",
      "how you’ll honour it."
    ],
    "fields": [
      {
        "key": "child_lesson",
        "label": "What your child taught you",
        "type": "text_long",
        "required": true
      },
      {
        "key": "honour_action",
        "label": "how you’ll honour it.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "learning-from-your-child"
    ]
  },
  {
    "id": "ws_044_safety-with-new-partners",
    "title": "Safety with new partners",
    "section": "personal_growth",
    "purpose": "Reflect on introducing partners to child.",
    "prompts": [
      "Partner involvement",
      "safety concern",
      "boundary or condition."
    ],
    "fields": [
      {
        "key": "partner_role",
        "label": "Partner involvement",
        "type": "text_long",
        "required": true
      },
      {
        "key": "partner_safety_concern",
        "label": "safety concern",
        "type": "text_long",
        "required": true
      },
      {
        "key": "partner_boundary",
        "label": "boundary or condition.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "safety-with-new-partners"
    ]
  },
  {
    "id": "ws_045_emotional-check-in-routine",
    "title": "Emotional check‑in routine",
    "section": "personal_growth",
    "purpose": "Build regular check‑ins.",
    "prompts": [
      "Current check‑in habit",
      "what works",
      "what to add."
    ],
    "fields": [
      {
        "key": "checkin_habit",
        "label": "Current check‑in habit",
        "type": "text_long",
        "required": true
      },
      {
        "key": "checkin_strength",
        "label": "what works",
        "type": "text_long",
        "required": true
      },
      {
        "key": "checkin_change",
        "label": "what to add.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "emotional-check-in-routine"
    ]
  },
  {
    "id": "ws_046_parenting-under-financial-stress",
    "title": "Parenting under financial stress",
    "section": "personal_growth",
    "purpose": "Link financial stress to parenting.",
    "prompts": [
      "Financial worry",
      "impact on patience",
      "one stabilising step."
    ],
    "fields": [
      {
        "key": "financial_stress",
        "label": "Financial worry",
        "type": "text_long",
        "required": true
      },
      {
        "key": "patience_impact",
        "label": "impact on patience",
        "type": "text_long",
        "required": true
      },
      {
        "key": "stabilising_step",
        "label": "one stabilising step.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-under-financial-stress"
    ]
  },
  {
    "id": "ws_047_safety-with-extended-contact",
    "title": "Safety with extended contact",
    "section": "personal_growth",
    "purpose": "Reflect on contact with risky people.",
    "prompts": [
      "Person of concern",
      "contact pattern",
      "safety limit."
    ],
    "fields": [
      {
        "key": "concern_person",
        "label": "Person of concern",
        "type": "text_long",
        "required": true
      },
      {
        "key": "contact_pattern",
        "label": "contact pattern",
        "type": "text_long",
        "required": true
      },
      {
        "key": "contact_limit",
        "label": "safety limit.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "safety-with-extended-contact"
    ]
  },
  {
    "id": "ws_048_celebrating-progress",
    "title": "Celebrating progress",
    "section": "personal_growth",
    "purpose": "Track change over time.",
    "prompts": [
      "What’s better than 3 months ago",
      "what helped",
      "how to keep it."
    ],
    "fields": [
      {
        "key": "progress_item",
        "label": "What’s better than 3 months ago",
        "type": "text_long",
        "required": true
      },
      {
        "key": "progress_factor",
        "label": "what helped",
        "type": "text_long",
        "required": true
      },
      {
        "key": "progress_maintenance",
        "label": "how to keep it.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "celebrating-progress"
    ]
  },
  {
    "id": "ws_049_parenting-under-grief-or-loss",
    "title": "Parenting under grief or loss",
    "section": "personal_growth",
    "purpose": "Reflect on grief’s impact.",
    "prompts": [
      "Loss you’re carrying",
      "how it affects parenting",
      "support you need."
    ],
    "fields": [
      {
        "key": "loss_description",
        "label": "Loss you’re carrying",
        "type": "text_long",
        "required": true
      },
      {
        "key": "grief_parenting_impact",
        "label": "how it affects parenting",
        "type": "text_long",
        "required": true
      },
      {
        "key": "support_needed",
        "label": "support you need.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "parenting-under-grief-or-loss"
    ]
  },
  {
    "id": "ws_050_commitment-statement",
    "title": "Commitment statement",
    "section": "personal_growth",
    "purpose": "Anchor commitment to safety and growth.",
    "prompts": [
      "One commitment to your child",
      "one to yourself",
      "first step."
    ],
    "fields": [
      {
        "key": "commitment_to_child",
        "label": "One commitment to your child",
        "type": "text_long",
        "required": true
      },
      {
        "key": "commitment_to_self",
        "label": "one to yourself",
        "type": "text_long",
        "required": true
      },
      {
        "key": "commitment_step",
        "label": "first step.",
        "type": "text_long",
        "required": true
      }
    ],
    "scoring": {
      "enabled": false
    },
    "tags": [
      "reflection",
      "personal-growth",
      "commitment-statement"
    ]
  }
];

export function getReflectionWorksheetById(worksheetId: string) {
  return safestepsReflectionWorksheets.find((worksheet) => worksheet.id === worksheetId) ?? null;
}
