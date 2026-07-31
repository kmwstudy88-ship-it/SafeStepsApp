import {
  expect,
  test,
} from '@jest/globals';

import {
  evaluateCrossDomainRules,
  scoreInstrument,
} from '../../backend/scoring/aodMhDfvScoring.js';
import {
  generateCasePlanGoals,
  loadAodMhDfvCasePlanTemplate,
} from '../../backend/case_plan/aodMhDfvCasePlanGenerator.js';

test('scores AOD/MH/DFV domains and forces critical concern for safety overrides', () => {
  const result = scoreInstrument(
    {
      DFV1: 3,
      DFV2: 2,
      DFV3: 1,
      DFV4: 2,
      AOD1: 1,
      AOD2: 3,
      AOD3: 2,
      AOD4: 0,
      MH1: 2,
      MH2: 1,
      MH3: 3,
      MH4: 2,
      PC1: 3,
      PC2: 2,
      PC3: 2,
      PA1: 2,
      PA2: 1,
      PA3: 0,
      SC1: 2,
      SC2: 1,
      CI1: 1,
      CI2: 2,
    },
    { priorDomainScores: { AOD_IMPACT: 50 } },
  );

  expect(result.instrumentCode).toBe('AOD_MH_DFV_v1');
  expect(result.domainResults.DFV_SAFETY.normalizedScore).toBe(50);
  expect(result.triggeredOverrides).toEqual(['DFV1_HIGH']);
  expect(result.forcedBand).toBe('Critical Concern');
  expect(result.compositeScore).toBe(76);
  expect(result.crossDomainFlags).toEqual([
    {
      ruleCode: 'DFV_OVERRIDES_AOD_TREND',
      flagText: 'AOD improvement detected but suppressed in composite due to active DFV safety critical override.',
    },
  ]);
});

test('cross-domain rules keep perpetrator accountability separate from protective plans', () => {
  const flags = evaluateCrossDomainRules(
    ['PA3_HIGH'],
    {
      AOD_IMPACT: { normalizedScore: 25 },
      PERPETRATOR_ACCOUNTABILITY: { normalizedScore: 100 },
    },
    { AOD_IMPACT: 50 },
  );

  expect(flags).toEqual([
    {
      ruleCode: 'SEPARATE_VICTIM_PERPETRATOR_PLANS',
      flagText:
        'Ongoing perpetrator risk indicator triggered. Verify victim-parent case plan and perpetrator accountability tracking remain scored as separate units.',
    },
  ]);
});

test('case-plan generation never inserts perpetrator-track goals into protective-parent plans', () => {
  const result = scoreInstrument({
    DFV1: 0,
    DFV2: 0,
    DFV3: 0,
    DFV4: 0,
    AOD1: 0,
    AOD2: 0,
    AOD3: 0,
    AOD4: 0,
    MH1: 0,
    MH2: 0,
    MH3: 0,
    MH4: 0,
    PC1: 0,
    PC2: 0,
    PC3: 0,
    PA1: 4,
    PA2: 4,
    PA3: 4,
    SC1: 0,
    SC2: 0,
    CI1: 0,
    CI2: 0,
  });

  const protectiveGoals = generateCasePlanGoals(result, 'protective_parent', '2026-07-31');
  const perpetratorGoals = generateCasePlanGoals(result, 'perpetrator_tracked_separately', '2026-07-31');

  expect(result.triggeredOverrides).toContain('PA3_HIGH');
  expect(protectiveGoals.some((goal) => goal.track === 'perpetrator_track')).toBe(false);
  expect(protectiveGoals.some((goal) => goal.goalTypeCode === 'BEHAVIOUR_CHANGE_PROGRAM_ENROLLMENT')).toBe(false);
  expect(perpetratorGoals.some((goal) => goal.track === 'protective_parent_track')).toBe(false);
  expect(perpetratorGoals.map((goal) => goal.goalTypeCode)).toEqual(
    expect.arrayContaining(['BEHAVIOUR_CHANGE_PROGRAM_ENROLLMENT', 'INDEPENDENT_VERIFICATION']),
  );
});

test('case-plan template documents concurrent treatment and separate tracks', () => {
  const template = loadAodMhDfvCasePlanTemplate();

  expect(template.sequencing_phases.map((phase) => phase.phase_name)).toEqual([
    'Safety Stabilisation',
    'Concurrent Treatment',
    'Consolidation & Reunification Readiness',
  ]);
  expect(template.tracks.protective_parent_track.domains).not.toContain('PERPETRATOR_ACCOUNTABILITY');
  expect(template.tracks.perpetrator_track.domains).toEqual(['PERPETRATOR_ACCOUNTABILITY']);
});
