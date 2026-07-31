import express from "express";

import { generateCasePlanGoals } from "../../case_plan/aodMhDfvCasePlanGenerator.js";
import { badRequest, notFound, serviceUnavailable } from "../../lib/apiError.js";
import {
  STAFF_DOCUMENT_ROLES,
  requireAnyRole,
  requireCaseAccess,
} from "../../middleware/authorize.js";
import {
  CRITICAL_OVERRIDES,
  DOMAIN_ITEMS,
  INSTRUMENT_SLUG,
  scoreInstrument,
} from "../../scoring/aodMhDfvScoring.js";

const router = express.Router();
const SUBJECT_ROLES = new Set(["protective_parent", "other_caregiver", "perpetrator_tracked_separately"]);

router.post(
  "/cases/:caseId/aod-mh-dfv",
  requireAnyRole(...STAFF_DOCUMENT_ROLES),
  requireCaseAccess,
  async (req, res, next) => {
    try {
      const client = requireSupabaseClient(req);
      const body = normalizeSubmissionBody(req.body);
      const caseId = req.safeStepsCaseId;
      const userId = req.safeStepsAuth.user.id;

      const priorDomainScores = await loadPriorDomainScores({
        client,
        caseId,
        subjectRole: body.subjectRole,
        timepointNumber: body.timepointNumber,
      });
      const scoringResult = scoreInstrument(body.itemScores, {
        priorDomainScores,
      });
      const generatedGoals = generateCasePlanGoals(scoringResult, body.subjectRole, body.administeredDate);

      const persisted = await persistAssessmentSubmission({
        client,
        caseId,
        userId,
        body,
        scoringResult,
      });

      res.status(201).json({
        data: {
          assessmentId: persisted.assessmentId,
          contextId: persisted.contextId,
          score: {
            compositeScore: scoringResult.compositeScore,
            band: scoringResult.band,
            forcedBand: scoringResult.forcedBand,
            triggeredOverrides: scoringResult.triggeredOverrides,
            crossDomainFlags: scoringResult.crossDomainFlags,
          },
          generatedGoals,
        },
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/cases/:caseId/aod-mh-dfv/trends",
  requireAnyRole(...STAFF_DOCUMENT_ROLES),
  requireCaseAccess,
  async (req, res, next) => {
    try {
      const client = requireSupabaseClient(req);
      const subjectRole = stringField(req.query.subjectRole);

      let query = client
        .from("v_aod_mh_dfv_domain_trends")
        .select("*")
        .eq("case_id", req.safeStepsCaseId)
        .order("timepoint_number", { ascending: true })
        .order("domain_code", { ascending: true });

      if (subjectRole) query = query.eq("subject_role", subjectRole);

      const { data, error } = await query;
      if (error) throw serviceUnavailable("SafeSteps could not load AOD/MH/DFV domain trends.");

      res.json({ data: { trends: data ?? [] }, meta: { requestId: req.id } });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/cases/:caseId/aod-mh-dfv/latest",
  requireAnyRole(...STAFF_DOCUMENT_ROLES),
  requireCaseAccess,
  async (req, res, next) => {
    try {
      const client = requireSupabaseClient(req);
      const subjectRole = stringField(req.query.subjectRole) ?? "protective_parent";

      const { data: contexts, error: contextError } = await client
        .from("aod_mh_dfv_assessment_context")
        .select("*")
        .eq("case_id", req.safeStepsCaseId)
        .eq("subject_role", subjectRole)
        .order("timepoint_number", { ascending: false })
        .limit(1);

      if (contextError) throw serviceUnavailable("SafeSteps could not load the latest AOD/MH/DFV assessment.");
      const context = contexts?.[0];
      if (!context) throw notFound("No AOD/MH/DFV assessment was found for this case and subject role.");

      const [domains, overrides, flags] = await Promise.all([
        client
          .from("assessment_domain_scores")
          .select("*,assessment_domains(name)")
          .eq("assessment_id", context.assessment_id),
        client
          .from("aod_mh_dfv_critical_override_log")
          .select("override_code,trigger_item,trigger_value,rationale,triggered_at")
          .eq("context_id", context.id)
          .order("triggered_at", { ascending: true }),
        client
          .from("aod_mh_dfv_cross_domain_flags")
          .select("rule_code,flag_text,created_at")
          .eq("context_id", context.id)
          .order("created_at", { ascending: true }),
      ]);

      if (domains.error || overrides.error || flags.error) {
        throw serviceUnavailable("SafeSteps could not load the latest AOD/MH/DFV details.");
      }

      res.json({
        data: {
          context,
          domainScores: domains.data ?? [],
          triggeredOverrides: overrides.data ?? [],
          crossDomainFlags: flags.data ?? [],
        },
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

function requireSupabaseClient(req) {
  const client = req.safeStepsAuth?.supabase;
  if (!client) {
    throw serviceUnavailable("A live Supabase session is required for AOD/MH/DFV assessment persistence.");
  }
  return client;
}

function stringField(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeSubmissionBody(body) {
  const timepointNumber = Number(body?.timepointNumber);
  const subjectRole = stringField(body?.subjectRole);
  const itemScores = body?.itemScores;

  if (!Number.isInteger(timepointNumber) || timepointNumber < 1) {
    throw badRequest("timepointNumber must be an integer greater than or equal to 1.");
  }
  if (!subjectRole || !SUBJECT_ROLES.has(subjectRole)) {
    throw badRequest("subjectRole must be protective_parent, other_caregiver, or perpetrator_tracked_separately.");
  }
  if (!itemScores || typeof itemScores !== "object" || Array.isArray(itemScores)) {
    throw badRequest("itemScores must be an object keyed by AOD/MH/DFV item code.");
  }

  const normalizedScores = {};
  for (const itemCode of Object.values(DOMAIN_ITEMS).flat()) {
    if (itemScores[itemCode] === undefined || itemScores[itemCode] === null) continue;
    const score = Number(itemScores[itemCode]);
    if (!Number.isInteger(score) || score < 0 || score > 4) {
      throw badRequest(`Score for ${itemCode} must be an integer from 0 to 4.`);
    }
    normalizedScores[itemCode] = score;
  }

  if (Object.keys(normalizedScores).length === 0) {
    throw badRequest("At least one AOD/MH/DFV item score is required.");
  }

  return {
    timepointNumber,
    subjectRole,
    itemScores: normalizedScores,
    notes: body?.notes && typeof body.notes === "object" && !Array.isArray(body.notes) ? body.notes : {},
    administeredDate: stringField(body?.administeredDate),
  };
}

async function loadPriorDomainScores({ client, caseId, subjectRole, timepointNumber }) {
  if (timepointNumber <= 1) return null;

  const { data, error } = await client
    .from("v_aod_mh_dfv_domain_trends")
    .select("domain_code,normalized_score")
    .eq("case_id", caseId)
    .eq("subject_role", subjectRole)
    .eq("timepoint_number", timepointNumber - 1);

  if (error) throw serviceUnavailable("SafeSteps could not load prior AOD/MH/DFV domain scores.");
  if (!data?.length) return null;

  return Object.fromEntries(data.map((row) => [row.domain_code, Number(row.normalized_score)]));
}

async function persistAssessmentSubmission({ client, caseId, userId, body, scoringResult }) {
  const instrument = await loadInstrument(client);
  const band = await loadBand(client, instrument.id, scoringResult.band);
  const assessment = await insertAssessmentRecord({ client, caseId, userId, instrumentId: instrument.id, body });
  const context = await insertAssessmentContext({
    client,
    caseId,
    assessmentId: assessment.id,
    instrumentId: instrument.id,
    body,
    scoringResult,
  });
  const lookup = await loadInstrumentItemLookup(client, instrument.id);

  await insertResponses({ client, assessmentId: assessment.id, itemScores: body.itemScores, notes: body.notes, lookup });
  await insertDomainScores({ client, assessmentId: assessment.id, scoringResult, lookup });
  await insertAssessmentScore({ client, assessmentId: assessment.id, scoringResult, band });
  await insertOverrideLogs({
    client,
    assessmentId: assessment.id,
    contextId: context.id,
    itemScores: body.itemScores,
    triggeredOverrides: scoringResult.triggeredOverrides,
  });
  await insertCrossDomainFlags({
    client,
    assessmentId: assessment.id,
    contextId: context.id,
    flags: scoringResult.crossDomainFlags,
  });

  return { assessmentId: assessment.id, contextId: context.id };
}

async function loadInstrument(client) {
  const { data, error } = await client
    .from("assessment_instruments")
    .select("id,slug")
    .eq("slug", INSTRUMENT_SLUG)
    .maybeSingle();

  if (error) throw serviceUnavailable("SafeSteps could not load the AOD/MH/DFV instrument.");
  if (!data) throw notFound("The AOD/MH/DFV instrument seed has not been applied.");
  return data;
}

async function loadBand(client, instrumentId, label) {
  const { data, error } = await client
    .from("assessment_scoring_bands")
    .select("id,label,recommendation,requires_supervisor_review")
    .eq("instrument_id", instrumentId)
    .eq("label", label)
    .maybeSingle();

  if (error) throw serviceUnavailable("SafeSteps could not load AOD/MH/DFV scoring bands.");
  return data ?? null;
}

async function insertAssessmentRecord({ client, caseId, userId, instrumentId, body }) {
  const { data, error } = await client
    .from("assessment_records")
    .insert({
      case_id: caseId,
      worker_user_id: userId,
      instrument_id: instrumentId,
      assessment_date: body.administeredDate ?? new Date().toISOString(),
      administered_by: "SafeSteps AOD/MH/DFV API",
      source_type: "safesteps_app",
      narrative_summary: `AOD/MH/DFV assessment timepoint ${body.timepointNumber} for ${body.subjectRole}.`,
      status: "completed",
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw serviceUnavailable("SafeSteps could not create the AOD/MH/DFV assessment record.");
  return data;
}

async function insertAssessmentContext({ client, caseId, assessmentId, instrumentId, body, scoringResult }) {
  const { data, error } = await client
    .from("aod_mh_dfv_assessment_context")
    .insert({
      assessment_id: assessmentId,
      case_id: caseId,
      instrument_id: instrumentId,
      timepoint_number: body.timepointNumber,
      subject_role: body.subjectRole,
      composite_score: scoringResult.compositeScore,
      band: scoringResult.band,
      forced_band: scoringResult.forcedBand,
    })
    .select("id")
    .single();

  if (error) throw serviceUnavailable("SafeSteps could not create the AOD/MH/DFV assessment context.");
  return data;
}

async function loadInstrumentItemLookup(client, instrumentId) {
  const { data: domains, error: domainsError } = await client
    .from("assessment_domains")
    .select("id,name")
    .eq("instrument_id", instrumentId);
  if (domainsError) throw serviceUnavailable("SafeSteps could not load AOD/MH/DFV domains.");

  const domainIds = (domains ?? []).map((domain) => domain.id);
  const { data: items, error: itemsError } = await client
    .from("assessment_items")
    .select("id,item_key,domain_id")
    .in("domain_id", domainIds);
  if (itemsError) throw serviceUnavailable("SafeSteps could not load AOD/MH/DFV items.");

  const domainByCode = {};
  for (const domain of domains ?? []) {
    const code = domainCodeFromName(domain.name);
    if (code) domainByCode[code] = domain;
  }

  return {
    domainByCode,
    itemByCode: Object.fromEntries((items ?? []).map((item) => [item.item_key, item])),
  };
}

function domainCodeFromName(name) {
  return {
    "DFV Safety and Coercive Control": "DFV_SAFETY",
    "AOD Impact on Caregiving Capacity": "AOD_IMPACT",
    "Mental Health Functional Impact": "MH_FUNCTIONAL",
    "Protective Capacity and Support Network": "PROTECTIVE_CAPACITY",
    "Perpetrator Accountability and Behaviour Change (where applicable)": "PERPETRATOR_ACCOUNTABILITY",
    "Coordination and Service Engagement": "SERVICE_COORDINATION",
    "Child Impact Indicators": "CHILD_IMPACT",
  }[name];
}

async function insertResponses({ client, assessmentId, itemScores, notes, lookup }) {
  const rows = Object.entries(itemScores)
    .map(([itemCode, score]) => {
      const item = lookup.itemByCode[itemCode];
      if (!item) return null;
      return {
        assessment_id: assessmentId,
        item_id: item.id,
        numeric_value: score,
        narrative_value: typeof notes[itemCode] === "string" ? notes[itemCode] : null,
      };
    })
    .filter(Boolean);

  if (!rows.length) return;
  const { error } = await client.from("assessment_responses").insert(rows);
  if (error) throw serviceUnavailable("SafeSteps could not save AOD/MH/DFV item responses.");
}

async function insertDomainScores({ client, assessmentId, scoringResult, lookup }) {
  const rows = Object.entries(scoringResult.domainResults)
    .map(([domainCode, result]) => {
      const domain = lookup.domainByCode[domainCode];
      if (!domain) return null;
      const itemCount = DOMAIN_ITEMS[domainCode].length;
      return {
        assessment_id: assessmentId,
        domain_id: domain.id,
        raw_score: result.rawAvg * itemCount,
        max_possible: 4 * itemCount,
        normalized_score: result.normalizedScore,
      };
    })
    .filter(Boolean);

  if (!rows.length) return;
  const { error } = await client.from("assessment_domain_scores").insert(rows);
  if (error) throw serviceUnavailable("SafeSteps could not save AOD/MH/DFV domain scores.");
}

async function insertAssessmentScore({ client, assessmentId, scoringResult, band }) {
  const { error } = await client.from("assessment_scores").insert({
    assessment_id: assessmentId,
    overall_score: scoringResult.compositeScore,
    band_id: band?.id ?? null,
    band_label: scoringResult.band,
    override_triggered: scoringResult.triggeredOverrides.length > 0,
    requires_supervisor_review: scoringResult.triggeredOverrides.length > 0 || Boolean(band?.requires_supervisor_review),
    recommendation: band?.recommendation ?? "Review AOD/MH/DFV assessment findings with the case team.",
  });

  if (error) throw serviceUnavailable("SafeSteps could not save the AOD/MH/DFV assessment score.");
}

async function insertOverrideLogs({ client, assessmentId, contextId, itemScores, triggeredOverrides }) {
  const rows = triggeredOverrides.map((overrideCode) => {
    const config = CRITICAL_OVERRIDES[overrideCode];
    return {
      context_id: contextId,
      assessment_id: assessmentId,
      override_code: overrideCode,
      trigger_item: config.item,
      trigger_value: itemScores[config.item],
      rationale: `Critical override triggered: ${config.item} >= ${config.threshold}`,
    };
  });

  if (!rows.length) return;
  const { error } = await client.from("aod_mh_dfv_critical_override_log").insert(rows);
  if (error) throw serviceUnavailable("SafeSteps could not save AOD/MH/DFV critical override logs.");
}

async function insertCrossDomainFlags({ client, assessmentId, contextId, flags }) {
  const rows = flags.map((flag) => ({
    context_id: contextId,
    assessment_id: assessmentId,
    rule_code: flag.ruleCode,
    flag_text: flag.flagText,
  }));

  if (!rows.length) return;
  const { error } = await client.from("aod_mh_dfv_cross_domain_flags").insert(rows);
  if (error) throw serviceUnavailable("SafeSteps could not save AOD/MH/DFV cross-domain flags.");
}
