'use strict';

const { buildSkillEnvelope, normalizeString } = require('../shared');

const TIER_SCHEDULES = {
  critical: {
    dueWindow: 'within 4 hours (same-day supervisory review)',
    tasks: [
      { task_id: 'immediate_safety_checkin', title: 'Conduct immediate safety check-in with family and safe network', priority: 'critical' },
      { task_id: 'supervisor_case_consult', title: 'Complete urgent supervisor review and document safety plan adjustments', priority: 'critical' },
    ],
  },
  high: {
    dueWindow: 'within 24 to 48 hours',
    tasks: [
      { task_id: 'priority_family_outreach', title: 'Complete priority outreach with parent/carer to review active supports', priority: 'high' },
      { task_id: 'barrier_resolution_check', title: 'Verify service access and resolve any transport or childcare barriers', priority: 'high' },
    ],
  },
  moderate: {
    dueWindow: 'within 5 business days',
    tasks: [
      { task_id: 'scheduled_case_checkin', title: 'Conduct scheduled progress check-in and update protective factor log', priority: 'medium' },
      { task_id: 'service_provider_followup', title: 'Confirm ongoing program participation and support alignment', priority: 'medium' },
    ],
  },
  low: {
    dueWindow: 'within 14 business days',
    tasks: [
      { task_id: 'routine_support_review', title: 'Complete routine supportive check-in and celebrate milestone progress', priority: 'low' },
    ],
  },
  post_reunification_step_down: {
    dueWindow: 'graduated 30/60/90/180/365-day post-return cadence',
    tasks: [
      {
        task_id: 'ecs_stability_checkin',
        title: 'Verify ongoing Economic & Concrete Supports (ECS) housing, childcare, and utility stability to prevent the post-reunification service cliff',
        priority: 'medium',
      },
      {
        task_id: 'parent_partner_peer_checkin',
        title: 'Offer non-surveilled Parent Partner peer mentor check-in and voluntary respite care support',
        priority: 'low',
      },
      {
        task_id: 'voluntary_dyadic_coaching_offer',
        title: 'Provide optional ABC/PCIT relational transition support without punitive compliance scoring',
        priority: 'low',
      },
    ],
  },
};

async function followUpSchedulingHandler({ input = {} }) {
  const caseId = normalizeString(input.caseId);
  const rawTier = normalizeString(input.tier).toLowerCase();

  if (!caseId && !rawTier) {
    return buildSkillEnvelope({
      status: 'insufficient_evidence',
      findings: [],
      confidence: 0,
      evidenceCitations: [],
      limitations: [
        'Requires caseId or risk tier to recommend follow-up scheduling windows.',
      ],
      fields: {
        tasks: [],
        due_windows: [],
      },
    });
  }

  const tier = TIER_SCHEDULES[rawTier] ? rawTier : 'moderate';
  const schedule = TIER_SCHEDULES[tier];
  const tasks = schedule.tasks.map((t) => ({
    ...t,
    case_id: caseId || null,
    tier,
    due_window: schedule.dueWindow,
    requires_human_confirmation: true,
  }));

  const dueWindows = [
    {
      tier,
      recommended_window: schedule.dueWindow,
      task_count: tasks.length,
    },
  ];

  return buildSkillEnvelope({
    status: 'complete',
    findings: tasks,
    confidence: TIER_SCHEDULES[rawTier] ? 0.88 : 0.7,
    evidenceCitations: [
      ...(caseId ? [`case:${caseId}`] : []),
      `tier:${tier}`,
    ],
    limitations: [
      'Proposed follow-up tasks and due windows are scheduling suggestions that must be confirmed by the assigned practitioner.',
    ],
    fields: {
      tasks,
      due_windows: dueWindows,
    },
  });
}

module.exports = { followUpSchedulingHandler };
