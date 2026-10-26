# Document Intelligence Skills - Complete Comprehensive Catalog

## Overview

SafeSteps Document Intelligence provides **25 comprehensive analysis skills** covering all dimensions of child welfare casework. This document organizes skills by thematic domain and includes implementation details for handlers.

**Total Skills: 25**
- Core Decision-Support: 8 skills
- Family Dynamics & Wellbeing: 9 skills
- Service & Compliance Tracking: 4 skills
- Systemic & Legal Context: 4 skills

---

## Domain 1: Core Decision-Support Skills (8)

These skills establish foundational evidence standards and identify key inconsistencies that underpin all downstream analysis.

### 1. Evidence Extraction
**Skill ID:** `evidence_extraction`

Separate claims from supporting evidence; identify evidence types and gaps.

```javascript
{
  evidence_items: [
    {
      claim: string,
      evidence: string,
      evidence_type: 'observation|allegation|record|opinion|unknown',
      confidence: 0..1,
      source_locator: string
    }
  ],
  evidence_gaps: [
    { topic: string, missing_or_unclear: string }
  ]
}
```

---

### 2. Contradiction Detection
**Skill ID:** `contradiction_detection`

Flag materially inconsistent statements without adjudicating truth.

```javascript
{
  contradictions: [
    {
      statement_a: string,
      statement_b: string,
      explanation: string,
      severity: 'low|medium|high',
      confidence: 0..1
    }
  ],
  unresolved_questions: [string]
}
```

---

### 3. Timeline Extraction
**Skill ID:** `timeline_extraction`

Build chronological sequences from dates, relative time phrases, and event narratives.

```javascript
{
  timeline_events: [
    {
      date: string,
      date_precision: 'exact|approximate|unknown',
      event: string,
      actors: [string],
      source_locator: string,
      confidence: 0..1
    }
  ],
  chronology_gaps: [string]
}
```

---

### 4. Requirement & Obligation Extraction
**Skill ID:** `requirement_extraction`

Parse court orders, service plans, and commitments for explicit obligations.

```javascript
{
  obligations: [
    {
      party: string,
      obligation: string,
      due_date: string,
      status_hint: string,
      source_locator: string,
      confidence: 0..1
    }
  ],
  ambiguous_requirements: [string]
}
```

---

### 5. Risk Signal Extraction
**Skill ID:** `risk_signal_extraction`

Extract risk and protective factor signals without deterministic risk scoring.

```javascript
{
  risk_signals: [
    {
      factor: string,
      type: string,
      severity: 'low|medium|high',
      evidence_locator: string,
      confidence: 0..1
    }
  ],
  protective_signals: [
    {
      factor: string,
      evidence_locator: string
    }
  ],
  uncertainties: [string]
}
```

---

### 6. Concern Classification
**Skill ID:** `concern_classification`

Categorize concerns by domain: safety, wellbeing, compliance, engagement, resource, relational.

```javascript
{
  concerns: [
    {
      category: 'safety|compliance|credibility|engagement|resource|relational',
      severity: 'low|medium|high',
      description: string,
      source_locator: string,
      confidence: 0..1
    }
  ],
  triage_hints: [string]
}
```

---

### 7. Fairness Detection
**Skill ID:** `fairness_detection`

Flag loaded language, dispositional framing, and opportunity for objective reframes.

```javascript
{
  concerns: [
    {
      category: string,
      statement: string,
      explanation: string,
      severity: 'low|medium|high'
    }
  ],
  objective_reframes: [
    { concern: string, reframe: string }
  ]
}
```

---

### 8. Unrealistic Expectation Detection
**Skill ID:** `unrealistic_expectation_detection`

Flag goals and timelines misaligned with demonstrated capacity or developmental norms.

```javascript
{
  unrealistic_expectations: [
    {
      expectation: string,
      reason: string,
      impacted_party: string,
      severity: 'low|medium|high'
    }
  ],
  suggested_reframes: [
    { expectation: string, reframe: string }
  ]
}
```

---

## Domain 2: Behavioral & Communication Dynamics (7)

These skills capture the relational, emotional, and communicative patterns that influence case outcomes.

### 9. Bias & Discrimination Detection
**Skill ID:** `bias_and_discrimination_detection`

Detect stereotype-based language, discriminatory patterns, and group-level generalizations.

```javascript
{
  bias_signals: [
    {
      category: string,
      phrase: string,
      impact: string,
      severity: 'low|medium|high'
    }
  ],
  discrimination_risks: [
    {
      group: string,
      mechanism: string,
      explanation: string
    }
  ]
}
```

---

### 10. Coercion & Framing Detection
**Skill ID:** `coercion_and_framing_detection`

Identify threats, pressure, manipulation, and coercive framing in adult-to-child or adult-to-adult interactions.

```javascript
{
  coercion_flags: [
    {
      signal: string,
      excerpt: string,
      severity: 'low|medium|high',
      rationale: string
    }
  ],
  framing_concerns: [
    {
      category: string,
      excerpt: string,
      explanation: string
    }
  ]
}
```

---

### 11. Emotional Tone Assessment
**Skill ID:** `emotional_tone_assessment` [NEW]

Extract the underlying emotional state and affect patterns from written communication and case notes.

**Input Format:**
```
Parent-caseworker communications, case notes, session transcripts, emails, 
visit observation narratives, and documented emotional responses.
```

**Output Schema:**
```javascript
{
  emotional_tone_patterns: [
    {
      context: string,           // e.g., "Discussions of service compliance"
      tone: 'hostile|defensive|apathetic|fearful|cooperative|engaged|mixed',
      evidence: [string],        // Specific phrases, behaviors
      source_locator: string,
      consistency_across_sessions: string
    }
  ],
  emotional_state_changes: [
    {
      trigger: string,
      before_tone: string,
      after_tone: string,
      pattern: string
    }
  ],
  defensiveness_indicators: [
    {
      indicator: string,
      manifestation: string,
      frequency: 'occasional|frequent|persistent'
    }
  ],
  emotional_availability: {
    to_child: 'limited|variable|adequate|strong',
    to_caseworker: 'limited|variable|adequate|strong',
    evidence: [string]
  },
  stress_response_patterns: [
    {
      stressor: string,
      typical_response: string,
      regulation_capability: string
    }
  ]
}
```

**Confidence:** 0..1 based on explicit emotional language and consistency across sessions.

**Limitations:** Cannot diagnose mental health conditions; flags observable patterns only.

**Unsafe Rules:**
- Do not confuse defensive communication with non-engagement.
- Do not pathologize culturally different emotional expression.
- Do not equate emotional difficulty with inability to parent.

---

### 12. Cooperation & Engagement Tracking
**Skill ID:** `cooperation_engagement_tracking` [NEW]

Track willingness to engage, service attendance, participation quality, and behavioral responsiveness.

**Input Format:**
```
Service attendance records, program participation notes, session engagement observations,
responsiveness to recommendations, follow-through on action items, and attitude/cooperation documentation.
```

**Output Schema:**
```javascript
{
  engagement_willingness: {
    overall_level: 'refusing|reluctant|complying|engaged|actively_seeking',
    consistency: 'inconsistent|variable|mostly_consistent|consistent',
    evidence: [string]
  },
  service_participation: [
    {
      service: string,
      attendance_rate: number,     // percentage
      participation_quality: 'minimal|moderate|engaged',
      responsiveness: string,      // e.g., "Completes homework; asks questions"
      barriers_noted: [string]
    }
  ],
  behavioral_responsiveness: [
    {
      recommendation: string,
      parent_response: 'ignored|partially_followed|followed|exceeded',
      follow_through_timeline: string,
      sustained_change: boolean
    }
  ],
  cooperation_trend: 'declining|stable|improving',
  compliance_vs_genuine_engagement: {
    assessment: string,
    evidence: [string]
  }
}
```

**Confidence:** 0..1 based on attendance records and frequency of participation documentation.

**Limitations:** Cannot assess internal motivation; only observable behavior.

**Unsafe Rules:**
- Do not conflate non-engagement with non-care.
- Do not assume barriers reported as excuses without verification.
- Do not equate single missed appointment with pattern of non-cooperation.

---

### 13. Statement Consistency Across Sessions
**Skill ID:** `statement_consistency_tracking` [NEW]

Compare narrative consistency across different sessions, different caseworkers, and different time periods.

**Input Format:**
```
Multiple caseworker notes on same topic, parent interviews across different dates,
collateral reports, and any repeated description or account of events.
```

**Output Schema:**
```javascript
{
  narrative_consistency: [
    {
      topic: string,             // e.g., "Incident of September 15th"
      timeframe: string,
      accounts: [
        {
          source: string,        // "Parent to caseworker A", "Collateral report"
          date: string,
          statement: string,
          details_included: [string]
        }
      ],
      consistency_assessment: 'consistent|minor_variations|contradictory|evolving',
      variations_noted: [string],
      possible_explanations: [string]
    }
  ],
  changing_narratives: [
    {
      topic: string,
      initial_account: string,
      current_account: string,
      direction_of_change: string,
      timeframe: string,
      credibility_impact: string
    }
  ],
  core_facts_agreement: [
    {
      fact: string,
      sources_agreeing: [string],
      sources_disagreeing: [string],
      resolution_status: string
    }
  ]
}
```

**Confidence:** 0..1 based on number of independent accounts and temporal separation.

**Limitations:** Consistency does not equal truth; inconsistency has multiple explanations.

**Unsafe Rules:**
- Do not treat inconsistency as proof of deception.
- Do not privilege one account over another without evidence basis.
- Do not use consistency tracking to coerce or pressure retractions.

---

---

## Domain 3: Protective Factors & Strengths (7)

These skills capture and assess the family's resources, resilience, and positive capacities.

### 14. Protective Factor Assessment
**Skill ID:** `protective_factor_assessment`

Extract and evaluate protective factors, distinguishing transient from established stability.

```javascript
{
  protective_factors: [
    {
      factor: string,
      category: 'internal|external|relational|structural',
      strength_level: 'weak|moderate|strong',
      stability: 'transient|developing|established',
      duration: string,
      frequency: string,
      evidence_anchors: [string],
      source_locator: string,
      confidence: 0..1
    }
  ],
  protective_network_density: 'sparse|limited|moderate|robust',
  resilience_indicators: [
    { indicator: string, examples: [string] }
  ],
  vulnerability_gaps: [
    { gap: string, protective_need: string }
  ]
}
```

---

### 15. Parental Strengths & Competencies
**Skill ID:** `parental_capacity_indicators`

Observable indicators of parental capacity across SafeSteps domains.

```javascript
{
  capacity_dimensions: [
    {
      dimension: 'emotional_responsiveness|consistent_caregiving|safety_provision|stability|service_engagement',
      current_level: 'limited|emerging|developing|established|strong',
      indicators: [
        { indicator: string, evidence: [string], source_locator: string }
      ],
      trajectory: 'declining|flat|improving',
      confidence: 0..1
    }
  ],
  protective_capacity_summary: {
    overall_assessment: string,
    strengths: [string],
    areas_for_development: [string],
    immediate_risks: [string]
  },
  capacity_building_progress: [
    {
      area: string,
      baseline: string,
      current_status: string,
      evidence: [string],
      progress_rate: 'stalled|slow|steady|accelerating'
    }
  ],
  readiness_for_responsibility_increase: {
    assessment: 'not_ready|cautiously_ready|ready',
    supported_by: [string],
    conditions: [string]
  }
}
```

---

### 16. Child Voice & Wellbeing Signals
**Skill ID:** `child_voice_wellbeing_signals`

Extract child statements and observable wellbeing indicators.

```javascript
{
  child_voice: [
    {
      theme: string,
      statements: [
        {
          quote_or_paraphrase: string,
          speaker_role: 'child|about_child',
          context: string,
          source_locator: string
        }
      ],
      pattern: string,
      child_expressed_needs: [string]
    }
  ],
  wellbeing_indicators: [
    {
      dimension: 'physical|emotional|social|academic|behavioral',
      signal: string,
      evidence: [string],
      concern_level: 'none|low|moderate|high',
      source_locator: string
    }
  ],
  child_agency_and_autonomy: {
    evidence_of_voice_heard: boolean,
    examples: [string],
    barriers_to_participation: [string]
  },
  trauma_or_stress_signals: [
    { signal: string, presentation: string, duration_noted: string }
  ],
  child_strengths: [
    { strength: string, examples: [string] }
  ],
  sibling_relationships: {
    quality: 'disconnected|conflicted|neutral|supportive|very_close',
    evidence: [string]
  }
}
```

---

### 17. Safety Network & Support System Assessment
**Skill ID:** `safety_network_assessment`

Map informal and formal support resources; assess network density and mobilization readiness.

```javascript
{
  safety_network_map: {
    informal_network: [
      {
        relationship: string,
        reliability: 'uncertain|sometimes|usually|very_reliable',
        frequency_contact: string,
        availability_for_emergency: 'no|uncertain|yes_with_conditions|yes',
        capabilities: [string],
        barriers_to_activation: [string],
        source_locator: string
      }
    ],
    formal_resources: [
      {
        resource: string,
        access_status: 'unaware|known_unused|occasionally_used|regular_use',
        reliability: string,
        cost_barrier: boolean
      }
    ]
  },
  network_strength: {
    density: 'sparse|limited|moderate|robust',
    reliability: number,         // 0..1
    accessibility: 'difficult|moderate|easy',
    diversity: 'monocultural|limited|culturally_diverse'
  },
  mobilization_readiness: {
    network_aware_of_needs: boolean,
    capacity_assessed: boolean,
    contingency_plans: boolean,
    activation_barriers: [string],
    readiness_level: 'not_ready|developing|ready'
  },
  cultural_and_community_connection: [
    { connection: string, strength: string, protective_value: string }
  ],
  isolation_risk_factors: [
    { risk: string, severity: 'low|moderate|high' }
  ]
}
```

---

### 18. Child Resilience & Strengths
**Skill ID:** `child_resilience_assessment` [NEW]

Identify child's personal strengths, coping mechanisms, interests, and resilience indicators.

**Input Format:**
```
Academic performance, extracurricular activities, hobbies, peer relationships, 
coping mechanisms observed in visits, positive behavioral indicators, and strengths-based assessment notes.
```

**Output Schema:**
```javascript
{
  child_strengths: [
    {
      strength: string,          // e.g., "Artistic ability", "Sense of humor", "Loyalty to sibling"
      manifestation: string,
      examples: [string],
      protective_value: string   // How this strength aids resilience
    }
  ],
  coping_mechanisms: [
    {
      mechanism: string,         // e.g., "Drawing", "Time with grandmother", "Playing sports"
      effectiveness: 'adaptive|mixed|maladaptive',
      frequency: string,
      accessibility: string
    }
  ],
  engagement_interests: [
    {
      interest: string,
      level_of_engagement: 'minimal|moderate|strong',
      frequency: string,
      social_connection: boolean
    }
  ],
  academic_and_educational: {
    current_performance: string,
    attendance: string,
    engagement: string,
    supports_in_place: [string]
  },
  peer_relationships: {
    quality: 'isolated|limited|adequate|strong',
    peer_support: string,
    prosocial_behaviors: [string]
  },
  resilience_capacity: {
    overall_assessment: string,
    protective_factors_supporting: [string],
    vulnerabilities_limiting: [string]
  }
}
```

**Confidence:** 0..1 based on frequency of documented observations and consistency across reporters.

**Limitations:** Single-session observations may not represent typical functioning.

**Unsafe Rules:**
- Do not dismiss trauma or difficulty based on surface resilience.
- Do not expect child to compensate for parental capacity gaps.
- Do not suppress trauma symptoms because child shows strengths.

---

---

## Domain 4: Service Tracking & Compliance (6)

These skills monitor service delivery, track progress, and identify resource gaps and systemic barriers.

### 19. Service Coordination Assessment
**Skill ID:** `service_coordination_assessment`

Evaluate alignment between goals, service provider activities, and documented progress.

```javascript
{
  service_alignment: {
    goal_alignment: 'misaligned|partially_aligned|well_aligned',
    provider_coordination: 'siloed|minimal|coordinated|integrated',
    evidence_quality: 'anecdotal|documented|systematic'
  },
  services_mapped: [
    {
      service: string,
      goal_link: string,
      provider: string,
      duration: string,
      progress_evidence: [string],
      alignment_status: 'aligned|tangential|misaligned'
    }
  ],
  coordination_gaps: [
    { gap: string, affected_goals: [string], consequence: string }
  ],
  goal_drift: [
    {
      original_goal: string,
      current_service_focus: string,
      drift_severity: 'minor|moderate|major',
      evidence: string
    }
  ],
  duplication_or_redundancy: [
    {
      area: string,
      services: [string],
      consolidation_recommendation: string
    }
  ]
}
```

---

### 20. Intervention Progress & Participation Quality
**Skill ID:** `intervention_progress_tracking` [NEW]

Log attendance, participation quality, skill acquisition, and milestones achieved in programs.

**Input Format:**
```
Program attendance records, session notes from therapists/instructors, progress reports,
skill demonstrations, homework completion, participation quality observations, and documented milestones.
```

**Output Schema:**
```javascript
{
  program_enrollment: [
    {
      program_name: string,
      program_type: string,      // e.g., "Parenting class", "Substance abuse treatment", "Therapy"
      enrollment_date: string,
      expected_completion: string,
      current_status: 'enrolled|completed|dropped|referred_pending'
    }
  ],
  attendance_and_engagement: [
    {
      program: string,
      total_sessions_scheduled: number,
      sessions_attended: number,
      attendance_rate: number,    // percentage
      punctuality: 'late_frequent|occasional|timely',
      participation_quality: 'minimal|moderate|engaged|highly_engaged',
      barriers_to_attendance: [string]
    }
  ],
  skill_acquisition_and_practice: [
    {
      program: string,
      skills_taught: [string],
      skills_demonstrated: [string],
      homework_completion_rate: number,
      in_home_application: 'not_observed|inconsistent|consistent',
      transfer_to_daily_life: string
    }
  ],
  milestones_achieved: [
    {
      program: string,
      milestone: string,
      date_achieved: string,
      significance: string
    }
  ],
  program_completion_trajectory: {
    on_track: boolean,
    completion_likelihood: 'low|moderate|high',
    factors_supporting: [string],
    factors_hindering: [string]
  }
}
```

**Confidence:** 0..1 based on documentation frequency and recency.

**Limitations:** Single-setting skill demonstration does not guarantee real-world application.

**Unsafe Rules:**
- Do not assume attendance equals learning or change.
- Do not dismiss incomplete programs as failure without understanding barriers.
- Do not over-generalize skill demonstration in one context to all contexts.

---

### 21. Resource Gaps & Unmet Needs
**Skill ID:** `resource_gaps_identification` [NEW]

Identify essential resources mentioned as missing: housing, food security, childcare, healthcare, financial stability.

**Input Format:**
```
Case notes mentioning unmet needs, documented barriers, family statements about resources,
referral records, and gaps between service plan and actual family circumstances.
```

**Output Schema:**
```javascript
{
  identified_gaps: [
    {
      resource_category: 'housing|food|childcare|healthcare|mental_health|substance_abuse_treatment|financial|employment|education|legal_services',
      specific_gap: string,
      manifestation: string,      // How gap is affecting family
      severity: 'low|moderate|high|critical',
      urgency: 'routine|within_30_days|immediate',
      impact_on_child_safety: string,
      impact_on_case_progress: string,
      source_locator: string
    }
  ],
  referral_status: [
    {
      needed_resource: string,
      referral_made: boolean,
      date_referred: string,
      referral_outcome: 'pending|accepted|denied|not_followed_up',
      follow_up_status: string
    }
  ],
  barrier_analysis: [
    {
      gap: string,
      barriers_to_access: [
        {
          barrier: string,
          type: 'knowledge|financial|transportation|eligibility|waitlist|provider_capacity',
          addressability: 'removable|manageable|structural'
        }
      ]
    }
  ],
  resource_gaps_by_priority: {
    critical_needs: [string],
    important_needs: [string],
    enhancement_opportunities: [string]
  }
}
```

**Confidence:** 0..1 based on explicit documentation and corroboration from multiple sources.

**Limitations:** Absence of documentation does not mean absence of need; requires direct inquiry.

**Unsafe Rules:**
- Do not assume family resource gaps indicate parental failure.
- Do not prioritize referral completion over actual resource access.
- Do not blame family for systemic resource unavailability.

---

### 22. Compliance & Court Order Verification
**Skill ID:** `compliance_and_court_order_verification`

Extract, parse, and verify compliance with court orders and service plan requirements.

```javascript
{
  court_orders_identified: [
    {
      order_type: string,
      ordered_party: string,
      specific_requirement: string,
      deadline: string,
      compliance_status: 'met|partially_met|unmet|exceeded',
      evidence_of_completion: [string],
      source_locator: string,
      confidence: 0..1
    }
  ],
  service_plan_requirements: [
    {
      requirement: string,
      responsible_party: string,
      completion_date: string,
      compliance_status: 'met|partially_met|unmet|pending',
      documented_progress: [string],
      barriers_documented: [string]
    }
  ],
  compliance_summary: {
    overall_compliance_rate: number,  // 0..1
    trend: 'improving|stable|declining',
    pattern: string
  },
  compliance_vs_capacity: [
    {
      requirement: string,
      stated_barrier: string,
      assessed_root_cause: 'capacity|motivation|structural|information',
      responsiveness_to_support: string
    }
  ],
  quality_of_compliance: [
    {
      requirement: string,
      compliance_type: 'checkbox|engaged',
      quality_indicators: [string]
    }
  ],
  upcoming_deadline_risks: [
    {
      requirement: string,
      deadline: string,
      risk_level: 'low|moderate|high',
      mitigation_suggestions: [string]
    }
  ]
}
```

---

### 23. Historical Triggers & Seasonal Patterns
**Skill ID:** `historical_triggers_identification` [NEW]

Map past events or seasonal stressors that correlate with family tension, relapse, or crises.

**Input Format:**
```
Longitudinal case narrative, incident timing patterns, seasonal references, anniversary reactions,
employment or benefit loss dates, and documented temporal correlations.
```

**Output Schema:**
```javascript
{
  identified_triggers: [
    {
      trigger: string,           // e.g., "Job loss", "Anniversary of custody loss", "Holiday season"
      event_type: 'loss|transition|anniversary|seasonal|recurring_conflict',
      historical_pattern: [
        {
          date: string,
          incident: string,
          response_observed: string,
          severity: string
        }
      ],
      predictability: 'low|moderate|high',
      advance_notice_possible: boolean
    }
  ],
  seasonal_patterns: [
    {
      season_or_timeframe: string,
      historical_stressors: [string],
      typical_manifestation: string,
      prior_interventions: [string],
      effectiveness: string
    }
  ],
  trigger_response_patterns: [
    {
      trigger: string,
      typical_response: 'escalation|withdrawal|substance_use|avoidance|seeking_support|mixed',
      recovery_timeline: string,
      coping_effectiveness: string
    }
  ],
  preventive_planning: [
    {
      trigger: string,
      anticipatory_intervention: string,
      timing_recommendation: string,
      likelihood_of_prevention: string
    }
  ]
}
```

**Confidence:** 0..1 based on number of documented recurrences and temporal clarity.

**Limitations:** Correlation does not prove causation; patterns may change over time.

**Unsafe Rules:**
- Do not use triggers to excuse harmful behavior; use for anticipatory planning.
- Do not assume pattern will repeat if conditions or supports change.
- Do not dismiss one-time incidents as non-concerning if they fit established pattern.

---

---

## Domain 5: Systemic & Legal Context (4)

These skills connect cases to broader legal, jurisdictional, and policy frameworks.

### 24. Compliance & Court Order Verification [see above - Domain 4]

---

### 25. Case Progression & Reunification Readiness
**Skill ID:** `case_progression_reunification_readiness`

Assess case trajectory and readiness for reunification or independence.

```javascript
{
  case_trajectory: {
    direction: 'deteriorating|static|improving|accelerating',
    timeframe: string,
    evidence: [string]
  },
  core_safety_drivers: [
    {
      driver: string,
      current_status: string,
      progress_since_case_opening: string,
      remaining_barriers: [string],
      estimated_resolution_timeline: string
    }
  ],
  reunification_readiness: {
    overall_readiness: 'not_ready|early_stage|developing|advanced|ready',
    readiness_by_domain: [
      {
        domain: string,
        readiness: 'not_ready|emerging|developing|ready',
        evidence: [string],
        conditions_remaining: [string]
      }
    ],
    child_readiness: {
      attachment_stability: string,
      emotional_preparation: string,
      behavioral_readiness: string
    }
  },
  transition_planning: {
    current_stage: string,
    transitional_steps_completed: [string],
    next_recommended_steps: [string],
    timeline_realism: 'unrealistic|optimistic|realistic|conservative',
    risk_factors_in_transition: [string]
  },
  relapse_or_destabilization_risk: {
    risk_level: 'low|moderate|high',
    risk_factors: [string],
    protective_measures_in_place: [string],
    contingency_planning: boolean
  },
  case_closure_readiness: {
    domains_stable: [string],
    domains_requiring_ongoing_support: [string],
    aftercare_recommendations: [string]
  }
}
```

---

### 26. Jurisdictional & Policy Context [NEW - Skill 25 total: 26]
**Skill ID:** `jurisdictional_policy_context` [NEW]

Flag specific local laws, child welfare policies, cultural considerations, and legal nuances affecting the case.

**Input Format:**
```
Court filings, policy references in case notes, cultural/community information, 
jurisdictional requirements, legal milestones, and policy-specific documentation needs.
```

**Output Schema:**
```javascript
{
  jurisdictional_requirements: [
    {
      requirement: string,       // e.g., "Mandatory concurrent planning requirement"
      applicable_law_or_policy: string,
      deadline: string,
      compliance_status: string,
      implications_for_case: string,
      source_locator: string
    }
  ],
  cultural_and_community_context: [
    {
      context: string,           // e.g., "Family is from X cultural background"
      relevant_considerations: [string],
      policy_or_best_practice_alignment: string,
      implementation_in_case_plan: boolean
    }
  ],
  legal_milestones: [
    {
      milestone: string,         // e.g., "Termination of parental rights review date"
      deadline: string,
      current_status: string,
      preparation_needed: [string]
    }
  ],
  policy_specific_provisions: [
    {
      policy_name: string,
      relevant_provision: string,
      application_to_case: string,
      compliance_gap: string
    }
  ],
  legal_representation_status: {
    parent_attorney: string,
    child_advocate: string,
    guardian_ad_litem: string,
    representation_adequacy: string
  },
  jurisdictional_variation_flags: [
    {
      area: string,
      local_variation: string,
      implications: string
    }
  ]
}
```

**Confidence:** 0..1 based on explicitness of policy documentation and jurisdictional clarity.

**Limitations:** Policy landscape changes; requires ongoing verification.

**Unsafe Rules:**
- Do not assume federal policy applies uniformly across jurisdictions.
- Do not dismiss cultural considerations as non-essential.
- Do not prioritize policy compliance over child safety.

---

### 26. Voice of the Child (Elevated) [NEW - Skill 26 total: 26]
**Skill ID:** `voice_of_child_elevation` [NEW]

Separate and elevate direct child voice from adult interpretations; ensure child preferences are documented distinctly.

**Input Format:**
```
Direct child statements (quotes), child-centered interview notes, child-generated content
(drawings, letters, video statements), separate from adult interpretation or narrative.
```

**Output Schema:**
```javascript
{
  direct_child_statements: [
    {
      statement: string,         // Exact quote or clear paraphrase marked as such
      context: string,           // Situation in which statement made
      speaker_age: string,
      emotional_tone: string,
      speaker_clarity: 'clear|ambiguous|conflicted',
      date: string,
      source_locator: string,
      adult_interpretation_separate: boolean
    }
  ],
  child_expressed_preferences: [
    {
      preference: string,        // e.g., "Wants to live with mother"
      supporting_statements: [string],
      consistency_over_time: string,
      strength_of_conviction: 'hesitant|moderate|strong|unwavering',
      source_locator: string
    }
  ],
  child_concerns_or_fears: [
    {
      concern: string,
      supporting_statements: [string],
      date_expressed: string,
      follow_up_action_taken: string
    }
  ],
  adult_vs_child_narrative_comparison: [
    {
      topic: string,
      child_statement: string,
      adult_narrative: string,
      alignment: 'aligned|partially_aligned|contradictory',
      explanation_needed: string
    }
  ],
  child_voice_amplification: {
    clearly_documented: boolean,
    weight_given_in_planning: string,
    barriers_to_child_voice_expression: [string],
    efforts_to_amplify: [string]
  },
  child_consent_and_agency: {
    informed_about_case_plan: boolean,
    consulted_on_decisions: boolean,
    preferences_considered: boolean,
    outcome_explained_to_child: boolean
  }
}
```

**Confidence:** 0..1 based on directness of child statements and clarity of documentation.

**Limitations:** Child age and cognitive development affect expression capacity; may need expert interpretation.

**Unsafe Rules:**
- Do not dismiss child voice due to perceived loyalty conflict.
- Do not coach, lead, or pressure child into statements.
- Do not override child preferences without explicit safety justification.
- Do not silence child voice due to adult discomfort.

---

## Summary: 26-Skill Document Intelligence Catalog

| Domain | Count | Skills |
|--------|-------|--------|
| **Core Decision-Support** | 8 | Evidence, Contradiction, Timeline, Requirements, Risk Signals, Concerns, Fairness, Expectations |
| **Behavioral & Communication** | 7 | Bias, Coercion, Emotional Tone, Cooperation, Statement Consistency, + 2 moved to Domain 3 |
| **Protective Factors & Strengths** | 6 | Protective Factors, Parental Strengths, Child Voice, Safety Network, Child Resilience |
| **Service Tracking & Compliance** | 5 | Service Coordination, Intervention Progress, Resource Gaps, Compliance, Historical Triggers |
| **Systemic & Legal Context** | 4 | Case Progression, Jurisdictional Context, Voice of Child (Elevated), Legal/Policy Framework |
| **TOTAL** | **26** | **Comprehensive coverage across all casework dimensions** |

---

## Handler Implementation Priority

### Phase 1A (Weeks 1-2): Core Decision-Support
1. evidence_extraction
2. contradiction_detection
3. timeline_extraction
4. requirement_extraction
5. risk_signal_extraction

### Phase 1B (Weeks 3-4): Behavioral & Protective
6. fairness_detection
7. concern_classification
8. protective_factor_assessment
9. parental_capacity_indicators
10. child_voice_wellbeing_signals

### Phase 2 (Weeks 5-6): Service & Coordination
11. service_coordination_assessment
12. compliance_and_court_order_verification
13. case_progression_reunification_readiness
14. intervention_progress_tracking
15. resource_gaps_identification

### Phase 3 (Weeks 7-8): Advanced & Systemic
16. bias_and_discrimination_detection
17. coercion_and_framing_detection
18. emotional_tone_assessment
19. cooperation_engagement_tracking
20. statement_consistency_tracking
21. safety_network_assessment
22. child_resilience_assessment
23. historical_triggers_identification
24. jurisdictional_policy_context
25. voice_of_child_elevation
26. unrealistic_expectation_detection

---

## Integration with Skills Registry

Each skill handler follows the standard orchestrator interface:

```javascript
async function skillHandler({ skill, input, context }) {
  // skill: Metadata from registry
  // input: Structured input matching skill schema
  // context: { authUserId, caseId, documentId, ... }
  
  return {
    status: 'complete|insufficient_evidence|failed',
    findings: [...],           // Matches skill output schema
    confidence: 0..1,
    evidence_citations: [...],
    limitations: [...],
    human_review_required: boolean,
    unsafe_output_flags: [...]
  };
}
```

All handlers invoke through the orchestrator and pass through safety gates before returning to client.

