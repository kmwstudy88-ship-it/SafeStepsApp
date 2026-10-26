export type FamilyMeetingPromptRole = "Child" | "Parent" | "Family";

export type FamilyMeetingFieldType = "text_input" | "single_select" | "rating_1_to_5" | "discussion";

export type NominationPromptCard = {
  prompt_id: string;
  phase: "nomination";
  target_role: Exclude<FamilyMeetingPromptRole, "Family">;
  question: string;
  field_type: FamilyMeetingFieldType;
  options?: string[];
};

export type NegotiationPromptCard = {
  prompt_id: string;
  phase: "negotiation";
  title: string;
  instruction: string;
  field_type: "discussion";
};

export type ReflectionPromptCard = {
  prompt_id: string;
  phase: "reflection";
  category: string;
  question: string;
  field_type: FamilyMeetingFieldType;
};

export type FamilyMeetingPromptCard = NominationPromptCard | NegotiationPromptCard | ReflectionPromptCard;

export type FamilyMeetingPromptLibrary = {
  nomination_prompts: NominationPromptCard[];
  negotiation_prompts: NegotiationPromptCard[];
  reflection_prompts: ReflectionPromptCard[];
};

export type FamilyMeetingSessionPayload = {
  family_id: string;
  week_number: number;
  nominations: {
    member_id: string;
    nominated_activity_id: string;
    prompt_responses: {
      prompt_id: string;
      response: string | number;
    }[];
  }[];
  negotiation_outcome: {
    agreed_activity_id: string;
    consensus_type: "Unanimous" | "Majority" | "Compromise" | "Deferred";
    carry_forward_activity_id?: string;
  };
  post_activity_reflection: {
    photo_url?: string;
    ratings: {
      overall_fun: number;
      communication_harmony: number;
    };
    family_quote: string;
  };
};

export type DeEscalationTool = {
  tool_id: string;
  name: string;
  trigger: "User Press or Timer Expiry" | "Deadlock Vote";
  prompt: string;
};

export type FamilyRewardBadge = {
  badge_id: string;
  title: string;
  description: string;
  date_unlocked: string;
};

export type FamilyTelemetryAlert = {
  alert_type: "POSITIVE_GROWTH" | "CIRCUIT_BREAKER" | "PHOTO_UPLOAD" | "BADGE_UNLOCKED";
  message: string;
  severity: "Info" | "Review" | "High";
};

export type FamilyApiEndpoint = {
  method: "GET" | "POST";
  endpoint: string;
  description: string;
};

export type ClinicianDashboardWidget = {
  widget_id: string;
  title: string;
  purpose: string;
};

export type FrontendFlowScreen = {
  screen: string;
  purpose: string;
};

export type FrontendFlow = {
  flow_id: "ChildFlow" | "ParentFlow" | "ClinicianDashboardFlow";
  audience: string;
  ux_mode: string;
  screens: FrontendFlowScreen[];
};

export type WeeklyMeetingStep = {
  step_id: string;
  title: string;
  timing: string;
  actions: string[];
};

export type SecurityGuardrail = {
  domain: string;
  technical_implementation: string;
  target_standard: string;
};

export type EngineeringRoadmapSprint = {
  sprint_id: string;
  timeframe: string;
  title: string;
  deliverables: string[];
};

export type FamilyMeetingFrontendPrivacyArchitecture = {
  title: "FamilyMeetingFrontendPrivacyArchitecture";
  version: "5.0.0";
  description: string;
  component_hierarchy: {
    app_root: "AppRoot";
    providers: string[];
    flows: FrontendFlow[];
  };
  weekly_meeting_ux_flow: WeeklyMeetingStep[];
  data_protection_security_architecture: SecurityGuardrail[];
  engineering_implementation_roadmap: EngineeringRoadmapSprint[];
};

export type FamilyReunificationSafetyAndRewardsEngine = {
  $schema: string;
  title: "FamilyReunificationSafetyAndRewardsEngine";
  version: "4.0.0";
  description: string;
  circuit_breaker_protocols: {
    consensus_timer_seconds: number;
    pause_reset_seconds: number;
    on_timeout_action: "TRIGGER_NEUTRAL_FALLBACK";
    safe_default_fallbacks: string[];
    de_escalation_tools: DeEscalationTool[];
  };
  gamification_and_rewards: {
    family_streaks: {
      current_weekly_streak: number;
      longest_weekly_streak: number;
      total_activities_completed: number;
      cycle_required_steps: ["Nominate", "Vote", "Reflection Photo"];
    };
    badges_earned: FamilyRewardBadge[];
    memory_book_generator: {
      total_photos_logged: number;
      auto_export_pdf_ready: boolean;
      next_milestone_target: string;
    };
  };
  case_manager_oversight_telemetry: {
    family_id: string;
    assigned_caseworker_id: string;
    current_program_stage: string;
    current_week_label: string;
    overall_health_score: number;
    consensus_rate_percent: number;
    flags_and_alerts: FamilyTelemetryAlert[];
    clinical_summary_export: {
      average_conflict_level: "Low" | "Moderate" | "High";
      most_frequent_decision_mode: "Unanimous" | "Compromise" | "Turn-Taking" | "Randomizer" | "Parent Override";
      child_satisfaction_score_avg: number;
      parent_satisfaction_score_avg: number;
      active_listening_score: number;
      parent_child_alignment_percent: number;
    };
  };
  clinician_dashboard_widgets: ClinicianDashboardWidget[];
  api_endpoint_architecture: FamilyApiEndpoint[];
  sample_weekly_consensus_payload: {
    family_id: string;
    week_number: number;
    agreed_activity_id: string;
    decision_method: "Unanimous" | "Compromise" | "Turn-Taking" | "Randomizer" | "Parent Override";
    carried_forward_activity_id?: string;
    timer_duration_seconds: number;
    circuit_breaker_triggered: boolean;
  };
  database_schema_blueprint: {
    table_name: string;
    purpose: string;
    key_fields: string[];
  }[];
  frontend_privacy_architecture: FamilyMeetingFrontendPrivacyArchitecture;
};

export const familyMeetingPromptAndReflectionEngine = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "FamilyMeetingPromptAndReflectionEngine",
  version: "3.1.0",
  description:
    "Interactive prompt card schema and discussion engine for family activity selection and communication tracking.",
  prompt_card_library: {
    nomination_prompts: [
      {
        prompt_id: "PRM-NOM-01",
        phase: "nomination",
        target_role: "Child",
        question: "What sounds most fun to you this weekend?",
        field_type: "text_input",
      },
      {
        prompt_id: "PRM-NOM-02",
        phase: "nomination",
        target_role: "Child",
        question: "Why do you think the family will enjoy doing this together?",
        field_type: "text_input",
      },
      {
        prompt_id: "PRM-NOM-03",
        phase: "nomination",
        target_role: "Child",
        question: "If we pick another activity this week, would you be open to doing this one next week?",
        field_type: "single_select",
        options: ["Yes", "Maybe", "Not this time"],
      },
      {
        prompt_id: "PRM-NOM-04",
        phase: "nomination",
        target_role: "Parent",
        question: "How does this activity support our family's energy level this weekend?",
        field_type: "single_select",
        options: ["Low Energy / Restful", "Balanced / Moderate", "High Energy / Active"],
      },
      {
        prompt_id: "PRM-NOM-05",
        phase: "nomination",
        target_role: "Parent",
        question: "What is one way this choice gives everyone a chance to participate?",
        field_type: "text_input",
      },
    ],
    negotiation_prompts: [
      {
        prompt_id: "PRM-NEG-01",
        phase: "negotiation",
        title: "Listening Card",
        instruction:
          "Before we vote, let's go around the circle: Each person shares one thing they like about someone else's choice.",
        field_type: "discussion",
      },
      {
        prompt_id: "PRM-NEG-02",
        phase: "negotiation",
        title: "Compromise Card",
        instruction:
          "If we choose [Activity A] this weekend, can we lock in [Activity B] for next weekend on our calendar?",
        field_type: "discussion",
      },
      {
        prompt_id: "PRM-NEG-03",
        phase: "negotiation",
        title: "Integration Card",
        instruction:
          "Can we add a fun idea from an unselected activity into the winning choice?",
        field_type: "discussion",
      },
    ],
    reflection_prompts: [
      {
        prompt_id: "PRM-REF-01",
        phase: "reflection",
        category: "Joy Check",
        question: "What was the funniest or most unexpected moment of our weekend?",
        field_type: "text_input",
      },
      {
        prompt_id: "PRM-REF-02",
        phase: "reflection",
        category: "Communication Check",
        question: "How did we do at listening to each other during this activity?",
        field_type: "rating_1_to_5",
      },
      {
        prompt_id: "PRM-REF-03",
        phase: "reflection",
        category: "Affirmation",
        question: "Who did something helpful or kind this weekend that made the activity better?",
        field_type: "text_input",
      },
    ],
  } satisfies FamilyMeetingPromptLibrary,
  sample_meeting_session_payload: {
    family_id: "FAM-1042",
    week_number: 14,
    nominations: [
      {
        member_id: "MEM-02",
        nominated_activity_id: "ACT-003",
        prompt_responses: [
          {
            prompt_id: "PRM-NOM-01",
            response: "I want to sing and have a dance-off with Maya!",
          },
        ],
      },
    ],
    negotiation_outcome: {
      agreed_activity_id: "ACT-003",
      consensus_type: "Unanimous",
      carry_forward_activity_id: "ACT-001",
    },
    post_activity_reflection: {
      photo_url: "https://storage.app.com/photos/fam1042_wk14.jpg",
      ratings: {
        overall_fun: 5,
        communication_harmony: 4,
      },
      family_quote: "We laughed so hard during the karaoke duets!",
    },
  } satisfies FamilyMeetingSessionPayload,
} as const;

export const familyReunificationSafetyAndRewardsEngine = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "FamilyReunificationSafetyAndRewardsEngine",
  version: "4.0.0",
  description:
    "De-escalation circuit breaker protocols, gamification reward mechanics, and case manager oversight data schema.",
  circuit_breaker_protocols: {
    consensus_timer_seconds: 600,
    pause_reset_seconds: 300,
    on_timeout_action: "TRIGGER_NEUTRAL_FALLBACK",
    safe_default_fallbacks: ["Family walk", "Movie night", "Jar of Surprise Activities"],
    de_escalation_tools: [
      {
        tool_id: "DE-01",
        name: "5-Minute Family Reset",
        trigger: "User Press or Timer Expiry",
        prompt:
          "Let's take 5 quiet minutes. Listen to the guided breathing audio together before speaking again.",
      },
      {
        tool_id: "DE-02",
        name: "The Coin Toss / Randomizer",
        trigger: "Deadlock Vote",
        prompt:
          "Both choices are great. Let the app pick randomly for this weekend, and the other choice will automatically happen next weekend.",
      },
    ],
  },
  gamification_and_rewards: {
    family_streaks: {
      current_weekly_streak: 8,
      longest_weekly_streak: 12,
      total_activities_completed: 24,
      cycle_required_steps: ["Nominate", "Vote", "Reflection Photo"],
    },
    badges_earned: [
      {
        badge_id: "BDG-01",
        title: "First Step Forward",
        description: "Completed Week 1 of Reunification.",
        date_unlocked: "2026-04-12",
      },
      {
        badge_id: "BDG-02",
        title: "Master Compromisers",
        description: "Reached consensus through compromise 5 times in a row.",
        date_unlocked: "2026-06-20",
      },
    ],
    memory_book_generator: {
      total_photos_logged: 24,
      auto_export_pdf_ready: true,
      next_milestone_target: "50 Photos (Hardcover Album Unlock)",
    },
  },
  case_manager_oversight_telemetry: {
    family_id: "FAM-1042",
    assigned_caseworker_id: "CW-882",
    current_program_stage: "Stage 3",
    current_week_label: "Week 14 of 78 (178 cumulative)",
    overall_health_score: 88,
    consensus_rate_percent: 85,
    flags_and_alerts: [
      {
        alert_type: "CIRCUIT_BREAKER",
        message: "2026-07-12: Circuit-breaker triggered by timer expiry and resolved through DE-02.",
        severity: "Review",
      },
      {
        alert_type: "PHOTO_UPLOAD",
        message: "2026-07-11: Weekly photo snapshot uploaded for activity ACT-003.",
        severity: "Info",
      },
      {
        alert_type: "BADGE_UNLOCKED",
        message: '2026-07-04: Badge unlocked: "Master Compromisers".',
        severity: "Info",
      },
      {
        alert_type: "POSITIVE_GROWTH",
        message: "Family communication rating increased by 35% over the past 4 weeks.",
        severity: "Info",
      },
    ],
    clinical_summary_export: {
      average_conflict_level: "Low",
      most_frequent_decision_mode: "Compromise",
      child_satisfaction_score_avg: 4.8,
      parent_satisfaction_score_avg: 4.6,
      active_listening_score: 4.2,
      parent_child_alignment_percent: 78,
    },
  },
  clinician_dashboard_widgets: [
    {
      widget_id: "WID-HEALTH",
      title: "Family Health and Engagement Scorecard",
      purpose: "Summarizes weekly completion streaks, consensus rates, and emotional safety ratings.",
    },
    {
      widget_id: "WID-DEESCALATION",
      title: "De-Escalation and Safety Monitor",
      purpose: "Flags pause resets, timer expiries, and neutral backup activity use for facilitator review.",
    },
    {
      widget_id: "WID-REFLECTION",
      title: "Qualitative Reflection Feed",
      purpose: "Surfaces Sunday uploads, family quotes, child and parent reflections, and weekly wins.",
    },
    {
      widget_id: "WID-EXPORT",
      title: "Court and Agency Progress Report",
      purpose: "Prepares objective growth metrics over 3, 6, or 12 months for human review before export.",
    },
  ],
  api_endpoint_architecture: [
    {
      method: "GET",
      endpoint: "/api/v1/activities/library",
      description: "Retrieves activity library filtered by stage, energy level, or tags.",
    },
    {
      method: "POST",
      endpoint: "/api/v1/sessions/nominate",
      description: "Submits a parent or child's individual activity choice and reason.",
    },
    {
      method: "POST",
      endpoint: "/api/v1/sessions/consensus",
      description: "Logs the final agreed activity, decision method, and carry-over picks.",
    },
    {
      method: "POST",
      endpoint: "/api/v1/sessions/circuit-breaker",
      description: "Triggers de-escalation protocols such as pause timer, neutral pick, or breathing reset.",
    },
    {
      method: "POST",
      endpoint: "/api/v1/sessions/reflection",
      description: "Submits Sunday reflection scores, quotes, and photo file links.",
    },
    {
      method: "GET",
      endpoint: "/api/v1/analytics/family/{family_id}",
      description: "Fetches clinical telemetry, communication scores, and badge progress.",
    },
  ],
  sample_weekly_consensus_payload: {
    family_id: "FAM-1042",
    week_number: 14,
    agreed_activity_id: "ACT-003",
    decision_method: "Compromise",
    carried_forward_activity_id: "ACT-001",
    timer_duration_seconds: 320,
    circuit_breaker_triggered: false,
  },
  database_schema_blueprint: [
    {
      table_name: "families",
      purpose: "Core family record with program, week, and assigned caseworker linkage.",
      key_fields: ["family_id", "family_name", "current_program_id", "current_week_number", "assigned_caseworker_id"],
    },
    {
      table_name: "family_members",
      purpose: "Parent, child, and guardian records scoped to one family.",
      key_fields: ["member_id", "family_id", "first_name", "role", "age"],
    },
    {
      table_name: "member_relationships",
      purpose: "Parent-child relationship mapping for reporting and privacy-aware views.",
      key_fields: ["relationship_id", "parent_id", "child_id"],
    },
    {
      table_name: "activity_library",
      purpose: "Master activity catalogue with energy, location, tags, plans, and photo challenge prompts.",
      key_fields: ["activity_id", "title", "energy_level", "location", "tags", "photo_challenge_prompt"],
    },
    {
      table_name: "weekly_sessions",
      purpose: "Weekly consensus log with decision method, chosen activity, and circuit-breaker use.",
      key_fields: ["session_id", "family_id", "week_number", "agreed_activity_id", "decision_method", "circuit_breaker_used"],
    },
    {
      table_name: "session_reflections",
      purpose: "Sunday reflection media and communication scores linked to a weekly session.",
      key_fields: ["reflection_id", "session_id", "photo_url", "active_listening_score", "harmony_score", "family_quote"],
    },
  ],
  frontend_privacy_architecture: {
    title: "FamilyMeetingFrontendPrivacyArchitecture",
    version: "5.0.0",
    description:
      "Frontend component tree, weekly navigation flow, privacy guardrails, and implementation roadmap for family meeting delivery.",
    component_hierarchy: {
      app_root: "AppRoot",
      providers: ["AuthProvider (RBAC and session management)", "Expo Router navigation stack"],
      flows: [
        {
          flow_id: "ChildFlow",
          audience: "Child or young person",
          ux_mode: "Simplified, high-visual, gamified UX",
          screens: [
            {
              screen: "ActivityDiscovery",
              purpose: "Browse activity library by energy level, stage, and tags.",
            },
            {
              screen: "NominationCard",
              purpose: "Submit one preferred activity and a short reason.",
            },
            {
              screen: "FamilyVoteRoom",
              purpose: "Participate in shared family council prompts without seeing clinical notes.",
            },
            {
              screen: "SundayMemoryCapture",
              purpose: "Upload or review a family-safe memory photo and simple reflection.",
            },
          ],
        },
        {
          flow_id: "ParentFlow",
          audience: "Parent or guardian",
          ux_mode: "Full family control and guided support UX",
          screens: [
            {
              screen: "StageOverview",
              purpose: "Show current program week, goals, and family meeting readiness.",
            },
            {
              screen: "MeetingFacilitator",
              purpose: "Run timer, prompt cards, pause reset, and circuit-breaker tools.",
            },
            {
              screen: "FamilyVoteRoom",
              purpose: "Log consensus outcome and carry-over picks.",
            },
            {
              screen: "ReflectionEntry",
              purpose: "Submit scores, notes, quote, and photo reference after the activity.",
            },
          ],
        },
        {
          flow_id: "ClinicianDashboardFlow",
          audience: "Case manager, clinician, or family court supervisor",
          ux_mode: "Professional oversight UX with privacy-aware summaries",
          screens: [
            {
              screen: "CaseloadOverview",
              purpose: "List assigned families and review priority indicators.",
            },
            {
              screen: "FamilyTelemetryDetail",
              purpose: "Review trends, circuit-breaker flags, and objective progress metrics.",
            },
            {
              screen: "CourtReportGenerator",
              purpose: "Prepare PDF progress exports for human review before sharing.",
            },
          ],
        },
      ],
    },
    weekly_meeting_ux_flow: [
      {
        step_id: "STEP-01",
        title: "Individual Nominations",
        timing: "Friday or Saturday morning",
        actions: [
          "Parent and linked children use their personal views.",
          "Browse Activity Library.",
          "Select preferred activity.",
          "Enter a short reason using role-appropriate prompt cards.",
        ],
      },
      {
        step_id: "STEP-02",
        title: "Sunday Family Council",
        timing: "15-minute live voting session",
        actions: [
          "Display nominated choices side by side.",
          "Use negotiation prompt cards to guide discussion.",
          "Run 10-minute consensus timer.",
          "Trigger circuit-breaker if timer expires or Pause and Reset is pressed.",
        ],
      },
      {
        step_id: "STEP-03",
        title: "Consensus and Carry-Over Selection",
        timing: "After voting",
        actions: [
          "Lock in winning activity.",
          "Record decision method.",
          "Queue unselected nominations for upcoming weekends.",
        ],
      },
      {
        step_id: "STEP-04",
        title: "Activity Execution and Memory Logging",
        timing: "Sunday afternoon or evening",
        actions: [
          "Complete the family activity.",
          "Upload photo snapshot.",
          "Answer two reflection ratings.",
          "Update streak, badges, and memory book readiness.",
        ],
      },
    ],
    data_protection_security_architecture: [
      {
        domain: "Data Encryption",
        technical_implementation: "Encrypt sensitive media at rest where supported; use TLS for network traffic.",
        target_standard: "HIPAA and SOC 2 aligned control target",
      },
      {
        domain: "Child Privacy",
        technical_implementation: "No public indexing, no third-party ad tracking, anonymized telemetry, and no child access to clinical notes.",
        target_standard: "COPPA-aligned privacy target",
      },
      {
        domain: "Role-Based Access",
        technical_implementation: "RBAC separates child, parent, facilitator, clinician, and case manager views.",
        target_standard: "Enterprise RBAC target",
      },
      {
        domain: "Multi-Tenancy",
        technical_implementation: "Database Row-Level Security should isolate family tenants and assigned-worker access.",
        target_standard: "Data isolation target",
      },
      {
        domain: "Audit Logging",
        technical_implementation: "Log case manager access, exports, and status changes in an append-only audit trail.",
        target_standard: "Court-aware auditability target",
      },
    ],
    engineering_implementation_roadmap: [
      {
        sprint_id: "SPRINT-01",
        timeframe: "Weeks 1-4",
        title: "Core Engine and Database",
        deliverables: [
          "Provision PostgreSQL schema and API endpoints.",
          "Ingest initial Activity Library.",
          "Add five program stage definitions.",
        ],
      },
      {
        sprint_id: "SPRINT-02",
        timeframe: "Weeks 5-8",
        title: "Family App and Selection Workflow",
        deliverables: [
          "Build nomination, voting, and photo capture screens.",
          "Integrate prompt card engine.",
          "Implement consensus decision logic.",
        ],
      },
      {
        sprint_id: "SPRINT-03",
        timeframe: "Weeks 9-10",
        title: "Safety Circuit-Breakers and Gamification",
        deliverables: [
          "Build de-escalation timers.",
          "Add Pause and Reset modal and randomizer fallback.",
          "Implement streak tracking, badge unlocks, and memory album generator.",
        ],
      },
      {
        sprint_id: "SPRINT-04",
        timeframe: "Weeks 11-12",
        title: "Clinician Dashboard and Security Audit",
        deliverables: [
          "Launch case manager UI with growth analytics.",
          "Add PDF progress export preparation.",
          "Complete security testing and beta review.",
        ],
      },
    ],
  },
} satisfies FamilyReunificationSafetyAndRewardsEngine;

export function getAllFamilyMeetingPromptCards() {
  const library = familyMeetingPromptAndReflectionEngine.prompt_card_library;
  return [
    ...library.nomination_prompts,
    ...library.negotiation_prompts,
    ...library.reflection_prompts,
  ] satisfies FamilyMeetingPromptCard[];
}

export function getFamilyMeetingPromptCardsByPhase(phase: FamilyMeetingPromptCard["phase"]) {
  return getAllFamilyMeetingPromptCards().filter((card) => card.phase === phase);
}

export function getNominationPromptCardsForRole(role: NominationPromptCard["target_role"]) {
  return familyMeetingPromptAndReflectionEngine.prompt_card_library.nomination_prompts.filter(
    (card) => card.target_role === role,
  );
}

export function getCircuitBreakerTools() {
  return familyReunificationSafetyAndRewardsEngine.circuit_breaker_protocols.de_escalation_tools;
}

export function getClinicianDashboardWidgets() {
  return familyReunificationSafetyAndRewardsEngine.clinician_dashboard_widgets;
}

export function getFamilyMeetingApiEndpoints() {
  return familyReunificationSafetyAndRewardsEngine.api_endpoint_architecture;
}

export function getFamilyMeetingFrontendFlows() {
  return familyReunificationSafetyAndRewardsEngine.frontend_privacy_architecture.component_hierarchy.flows;
}

export function getWeeklyMeetingUxSteps() {
  return familyReunificationSafetyAndRewardsEngine.frontend_privacy_architecture.weekly_meeting_ux_flow;
}

export function getFamilyMeetingSecurityGuardrails() {
  return familyReunificationSafetyAndRewardsEngine.frontend_privacy_architecture.data_protection_security_architecture;
}

export function getFamilyMeetingImplementationRoadmap() {
  return familyReunificationSafetyAndRewardsEngine.frontend_privacy_architecture.engineering_implementation_roadmap;
}
