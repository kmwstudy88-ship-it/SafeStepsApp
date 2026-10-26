export type ScenarioCategory =
  | "parenting_response"
  | "safety_protective_capacity"
  | "co_parenting_relationship"
  | "emotional_regulation"
  | "communication_skill"
  | "daily_routine_structure"
  | "behaviour_guidance"
  | "trauma_informed_parenting"
  | "self_reflection_growth"
  | "life_skills_executive_function";

export type ScenarioDimension =
  | "protective_capacity"
  | "emotional_regulation"
  | "communication"
  | "emotional_safety"
  | "boundary_respect"
  | "repair_accountability"
  | "routine_stability"
  | "boundary_strength"
  | "conflict_risk"
  | "consistency";

export type ShareAudience = "private" | "parent" | "caseworker" | "both";

export type ScenarioStep =
  | {
      step_id: string;
      type: "reflection" | "behaviour" | "observation" | "skill_practice";
      prompt: string;
      response_type: "text" | "rating" | "checklist";
    }
  | {
      step_id: string;
      type: "decision";
      prompt: string;
      options: {
        option_id: string;
        label: string;
        score_impact: Partial<Record<ScenarioDimension, number>>;
        safety_flag?: "none" | "amber" | "red";
      }[];
    };

export type ScenarioModule = {
  module_id: string;
  category: ScenarioCategory;
  type: string;
  title: string;
  description: string;
  tags: string[];
  level: "core" | "advanced" | "reunification";
  scenario: {
    context: string;
    actors: string[];
    risk_level: "low" | "medium" | "high";
    goals: string[];
  };
  steps: ScenarioStep[];
  assessment: {
    dimensions: ScenarioDimension[];
    scoring_profile: string;
  };
};

export type TaskModule = {
  task_id: string;
  category: "reflection" | "decision" | "behaviour" | "observation" | "skill_building";
  title: string;
  description: string;
  instructions: string;
  response_type: "text" | "rating" | "checklist" | "evidence_upload";
  scoring_profile: string;
  outcomes: string[];
  evidence_required: boolean;
};

export type CurriculumScenarioBlock = {
  block_id: string;
  title: string;
  sequence: {
    module_ref: string;
    position: number;
    mode: "scenario" | "reflection" | "task";
  }[];
  outcomes: string[];
  delivery: {
    format: "self-paced" | "facilitated" | "hybrid";
    estimated_duration_minutes: number;
  };
};

export type ScoringProfile = {
  profile_id: string;
  dimensions: {
    name: ScenarioDimension;
    range: { min: number; max: number };
    description: string;
  }[];
  mapping_rules: {
    module_id: string;
    step_id: string;
    option_id: string;
    dimension_impacts: Partial<Record<ScenarioDimension, number>>;
  }[];
};

export type ContactProgressionModule = {
  contact_module_id: string;
  title: string;
  stage: number;
  requirements: string[];
  activities: {
    activity_id: string;
    description: string;
    observation_points: string[];
  }[];
  assessment: {
    dimensions: ScenarioDimension[];
    scoring_profile: string;
  };
  next_stage_conditions: string[];
};

export type WorkshopModule = {
  workshop_id: string;
  title: string;
  duration_minutes: number;
  sections: {
    section_id: string;
    type: "facilitator_intro" | "scenario" | "discussion" | "roleplay" | "reflection";
    content?: string;
    module_ref?: string;
    prompt?: string;
    instructions?: string;
  }[];
  outcomes: string[];
};

export type FacilitatorScript = {
  script_id: string;
  title: string;
  segments: {
    segment_id: string;
    purpose: string;
    script: string;
    facilitator_notes: string[];
  }[];
};

export type AutomationPipelineBlueprint = {
  pipeline_id: string;
  trigger: "lesson_completed" | "scenario_completed" | "task_completed" | "contact_logged";
  actions: string[];
  evidence_target: "assessment_records" | "quest_progress" | "contact_progression";
};

export type AchievementBadgeModule = {
  achievement_id: string;
  title: string;
  description: string;
  criteria: (
    | {
        criterion_id: string;
        type: "module_completion";
        modules_required: string[];
      }
    | {
        criterion_id: string;
        type: "scoring";
        dimension: ScenarioDimension;
        min_score: number;
      }
  )[];
  rewards: {
    unlock_modules: string[];
    display_badge: boolean;
  };
};

export type MiniQuestModule = {
  miniquest_id: string;
  title: string;
  steps: {
    step_id: string;
    type: "scenario" | "task" | "skill_practice" | "reflection";
    module_ref?: string;
    task_ref?: string;
    instructions?: string;
    prompt?: string;
  }[];
  completion_rules: {
    required_steps: string[];
    auto_award_achievement?: string;
  };
};

export type FullProgramSequenceTemplate = {
  program_id: string;
  title: string;
  weeks: {
    week: number;
    modules: string[];
  }[];
  completion_rules: {
    required_weeks: number;
    required_achievements: string[];
    auto_generate_certificate: boolean;
  };
};

export type ChildModule = {
  child_module_id: string;
  title: string;
  description: string;
  age_range: string;
  components: {
    component_id: string;
    type: "story" | "activity" | "reflection" | "scenario";
    title?: string;
    content?: string;
    instructions?: string;
    prompt?: string;
    module_ref?: string;
  }[];
  outcomes: string[];
  completion_rules: {
    required_components: string[];
    auto_unlock_next: boolean;
  };
  privacy: "child_private_by_default";
};

export type ChildSafetyScenarioModule = {
  child_scenario_id: string;
  title: string;
  age_range: string;
  scenario: {
    context: string;
    actors: string[];
    goals: string[];
  };
  steps: (
    | {
        step_id: string;
        type: "reflection";
        prompt: string;
      }
    | {
        step_id: string;
        type: "decision";
        prompt: string;
        options: {
          option_id: string;
          label: string;
          child_safety_score: number;
          safety_flag?: "none" | "review" | "urgent";
        }[];
      }
  )[];
  outcomes: string[];
  sharing_default: "private";
};

export type MultiLocationServiceModule = {
  service_module_id: string;
  title: string;
  locations: {
    location_id: string;
    name: string;
    delivery_mode: "in-person" | "hybrid" | "online";
  }[];
  modules: string[];
  scheduling_rules: {
    sync_progress_across_locations: boolean;
    allow_location_specific_variations: boolean;
  };
  reporting: {
    generate_location_reports: boolean;
    aggregate_to_central_dashboard: boolean;
  };
};

export type DocumentIntelligenceExtractionTemplate = {
  di_template_id: string;
  title: string;
  fields: {
    field_id: string;
    label: string;
    type: "list" | "text" | "score";
    extraction_rules: string[];
  }[];
  scoring_rules: Record<string, {
    positive_indicators: string[];
    negative_indicators: string[];
  }>;
};

export type MultiStageProgressionMap = {
  progression_map_id: string;
  title: string;
  stages: {
    stage: number;
    label: string;
    requirements: string[];
    outcomes: string[];
  }[];
  advancement_rules: {
    condition: string;
    action: string;
  }[];
};

export type FullSystemIntegrationBlueprint = {
  integration_blueprint_id: string;
  title: string;
  systems: {
    system: string;
    inputs: string[];
    outputs: string[];
  }[];
  data_flow: {
    from: string;
    to: string;
  }[];
  automation_rules: string[];
};

export type AdvancedCoparentingModule = {
  coparenting_module_id: string;
  title: string;
  description: string;
  components: {
    component_id: string;
    type: "education" | "scenario" | "decision_tree" | "practice";
    content?: string;
    module_ref?: string;
    tree_ref?: string;
    instructions?: string;
  }[];
  outcomes: string[];
  completion_rules: {
    required_components: string[];
    auto_unlock_next: boolean;
  };
};

export type MultiScenarioDecisionTree = {
  decision_tree_id: string;
  title: string;
  root: string;
  nodes: {
    node_id: string;
    prompt: string;
    options: {
      option_id: string;
      label: string;
      next: string;
      impact?: Partial<Record<ScenarioDimension, number>>;
    }[];
  }[];
  endings: Record<string, {
    summary: string;
    scores: Partial<Record<ScenarioDimension, number>>;
  }>;
};

export type BehaviourChangeInterventionModule = {
  intervention_id: string;
  title: string;
  description: string;
  phases: {
    phase_id: string;
    label: string;
    tasks: string[];
  }[];
  measurement: {
    dimensions: ScenarioDimension[];
    scoring_profile: string;
  };
  completion_rules: {
    required_phases: string[];
    auto_award_achievement?: string;
  };
};

export type MultiChildFamilyModule = {
  multi_child_module_id: string;
  title: string;
  description: string;
  children_profiles: {
    child_id: string;
    age: number;
    needs: ScenarioDimension[];
  }[];
  components: {
    component_id: string;
    type: "scenario" | "task";
    module_ref?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type IntergenerationalPatternModule = {
  intergen_module_id: string;
  title: string;
  description: string;
  components: {
    component_id: string;
    type: "reflection" | "scenario" | "task";
    prompt?: string;
    module_ref?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type HighRiskSafetyEscalationMap = {
  escalation_map_id: string;
  title: string;
  levels: {
    level: number;
    label: string;
    indicators: string[];
    actions: string[];
  }[];
  integration: {
    links_to: string[];
  };
};

export type FamilySystemDynamicsModule = {
  family_system_module_id: string;
  title: string;
  description: string;
  components: {
    component_id: string;
    type: "mapping" | "scenario" | "task";
    instructions?: string;
    module_ref?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type AdvancedBehaviourAnalyticsModule = {
  analytics_module_id: string;
  title: string;
  description: string;
  inputs: string[];
  analysis: {
    detect_patterns: boolean;
    predict_escalation: boolean;
    flag_inconsistencies: boolean;
  };
  outputs: string[];
};

export type CrossModuleOrchestrationMap = {
  orchestration_map_id: string;
  title: string;
  links: {
    from: string;
    to: string;
  }[];
  global_rules: string[];
};

export type HighComplexityFamilyInterventionModule = {
  family_intervention_id: string;
  title: string;
  description: string;
  domains: string[];
  components: {
    component_id: string;
    type: "scenario" | "assessment" | "intervention_task";
    module_ref?: string;
    assessment_ref?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
  integration: {
    links_to: string[];
  };
};

export type MultiDomainRiskMatrixModule = {
  risk_matrix_id: string;
  title: string;
  domains: {
    domain_id: string;
    label: string;
    indicators: string[];
    scale: { min: number; max: number };
  }[];
  scoring_rules: {
    high_risk_threshold: number;
    auto_flag_domains: boolean;
    auto_assign_interventions: boolean;
  };
  outputs: string[];
};

export type LongFormTherapeuticJourneyMap = {
  journey_map_id: string;
  title: string;
  phases: {
    phase: number;
    label: string;
    duration_weeks: number;
    modules: string[];
  }[];
  completion_rules: {
    required_phases: number[];
    auto_generate_summary: boolean;
  };
};

export type CrossAgencyCollaborationModule = {
  collab_module_id: string;
  title: string;
  agencies: string[];
  components: {
    component_id: string;
    type: "information_exchange" | "alignment_meeting";
    instructions: string;
  }[];
  outcomes: string[];
};

export type ProfessionalReportingTemplate = {
  report_template_id: string;
  title: string;
  sections: string[];
  extraction_rules: {
    auto_pull_from_DI_engine: boolean;
    auto_insert_scores: boolean;
  };
};

export type MultiTierCaseManagementMap = {
  case_map_id: string;
  title: string;
  tiers: {
    tier: number;
    label: string;
    requirements: string[];
  }[];
  movement_rules: {
    auto_escalate_on_risk: boolean;
    auto_deescalate_on_progress: boolean;
  };
};

export type CulturalSafetyModule = {
  cultural_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "education" | "scenario";
    content?: string;
    module_ref?: string;
  }[];
  outcomes: string[];
};

export type DisabilityInclusiveParentingModule = {
  disability_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "education" | "task";
    content?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type NeurodiversitySupportModule = {
  neuro_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "education" | "scenario";
    content?: string;
    module_ref?: string;
  }[];
  outcomes: string[];
};

export type EnvironmentalStressorModule = {
  env_module_id: string;
  title: string;
  stressors: string[];
  tasks: string[];
  outcomes: string[];
};

export type ComplexBehaviourLoopModule = {
  behaviour_loop_id: string;
  title: string;
  loops: {
    loop_id: string;
    trigger: string;
    parent_response: string;
    child_reaction: string;
    outcome: string;
  }[];
  intervention_points: string[];
};

export type ParentCapacityGrowthTracker = {
  growth_tracker_id: string;
  title: string;
  dimensions: string[];
  tracking_rules: {
    auto_pull_scores: boolean;
    auto_generate_trends: boolean;
  };
};

export type SystemHealthDiagnosticModule = {
  system_diagnostic_id: string;
  title: string;
  checks: string[];
  outputs: string[];
};

export type HighRiskContactSessionModule = {
  contact_session_id: string;
  title: string;
  risk_factors: string[];
  components: {
    component_id: string;
    type: "observation" | "intervention";
    assessment_ref?: string;
    instructions?: string;
  }[];
  outcomes: string[];
};

export type ParentChildRepairCycleModule = {
  repair_cycle_id: string;
  title: string;
  steps: string[];
  tasks: string[];
  outcomes: string[];
};

export type MultiAdultHouseholdSafetyModule = {
  household_safety_id: string;
  title: string;
  adults: string[];
  risk_checks: string[];
  outcomes: string[];
};

export type AdvancedCommunicationBreakdownModule = {
  comm_breakdown_id: string;
  title: string;
  patterns: string[];
  interventions: string[];
  outcomes: string[];
};

export type EmotionalLoadDistributionModule = {
  load_distribution_id: string;
  title: string;
  domains: string[];
  tasks: string[];
  outcomes: string[];
};

export type ComplexTriggerChainModule = {
  trigger_chain_id: string;
  title: string;
  chain: string[];
  intervention_points: string[];
  outcomes: string[];
};

export type ParentIdentityReconstructionModule = {
  identity_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "reflection" | "task";
    prompt?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type ChildResilienceBuildingModule = {
  child_resilience_id: string;
  title: string;
  components: {
    component_id: string;
    type: "activity" | "scenario";
    instructions?: string;
    module_ref?: string;
  }[];
  outcomes: string[];
};

export type MultiFactorStabilityIndexModule = {
  stability_index_id: string;
  title: string;
  factors: string[];
  scoring_rules: {
    auto_generate_index: boolean;
    thresholds: {
      stable: number;
      moderate: number;
      unstable: number;
    };
  };
  outputs: string[];
};

export type FullFamilyReintegrationBlueprint = {
  reintegration_blueprint_id: string;
  title: string;
  phases: {
    phase: number;
    label: string;
    modules: string[];
  }[];
  completion_rules: {
    required_phases: number[];
    auto_generate_reintegration_report: boolean;
  };
};

export type InterSiblingRelationshipModule = {
  sibling_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "scenario" | "task";
    module_ref?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type ParentStressLoadCompressionModule = {
  stress_module_id: string;
  title: string;
  domains: string[];
  tasks: string[];
  outcomes: string[];
};

export type ChildEmotionalExpansionModule = {
  child_emotion_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "activity" | "scenario";
    instructions?: string;
    module_ref?: string;
  }[];
  outcomes: string[];
};

export type HighIntensityTriggerResponseModule = {
  trigger_response_id: string;
  title: string;
  steps: string[];
  tasks: string[];
  outcomes: string[];
};

export type ParentCognitiveReframeModule = {
  cognitive_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "reflection" | "task";
    prompt?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type ChildBehaviourStabilizationModule = {
  child_stability_id: string;
  title: string;
  components: {
    component_id: string;
    type: "scenario" | "task";
    module_ref?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type ParentEmotionalAnchoringModule = {
  anchor_module_id: string;
  title: string;
  steps: string[];
  tasks: string[];
  outcomes: string[];
};

export type ChildPredictabilityRoutineModule = {
  routine_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "activity" | "scenario";
    instructions?: string;
    module_ref?: string;
  }[];
  outcomes: string[];
};

export type ParentChildEmotionalSynchronyModule = {
  synchrony_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "education" | "practice";
    content?: string;
    instructions?: string;
  }[];
  outcomes: string[];
};

export type FamilyEmotionalClimateModule = {
  climate_module_id: string;
  title: string;
  domains: string[];
  tasks: string[];
  outcomes: string[];
};

export type ParentChildCoregulationLoopModule = {
  coreg_loop_id: string;
  title: string;
  steps: string[];
  tasks: string[];
  outcomes: string[];
};

export type HighConflictCoparentingDeescalationModule = {
  coparent_deescalation_id: string;
  title: string;
  patterns: string[];
  interventions: string[];
  outcomes: string[];
};

export type ChildTraumaSignalRecognitionModule = {
  trauma_signal_id: string;
  title: string;
  signals: string[];
  tasks: string[];
  outcomes: string[];
};

export type ParentEmotionalCompressionReleaseModule = {
  compression_release_id: string;
  title: string;
  steps: string[];
  tasks: string[];
  outcomes: string[];
};

export type ChildSocialSafetyModule = {
  child_social_safety_id: string;
  title: string;
  domains: string[];
  tasks: string[];
  outcomes: string[];
};

export type ParentBehaviourResetProtocolModule = {
  reset_protocol_id: string;
  title: string;
  steps: string[];
  tasks: string[];
  outcomes: string[];
};

export type ChildEmotionalBoundaryModule = {
  child_boundary_id: string;
  title: string;
  components: {
    component_id: string;
    type: "education" | "activity";
    content?: string;
    instructions?: string;
  }[];
  outcomes: string[];
};

export type ParentSelfTrustReconstructionModule = {
  selftrust_module_id: string;
  title: string;
  components: {
    component_id: string;
    type: "reflection" | "task";
    prompt?: string;
    task_ref?: string;
  }[];
  outcomes: string[];
};

export type ChildEmotionalPatternStabilizerModule = {
  pattern_stabilizer_id: string;
  title: string;
  patterns: string[];
  tasks: string[];
  outcomes: string[];
};

export type FamilyEmotionalArchitectureModule = {
  architecture_module_id: string;
  title: string;
  domains: string[];
  tasks: string[];
  outcomes: string[];
};

const coreScenarioSeeds: Array<Pick<ScenarioModule, "category" | "type" | "title" | "description" | "tags" | "level" | "scenario">> = [
  {
    category: "parenting_response",
    type: "meltdown_response",
    title: "Responding to a Child Meltdown",
    description: "Scenario where a parent responds to a child's intense meltdown.",
    tags: ["emotion", "regulation", "parenting", "safety"],
    level: "core",
    scenario: {
      context: "Child has a loud meltdown in a supermarket.",
      actors: ["parent", "child", "bystanders"],
      risk_level: "medium",
      goals: ["Maintain safety", "Model regulation", "Protect relationship"],
    },
  },
  {
    category: "safety_protective_capacity",
    type: "child_disclosure_response",
    title: "Responding to a Child Disclosure",
    description: "Parent practises a calm, protective response when a child discloses possible harm.",
    tags: ["safety", "disclosure", "protective-capacity"],
    level: "reunification",
    scenario: {
      context: "Child says an adult made them uncomfortable and asks the parent not to tell anyone.",
      actors: ["parent", "child", "safe adult"],
      risk_level: "high",
      goals: ["Believe and reassure the child", "Avoid interrogation", "Activate safety and reporting steps"],
    },
  },
  {
    category: "co_parenting_relationship",
    type: "discipline_disagreement",
    title: "Disagreement About Discipline",
    description: "Parent chooses a boundaried response during a discipline disagreement.",
    tags: ["co-parenting", "boundaries", "communication"],
    level: "core",
    scenario: {
      context: "Co-parent criticises the parent's routine in front of the child.",
      actors: ["parent", "co-parent", "child"],
      risk_level: "medium",
      goals: ["Avoid triangulation", "Use calm boundaries", "Protect the child from adult conflict"],
    },
  },
  {
    category: "emotional_regulation",
    type: "triggered_by_child_behaviour",
    title: "Regulating Before Responding",
    description: "Parent notices activation and chooses a safe pause before responding.",
    tags: ["trigger", "grounding", "repair"],
    level: "core",
    scenario: {
      context: "Child shouts that they do not want to see the parent.",
      actors: ["parent", "child", "facilitator"],
      risk_level: "medium",
      goals: ["Regulate first", "Avoid retaliation", "Make room for the child's feeling"],
    },
  },
  {
    category: "communication_skill",
    type: "reflective_responding",
    title: "Reflective Responding Practice",
    description: "Parent practises active listening and reflective language.",
    tags: ["listening", "communication", "repair"],
    level: "core",
    scenario: {
      context: "Child says they feel ignored when the parent checks their phone.",
      actors: ["parent", "child"],
      risk_level: "low",
      goals: ["Reflect the feeling", "Own the impact", "Invite repair"],
    },
  },
  {
    category: "daily_routine_structure",
    type: "bedtime_routine_planning",
    title: "Bedtime Routine Planning",
    description: "Parent builds a predictable and calm bedtime response.",
    tags: ["routine", "structure", "transition"],
    level: "core",
    scenario: {
      context: "Child refuses bedtime and keeps leaving the bedroom.",
      actors: ["parent", "child"],
      risk_level: "low",
      goals: ["Keep routine predictable", "Avoid threats", "Support transition"],
    },
  },
  {
    category: "behaviour_guidance",
    type: "logical_consequence",
    title: "Logical Consequence Practice",
    description: "Parent chooses a respectful consequence tied to the behaviour.",
    tags: ["behaviour", "consequences", "teaching"],
    level: "core",
    scenario: {
      context: "Child breaks a house rule during screen time.",
      actors: ["parent", "child"],
      risk_level: "low",
      goals: ["Teach replacement behaviour", "Use proportionate consequences", "Keep connection intact"],
    },
  },
  {
    category: "trauma_informed_parenting",
    type: "trauma_trigger_response",
    title: "Responding to Trauma Triggers",
    description: "Parent responds to fear-based behaviour with emotional safety.",
    tags: ["trauma-informed", "safety", "co-regulation"],
    level: "reunification",
    scenario: {
      context: "Child freezes and hides when voices get loud nearby.",
      actors: ["parent", "child", "other adult"],
      risk_level: "medium",
      goals: ["Reduce stimulation", "Offer choice", "Rebuild felt safety"],
    },
  },
  {
    category: "self_reflection_growth",
    type: "identifying_personal_triggers",
    title: "Identifying Personal Triggers",
    description: "Parent maps patterns that affect their parenting response.",
    tags: ["reflection", "growth", "accountability"],
    level: "core",
    scenario: {
      context: "Parent reviews a recent moment where they felt overwhelmed or reactive.",
      actors: ["parent", "support worker"],
      risk_level: "low",
      goals: ["Name the trigger", "Connect body cues", "Plan a safer next response"],
    },
  },
  {
    category: "life_skills_executive_function",
    type: "weekly_task_planning",
    title: "Weekly Task Planning",
    description: "Parent prioritises appointments, child routines, and evidence tasks.",
    tags: ["planning", "stability", "executive-function"],
    level: "core",
    scenario: {
      context: "Parent has a contact visit, housing appointment, and school meeting in the same week.",
      actors: ["parent", "caseworker", "child"],
      risk_level: "low",
      goals: ["Plan ahead", "Use reminders", "Protect child commitments"],
    },
  },
];

function moduleIdFor(seed: (typeof coreScenarioSeeds)[number], index: number) {
  return `${seed.category}_${seed.type}_${String(index + 1).padStart(2, "0")}`;
}

function buildScenarioModule(seed: (typeof coreScenarioSeeds)[number], index: number): ScenarioModule {
  return {
    module_id: moduleIdFor(seed, index),
    ...seed,
    steps: [
      {
        step_id: "step_reflect",
        type: "reflection",
        prompt: "What is happening for you emotionally in this moment?",
        response_type: "text",
      },
      {
        step_id: "step_decide",
        type: "decision",
        prompt: "How do you respond?",
        options: [
          {
            option_id: "unsafe_reactive",
            label: "React quickly with blame, pressure, or a demand for immediate compliance.",
            score_impact: { protective_capacity: -2, emotional_regulation: -2, communication: -1 },
            safety_flag: seed.scenario.risk_level === "high" ? "red" : "amber",
          },
          {
            option_id: "safe_regulated",
            label: "Pause, reduce pressure, use calm language, and choose the next safest step.",
            score_impact: { protective_capacity: 2, emotional_regulation: 3, communication: 2 },
            safety_flag: "none",
          },
        ],
      },
      {
        step_id: "step_repair",
        type: "skill_practice",
        prompt: "What repair or follow-up action would show safety, accountability, and respect?",
        response_type: "text",
      },
    ],
    assessment: {
      dimensions: ["protective_capacity", "emotional_regulation", "communication"],
      scoring_profile: seed.category === "safety_protective_capacity" ? "protective_capacity_safety_v1" : "standard_parenting_response_v1",
    },
  };
}

export const scenarioModules: ScenarioModule[] = coreScenarioSeeds.map(buildScenarioModule);

export const taskModules: TaskModule[] = [
  {
    task_id: "task_reflection_triggers_01",
    category: "reflection",
    title: "Identify Personal Triggers",
    description: "A reflection task to help parents identify emotional triggers.",
    instructions: "Reflect on moments where you felt overwhelmed or reactive and name one safer response plan.",
    response_type: "text",
    scoring_profile: "reflection_growth_v1",
    outcomes: ["Increased self-awareness", "Improved emotional regulation", "Better parenting decision-making"],
    evidence_required: true,
  },
  {
    task_id: "task_observation_child_comfort_01",
    category: "observation",
    title: "Observe Child Comfort Cues",
    description: "A structured observation task for noticing child comfort during contact or routines.",
    instructions: "Record observable cues only, then separate your interpretation from what was directly seen or heard.",
    response_type: "evidence_upload",
    scoring_profile: "contact_progression_v1",
    outcomes: ["Improved attunement", "Clearer evidence records", "Better contact planning"],
    evidence_required: true,
  },
];

export const scoringProfiles: ScoringProfile[] = [
  {
    profile_id: "standard_parenting_response_v1",
    dimensions: [
      {
        name: "protective_capacity",
        range: { min: -5, max: 5 },
        description: "Ability to make decisions that keep the child safe.",
      },
      {
        name: "emotional_regulation",
        range: { min: -5, max: 5 },
        description: "Ability to regulate emotions before and during response.",
      },
      {
        name: "communication",
        range: { min: -5, max: 5 },
        description: "Use of calm, clear, non-harmful communication.",
      },
    ],
    mapping_rules: scenarioModules.flatMap((module) =>
      module.steps.flatMap((step) =>
        step.type === "decision"
          ? step.options.map((option) => ({
              module_id: module.module_id,
              step_id: step.step_id,
              option_id: option.option_id,
              dimension_impacts: option.score_impact,
            }))
          : [],
      ),
    ),
  },
  {
    profile_id: "protective_capacity_safety_v1",
    dimensions: [
      {
        name: "protective_capacity",
        range: { min: -5, max: 5 },
        description: "Identifies risk, believes the child, and activates safe next steps.",
      },
      {
        name: "emotional_safety",
        range: { min: -5, max: 5 },
        description: "Maintains child emotional safety while responding to risk.",
      },
      {
        name: "communication",
        range: { min: -5, max: 5 },
        description: "Uses clear language without interrogation, blame, or coercion.",
      },
    ],
    mapping_rules: [],
  },
];

export const curriculumScenarioBlocks: CurriculumScenarioBlock[] = [
  {
    block_id: "curriculum_parenting_response_core",
    title: "Core Parenting Response Scenarios",
    sequence: [
      { module_ref: "parenting_response_meltdown_response_01", position: 1, mode: "scenario" },
      { module_ref: "daily_routine_structure_bedtime_routine_planning_06", position: 2, mode: "scenario" },
      { module_ref: "task_reflection_triggers_01", position: 3, mode: "reflection" },
    ],
    outcomes: [
      "Improved emotional regulation in parenting moments",
      "Increased protective decision-making",
      "Improved communication with children",
    ],
    delivery: { format: "self-paced", estimated_duration_minutes: 60 },
  },
];

export const contactProgressionModules: ContactProgressionModule[] = [
  {
    contact_module_id: "contact_step_1_safe_intro",
    title: "Safe Introductory Contact",
    stage: 1,
    requirements: [
      "Parent demonstrates calm tone",
      "Child shows comfort entering space",
      "No safety concerns observed",
    ],
    activities: [
      {
        activity_id: "contact_activity_greeting",
        description: "Parent greets child using calm, warm tone.",
        observation_points: ["Eye contact", "Body language", "Child response"],
      },
    ],
    assessment: {
      dimensions: ["emotional_safety", "communication", "protective_capacity"],
      scoring_profile: "contact_progression_v1",
    },
    next_stage_conditions: [
      "Child remains regulated",
      "Parent maintains consistent safety behaviours",
      "Facilitator records no amber or red risk flags",
    ],
  },
];

export const workshopModules: WorkshopModule[] = [
  {
    workshop_id: "ws_parenting_response_core",
    title: "Core Parenting Response Workshop",
    duration_minutes: 90,
    sections: [
      {
        section_id: "intro",
        type: "facilitator_intro",
        content: "Introduce responding to child distress with safety, regulation, and relationship protection.",
      },
      {
        section_id: "scenario_walkthrough",
        type: "scenario",
        module_ref: "parenting_response_meltdown_response_01",
      },
      {
        section_id: "group_discussion",
        type: "discussion",
        prompt: "What emotions arise for you when a child has a meltdown?",
      },
      {
        section_id: "skill_practice",
        type: "roleplay",
        instructions: "Practise calm communication and grounding techniques.",
      },
      {
        section_id: "reflection",
        type: "reflection",
        prompt: "What will you do differently next time?",
      },
    ],
    outcomes: [
      "Improved regulation during child distress",
      "Better protective decision-making",
      "Stronger communication under pressure",
    ],
  },
];

export const facilitatorScripts: FacilitatorScript[] = [
  {
    script_id: "fs_parenting_response_meltdown",
    title: "Facilitator Script: Responding to Meltdowns",
    segments: [
      {
        segment_id: "set_safety_frame",
        purpose: "Frame the scenario without shame or blame.",
        script: "We are practising a safer response under pressure. The goal is not perfection; the goal is noticing, pausing, and choosing the next safe action.",
        facilitator_notes: [
          "Keep discussion behaviour-specific.",
          "Redirect blaming language toward observable safety and repair.",
        ],
      },
      {
        segment_id: "debrief_decision",
        purpose: "Connect the decision branch to assessment dimensions.",
        script: "Let's separate what happened, what the child may have needed, and what action would show regulation and protective capacity.",
        facilitator_notes: [
          "Record evidence only when the parent provides a concrete response.",
          "Flag any unsafe escalation for worker review.",
        ],
      },
    ],
  },
];

export const automationPipelineBlueprints: AutomationPipelineBlueprint[] = [
  {
    pipeline_id: "scenario_completion_to_assessment_record",
    trigger: "scenario_completed",
    actions: [
      "score selected decision branches",
      "write structured evidence payload",
      "check mini-quest criteria",
      "surface risk flags for facilitator review",
    ],
    evidence_target: "assessment_records",
  },
  {
    pipeline_id: "task_completion_to_quest_progress",
    trigger: "task_completed",
    actions: [
      "verify required response or evidence upload exists",
      "attach task outcome to assessment record",
      "refresh quest and achievement state",
    ],
    evidence_target: "quest_progress",
  },
];

export const achievementBadgeModules: AchievementBadgeModule[] = [
  {
    achievement_id: "ach_regulation_foundation",
    title: "Regulation Foundation Badge",
    description: "Awarded when a parent demonstrates consistent emotional regulation across modules.",
    criteria: [
      {
        criterion_id: "crit_complete_modules",
        type: "module_completion",
        modules_required: ["pm_emotional_regulation_intro", "parenting_response_meltdown_response_01"],
      },
      {
        criterion_id: "crit_score_threshold",
        type: "scoring",
        dimension: "emotional_regulation",
        min_score: 4,
      },
    ],
    rewards: {
      unlock_modules: ["pm_emotional_regulation_advanced"],
      display_badge: true,
    },
  },
];

export const miniQuestModules: MiniQuestModule[] = [
  {
    miniquest_id: "mq_manage_meltdown",
    title: "Managing a Child Meltdown",
    steps: [
      { step_id: "mq_step_1", type: "scenario", module_ref: "parenting_response_meltdown_response_01" },
      { step_id: "mq_step_2", type: "task", task_ref: "task_reflection_triggers_01" },
      { step_id: "mq_step_3", type: "skill_practice", instructions: "Practice grounding techniques for 2 minutes." },
      { step_id: "mq_step_4", type: "reflection", prompt: "What did you learn about your reactions?" },
    ],
    completion_rules: {
      required_steps: ["mq_step_1", "mq_step_2", "mq_step_3"],
      auto_award_achievement: "ach_regulation_foundation",
    },
  },
];

export const fullProgramSequenceTemplates: FullProgramSequenceTemplate[] = [
  {
    program_id: "prog_parenting_core_6wk",
    title: "SafeSteps Core Parenting Program (6 Weeks)",
    weeks: [
      { week: 1, modules: ["pm_emotional_regulation_intro", "mq_manage_meltdown"] },
      { week: 2, modules: ["daily_routine_structure_bedtime_routine_planning_06", "task_reflection_triggers_01"] },
      { week: 3, modules: ["pm_communication_intro", "communication_skill_reflective_responding_05"] },
      { week: 4, modules: ["pm_safety_planning_intro", "contact_step_1_safe_intro"] },
      { week: 5, modules: ["pm_co_parenting_basics", "co_parenting_relationship_discipline_disagreement_03"] },
      { week: 6, modules: ["pm_relationship_repair", "task_reflection_growth_summary_01"] },
    ],
    completion_rules: {
      required_weeks: 6,
      required_achievements: ["ach_regulation_foundation"],
      auto_generate_certificate: true,
    },
  },
];

export const childModules: ChildModule[] = [
  {
    child_module_id: "cm_emotion_identification_intro",
    title: "Understanding Your Feelings",
    description: "Helps children identify and name their emotions safely.",
    age_range: "6-10",
    components: [
      {
        component_id: "cm_story_01",
        type: "story",
        title: "A Day With Sam",
        content: "Sam feels different emotions throughout the day.",
      },
      {
        component_id: "cm_activity_01",
        type: "activity",
        instructions: "Match each face to the correct emotion.",
      },
      {
        component_id: "cm_reflection_01",
        type: "reflection",
        prompt: "What emotion did you feel today?",
      },
    ],
    outcomes: ["Improved emotional literacy", "Better communication with caregivers", "Increased self-awareness"],
    completion_rules: {
      required_components: ["cm_activity_01"],
      auto_unlock_next: true,
    },
    privacy: "child_private_by_default",
  },
];

export const childSafetyScenarioModules: ChildSafetyScenarioModule[] = [
  {
    child_scenario_id: "cs_safe_touch_01",
    title: "Understanding Safe and Unsafe Touch",
    age_range: "7-11",
    scenario: {
      context: "A trusted adult gives the child a hug that feels uncomfortable.",
      actors: ["child", "adult"],
      goals: ["Teach body autonomy", "Identify unsafe touch", "Practice help-seeking behaviour"],
    },
    steps: [
      {
        step_id: "cs_step_1",
        type: "reflection",
        prompt: "How does your body feel when something feels wrong?",
      },
      {
        step_id: "cs_step_2",
        type: "decision",
        prompt: "What should you do?",
        options: [
          {
            option_id: "tell_safe_adult",
            label: "Tell a safe adult",
            child_safety_score: 3,
            safety_flag: "none",
          },
          {
            option_id: "stay_silent",
            label: "Stay silent",
            child_safety_score: -2,
            safety_flag: "review",
          },
        ],
      },
    ],
    outcomes: ["Improved body awareness", "Understanding of safe vs unsafe touch", "Confidence in seeking help"],
    sharing_default: "private",
  },
];

export const multiLocationServiceModules: MultiLocationServiceModule[] = [
  {
    service_module_id: "svc_multisite_parenting_core",
    title: "Multi-Location Parenting Core Delivery",
    locations: [
      { location_id: "loc_01", name: "Mapleton Family Centre", delivery_mode: "in-person" },
      { location_id: "loc_02", name: "Sunshine Coast Outreach Hub", delivery_mode: "hybrid" },
      { location_id: "loc_03", name: "Brisbane Digital Service", delivery_mode: "online" },
    ],
    modules: ["pm_emotional_regulation_intro", "pm_communication_intro", "pm_safety_planning_intro"],
    scheduling_rules: {
      sync_progress_across_locations: true,
      allow_location_specific_variations: true,
    },
    reporting: {
      generate_location_reports: true,
      aggregate_to_central_dashboard: true,
    },
  },
];

export const documentIntelligenceExtractionTemplates: DocumentIntelligenceExtractionTemplate[] = [
  {
    di_template_id: "di_parenting_assessment_v1",
    title: "Parenting Assessment Extraction Template",
    fields: [
      {
        field_id: "fi_strengths",
        label: "Parent Strengths",
        type: "list",
        extraction_rules: [
          "Identify positive parenting behaviours",
          "Extract mentions of protective actions",
          "Capture supportive relational statements",
        ],
      },
      {
        field_id: "fi_risks",
        label: "Risks Identified",
        type: "list",
        extraction_rules: [
          "Detect mentions of unsafe behaviour",
          "Extract environmental risks",
          "Identify emotional dysregulation indicators",
        ],
      },
      {
        field_id: "fi_recommendations",
        label: "Recommendations",
        type: "text",
        extraction_rules: [
          "Capture professional recommendations",
          "Extract required next steps",
          "Identify safety planning needs",
        ],
      },
    ],
    scoring_rules: {
      protective_capacity: {
        positive_indicators: ["consistent safety actions", "calm communication"],
        negative_indicators: ["unsafe decisions", "emotional escalation"],
      },
    },
  },
];

export const multiStageProgressionMaps: MultiStageProgressionMap[] = [
  {
    progression_map_id: "pm_parenting_core_5stage",
    title: "Parenting Core 5-Stage Progression",
    stages: [
      { stage: 1, label: "Awareness", requirements: ["pm_emotional_regulation_intro"], outcomes: ["Basic emotional awareness"] },
      { stage: 2, label: "Skill Building", requirements: ["mq_manage_meltdown"], outcomes: ["Foundational regulation skills"] },
      { stage: 3, label: "Application", requirements: ["parenting_response_meltdown_response_01"], outcomes: ["Real-world application"] },
      { stage: 4, label: "Consistency", requirements: ["fa_contact_observation_core"], outcomes: ["Consistent safe behaviour"] },
      { stage: 5, label: "Mastery", requirements: ["ach_regulation_foundation"], outcomes: ["Demonstrated mastery"] },
    ],
    advancement_rules: [
      { condition: "All requirements completed", action: "Advance to next stage" },
      { condition: "Any safety score below threshold", action: "Hold and assign corrective modules" },
    ],
  },
];

export const fullSystemIntegrationBlueprints: FullSystemIntegrationBlueprint[] = [
  {
    integration_blueprint_id: "ib_safesteps_core_v1",
    title: "SafeSteps Core System Integration Blueprint",
    systems: [
      { system: "curriculum_engine", inputs: ["scenario_modules", "task_modules"], outputs: ["parent_modules", "child_modules"] },
      { system: "scoring_engine", inputs: ["scenario_steps", "facilitator_assessments"], outputs: ["scores", "progression_flags"] },
      { system: "contact_progression_engine", inputs: ["scores", "facilitator_assessment_blocks"], outputs: ["contact_stage_updates"] },
      { system: "reunification_engine", inputs: ["contact_stage_updates", "scoring_profiles"], outputs: ["reunification_stage_updates"] },
      { system: "document_intelligence_engine", inputs: ["case_documents", "di_templates"], outputs: ["extracted_fields", "risk_flags", "recommendations"] },
    ],
    data_flow: [
      { from: "scenario_modules", to: "curriculum_engine" },
      { from: "curriculum_engine", to: "scoring_engine" },
      { from: "scoring_engine", to: "contact_progression_engine" },
      { from: "contact_progression_engine", to: "reunification_engine" },
      { from: "document_intelligence_engine", to: "scoring_engine" },
    ],
    automation_rules: [
      "Auto-assign corrective modules when scores drop",
      "Auto-advance stages when thresholds met",
      "Auto-generate DI reports for facilitators",
      "Auto-sync progress across locations",
    ],
  },
];

export const advancedCoparentingModules: AdvancedCoparentingModule[] = [
  {
    coparenting_module_id: "cp_advanced_boundary_negotiation",
    title: "Advanced Boundary Negotiation",
    description: "A module that teaches parents how to negotiate boundaries with an ex-partner in high-stress situations.",
    components: [
      {
        component_id: "cp_component_1",
        type: "education",
        content: "Understanding boundary violations and negotiation principles.",
      },
      {
        component_id: "cp_component_2",
        type: "scenario",
        module_ref: "co_parenting_relationship_discipline_disagreement_03",
      },
      {
        component_id: "cp_component_3",
        type: "decision_tree",
        tree_ref: "dt_boundary_negotiation_01",
      },
      {
        component_id: "cp_component_4",
        type: "practice",
        instructions: "Practice assertive communication using the SAFE model.",
      },
    ],
    outcomes: [
      "Improved co-parenting communication",
      "Reduced conflict escalation",
      "Clearer and safer boundaries",
    ],
    completion_rules: {
      required_components: ["cp_component_2", "cp_component_3"],
      auto_unlock_next: true,
    },
  },
];

export const multiScenarioDecisionTrees: MultiScenarioDecisionTree[] = [
  {
    decision_tree_id: "dt_boundary_negotiation_01",
    title: "Boundary Negotiation Decision Tree",
    root: "node_1",
    nodes: [
      {
        node_id: "node_1",
        prompt: "Your ex-partner demands a last-minute schedule change.",
        options: [
          {
            option_id: "opt_a",
            label: "Agree immediately to avoid conflict",
            next: "node_2",
            impact: { boundary_strength: -2, conflict_risk: 1 },
          },
          {
            option_id: "opt_b",
            label: "Assert your boundary calmly",
            next: "node_3",
            impact: { boundary_strength: 3, conflict_risk: -1 },
          },
        ],
      },
      {
        node_id: "node_2",
        prompt: "You agreed, but now feel resentful. What next?",
        options: [
          {
            option_id: "opt_c",
            label: "Communicate your feelings later",
            next: "end_positive",
          },
          {
            option_id: "opt_d",
            label: "Stay silent",
            next: "end_negative",
          },
        ],
      },
      {
        node_id: "node_3",
        prompt: "Your ex-partner reacts defensively. How do you respond?",
        options: [
          {
            option_id: "opt_e",
            label: "Escalate the argument",
            next: "end_negative",
          },
          {
            option_id: "opt_f",
            label: "Use de-escalation language",
            next: "end_positive",
          },
        ],
      },
    ],
    endings: {
      end_positive: {
        summary: "You maintained boundaries and reduced conflict.",
        scores: { boundary_strength: 4, communication: 3 },
      },
      end_negative: {
        summary: "Boundary weakened and conflict increased.",
        scores: { boundary_strength: -3, communication: -2 },
      },
    },
  },
];

export const behaviourChangeInterventionModules: BehaviourChangeInterventionModule[] = [
  {
    intervention_id: "bc_regulation_consistency_01",
    title: "Consistency in Emotional Regulation",
    description: "A behaviour-change module designed to help parents maintain regulation across multiple stressors.",
    phases: [
      {
        phase_id: "phase_1",
        label: "Awareness",
        tasks: ["task_reflection_triggers_01", "task_emotion_identification_02"],
      },
      {
        phase_id: "phase_2",
        label: "Skill Practice",
        tasks: ["task_grounding_practice_01", "task_regulation_drill_02"],
      },
      {
        phase_id: "phase_3",
        label: "Real-World Application",
        tasks: ["parenting_response_meltdown_response_01", "crisis_emotional_flooding_01"],
      },
      {
        phase_id: "phase_4",
        label: "Consistency Tracking",
        tasks: ["task_daily_regulation_log_01", "task_pattern_tracking_02"],
      },
    ],
    measurement: {
      dimensions: ["emotional_regulation", "consistency", "protective_capacity"],
      scoring_profile: "behaviour_change_v1",
    },
    completion_rules: {
      required_phases: ["phase_1", "phase_2", "phase_3"],
      auto_award_achievement: "ach_regulation_foundation",
    },
  },
];

export const multiChildFamilyModules: MultiChildFamilyModule[] = [
  {
    multi_child_module_id: "mc_family_dynamics_core",
    title: "Core Multi-Child Family Dynamics",
    description: "Supports parents managing different emotional and behavioural needs across multiple children.",
    children_profiles: [
      {
        child_id: "child_01",
        age: 7,
        needs: ["emotional_regulation", "routine_stability"],
      },
      {
        child_id: "child_02",
        age: 12,
        needs: ["boundary_respect", "communication"],
      },
    ],
    components: [
      {
        component_id: "mc_component_1",
        type: "scenario",
        module_ref: "parenting_response_meltdown_response_01",
      },
      {
        component_id: "mc_component_2",
        type: "task",
        task_ref: "task_multi_child_planning_01",
      },
    ],
    outcomes: [
      "Improved sibling conflict management",
      "Better individualized parenting strategies",
      "Reduced household stress",
    ],
  },
];

export const intergenerationalPatternModules: IntergenerationalPatternModule[] = [
  {
    intergen_module_id: "ig_pattern_breaking_core",
    title: "Breaking Intergenerational Patterns",
    description: "Helps parents identify and interrupt harmful patterns passed down through generations.",
    components: [
      {
        component_id: "ig_component_1",
        type: "reflection",
        prompt: "What patterns from your childhood show up in your parenting?",
      },
      {
        component_id: "ig_component_2",
        type: "scenario",
        module_ref: "emotional_regulation_triggered_by_child_behaviour_04",
      },
      {
        component_id: "ig_component_3",
        type: "task",
        task_ref: "task_pattern_mapping_01",
      },
    ],
    outcomes: [
      "Increased self-awareness",
      "Reduced repetition of harmful patterns",
      "Improved emotional safety",
    ],
  },
];

export const highRiskSafetyEscalationMaps: HighRiskSafetyEscalationMap[] = [
  {
    escalation_map_id: "hr_safety_escalation_core",
    title: "High-Risk Safety Escalation Map",
    levels: [
      {
        level: 1,
        label: "Early Warning Signs",
        indicators: ["raised voice", "tension", "withdrawal"],
        actions: ["pause interaction", "move child to safe space"],
      },
      {
        level: 2,
        label: "Active Risk",
        indicators: ["verbal aggression", "threatening behaviour"],
        actions: ["activate safety plan", "contact safe adult"],
      },
      {
        level: 3,
        label: "Critical Risk",
        indicators: ["physical aggression", "weapons", "severe intoxication"],
        actions: ["call emergency services", "exit environment immediately"],
      },
    ],
    integration: {
      links_to: ["safety_plan_id", "crisis_module_id", "contact_progression_engine"],
    },
  },
];

export const familySystemDynamicsModules: FamilySystemDynamicsModule[] = [
  {
    family_system_module_id: "fs_dynamics_core",
    title: "Family System Dynamics Mapping",
    description: "Helps families understand relational patterns, alliances, and conflict cycles.",
    components: [
      {
        component_id: "fs_component_1",
        type: "mapping",
        instructions: "Map each family member's role and influence.",
      },
      {
        component_id: "fs_component_2",
        type: "scenario",
        module_ref: "co_parenting_relationship_discipline_disagreement_03",
      },
      {
        component_id: "fs_component_3",
        type: "task",
        task_ref: "task_system_pattern_identification_01",
      },
    ],
    outcomes: [
      "Clearer understanding of family roles",
      "Reduced conflict cycles",
      "Improved relational safety",
    ],
  },
];

export const advancedBehaviourAnalyticsModules: AdvancedBehaviourAnalyticsModule[] = [
  {
    analytics_module_id: "ba_advanced_behavior_core",
    title: "Advanced Behaviour Analytics",
    description: "Analyzes behavioural patterns to identify triggers, escalation paths, and consistency gaps.",
    inputs: ["task_daily_regulation_log_01", "facilitator_assessment_blocks", "scenario_decision_data"],
    analysis: {
      detect_patterns: true,
      predict_escalation: true,
      flag_inconsistencies: true,
    },
    outputs: ["risk_flags", "behaviour_trends", "consistency_scores", "recommendation_set"],
  },
];

export const crossModuleOrchestrationMaps: CrossModuleOrchestrationMap[] = [
  {
    orchestration_map_id: "om_safesteps_full_v1",
    title: "Full SafeSteps Cross-Module Orchestration",
    links: [
      { from: "parent_modules", to: "task_modules" },
      { from: "task_modules", to: "scoring_engine" },
      { from: "scoring_engine", to: "contact_progression_engine" },
      { from: "contact_progression_engine", to: "reunification_engine" },
      { from: "reunification_engine", to: "achievement_modules" },
      { from: "document_intelligence_engine", to: "analytics_modules" },
      { from: "analytics_modules", to: "safety_escalation_maps" },
    ],
    global_rules: [
      "Auto-assign corrective modules when risk flags appear",
      "Auto-advance progression when thresholds met",
      "Auto-sync across multi-location services",
      "Auto-generate DI reports for facilitators",
    ],
  },
];

export const highComplexityFamilyInterventionModules: HighComplexityFamilyInterventionModule[] = [
  {
    family_intervention_id: "fi_complex_case_core",
    title: "Complex Family Intervention Core Module",
    description: "Supports families experiencing overlapping trauma, conflict, and safety concerns.",
    domains: [
      "trauma_history",
      "parent_child_relationship",
      "co_parenting_conflict",
      "environmental_safety",
      "emotional_regulation",
    ],
    components: [
      {
        component_id: "fi_component_1",
        type: "scenario",
        module_ref: "co_parenting_relationship_discipline_disagreement_03",
      },
      {
        component_id: "fi_component_2",
        type: "assessment",
        assessment_ref: "fa_contact_observation_core",
      },
      {
        component_id: "fi_component_3",
        type: "intervention_task",
        task_ref: "task_system_pattern_identification_01",
      },
    ],
    outcomes: [
      "Reduced conflict cycles",
      "Improved relational safety",
      "Clearer intervention pathways",
    ],
    integration: {
      links_to: ["safety_plan_id", "reunification_engine", "analytics_module_id"],
    },
  },
];

export const multiDomainRiskMatrixModules: MultiDomainRiskMatrixModule[] = [
  {
    risk_matrix_id: "rm_multi_domain_core",
    title: "Multi-Domain Risk Matrix",
    domains: [
      {
        domain_id: "rm_safety",
        label: "Safety",
        indicators: ["unsafe adults", "environmental hazards", "crisis behaviours"],
        scale: { min: 1, max: 5 },
      },
      {
        domain_id: "rm_emotional_regulation",
        label: "Emotional Regulation",
        indicators: ["escalation frequency", "repair ability", "trigger sensitivity"],
        scale: { min: 1, max: 5 },
      },
      {
        domain_id: "rm_relationship",
        label: "Relationship Safety",
        indicators: ["child comfort", "communication tone", "attachment behaviours"],
        scale: { min: 1, max: 5 },
      },
      {
        domain_id: "rm_environment",
        label: "Environment",
        indicators: ["housing stability", "routine consistency", "predictability"],
        scale: { min: 1, max: 5 },
      },
    ],
    scoring_rules: {
      high_risk_threshold: 3,
      auto_flag_domains: true,
      auto_assign_interventions: true,
    },
    outputs: ["risk_profile", "priority_intervention_list", "safety_escalation_level"],
  },
];

export const longFormTherapeuticJourneyMaps: LongFormTherapeuticJourneyMap[] = [
  {
    journey_map_id: "tj_12_month_healing_arc",
    title: "12-Month Healing & Stability Journey",
    phases: [
      {
        phase: 1,
        label: "Stabilization",
        duration_weeks: 4,
        modules: ["crisis_emotional_flooding_01", "sp_home_safety_core"],
      },
      {
        phase: 2,
        label: "Regulation & Safety",
        duration_weeks: 8,
        modules: ["pm_emotional_regulation_intro", "bc_regulation_consistency_01"],
      },
      {
        phase: 3,
        label: "Relationship Repair",
        duration_weeks: 12,
        modules: ["ti_attachment_repair_advanced", "fs_dynamics_core"],
      },
      {
        phase: 4,
        label: "Integration",
        duration_weeks: 12,
        modules: ["ig_pattern_breaking_core", "mc_family_dynamics_core"],
      },
    ],
    completion_rules: {
      required_phases: [1, 2, 3],
      auto_generate_summary: true,
    },
  },
];

export const crossAgencyCollaborationModules: CrossAgencyCollaborationModule[] = [
  {
    collab_module_id: "ca_cross_agency_core",
    title: "Cross-Agency Collaboration Core Module",
    agencies: ["child_safety", "family_support", "mental_health", "education"],
    components: [
      {
        component_id: "ca_component_1",
        type: "information_exchange",
        instructions: "Share relevant case updates across agencies.",
      },
      {
        component_id: "ca_component_2",
        type: "alignment_meeting",
        instructions: "Conduct a joint meeting to align goals.",
      },
    ],
    outcomes: ["Improved communication", "Aligned intervention plans", "Reduced duplication of services"],
  },
];

export const professionalReportingTemplates: ProfessionalReportingTemplate[] = [
  {
    report_template_id: "pr_case_review_v1",
    title: "Case Review Professional Report",
    sections: ["summary", "strengths", "risks", "recommendations", "next_steps"],
    extraction_rules: {
      auto_pull_from_DI_engine: true,
      auto_insert_scores: true,
    },
  },
];

export const multiTierCaseManagementMaps: MultiTierCaseManagementMap[] = [
  {
    case_map_id: "cm_multi_tier_core",
    title: "Multi-Tier Case Management Map",
    tiers: [
      { tier: 1, label: "Low Support", requirements: ["basic_safety", "routine_stability"] },
      { tier: 2, label: "Moderate Support", requirements: ["emotional_regulation", "consistent_contact"] },
      { tier: 3, label: "High Support", requirements: ["crisis_response", "complex_intervention"] },
    ],
    movement_rules: {
      auto_escalate_on_risk: true,
      auto_deescalate_on_progress: true,
    },
  },
];

export const culturalSafetyModules: CulturalSafetyModule[] = [
  {
    cultural_module_id: "cs_cultural_safety_core",
    title: "Cultural Safety Foundations",
    components: [
      {
        component_id: "cs_component_1",
        type: "education",
        content: "Understanding cultural identity and respect.",
      },
      {
        component_id: "cs_component_2",
        type: "scenario",
        module_ref: "cultural_misunderstanding_01",
      },
    ],
    outcomes: ["Improved cultural awareness", "Respectful communication", "Safer cross-cultural interactions"],
  },
];

export const disabilityInclusiveParentingModules: DisabilityInclusiveParentingModule[] = [
  {
    disability_module_id: "di_parenting_inclusion_core",
    title: "Disability-Inclusive Parenting",
    components: [
      {
        component_id: "di_component_1",
        type: "education",
        content: "Understanding disability-inclusive communication.",
      },
      {
        component_id: "di_component_2",
        type: "task",
        task_ref: "task_accessibility_planning_01",
      },
    ],
    outcomes: ["Improved accessibility", "Better communication", "Inclusive parenting strategies"],
  },
];

export const neurodiversitySupportModules: NeurodiversitySupportModule[] = [
  {
    neuro_module_id: "nd_support_core",
    title: "Neurodiversity Support Core Module",
    components: [
      {
        component_id: "nd_component_1",
        type: "education",
        content: "Understanding sensory needs and neurodiverse communication.",
      },
      {
        component_id: "nd_component_2",
        type: "scenario",
        module_ref: "sensory_overload_01",
      },
    ],
    outcomes: ["Improved sensory awareness", "Better regulation strategies", "Safer communication"],
  },
];

export const environmentalStressorModules: EnvironmentalStressorModule[] = [
  {
    env_module_id: "es_environmental_stress_core",
    title: "Environmental Stressor Identification",
    stressors: ["noise", "crowding", "routine_disruption", "financial_pressure"],
    tasks: ["task_stressor_mapping_01", "task_environment_adjustment_01"],
    outcomes: ["Reduced stress", "Improved environmental safety", "Better planning"],
  },
];

export const complexBehaviourLoopModules: ComplexBehaviourLoopModule[] = [
  {
    behaviour_loop_id: "bl_complex_loop_core",
    title: "Complex Behaviour Loop Mapping",
    loops: [
      {
        loop_id: "loop_1",
        trigger: "child_misunderstood",
        parent_response: "frustration",
        child_reaction: "shutdown",
        outcome: "conflict_cycle",
      },
    ],
    intervention_points: ["trigger_identification", "regulation_step", "repair_step"],
  },
];

export const parentCapacityGrowthTrackers: ParentCapacityGrowthTracker[] = [
  {
    growth_tracker_id: "gc_parent_capacity_core",
    title: "Parent Capacity Growth Tracker",
    dimensions: ["regulation", "communication", "protective_capacity", "consistency"],
    tracking_rules: {
      auto_pull_scores: true,
      auto_generate_trends: true,
    },
  },
];

export const systemHealthDiagnosticModules: SystemHealthDiagnosticModule[] = [
  {
    system_diagnostic_id: "sd_system_health_core",
    title: "SafeSteps System Health Diagnostic",
    checks: [
      "module_integrity",
      "scoring_engine_status",
      "progression_engine_status",
      "DI_engine_status",
      "analytics_engine_status",
    ],
    outputs: ["system_health_report", "recommended_fixes", "performance_metrics"],
  },
];

export const highRiskContactSessionModules: HighRiskContactSessionModule[] = [
  {
    contact_session_id: "cs_high_risk_core",
    title: "High-Risk Contact Session",
    risk_factors: ["recent conflict", "emotional escalation", "child fear indicators"],
    components: [
      {
        component_id: "cs_component_1",
        type: "observation",
        assessment_ref: "fa_contact_observation_core",
      },
      {
        component_id: "cs_component_2",
        type: "intervention",
        instructions: "Facilitator intervenes if escalation indicators appear.",
      },
    ],
    outcomes: ["Safe contact environment", "Reduced escalation", "Clear progression signals"],
  },
];

export const parentChildRepairCycleModules: ParentChildRepairCycleModule[] = [
  {
    repair_cycle_id: "rc_parent_child_core",
    title: "Parent-Child Repair Cycle",
    steps: ["rupture_identification", "regulation", "repair_attempt", "connection_rebuild"],
    tasks: ["task_repair_reflection_01", "task_repair_practice_01"],
    outcomes: ["Improved relational safety", "Reduced rupture frequency", "Stronger attachment"],
  },
];

export const multiAdultHouseholdSafetyModules: MultiAdultHouseholdSafetyModule[] = [
  {
    household_safety_id: "hs_multi_adult_core",
    title: "Multi-Adult Household Safety",
    adults: ["parent", "partner", "grandparent", "other_resident"],
    risk_checks: ["communication_style", "discipline_methods", "substance_use", "emotional_regulation"],
    outcomes: ["Unified safety expectations", "Reduced mixed messaging", "Improved household stability"],
  },
];

export const advancedCommunicationBreakdownModules: AdvancedCommunicationBreakdownModule[] = [
  {
    comm_breakdown_id: "cb_advanced_core",
    title: "Advanced Communication Breakdown",
    patterns: ["misinterpretation", "tone_escalation", "shutdown", "defensiveness"],
    interventions: ["task_communication_reset_01", "task_tone_mapping_01"],
    outcomes: ["Reduced breakdown frequency", "Improved clarity", "Safer communication"],
  },
];

export const emotionalLoadDistributionModules: EmotionalLoadDistributionModule[] = [
  {
    load_distribution_id: "eld_core",
    title: "Emotional Load Distribution",
    domains: ["household_tasks", "childcare", "emotional_support", "decision_making"],
    tasks: ["task_load_mapping_01", "task_load_rebalance_01"],
    outcomes: ["Reduced emotional overload", "Improved balance", "Better co-parenting stability"],
  },
];

export const complexTriggerChainModules: ComplexTriggerChainModule[] = [
  {
    trigger_chain_id: "tc_complex_core",
    title: "Complex Trigger Chain Mapping",
    chain: ["initial_trigger", "secondary_trigger", "behaviour_response", "child_reaction", "cycle_outcome"],
    intervention_points: ["trigger_interruption", "regulation_step", "repair_step"],
    outcomes: ["Reduced escalation", "Improved trigger awareness", "Safer behavioural patterns"],
  },
];

export const parentIdentityReconstructionModules: ParentIdentityReconstructionModule[] = [
  {
    identity_module_id: "pi_reconstruction_core",
    title: "Parent Identity Reconstruction",
    components: [
      {
        component_id: "pi_component_1",
        type: "reflection",
        prompt: "How has your identity changed through parenting challenges?",
      },
      {
        component_id: "pi_component_2",
        type: "task",
        task_ref: "task_identity_mapping_01",
      },
    ],
    outcomes: ["Stronger self-concept", "Improved confidence", "Better emotional stability"],
  },
];

export const childResilienceBuildingModules: ChildResilienceBuildingModule[] = [
  {
    child_resilience_id: "cr_building_core",
    title: "Child Resilience Building",
    components: [
      {
        component_id: "cr_component_1",
        type: "activity",
        instructions: "Practice naming strengths.",
      },
      {
        component_id: "cr_component_2",
        type: "scenario",
        module_ref: "child_challenge_01",
      },
    ],
    outcomes: ["Improved coping skills", "Better emotional flexibility", "Increased confidence"],
  },
];

export const multiFactorStabilityIndexModules: MultiFactorStabilityIndexModule[] = [
  {
    stability_index_id: "si_multi_factor_core",
    title: "Multi-Factor Stability Index",
    factors: [
      "emotional_regulation",
      "environmental_consistency",
      "relationship_safety",
      "routine_stability",
      "financial_stress",
    ],
    scoring_rules: {
      auto_generate_index: true,
      thresholds: {
        stable: 4,
        moderate: 3,
        unstable: 2,
      },
    },
    outputs: ["stability_score", "risk_flags", "recommended_interventions"],
  },
];

export const fullFamilyReintegrationBlueprints: FullFamilyReintegrationBlueprint[] = [
  {
    reintegration_blueprint_id: "fr_full_core",
    title: "Full Family Reintegration Blueprint",
    phases: [
      { phase: 1, label: "Preparation", modules: ["sp_home_safety_core", "pm_emotional_regulation_intro"] },
      { phase: 2, label: "Supervised Contact", modules: ["cs_high_risk_core", "fa_contact_observation_core"] },
      { phase: 3, label: "Supported Contact", modules: ["rc_parent_child_core", "bc_regulation_consistency_01"] },
      { phase: 4, label: "Independent Contact", modules: ["fs_dynamics_core", "ig_pattern_breaking_core"] },
      { phase: 5, label: "Full Reintegration", modules: ["mc_family_dynamics_core", "fr_followup_support_01"] },
    ],
    completion_rules: {
      required_phases: [1, 2, 3, 4],
      auto_generate_reintegration_report: true,
    },
  },
];

export const interSiblingRelationshipModules: InterSiblingRelationshipModule[] = [
  {
    sibling_module_id: "sr_relationship_core",
    title: "Inter-Sibling Relationship Core Module",
    components: [
      { component_id: "sr_component_1", type: "scenario", module_ref: "sibling_conflict_01" },
      { component_id: "sr_component_2", type: "task", task_ref: "task_sibling_mapping_01" },
    ],
    outcomes: ["Improved sibling cooperation", "Reduced conflict cycles", "Better emotional safety between siblings"],
  },
];

export const parentStressLoadCompressionModules: ParentStressLoadCompressionModule[] = [
  {
    stress_module_id: "ps_load_compression_core",
    title: "Parent Stress-Load Compression",
    domains: ["emotional_load", "task_load", "decision_load"],
    tasks: ["task_stress_identification_01", "task_load_reduction_01"],
    outcomes: ["Reduced overwhelm", "Improved regulation", "Better decision-making"],
  },
];

export const childEmotionalExpansionModules: ChildEmotionalExpansionModule[] = [
  {
    child_emotion_module_id: "ce_expansion_core",
    title: "Child Emotional Expansion",
    components: [
      { component_id: "ce_component_1", type: "activity", instructions: "Practice naming complex emotions." },
      { component_id: "ce_component_2", type: "scenario", module_ref: "child_emotional_challenge_01" },
    ],
    outcomes: ["Expanded emotional vocabulary", "Improved communication", "Better self-awareness"],
  },
];

export const highIntensityTriggerResponseModules: HighIntensityTriggerResponseModule[] = [
  {
    trigger_response_id: "tr_high_intensity_core",
    title: "High-Intensity Trigger Response",
    steps: ["trigger_detection", "regulation_protocol", "safe_response", "repair"],
    tasks: ["task_trigger_chain_mapping_01", "task_regulation_drill_03"],
    outcomes: ["Reduced escalation", "Improved trigger management", "Safer parent-child interactions"],
  },
];

export const parentCognitiveReframeModules: ParentCognitiveReframeModule[] = [
  {
    cognitive_module_id: "pc_reframe_core",
    title: "Parent Cognitive Reframe",
    components: [
      { component_id: "pc_component_1", type: "reflection", prompt: "What beliefs influence your reactions?" },
      { component_id: "pc_component_2", type: "task", task_ref: "task_cognitive_reframe_01" },
    ],
    outcomes: ["Improved cognitive flexibility", "Reduced reactive behaviour", "Better emotional regulation"],
  },
];

export const childBehaviourStabilizationModules: ChildBehaviourStabilizationModule[] = [
  {
    child_stability_id: "cb_stabilization_core",
    title: "Child Behaviour Stabilization",
    components: [
      { component_id: "cb_component_1", type: "scenario", module_ref: "child_instability_01" },
      { component_id: "cb_component_2", type: "task", task_ref: "task_stability_practice_01" },
    ],
    outcomes: ["Reduced behavioural volatility", "Improved predictability", "Better emotional safety"],
  },
];

export const parentEmotionalAnchoringModules: ParentEmotionalAnchoringModule[] = [
  {
    anchor_module_id: "pe_anchoring_core",
    title: "Parent Emotional Anchoring",
    steps: ["identify_anchor", "practice_anchor", "apply_anchor_in_stress"],
    tasks: ["task_anchor_identification_01", "task_anchor_application_01"],
    outcomes: ["Improved emotional stability", "Reduced escalation", "Better crisis response"],
  },
];

export const childPredictabilityRoutineModules: ChildPredictabilityRoutineModule[] = [
  {
    routine_module_id: "cr_predictability_core",
    title: "Child Predictability & Routine",
    components: [
      { component_id: "cr_component_1", type: "activity", instructions: "Build a daily routine map." },
      { component_id: "cr_component_2", type: "scenario", module_ref: "routine_disruption_01" },
    ],
    outcomes: ["Improved routine stability", "Reduced anxiety", "Better behavioural consistency"],
  },
];

export const parentChildEmotionalSynchronyModules: ParentChildEmotionalSynchronyModule[] = [
  {
    synchrony_module_id: "pc_synchrony_core",
    title: "Parent-Child Emotional Synchrony",
    components: [
      {
        component_id: "pc_component_1",
        type: "education",
        content: "Understanding emotional synchrony and co-regulation.",
      },
      { component_id: "pc_component_2", type: "practice", instructions: "Practice matching tone and pace." },
    ],
    outcomes: ["Improved co-regulation", "Stronger relational safety", "Better emotional alignment"],
  },
];

export const familyEmotionalClimateModules: FamilyEmotionalClimateModule[] = [
  {
    climate_module_id: "fe_climate_core",
    title: "Family Emotional Climate",
    domains: ["tone", "stress_level", "communication_style", "predictability"],
    tasks: ["task_climate_mapping_01", "task_climate_adjustment_01"],
    outcomes: ["Improved household emotional safety", "Reduced tension", "Better family cohesion"],
  },
];

export const parentChildCoregulationLoopModules: ParentChildCoregulationLoopModule[] = [
  {
    coreg_loop_id: "pc_coregulation_core",
    title: "Parent-Child Co-Regulation Loop",
    steps: ["parent_regulates", "child_matches", "parent_adjusts", "child_stabilizes"],
    tasks: ["task_coreg_practice_01", "task_coreg_reflection_01"],
    outcomes: ["Improved emotional synchrony", "Reduced escalation", "Stronger attachment"],
  },
];

export const highConflictCoparentingDeescalationModules: HighConflictCoparentingDeescalationModule[] = [
  {
    coparent_deescalation_id: "cp_deescalation_core",
    title: "High-Conflict Co-Parenting De-Escalation",
    patterns: ["tone_escalation", "misinterpretation", "reactive messaging"],
    interventions: ["task_message_rewrite_01", "task_boundary_reset_01"],
    outcomes: ["Reduced conflict", "Improved communication", "Safer co-parenting exchanges"],
  },
];

export const childTraumaSignalRecognitionModules: ChildTraumaSignalRecognitionModule[] = [
  {
    trauma_signal_id: "ct_signal_recognition_core",
    title: "Child Trauma Signal Recognition",
    signals: ["freeze_response", "avoidance", "hypervigilance", "shutdown"],
    tasks: ["task_signal_mapping_01", "task_safe_response_01"],
    outcomes: ["Improved trauma awareness", "Safer adult responses", "Reduced retraumatization"],
  },
];

export const parentEmotionalCompressionReleaseModules: ParentEmotionalCompressionReleaseModule[] = [
  {
    compression_release_id: "pe_compression_release_core",
    title: "Parent Emotional Compression Release",
    steps: ["identify_compression", "release_protocol", "post_release_regulation"],
    tasks: ["task_compression_identification_01", "task_release_practice_01"],
    outcomes: ["Reduced emotional overload", "Improved regulation", "Better crisis resilience"],
  },
];

export const childSocialSafetyModules: ChildSocialSafetyModule[] = [
  {
    child_social_safety_id: "cs_social_safety_core",
    title: "Child Social Safety",
    domains: ["peer_interactions", "school_environment", "online_spaces"],
    tasks: ["task_social_safety_mapping_01", "task_safe_friendship_01"],
    outcomes: ["Improved social awareness", "Safer peer relationships", "Better boundary-setting"],
  },
];

export const parentBehaviourResetProtocolModules: ParentBehaviourResetProtocolModule[] = [
  {
    reset_protocol_id: "pb_reset_protocol_core",
    title: "Parent Behaviour Reset Protocol",
    steps: ["pause", "regulate", "reset_intention", "respond_safely"],
    tasks: ["task_reset_practice_01", "task_reset_tracking_01"],
    outcomes: ["Reduced reactive behaviour", "Improved consistency", "Better emotional safety"],
  },
];

export const childEmotionalBoundaryModules: ChildEmotionalBoundaryModule[] = [
  {
    child_boundary_id: "cb_emotional_boundary_core",
    title: "Child Emotional Boundary Module",
    components: [
      { component_id: "cb_component_1", type: "education", content: "Understanding emotional boundaries." },
      { component_id: "cb_component_2", type: "activity", instructions: "Practice saying 'stop' or 'no' safely." },
    ],
    outcomes: ["Improved boundary-setting", "Reduced vulnerability", "Better emotional safety"],
  },
];

export const parentSelfTrustReconstructionModules: ParentSelfTrustReconstructionModule[] = [
  {
    selftrust_module_id: "pt_selftrust_core",
    title: "Parent Self-Trust Reconstruction",
    components: [
      { component_id: "pt_component_1", type: "reflection", prompt: "Where do you doubt your parenting decisions?" },
      { component_id: "pt_component_2", type: "task", task_ref: "task_selftrust_rebuild_01" },
    ],
    outcomes: ["Improved confidence", "Better decision-making", "Reduced self-criticism"],
  },
];

export const childEmotionalPatternStabilizerModules: ChildEmotionalPatternStabilizerModule[] = [
  {
    pattern_stabilizer_id: "ce_pattern_stabilizer_core",
    title: "Child Emotional Pattern Stabilizer",
    patterns: ["morning_anxiety", "bedtime_resistance", "school_transition_stress"],
    tasks: ["task_pattern_identification_01", "task_stabilizer_practice_01"],
    outcomes: ["Improved predictability", "Reduced emotional spikes", "Better daily stability"],
  },
];

export const familyEmotionalArchitectureModules: FamilyEmotionalArchitectureModule[] = [
  {
    architecture_module_id: "fe_architecture_core",
    title: "Family Emotional Architecture",
    domains: ["tone_baseline", "stress_distribution", "communication_flow", "repair_cycles"],
    tasks: ["task_architecture_mapping_01", "task_architecture_adjustment_01"],
    outcomes: ["Improved emotional structure", "Reduced household volatility", "Better relational cohesion"],
  },
];

export const parentChildMicroRepairModules = [
  {
    micro_repair_id: "pc_micro_repair_core",
    title: "Parent-Child Micro-Repair",
    steps: ["notice_rupture", "acknowledge", "repair_phrase", "reconnect"],
    tasks: ["task_micro_repair_practice_01"],
    outcomes: ["Faster repair cycles", "Reduced emotional distance", "Improved relational safety"],
  },
] as const;

export const childSensoryRegulationModules = [
  {
    sensory_regulation_id: "cs_sensory_regulation_core",
    title: "Child Sensory Regulation",
    domains: ["sound", "touch", "movement", "light"],
    tasks: ["task_sensory_mapping_01", "task_sensory_toolkit_01"],
    outcomes: ["Reduced sensory overload", "Improved self-regulation", "Better daily stability"],
  },
] as const;

export const parentEmotionalPatternDisruptionModules = [
  {
    pattern_disruption_id: "pe_pattern_disruption_core",
    title: "Parent Emotional Pattern Disruption",
    patterns: ["reactive_tone", "shutdown", "overcontrol"],
    tasks: ["task_pattern_interrupt_01"],
    outcomes: ["Reduced reactive cycles", "Improved emotional flexibility", "Better crisis resilience"],
  },
] as const;

export const childSocialResilienceModules = [
  {
    social_resilience_id: "cr_social_resilience_core",
    title: "Child Social Resilience",
    components: [
      { component_id: "cr_component_1", type: "activity", instructions: "Practice safe peer communication." },
    ],
    outcomes: ["Improved peer confidence", "Reduced social anxiety", "Better conflict navigation"],
  },
] as const;

export const parentChildEmotionalMatchingModules = [
  {
    matching_module_id: "pc_emotional_matching_core",
    title: "Parent-Child Emotional Matching",
    steps: ["observe_child_state", "match_tone", "match_pace", "guide_to_regulation"],
    outcomes: ["Improved co-regulation", "Reduced mismatch escalation", "Stronger connection"],
  },
] as const;

export const highRiskBehaviourInterruptionModules = [
  {
    risk_interrupt_id: "hr_behaviour_interrupt_core",
    title: "High-Risk Behaviour Interruption",
    behaviours: ["aggression", "property_damage", "unsafe_running"],
    steps: ["identify_risk", "interrupt_safely", "redirect", "repair"],
    outcomes: ["Reduced harm", "Improved safety", "Better crisis management"],
  },
] as const;

export const parentEmotionalExpansionModules = [
  {
    emotion_expansion_id: "pe_expansion_core",
    title: "Parent Emotional Expansion",
    domains: ["awareness", "expression", "processing"],
    tasks: ["task_emotion_expansion_01"],
    outcomes: ["Improved emotional literacy", "Better communication", "Reduced suppression"],
  },
] as const;

export const childRoutineStabilizerModules = [
  {
    routine_stabilizer_id: "cr_routine_stabilizer_core",
    title: "Child Routine Stabilizer",
    routine_points: ["morning", "school_transition", "bedtime"],
    tasks: ["task_routine_mapping_01", "task_routine_practice_01"],
    outcomes: ["Improved predictability", "Reduced anxiety", "Better behavioural consistency"],
  },
] as const;

export const parentChildConflictSofteningModules = [
  {
    conflict_softening_id: "pc_conflict_softening_core",
    title: "Parent-Child Conflict Softening",
    steps: ["slow_down", "soften_tone", "validate_feelings", "offer_repair"],
    outcomes: ["Reduced conflict intensity", "Improved emotional safety", "Better repair outcomes"],
  },
] as const;

export const familyStressLoadRedistributionModules = [
  {
    stress_redistribution_id: "fs_stress_redistribution_core",
    title: "Family Stress-Load Redistribution",
    domains: ["tasks", "emotional_support", "decision_making"],
    tasks: ["task_stress_distribution_01"],
    outcomes: ["Reduced overload", "Improved balance", "Better household stability"],
  },
] as const;

export const childEmotionalSafetyAnchorModules = [
  {
    child_anchor_id: "ce_safety_anchor_core",
    title: "Child Emotional Safety Anchor",
    steps: ["identify_anchor", "practice_anchor", "use_anchor_in_stress"],
    outcomes: ["Improved self-regulation", "Reduced panic", "Better emotional grounding"],
  },
] as const;

export const parentBehaviourCalibrationModules = [
  {
    calibration_module_id: "pb_calibration_core",
    title: "Parent Behaviour Calibration",
    domains: ["tone", "pace", "volume", "body_language"],
    tasks: ["task_calibration_practice_01"],
    outcomes: ["Improved communication clarity", "Reduced escalation", "Better emotional alignment"],
  },
] as const;

export const childAttachmentStrengtheningModules = [
  {
    attachment_strength_id: "ca_strengthening_core",
    title: "Child Attachment Strengthening",
    components: [
      { component_id: "ca_component_1", type: "practice", instructions: "Practice predictable connection moments." },
    ],
    outcomes: ["Improved attachment security", "Reduced fear responses", "Better relational trust"],
  },
] as const;

export const parentEmotionalResetLoopModules = [
  {
    reset_loop_id: "pe_reset_loop_core",
    title: "Parent Emotional Reset Loop",
    steps: ["pause", "regulate", "reset", "re-engage"],
    outcomes: ["Reduced reactive cycles", "Improved consistency", "Better emotional safety"],
  },
] as const;

export const childBehaviourPredictionModules = [
  {
    behaviour_prediction_id: "cb_prediction_core",
    title: "Child Behaviour Prediction",
    inputs: ["routine_data", "emotional_state", "environmental_stressors"],
    outputs: ["prediction_score", "risk_flags", "recommended_interventions"],
  },
] as const;

export const parentTraumaTriggerMappingModules = [
  {
    trigger_mapping_id: "pt_trigger_mapping_core",
    title: "Parent Trauma Trigger Mapping",
    tasks: ["task_trigger_identification_01", "task_trigger_response_01"],
    outcomes: ["Improved trauma awareness", "Reduced reactive behaviour", "Better emotional regulation"],
  },
] as const;

export const childEmotionalMicroStabilityModules = [
  {
    micro_stability_id: "ce_micro_stability_core",
    title: "Child Emotional Micro-Stability",
    domains: ["moment_to_moment_regulation", "micro_triggers", "micro_repairs"],
    outcomes: ["Improved emotional consistency", "Reduced volatility", "Better daily functioning"],
  },
] as const;

export const parentChildEmotionalFlowModules = [
  {
    emotional_flow_id: "pc_emotional_flow_core",
    title: "Parent-Child Emotional Flow",
    flow_points: ["initiation", "matching", "guiding", "stabilizing"],
    outcomes: ["Improved emotional alignment", "Reduced mismatch escalation", "Better relational cohesion"],
  },
] as const;

export const familyPredictabilityArchitectureModules = [
  {
    predictability_arch_id: "fa_predictability_core",
    title: "Family Predictability Architecture",
    domains: ["routine", "tone", "communication", "repair_cycles"],
    tasks: ["task_predictability_mapping_01"],
    outcomes: ["Improved household stability", "Reduced anxiety", "Better emotional safety"],
  },
] as const;

export const childEmotionalResilienceLadderModules = [
  {
    resilience_ladder_id: "ce_resilience_ladder_core",
    title: "Child Emotional Resilience Ladder",
    levels: ["identify_feelings", "express_feelings", "regulate_feelings", "recover_from_stress"],
    outcomes: ["Improved resilience", "Better coping skills", "Reduced emotional collapse"],
  },
] as const;

export const parentChildRegulationBridgeModules = [
  {
    reg_bridge_id: "pc_regulation_bridge_core",
    title: "Parent-Child Regulation Bridge",
    steps: ["parent_grounding", "child_joining", "shared_regulation", "stabilization"],
    outcomes: ["Improved co-regulation", "Reduced emotional mismatch", "Better relational safety"],
  },
] as const;

export const childMicroTriggerIdentificationModules = [
  {
    micro_trigger_id: "ce_micro_trigger_core",
    title: "Child Micro-Trigger Identification",
    domains: ["tone_shift", "pace_change", "environmental_noise", "unexpected_touch"],
    tasks: ["task_micro_trigger_mapping_01"],
    outcomes: ["Improved trigger awareness", "Reduced sudden escalation", "Better emotional stability"],
  },
] as const;

export const parentEmotionalLoadVentingModules = [
  {
    load_vent_id: "pe_load_vent_core",
    title: "Parent Emotional Load Venting",
    steps: ["identify_load", "vent_safely", "regulate", "re-engage"],
    outcomes: ["Reduced emotional compression", "Improved regulation", "Better crisis resilience"],
  },
] as const;

export const childPredictableSafetyMomentsModules = [
  {
    safety_moments_id: "ce_safety_moments_core",
    title: "Child Predictable Safety Moments",
    components: [
      {
        component_id: "ce_component_1",
        type: "practice",
        instructions: "Create predictable daily safety moments.",
      },
    ],
    outcomes: ["Improved attachment", "Reduced anxiety", "Better emotional grounding"],
  },
] as const;

export const parentChildEmotionalResetSynchronizerModules = [
  {
    reset_sync_id: "pc_reset_sync_core",
    title: "Parent-Child Emotional Reset Synchronizer",
    steps: ["pause", "match_state", "reset_together", "reconnect"],
    outcomes: ["Improved synchrony", "Reduced escalation", "Better relational repair"],
  },
] as const;

export const highRiskEmotionalCollapseResponseModules = [
  {
    collapse_response_id: "hr_collapse_response_core",
    title: "High-Risk Emotional Collapse Response",
    steps: ["identify_collapse", "reduce_stimulation", "anchor_child", "slow_recovery"],
    outcomes: ["Reduced harm", "Improved crisis response", "Better emotional stabilization"],
  },
] as const;

export const parentCognitiveLoadReductionModules = [
  {
    cognitive_load_id: "pe_cognitive_load_core",
    title: "Parent Cognitive Load Reduction",
    domains: ["decision_fatigue", "emotional_processing", "task_overload"],
    tasks: ["task_cognitive_load_mapping_01"],
    outcomes: ["Improved clarity", "Reduced overwhelm", "Better decision-making"],
  },
] as const;

export const childEmotionalSafetyLoopModules = [
  {
    safety_loop_id: "ce_safety_loop_core",
    title: "Child Emotional Safety Loop",
    steps: ["predictability", "connection", "validation", "repair"],
    outcomes: ["Improved emotional safety", "Reduced fear responses", "Better relational trust"],
  },
] as const;

export const parentBehaviourSofteningModules = [
  {
    behaviour_soften_id: "pb_softening_core",
    title: "Parent Behaviour Softening",
    steps: ["tone_soften", "pace_reduce", "body_language_open", "repair_invitation"],
    outcomes: ["Reduced conflict", "Improved emotional safety", "Better connection"],
  },
] as const;

export const childEmotionalExpansionLadderModules = [
  {
    expansion_ladder_id: "ce_expansion_ladder_core",
    title: "Child Emotional Expansion Ladder",
    levels: ["identify", "express", "regulate", "recover"],
    outcomes: ["Improved resilience", "Better emotional literacy", "Reduced shutdown"],
  },
] as const;

export const parentTraumaMicroRepairModules = [
  {
    trauma_micro_repair_id: "pt_micro_repair_core",
    title: "Parent Trauma Micro-Repair",
    steps: ["notice_trigger", "regulate", "repair_self", "re-engage_safely"],
    outcomes: ["Reduced trauma-driven reactions", "Improved emotional stability", "Better parenting consistency"],
  },
] as const;

export const childBehaviourDeescalationPathwayModules = [
  {
    deescalation_path_id: "cb_deescalation_path_core",
    title: "Child Behaviour De-Escalation Pathway",
    pathway: ["detect", "slow", "anchor", "repair"],
    outcomes: ["Reduced behavioural spikes", "Improved regulation", "Better crisis outcomes"],
  },
] as const;

export const parentEmotionalGroundingArchitectureModules = [
  {
    grounding_arch_id: "pe_grounding_arch_core",
    title: "Parent Emotional Grounding Architecture",
    domains: ["breath", "body", "thought", "connection"],
    tasks: ["task_grounding_architecture_01"],
    outcomes: ["Improved grounding", "Reduced escalation", "Better emotional resilience"],
  },
] as const;

export const childPredictabilityAnchorModules = [
  {
    predict_anchor_id: "ce_predict_anchor_core",
    title: "Child Predictability Anchor",
    steps: ["identify_anchor", "practice_anchor", "use_anchor_in_transitions"],
    outcomes: ["Improved transition stability", "Reduced anxiety", "Better daily functioning"],
  },
] as const;

export const parentChildEmotionalRepairLadderModules = [
  {
    repair_ladder_id: "pc_repair_ladder_core",
    title: "Parent-Child Emotional Repair Ladder",
    levels: ["notice", "validate", "repair", "reconnect"],
    outcomes: ["Improved repair consistency", "Reduced rupture duration", "Better relational safety"],
  },
] as const;

export const highRiskHouseholdEmotionalSafetyModules = [
  {
    household_emotional_safety_id: "hr_household_safety_core",
    title: "High-Risk Household Emotional Safety",
    domains: ["tone_baseline", "stress_distribution", "conflict_frequency", "repair_cycles"],
    tasks: ["task_household_safety_mapping_01"],
    outcomes: ["Improved household stability", "Reduced emotional volatility", "Better family cohesion"],
  },
] as const;

export const childEmotionalMicroRepairModules = [
  {
    child_micro_repair_id: "ce_micro_repair_core",
    title: "Child Emotional Micro-Repair",
    steps: ["notice_distress", "validate", "anchor", "reconnect"],
    outcomes: ["Improved emotional recovery", "Reduced shutdown", "Better resilience"],
  },
] as const;

export const parentBehaviourPredictionModules = [
  {
    parent_prediction_id: "pb_prediction_core",
    title: "Parent Behaviour Prediction",
    inputs: ["stress_level", "environmental_factors", "child_state"],
    outputs: ["prediction_score", "risk_flags", "recommended_interventions"],
  },
] as const;

export const childEmotionalFlowStabilizerModules = [
  {
    flow_stabilizer_id: "ce_flow_stabilizer_core",
    title: "Child Emotional Flow Stabilizer",
    steps: ["identify_flow", "support_flow", "stabilize_flow", "repair_flow"],
    outcomes: ["Improved emotional consistency", "Reduced volatility", "Better daily functioning"],
  },
] as const;

export const familyEmotionalStabilityBlueprints = [
  {
    stability_blueprint_id: "fe_stability_blueprint_core",
    title: "Family Emotional Stability Blueprint",
    domains: ["tone", "routine", "communication", "repair_cycles"],
    tasks: ["task_stability_blueprint_01"],
    outcomes: ["Improved household stability", "Reduced emotional chaos", "Better relational cohesion"],
  },
] as const;

export function getStressLoadModuleById(stressModuleId: string) {
  return parentStressLoadCompressionModules.find((module) => module.stress_module_id === stressModuleId) ?? null;
}

export function getFamilyClimateModuleById(climateModuleId: string) {
  return familyEmotionalClimateModules.find((module) => module.climate_module_id === climateModuleId) ?? null;
}

export function getChildSocialSafetyModuleById(childSocialSafetyId: string) {
  return childSocialSafetyModules.find((module) => module.child_social_safety_id === childSocialSafetyId) ?? null;
}

export function getChildPatternStabilizerById(patternStabilizerId: string) {
  return childEmotionalPatternStabilizerModules.find((module) => module.pattern_stabilizer_id === patternStabilizerId) ?? null;
}

export function getFamilyArchitectureModuleById(architectureModuleId: string) {
  return familyEmotionalArchitectureModules.find((module) => module.architecture_module_id === architectureModuleId) ?? null;
}

export function getChildSensoryRegulationModuleById(sensoryRegulationId: string) {
  return childSensoryRegulationModules.find((module) => module.sensory_regulation_id === sensoryRegulationId) ?? null;
}

export function getParentEmotionalExpansionModuleById(emotionExpansionId: string) {
  return parentEmotionalExpansionModules.find((module) => module.emotion_expansion_id === emotionExpansionId) ?? null;
}

export function getFamilyStressRedistributionModuleById(stressRedistributionId: string) {
  return familyStressLoadRedistributionModules.find((module) => module.stress_redistribution_id === stressRedistributionId) ?? null;
}

export function getParentBehaviourCalibrationModuleById(calibrationModuleId: string) {
  return parentBehaviourCalibrationModules.find((module) => module.calibration_module_id === calibrationModuleId) ?? null;
}

export function getFamilyPredictabilityArchitectureModuleById(predictabilityArchId: string) {
  return familyPredictabilityArchitectureModules.find((module) => module.predictability_arch_id === predictabilityArchId) ?? null;
}

export function getChildMicroTriggerModuleById(microTriggerId: string) {
  return childMicroTriggerIdentificationModules.find((module) => module.micro_trigger_id === microTriggerId) ?? null;
}

export function getParentCognitiveLoadModuleById(cognitiveLoadId: string) {
  return parentCognitiveLoadReductionModules.find((module) => module.cognitive_load_id === cognitiveLoadId) ?? null;
}

export function getParentGroundingArchitectureModuleById(groundingArchId: string) {
  return parentEmotionalGroundingArchitectureModules.find((module) => module.grounding_arch_id === groundingArchId) ?? null;
}

export function getHighRiskHouseholdEmotionalSafetyModuleById(householdEmotionalSafetyId: string) {
  return highRiskHouseholdEmotionalSafetyModules.find(
    (module) => module.household_emotional_safety_id === householdEmotionalSafetyId,
  ) ?? null;
}

export function getFamilyEmotionalStabilityBlueprintById(stabilityBlueprintId: string) {
  return familyEmotionalStabilityBlueprints.find((module) => module.stability_blueprint_id === stabilityBlueprintId) ?? null;
}

export function getScenarioModuleById(moduleId: string) {
  return scenarioModules.find((module) => module.module_id === moduleId) ?? null;
}

export function getChildSafetyScenarioById(childScenarioId: string) {
  return childSafetyScenarioModules.find((module) => module.child_scenario_id === childScenarioId) ?? null;
}

export function getDecisionTreeById(decisionTreeId: string) {
  return multiScenarioDecisionTrees.find((tree) => tree.decision_tree_id === decisionTreeId) ?? null;
}

export function getHighRiskEscalationMapById(escalationMapId: string) {
  return highRiskSafetyEscalationMaps.find((map) => map.escalation_map_id === escalationMapId) ?? null;
}

export function getRiskMatrixById(riskMatrixId: string) {
  return multiDomainRiskMatrixModules.find((matrix) => matrix.risk_matrix_id === riskMatrixId) ?? null;
}

export function getCaseManagementMapById(caseMapId: string) {
  return multiTierCaseManagementMaps.find((map) => map.case_map_id === caseMapId) ?? null;
}

export function getGrowthTrackerById(growthTrackerId: string) {
  return parentCapacityGrowthTrackers.find((tracker) => tracker.growth_tracker_id === growthTrackerId) ?? null;
}

export function getSystemDiagnosticById(systemDiagnosticId: string) {
  return systemHealthDiagnosticModules.find((diagnostic) => diagnostic.system_diagnostic_id === systemDiagnosticId) ?? null;
}

export function getHighRiskContactSessionModuleById(contactSessionId: string) {
  return highRiskContactSessionModules.find((module) => module.contact_session_id === contactSessionId) ?? null;
}

export function getStabilityIndexById(stabilityIndexId: string) {
  return multiFactorStabilityIndexModules.find((module) => module.stability_index_id === stabilityIndexId) ?? null;
}
