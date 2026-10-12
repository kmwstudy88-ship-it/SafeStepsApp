import {
  advancedCoparentingModules,
  advancedBehaviourAnalyticsModules,
  advancedCommunicationBreakdownModules,
  achievementBadgeModules,
  automationPipelineBlueprints,
  behaviourChangeInterventionModules,
  childBehaviourStabilizationModules,
  childEmotionalExpansionModules,
  childEmotionalBoundaryModules,
  childEmotionalPatternStabilizerModules,
  childEmotionalMicroStabilityModules,
  childEmotionalResilienceLadderModules,
  childEmotionalSafetyAnchorModules,
  childAttachmentStrengtheningModules,
  childBehaviourPredictionModules,
  childBehaviourDeescalationPathwayModules,
  childModules,
  childMicroTriggerIdentificationModules,
  childEmotionalExpansionLadderModules,
  childEmotionalFlowStabilizerModules,
  childEmotionalMicroRepairModules,
  childEmotionalSafetyLoopModules,
  childPredictabilityRoutineModules,
  childPredictabilityAnchorModules,
  childPredictableSafetyMomentsModules,
  childRoutineStabilizerModules,
  childResilienceBuildingModules,
  childSafetyScenarioModules,
  childSensoryRegulationModules,
  childSocialResilienceModules,
  childSocialSafetyModules,
  complexTriggerChainModules,
  contactProgressionModules,
  complexBehaviourLoopModules,
  crossAgencyCollaborationModules,
  crossModuleOrchestrationMaps,
  curriculumScenarioBlocks,
  culturalSafetyModules,
  documentIntelligenceExtractionTemplates,
  disabilityInclusiveParentingModules,
  emotionalLoadDistributionModules,
  environmentalStressorModules,
  familyEmotionalClimateModules,
  familyEmotionalArchitectureModules,
  familyEmotionalStabilityBlueprints,
  familyPredictabilityArchitectureModules,
  familyStressLoadRedistributionModules,
  familySystemDynamicsModules,
  facilitatorScripts,
  fullFamilyReintegrationBlueprints,
  fullProgramSequenceTemplates,
  fullSystemIntegrationBlueprints,
  highComplexityFamilyInterventionModules,
  highRiskContactSessionModules,
  highRiskEmotionalCollapseResponseModules,
  highRiskHouseholdEmotionalSafetyModules,
  highRiskSafetyEscalationMaps,
  highRiskBehaviourInterruptionModules,
  highIntensityTriggerResponseModules,
  intergenerationalPatternModules,
  interSiblingRelationshipModules,
  longFormTherapeuticJourneyMaps,
  miniQuestModules,
  multiAdultHouseholdSafetyModules,
  multiChildFamilyModules,
  multiDomainRiskMatrixModules,
  multiFactorStabilityIndexModules,
  multiScenarioDecisionTrees,
  multiLocationServiceModules,
  multiStageProgressionMaps,
  multiTierCaseManagementMaps,
  neurodiversitySupportModules,
  parentCapacityGrowthTrackers,
  parentBehaviourPredictionModules,
  parentBehaviourSofteningModules,
  parentChildRepairCycleModules,
  parentChildEmotionalSynchronyModules,
  parentChildCoregulationLoopModules,
  parentChildConflictSofteningModules,
  parentChildEmotionalRepairLadderModules,
  parentChildEmotionalFlowModules,
  parentChildEmotionalMatchingModules,
  parentChildEmotionalResetSynchronizerModules,
  parentChildMicroRepairModules,
  parentChildRegulationBridgeModules,
  parentCognitiveReframeModules,
  parentCognitiveLoadReductionModules,
  parentEmotionalAnchoringModules,
  parentBehaviourCalibrationModules,
  parentBehaviourResetProtocolModules,
  parentEmotionalCompressionReleaseModules,
  parentEmotionalGroundingArchitectureModules,
  parentEmotionalLoadVentingModules,
  parentEmotionalExpansionModules,
  parentEmotionalPatternDisruptionModules,
  parentEmotionalResetLoopModules,
  parentIdentityReconstructionModules,
  parentStressLoadCompressionModules,
  parentSelfTrustReconstructionModules,
  parentTraumaMicroRepairModules,
  parentTraumaTriggerMappingModules,
  highConflictCoparentingDeescalationModules,
  childTraumaSignalRecognitionModules,
  professionalReportingTemplates,
  scenarioModules,
  scoringProfiles,
  systemHealthDiagnosticModules,
  taskModules,
  workshopModules,
} from "../lib/data/scenarioModules";
import {
  evaluateChildSafetyScenario,
  evaluateChildMicroTrigger,
  evaluateChildSocialSafety,
  evaluateChildPatternStabilizer,
  evaluateChildSensoryRegulation,
  evaluateCaseManagementTier,
  evaluateDecisionTree,
  evaluateFamilyEmotionalArchitecture,
  evaluateFamilyEmotionalClimate,
  evaluateFamilyEmotionalStabilityBlueprint,
  evaluateFamilyPredictabilityArchitecture,
  evaluateFamilyStressRedistribution,
  evaluateHighRiskContactSession,
  evaluateHighRiskEscalation,
  evaluateHighRiskHouseholdEmotionalSafety,
  evaluateParentCapacityGrowth,
  evaluateParentBehaviourCalibration,
  evaluateParentCognitiveLoad,
  evaluateParentEmotionalExpansion,
  evaluateParentGroundingArchitecture,
  evaluateParentStressLoad,
  evaluateRiskMatrix,
  evaluateScenarioCompletion,
  evaluateStabilityIndex,
  evaluateSystemHealthDiagnostic,
  listScenarioCategories,
} from "../lib/engines/scenarioActivityEngine";

describe("scenario activity engine", () => {
  test("ships the scenario/task structures requested for SafeSteps", () => {
    expect(listScenarioCategories()).toEqual([
      "parenting_response",
      "safety_protective_capacity",
      "co_parenting_relationship",
      "emotional_regulation",
      "communication_skill",
      "daily_routine_structure",
      "behaviour_guidance",
      "trauma_informed_parenting",
      "self_reflection_growth",
      "life_skills_executive_function",
    ]);
    expect(scenarioModules).toHaveLength(10);
    expect(taskModules.length).toBeGreaterThanOrEqual(2);
    expect(scoringProfiles.some((profile) => profile.profile_id === "standard_parenting_response_v1")).toBe(true);
    expect(curriculumScenarioBlocks[0].sequence[0]).toEqual(
      expect.objectContaining({ mode: "scenario", module_ref: "parenting_response_meltdown_response_01" }),
    );
    expect(contactProgressionModules[0].assessment.scoring_profile).toBe("contact_progression_v1");
    expect(workshopModules[0].sections.some((section) => section.type === "roleplay")).toBe(true);
    expect(facilitatorScripts[0].segments[0].facilitator_notes.length).toBeGreaterThan(0);
    expect(automationPipelineBlueprints[0].evidence_target).toBe("assessment_records");
  });

  test("ships badge, mini-quest, sequence, service, document, and integration templates", () => {
    expect(achievementBadgeModules[0]).toEqual(
      expect.objectContaining({
        achievement_id: "ach_regulation_foundation",
        title: "Regulation Foundation Badge",
      }),
    );
    expect(miniQuestModules[0].completion_rules.auto_award_achievement).toBe("ach_regulation_foundation");
    expect(fullProgramSequenceTemplates[0].completion_rules).toEqual(
      expect.objectContaining({
        required_weeks: 6,
        auto_generate_certificate: true,
      }),
    );
    expect(childModules[0]).toEqual(
      expect.objectContaining({
        child_module_id: "cm_emotion_identification_intro",
        privacy: "child_private_by_default",
      }),
    );
    expect(childSafetyScenarioModules[0].sharing_default).toBe("private");
    expect(multiLocationServiceModules[0].reporting.aggregate_to_central_dashboard).toBe(true);
    expect(documentIntelligenceExtractionTemplates[0].fields.map((field) => field.field_id)).toEqual([
      "fi_strengths",
      "fi_risks",
      "fi_recommendations",
    ]);
    expect(multiStageProgressionMaps[0].stages).toHaveLength(5);
    expect(fullSystemIntegrationBlueprints[0].systems.map((system) => system.system)).toContain("document_intelligence_engine");
  });

  test("ships advanced co-parenting, decision tree, and behaviour-change modules", () => {
    expect(advancedCoparentingModules[0]).toEqual(
      expect.objectContaining({
        coparenting_module_id: "cp_advanced_boundary_negotiation",
        title: "Advanced Boundary Negotiation",
      }),
    );
    expect(advancedCoparentingModules[0].components.map((component) => component.type)).toEqual([
      "education",
      "scenario",
      "decision_tree",
      "practice",
    ]);
    expect(multiScenarioDecisionTrees[0]).toEqual(
      expect.objectContaining({
        decision_tree_id: "dt_boundary_negotiation_01",
        root: "node_1",
      }),
    );
    expect(behaviourChangeInterventionModules[0].measurement).toEqual(
      expect.objectContaining({
        scoring_profile: "behaviour_change_v1",
        dimensions: ["emotional_regulation", "consistency", "protective_capacity"],
      }),
    );
  });

  test("ships family dynamics, pattern, escalation, analytics, and orchestration modules", () => {
    expect(multiChildFamilyModules[0]).toEqual(
      expect.objectContaining({
        multi_child_module_id: "mc_family_dynamics_core",
        title: "Core Multi-Child Family Dynamics",
      }),
    );
    expect(multiChildFamilyModules[0].children_profiles).toHaveLength(2);
    expect(intergenerationalPatternModules[0].components.map((component) => component.type)).toEqual([
      "reflection",
      "scenario",
      "task",
    ]);
    expect(highRiskSafetyEscalationMaps[0].levels.map((level) => level.label)).toEqual([
      "Early Warning Signs",
      "Active Risk",
      "Critical Risk",
    ]);
    expect(familySystemDynamicsModules[0].components[0]).toEqual(
      expect.objectContaining({ type: "mapping" }),
    );
    expect(advancedBehaviourAnalyticsModules[0].analysis).toEqual({
      detect_patterns: true,
      predict_escalation: true,
      flag_inconsistencies: true,
    });
    expect(crossModuleOrchestrationMaps[0].links).toContainEqual({
      from: "analytics_modules",
      to: "safety_escalation_maps",
    });
  });

  test("ships complex family intervention, risk matrix, and long-form journey modules", () => {
    expect(highComplexityFamilyInterventionModules[0]).toEqual(
      expect.objectContaining({
        family_intervention_id: "fi_complex_case_core",
        title: "Complex Family Intervention Core Module",
      }),
    );
    expect(highComplexityFamilyInterventionModules[0].integration.links_to).toEqual([
      "safety_plan_id",
      "reunification_engine",
      "analytics_module_id",
    ]);
    expect(multiDomainRiskMatrixModules[0].domains.map((domain) => domain.domain_id)).toEqual([
      "rm_safety",
      "rm_emotional_regulation",
      "rm_relationship",
      "rm_environment",
    ]);
    expect(longFormTherapeuticJourneyMaps[0].phases.reduce((total, phase) => total + phase.duration_weeks, 0)).toBe(36);
    expect(longFormTherapeuticJourneyMaps[0].completion_rules.required_phases).toEqual([1, 2, 3]);
  });

  test("ships cross-agency, reporting, tiering, inclusion, stressor, loop, growth, and diagnostic modules", () => {
    expect(crossAgencyCollaborationModules[0].agencies).toEqual([
      "child_safety",
      "family_support",
      "mental_health",
      "education",
    ]);
    expect(professionalReportingTemplates[0].sections).toEqual([
      "summary",
      "strengths",
      "risks",
      "recommendations",
      "next_steps",
    ]);
    expect(multiTierCaseManagementMaps[0].tiers.map((tier) => tier.label)).toEqual([
      "Low Support",
      "Moderate Support",
      "High Support",
    ]);
    expect(culturalSafetyModules[0].components[1]).toEqual(expect.objectContaining({ type: "scenario" }));
    expect(disabilityInclusiveParentingModules[0].components[1]).toEqual(expect.objectContaining({ type: "task" }));
    expect(neurodiversitySupportModules[0].components[1]).toEqual(expect.objectContaining({ module_ref: "sensory_overload_01" }));
    expect(environmentalStressorModules[0].stressors).toContain("financial_pressure");
    expect(complexBehaviourLoopModules[0].intervention_points).toEqual(["trigger_identification", "regulation_step", "repair_step"]);
    expect(parentCapacityGrowthTrackers[0].tracking_rules.auto_generate_trends).toBe(true);
    expect(systemHealthDiagnosticModules[0].outputs).toEqual([
      "system_health_report",
      "recommended_fixes",
      "performance_metrics",
    ]);
  });

  test("ships high-risk contact, repair, household, communication, load, trigger, identity, resilience, stability, and reintegration modules", () => {
    expect(highRiskContactSessionModules[0].risk_factors).toEqual([
      "recent conflict",
      "emotional escalation",
      "child fear indicators",
    ]);
    expect(parentChildRepairCycleModules[0].steps).toEqual([
      "rupture_identification",
      "regulation",
      "repair_attempt",
      "connection_rebuild",
    ]);
    expect(multiAdultHouseholdSafetyModules[0].risk_checks).toContain("substance_use");
    expect(advancedCommunicationBreakdownModules[0].patterns).toContain("tone_escalation");
    expect(emotionalLoadDistributionModules[0].domains).toContain("decision_making");
    expect(complexTriggerChainModules[0].chain).toEqual([
      "initial_trigger",
      "secondary_trigger",
      "behaviour_response",
      "child_reaction",
      "cycle_outcome",
    ]);
    expect(parentIdentityReconstructionModules[0].components[0]).toEqual(expect.objectContaining({ type: "reflection" }));
    expect(childResilienceBuildingModules[0].components[1]).toEqual(expect.objectContaining({ type: "scenario" }));
    expect(multiFactorStabilityIndexModules[0].outputs).toEqual([
      "stability_score",
      "risk_flags",
      "recommended_interventions",
    ]);
    expect(fullFamilyReintegrationBlueprints[0].phases.map((phase) => phase.label)).toEqual([
      "Preparation",
      "Supervised Contact",
      "Supported Contact",
      "Independent Contact",
      "Full Reintegration",
    ]);
  });

  test("ships sibling, stress-load, child emotion, trigger response, reframe, stabilization, anchoring, routine, synchrony, and climate modules", () => {
    expect(interSiblingRelationshipModules[0].components.map((component) => component.type)).toEqual(["scenario", "task"]);
    expect(parentStressLoadCompressionModules[0].domains).toEqual(["emotional_load", "task_load", "decision_load"]);
    expect(childEmotionalExpansionModules[0].components[0]).toEqual(expect.objectContaining({ type: "activity" }));
    expect(highIntensityTriggerResponseModules[0].steps).toEqual([
      "trigger_detection",
      "regulation_protocol",
      "safe_response",
      "repair",
    ]);
    expect(parentCognitiveReframeModules[0].components[0]).toEqual(expect.objectContaining({ type: "reflection" }));
    expect(childBehaviourStabilizationModules[0].components[1]).toEqual(expect.objectContaining({ task_ref: "task_stability_practice_01" }));
    expect(parentEmotionalAnchoringModules[0].tasks).toEqual(["task_anchor_identification_01", "task_anchor_application_01"]);
    expect(childPredictabilityRoutineModules[0].components[0]).toEqual(expect.objectContaining({ type: "activity" }));
    expect(parentChildEmotionalSynchronyModules[0].components.map((component) => component.type)).toEqual(["education", "practice"]);
    expect(familyEmotionalClimateModules[0].domains).toEqual(["tone", "stress_level", "communication_style", "predictability"]);
  });

  test("ships co-regulation, co-parent de-escalation, trauma signal, compression release, social safety, reset, boundary, self-trust, pattern, and architecture modules", () => {
    expect(parentChildCoregulationLoopModules[0].steps).toEqual([
      "parent_regulates",
      "child_matches",
      "parent_adjusts",
      "child_stabilizes",
    ]);
    expect(highConflictCoparentingDeescalationModules[0].patterns).toContain("reactive messaging");
    expect(childTraumaSignalRecognitionModules[0].signals).toEqual(["freeze_response", "avoidance", "hypervigilance", "shutdown"]);
    expect(parentEmotionalCompressionReleaseModules[0].steps).toEqual([
      "identify_compression",
      "release_protocol",
      "post_release_regulation",
    ]);
    expect(childSocialSafetyModules[0].domains).toEqual(["peer_interactions", "school_environment", "online_spaces"]);
    expect(parentBehaviourResetProtocolModules[0].steps).toEqual(["pause", "regulate", "reset_intention", "respond_safely"]);
    expect(childEmotionalBoundaryModules[0].components.map((component) => component.type)).toEqual(["education", "activity"]);
    expect(parentSelfTrustReconstructionModules[0].components[0]).toEqual(expect.objectContaining({ type: "reflection" }));
    expect(childEmotionalPatternStabilizerModules[0].patterns).toContain("school_transition_stress");
    expect(familyEmotionalArchitectureModules[0].domains).toEqual([
      "tone_baseline",
      "stress_distribution",
      "communication_flow",
      "repair_cycles",
    ]);
  });

  test("ships micro-repair, sensory, disruption, resilience, matching, interruption, expansion, routine, softening, redistribution, anchor, calibration, attachment, reset, prediction, trauma mapping, micro-stability, flow, predictability, and ladder modules", () => {
    expect(parentChildMicroRepairModules[0].steps).toEqual(["notice_rupture", "acknowledge", "repair_phrase", "reconnect"]);
    expect(childSensoryRegulationModules[0].domains).toEqual(["sound", "touch", "movement", "light"]);
    expect(parentEmotionalPatternDisruptionModules[0].patterns).toEqual(["reactive_tone", "shutdown", "overcontrol"]);
    expect(childSocialResilienceModules[0].components[0]).toEqual(expect.objectContaining({ type: "activity" }));
    expect(parentChildEmotionalMatchingModules[0].steps).toEqual(["observe_child_state", "match_tone", "match_pace", "guide_to_regulation"]);
    expect(highRiskBehaviourInterruptionModules[0].behaviours).toEqual(["aggression", "property_damage", "unsafe_running"]);
    expect(parentEmotionalExpansionModules[0].domains).toEqual(["awareness", "expression", "processing"]);
    expect(childRoutineStabilizerModules[0].routine_points).toEqual(["morning", "school_transition", "bedtime"]);
    expect(parentChildConflictSofteningModules[0].steps).toEqual(["slow_down", "soften_tone", "validate_feelings", "offer_repair"]);
    expect(familyStressLoadRedistributionModules[0].domains).toEqual(["tasks", "emotional_support", "decision_making"]);
    expect(childEmotionalSafetyAnchorModules[0].steps).toEqual(["identify_anchor", "practice_anchor", "use_anchor_in_stress"]);
    expect(parentBehaviourCalibrationModules[0].domains).toEqual(["tone", "pace", "volume", "body_language"]);
    expect(childAttachmentStrengtheningModules[0].components[0]).toEqual(expect.objectContaining({ type: "practice" }));
    expect(parentEmotionalResetLoopModules[0].steps).toEqual(["pause", "regulate", "reset", "re-engage"]);
    expect(childBehaviourPredictionModules[0].outputs).toEqual(["prediction_score", "risk_flags", "recommended_interventions"]);
    expect(parentTraumaTriggerMappingModules[0].tasks).toEqual(["task_trigger_identification_01", "task_trigger_response_01"]);
    expect(childEmotionalMicroStabilityModules[0].domains).toEqual(["moment_to_moment_regulation", "micro_triggers", "micro_repairs"]);
    expect(parentChildEmotionalFlowModules[0].flow_points).toEqual(["initiation", "matching", "guiding", "stabilizing"]);
    expect(familyPredictabilityArchitectureModules[0].domains).toEqual(["routine", "tone", "communication", "repair_cycles"]);
    expect(childEmotionalResilienceLadderModules[0].levels).toEqual(["identify_feelings", "express_feelings", "regulate_feelings", "recover_from_stress"]);
  });

  test("ships regulation bridge, micro-trigger, reset, collapse, grounding, household safety, prediction, and stability blueprint modules", () => {
    expect(parentChildRegulationBridgeModules[0].steps).toEqual([
      "parent_grounding",
      "child_joining",
      "shared_regulation",
      "stabilization",
    ]);
    expect(childMicroTriggerIdentificationModules[0].domains).toEqual([
      "tone_shift",
      "pace_change",
      "environmental_noise",
      "unexpected_touch",
    ]);
    expect(parentEmotionalLoadVentingModules[0].steps).toEqual(["identify_load", "vent_safely", "regulate", "re-engage"]);
    expect(childPredictableSafetyMomentsModules[0].components[0]).toEqual(expect.objectContaining({ type: "practice" }));
    expect(parentChildEmotionalResetSynchronizerModules[0].steps).toEqual(["pause", "match_state", "reset_together", "reconnect"]);
    expect(highRiskEmotionalCollapseResponseModules[0].steps).toEqual([
      "identify_collapse",
      "reduce_stimulation",
      "anchor_child",
      "slow_recovery",
    ]);
    expect(parentCognitiveLoadReductionModules[0].domains).toEqual([
      "decision_fatigue",
      "emotional_processing",
      "task_overload",
    ]);
    expect(childEmotionalSafetyLoopModules[0].steps).toEqual(["predictability", "connection", "validation", "repair"]);
    expect(parentBehaviourSofteningModules[0].steps).toEqual([
      "tone_soften",
      "pace_reduce",
      "body_language_open",
      "repair_invitation",
    ]);
    expect(childEmotionalExpansionLadderModules[0].levels).toEqual(["identify", "express", "regulate", "recover"]);
    expect(parentTraumaMicroRepairModules[0].steps).toEqual(["notice_trigger", "regulate", "repair_self", "re-engage_safely"]);
    expect(childBehaviourDeescalationPathwayModules[0].pathway).toEqual(["detect", "slow", "anchor", "repair"]);
    expect(parentEmotionalGroundingArchitectureModules[0].tasks).toEqual(["task_grounding_architecture_01"]);
    expect(childPredictabilityAnchorModules[0].steps).toEqual(["identify_anchor", "practice_anchor", "use_anchor_in_transitions"]);
    expect(parentChildEmotionalRepairLadderModules[0].levels).toEqual(["notice", "validate", "repair", "reconnect"]);
    expect(highRiskHouseholdEmotionalSafetyModules[0].domains).toEqual([
      "tone_baseline",
      "stress_distribution",
      "conflict_frequency",
      "repair_cycles",
    ]);
    expect(childEmotionalMicroRepairModules[0].steps).toEqual(["notice_distress", "validate", "anchor", "reconnect"]);
    expect(parentBehaviourPredictionModules[0].outputs).toEqual(["prediction_score", "risk_flags", "recommended_interventions"]);
    expect(childEmotionalFlowStabilizerModules[0].steps).toEqual([
      "identify_flow",
      "support_flow",
      "stabilize_flow",
      "repair_flow",
    ]);
    expect(familyEmotionalStabilityBlueprints[0].domains).toEqual(["tone", "routine", "communication", "repair_cycles"]);
  });

  test("scores safe scenario branches into an assessment-ready evidence payload", () => {
    const result = evaluateScenarioCompletion({
      moduleId: "parenting_response_meltdown_response_01",
      userId: "user-1",
      caseId: "case-1",
      lessonId: "lesson-1",
      questId: "quest-1",
      responses: [
        { stepId: "step_reflect", responseText: "I notice I am embarrassed and tense." },
        { stepId: "step_decide", selectedOptionId: "safe_regulated" },
        { stepId: "step_repair", responseText: "Move to a quiet place, reconnect, and repair." },
      ],
    });

    expect(result.score).toBeGreaterThan(1);
    expect(result.dimensionScores).toEqual(
      expect.objectContaining({
        protective_capacity: 2,
        emotional_regulation: 3,
        communication: 2,
      }),
    );
    expect(result.riskFlags).toEqual({ amber: [], red: [] });
    expect(result.assessmentRecord).toEqual(
      expect.objectContaining({
        user_id: "user-1",
        case_id: "case-1",
        lesson_id: "lesson-1",
        quest_id: "quest-1",
        evidence_type: "scenario_activity",
        validated_by: "system",
      }),
    );
    expect(result.assessmentRecord.evidence_payload).toEqual(
      expect.objectContaining({
        module_id: "parenting_response_meltdown_response_01",
        source: "scenario_activity_engine",
      }),
    );
  });

  test("turns unsafe branches into risk flags and progression hard blocks", () => {
    const result = evaluateScenarioCompletion({
      moduleId: "safety_protective_capacity_child_disclosure_response_02",
      userId: "user-1",
      caseId: "case-1",
      responses: [{ stepId: "step_decide", selectedOptionId: "unsafe_reactive" }],
      validatedBy: "facilitator",
    });

    expect(result.score).toBeLessThan(0);
    expect(result.riskFlags.red).toHaveLength(1);
    expect(result.hardBlocks[0]).toContain("Facilitator review is required");
    expect(result.requiredInterventions).toContain("Review risk branch, safety plan, and repair action before progression.");
    expect(result.assessmentRecord.validated_by).toBe("facilitator");
  });

  test("keeps child safety scenario records private unless the child shares them", () => {
    const privateResult = evaluateChildSafetyScenario({
      childScenarioId: "cs_safe_touch_01",
      childId: "child-1",
      caseId: "case-1",
      responses: [{ stepId: "cs_step_2", selectedOptionId: "tell_safe_adult" }],
    });

    expect(privateResult.score).toBe(3);
    expect(privateResult.parentVisible).toBe(false);
    expect(privateResult.childRecord.share_audience).toBe("private");
    expect(privateResult.childRecord.structured_data.parent_visible).toBe(false);

    const sharedResult = evaluateChildSafetyScenario({
      childScenarioId: "cs_safe_touch_01",
      childId: "child-1",
      caseId: "case-1",
      responses: [{ stepId: "cs_step_2", selectedOptionId: "stay_silent" }],
      shareAudience: "parent",
    });

    expect(sharedResult.score).toBe(-2);
    expect(sharedResult.safetyFlags.review).toHaveLength(1);
    expect(sharedResult.parentVisible).toBe(true);
    expect(sharedResult.childRecord.share_audience).toBe("parent");
  });

  test("evaluates positive multi-scenario decision tree paths into assessment evidence", () => {
    const result = evaluateDecisionTree({
      decisionTreeId: "dt_boundary_negotiation_01",
      selectedOptionIds: ["opt_b", "opt_f"],
      userId: "user-1",
      caseId: "case-1",
      questId: "quest-1",
    });

    expect(result.endingId).toBe("end_positive");
    expect(result.summary).toBe("You maintained boundaries and reduced conflict.");
    expect(result.scores).toEqual(
      expect.objectContaining({
        boundary_strength: 7,
        communication: 3,
        conflict_risk: -1,
      }),
    );
    expect(result.riskFlags).toEqual({ amber: [], red: [] });
    expect(result.assessmentRecord).toEqual(
      expect.objectContaining({
        evidence_type: "decision_tree",
        lesson_id: "dt_boundary_negotiation_01",
        quest_id: "quest-1",
      }),
    );
  });

  test("flags negative decision tree endings for review", () => {
    const result = evaluateDecisionTree({
      decisionTreeId: "dt_boundary_negotiation_01",
      selectedOptionIds: ["opt_a", "opt_d"],
      userId: "user-1",
      caseId: "case-1",
      validatedBy: "facilitator",
    });

    expect(result.endingId).toBe("end_negative");
    expect(result.scores.boundary_strength).toBe(-5);
    expect(result.scores.conflict_risk).toBe(1);
    expect(result.riskFlags.amber).toEqual(["dt_boundary_negotiation_01:conflict_risk"]);
    expect(result.riskFlags.red).toEqual(["dt_boundary_negotiation_01:negative_ending"]);
    expect(result.assessmentRecord.validated_by).toBe("facilitator");
  });

  test("evaluates high-risk safety escalation maps by highest matched indicator", () => {
    const result = evaluateHighRiskEscalation({
      escalationMapId: "hr_safety_escalation_core",
      observedIndicators: ["raised voice", "weapons"],
    });

    expect(result.recommendedLevel).toEqual({
      level: 3,
      label: "Critical Risk",
      actions: ["call emergency services", "exit environment immediately"],
    });
    expect(result.requiresImmediateHumanReview).toBe(true);
    expect(result.matchedIndicators).toEqual(["weapons", "raised voice"]);
    expect(result.integrationLinks).toEqual(["safety_plan_id", "crisis_module_id", "contact_progression_engine"]);
  });

  test("synthesizes multi-domain risk matrix scores into flags and interventions", () => {
    const result = evaluateRiskMatrix({
      riskMatrixId: "rm_multi_domain_core",
      domainScores: {
        rm_safety: 5,
        rm_emotional_regulation: 3,
        rm_relationship: 2,
        rm_environment: 1,
      },
    });

    expect(result.riskProfile).toBe("high");
    expect(result.flaggedDomains).toEqual(["rm_safety", "rm_emotional_regulation"]);
    expect(result.priorityInterventionList).toEqual([
      "Review Safety indicators and assign targeted intervention.",
      "Review Emotional Regulation indicators and assign targeted intervention.",
    ]);
    expect(result.safetyEscalationLevel).toBe(3);
  });

  test("evaluates case tier from risk and completed requirements", () => {
    const result = evaluateCaseManagementTier({
      caseMapId: "cm_multi_tier_core",
      riskProfile: "high",
      completedRequirements: ["basic_safety", "routine_stability"],
    });

    expect(result.recommendedTier).toEqual(
      expect.objectContaining({
        tier: 3,
        label: "High Support",
      }),
    );
    expect(result.reasons).toContain("Risk profile maps to tier 3.");
  });

  test("evaluates parent capacity growth trends", () => {
    const result = evaluateParentCapacityGrowth({
      growthTrackerId: "gc_parent_capacity_core",
      records: [
        { dimension: "regulation", score: 2, sequence: 1 },
        { dimension: "regulation", score: 4, sequence: 2 },
        { dimension: "communication", score: 3, sequence: 1 },
        { dimension: "communication", score: 3, sequence: 2 },
      ],
    });

    expect(result.dimensionAverages.regulation).toBe(3);
    expect(result.trends.regulation).toBe("improving");
    expect(result.trends.communication).toBe("stable");
    expect(result.trends.protective_capacity).toBe("insufficient_data");
  });

  test("evaluates system health diagnostic checks", () => {
    const result = evaluateSystemHealthDiagnostic({
      systemDiagnosticId: "sd_system_health_core",
      checkStatuses: {
        module_integrity: true,
        scoring_engine_status: false,
        progression_engine_status: true,
        DI_engine_status: true,
        analytics_engine_status: false,
      },
    });

    expect(result.status).toBe("needs_attention");
    expect(result.failedChecks).toEqual(["scoring_engine_status", "analytics_engine_status"]);
    expect(result.performanceMetrics).toEqual({ passedChecks: 3, totalChecks: 5 });
  });

  test("evaluates high-risk contact sessions into intervention and progression signals", () => {
    const result = evaluateHighRiskContactSession({
      contactSessionId: "cs_high_risk_core",
      observedRiskFactors: ["recent conflict", "child fear indicators"],
    });

    expect(result.riskLevel).toBe("red");
    expect(result.facilitatorInterventionRequired).toBe(true);
    expect(result.progressionSignal).toBe("escalate_review");
    expect(result.recommendedActions).toEqual(["Facilitator intervenes if escalation indicators appear."]);
  });

  test("evaluates multi-factor stability index scores", () => {
    const result = evaluateStabilityIndex({
      stabilityIndexId: "si_multi_factor_core",
      factorScores: {
        emotional_regulation: 4,
        environmental_consistency: 3,
        relationship_safety: 2,
        routine_stability: 3,
        financial_stress: 1,
      },
    });

    expect(result.stabilityScore).toBe(2.6);
    expect(result.status).toBe("unstable");
    expect(result.riskFlags).toEqual(["relationship_safety", "financial_stress"]);
    expect(result.recommendedInterventions).toEqual([
      "Assign targeted support for relationship safety.",
      "Assign targeted support for financial stress.",
    ]);
  });

  test("evaluates parent stress-load compression pressure", () => {
    const result = evaluateParentStressLoad({
      stressModuleId: "ps_load_compression_core",
      domainScores: {
        emotional_load: 5,
        task_load: 4,
        decision_load: 2,
      },
    });

    expect(result.averageScore).toBe(3.7);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["emotional_load", "task_load"]);
    expect(result.recommendedTasks).toEqual(["task_stress_identification_01", "task_load_reduction_01"]);
  });

  test("evaluates family emotional climate pressure", () => {
    const result = evaluateFamilyEmotionalClimate({
      climateModuleId: "fe_climate_core",
      domainScores: {
        tone: 4,
        stress_level: 5,
        communication_style: 4,
        predictability: 3,
      },
    });

    expect(result.averageScore).toBe(4);
    expect(result.pressureLevel).toBe("high");
    expect(result.flaggedDomains).toEqual(["tone", "stress_level", "communication_style"]);
    expect(result.recommendedTasks).toEqual(["task_climate_mapping_01", "task_climate_adjustment_01"]);
  });

  test("evaluates child social safety pressure", () => {
    const result = evaluateChildSocialSafety({
      childSocialSafetyId: "cs_social_safety_core",
      domainScores: {
        peer_interactions: 4,
        school_environment: 2,
        online_spaces: 5,
      },
    });

    expect(result.averageScore).toBe(3.7);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["peer_interactions", "online_spaces"]);
    expect(result.recommendedTasks).toEqual(["task_social_safety_mapping_01", "task_safe_friendship_01"]);
  });

  test("evaluates child emotional pattern stabilizer pressure", () => {
    const result = evaluateChildPatternStabilizer({
      patternStabilizerId: "ce_pattern_stabilizer_core",
      patternScores: {
        morning_anxiety: 4,
        bedtime_resistance: 4,
        school_transition_stress: 5,
      },
    });

    expect(result.averageScore).toBe(4.3);
    expect(result.pressureLevel).toBe("high");
    expect(result.flaggedDomains).toEqual(["morning_anxiety", "bedtime_resistance", "school_transition_stress"]);
    expect(result.recommendedTasks).toEqual(["task_pattern_identification_01", "task_stabilizer_practice_01"]);
  });

  test("evaluates family emotional architecture pressure", () => {
    const result = evaluateFamilyEmotionalArchitecture({
      architectureModuleId: "fe_architecture_core",
      domainScores: {
        tone_baseline: 3,
        stress_distribution: 4,
        communication_flow: 4,
        repair_cycles: 2,
      },
    });

    expect(result.averageScore).toBe(3.3);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["stress_distribution", "communication_flow"]);
    expect(result.recommendedTasks).toEqual(["task_architecture_mapping_01", "task_architecture_adjustment_01"]);
  });

  test("evaluates child sensory regulation pressure", () => {
    const result = evaluateChildSensoryRegulation({
      sensoryRegulationId: "cs_sensory_regulation_core",
      domainScores: { sound: 5, touch: 4, movement: 2, light: 3 },
    });

    expect(result.averageScore).toBe(3.5);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["sound", "touch"]);
    expect(result.recommendedTasks).toEqual(["task_sensory_mapping_01", "task_sensory_toolkit_01"]);
  });

  test("evaluates parent emotional expansion pressure", () => {
    const result = evaluateParentEmotionalExpansion({
      emotionExpansionId: "pe_expansion_core",
      domainScores: { awareness: 4, expression: 2, processing: 4 },
    });

    expect(result.averageScore).toBe(3.3);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["awareness", "processing"]);
    expect(result.recommendedTasks).toEqual(["task_emotion_expansion_01"]);
  });

  test("evaluates family stress redistribution pressure", () => {
    const result = evaluateFamilyStressRedistribution({
      stressRedistributionId: "fs_stress_redistribution_core",
      domainScores: { tasks: 4, emotional_support: 5, decision_making: 4 },
    });

    expect(result.averageScore).toBe(4.3);
    expect(result.pressureLevel).toBe("high");
    expect(result.flaggedDomains).toEqual(["tasks", "emotional_support", "decision_making"]);
    expect(result.recommendedTasks).toEqual(["task_stress_distribution_01"]);
  });

  test("evaluates parent behaviour calibration pressure", () => {
    const result = evaluateParentBehaviourCalibration({
      calibrationModuleId: "pb_calibration_core",
      domainScores: { tone: 4, pace: 3, volume: 5, body_language: 2 },
    });

    expect(result.averageScore).toBe(3.5);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["tone", "volume"]);
    expect(result.recommendedTasks).toEqual(["task_calibration_practice_01"]);
  });

  test("evaluates family predictability architecture pressure", () => {
    const result = evaluateFamilyPredictabilityArchitecture({
      predictabilityArchId: "fa_predictability_core",
      domainScores: { routine: 4, tone: 4, communication: 3, repair_cycles: 5 },
    });

    expect(result.averageScore).toBe(4);
    expect(result.pressureLevel).toBe("high");
    expect(result.flaggedDomains).toEqual(["routine", "tone", "repair_cycles"]);
    expect(result.recommendedTasks).toEqual(["task_predictability_mapping_01"]);
  });

  test("evaluates child micro-trigger pressure", () => {
    const result = evaluateChildMicroTrigger({
      microTriggerId: "ce_micro_trigger_core",
      domainScores: { tone_shift: 4, pace_change: 2, environmental_noise: 5, unexpected_touch: 3 },
    });

    expect(result.averageScore).toBe(3.5);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["tone_shift", "environmental_noise"]);
    expect(result.recommendedTasks).toEqual(["task_micro_trigger_mapping_01"]);
  });

  test("evaluates parent cognitive load pressure", () => {
    const result = evaluateParentCognitiveLoad({
      cognitiveLoadId: "pe_cognitive_load_core",
      domainScores: { decision_fatigue: 5, emotional_processing: 4, task_overload: 4 },
    });

    expect(result.averageScore).toBe(4.3);
    expect(result.pressureLevel).toBe("high");
    expect(result.flaggedDomains).toEqual(["decision_fatigue", "emotional_processing", "task_overload"]);
    expect(result.recommendedTasks).toEqual(["task_cognitive_load_mapping_01"]);
  });

  test("evaluates parent grounding architecture pressure", () => {
    const result = evaluateParentGroundingArchitecture({
      groundingArchId: "pe_grounding_arch_core",
      domainScores: { breath: 4, body: 3, thought: 4, connection: 2 },
    });

    expect(result.averageScore).toBe(3.3);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["breath", "thought"]);
    expect(result.recommendedTasks).toEqual(["task_grounding_architecture_01"]);
  });

  test("evaluates high-risk household emotional safety pressure", () => {
    const result = evaluateHighRiskHouseholdEmotionalSafety({
      householdEmotionalSafetyId: "hr_household_safety_core",
      domainScores: { tone_baseline: 4, stress_distribution: 5, conflict_frequency: 5, repair_cycles: 2 },
    });

    expect(result.averageScore).toBe(4);
    expect(result.pressureLevel).toBe("high");
    expect(result.flaggedDomains).toEqual(["tone_baseline", "stress_distribution", "conflict_frequency"]);
    expect(result.recommendedTasks).toEqual(["task_household_safety_mapping_01"]);
  });

  test("evaluates family emotional stability blueprint pressure", () => {
    const result = evaluateFamilyEmotionalStabilityBlueprint({
      stabilityBlueprintId: "fe_stability_blueprint_core",
      domainScores: { tone: 3, routine: 4, communication: 4, repair_cycles: 4 },
    });

    expect(result.averageScore).toBe(3.8);
    expect(result.pressureLevel).toBe("moderate");
    expect(result.flaggedDomains).toEqual(["routine", "communication", "repair_cycles"]);
    expect(result.recommendedTasks).toEqual(["task_stability_blueprint_01"]);
  });
});
