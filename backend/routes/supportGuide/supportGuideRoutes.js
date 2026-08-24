import express from "express";

import { createSupportGuideResponse } from "../../Services/SupportGuide/SupportGuideService.js";
import { log } from "../../lib/logger.js";
import { supportGuideRateLimit } from "../../middleware/supportGuideRateLimit.js";

const router = express.Router();

router.post("/respond", supportGuideRateLimit, async (req, res, next) => {
  try {
    const result = await createSupportGuideResponse(req.body ?? {});
    log("info", "support_guide.response", {
      requestId: req.id,
      userId: req.safeStepsAuth?.user?.id ?? null,
      domain: req.body?.domain,
      source: result.source,
      riskRuleIds: result.risk.ruleIds,
      outputViolationIds: result.outputReview?.violations ?? [],
    });
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: result, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

export default router;
