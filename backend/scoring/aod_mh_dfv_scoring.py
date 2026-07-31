"""
AOD_MH_DFV_v1 scoring module.

Domain scores are 0-100 normalized (item scale 0-4 -> domain avg -> *25).
Critical overrides force band to "Critical Concern" regardless of aggregate
domain performance. Cross-domain rule: an improving AOD_IMPACT trend across
timepoints must not offset an active DFV_SAFETY critical override in the
composite RRI.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional

INSTRUMENT_CODE = "AOD_MH_DFV_v1"

DOMAIN_ITEMS = {
    "DFV_SAFETY": ["DFV1", "DFV2", "DFV3", "DFV4"],
    "AOD_IMPACT": ["AOD1", "AOD2", "AOD3", "AOD4"],
    "MH_FUNCTIONAL": ["MH1", "MH2", "MH3", "MH4"],
    "PROTECTIVE_CAPACITY": ["PC1", "PC2", "PC3"],
    "PERPETRATOR_ACCOUNTABILITY": ["PA1", "PA2", "PA3"],
    "SERVICE_COORDINATION": ["SC1", "SC2"],
    "CHILD_IMPACT": ["CI1", "CI2"],
}

CRITICAL_OVERRIDES = {
    "DFV1_HIGH": {"item": "DFV1", "threshold": 3, "domain": "DFV_SAFETY"},
    "DFV3_HIGH": {"item": "DFV3", "threshold": 3, "domain": "DFV_SAFETY"},
    "AOD4_HIGH": {"item": "AOD4", "threshold": 3, "domain": "AOD_IMPACT"},
    "MH2_HIGH": {"item": "MH2", "threshold": 3, "domain": "MH_FUNCTIONAL"},
    "PA3_HIGH": {"item": "PA3", "threshold": 3, "domain": "PERPETRATOR_ACCOUNTABILITY"},
}

SCORING_BANDS = [
    ("Low Concern", 0, 25),
    ("Moderate Concern", 26, 50),
    ("High Concern", 51, 75),
    ("Critical Concern", 76, 100),
]


@dataclass
class DomainResult:
    domain_code: str
    raw_avg: float
    normalized_score: float
    item_scores: Dict[str, Optional[int]]


@dataclass
class InstrumentResult:
    instrument_code: str
    domain_results: Dict[str, DomainResult]
    triggered_overrides: List[str]
    forced_band: Optional[str]
    composite_score: float
    band: str
    cross_domain_flags: List[str] = field(default_factory=list)


def _band_for_score(score: float) -> str:
    for name, low, high in SCORING_BANDS:
        if low <= score <= high:
            return name
    return SCORING_BANDS[-1][0]


def score_domain(domain_code: str, item_scores: Dict[str, int]) -> DomainResult:
    items = DOMAIN_ITEMS[domain_code]
    values = [item_scores[item] for item in items if item in item_scores]
    raw_avg = sum(values) / len(values) if values else 0.0
    normalized = round((raw_avg / 4.0) * 100, 2)

    return DomainResult(
        domain_code=domain_code,
        raw_avg=raw_avg,
        normalized_score=normalized,
        item_scores={item: item_scores.get(item) for item in items},
    )


def evaluate_critical_overrides(item_scores: Dict[str, int]) -> List[str]:
    triggered = []
    for code, config in CRITICAL_OVERRIDES.items():
        value = item_scores.get(config["item"])
        if value is not None and value >= config["threshold"]:
            triggered.append(code)
    return triggered


def evaluate_cross_domain_rules(
    triggered_overrides: List[str],
    domain_results: Dict[str, DomainResult],
    prior_timepoint_domain_scores: Optional[Dict[str, float]] = None,
) -> List[str]:
    flags = []

    dfv_override_active = any(
        CRITICAL_OVERRIDES[code]["domain"] == "DFV_SAFETY"
        for code in triggered_overrides
    )
    if dfv_override_active and prior_timepoint_domain_scores:
        previous_aod = prior_timepoint_domain_scores.get("AOD_IMPACT")
        current_aod = domain_results["AOD_IMPACT"].normalized_score
        if previous_aod is not None and current_aod < previous_aod:
            flags.append(
                "DFV_OVERRIDES_AOD_TREND: AOD improvement detected but suppressed "
                "in composite due to active DFV safety critical override."
            )

    if "PA3_HIGH" in triggered_overrides:
        flags.append(
            "SEPARATE_VICTIM_PERPETRATOR_PLANS: Ongoing perpetrator risk indicator "
            "triggered. Verify victim-parent case plan and perpetrator accountability "
            "tracking remain scored as separate units, not combined."
        )

    return flags


def score_instrument(
    item_scores: Dict[str, int],
    prior_timepoint_domain_scores: Optional[Dict[str, float]] = None,
    domain_weights: Optional[Dict[str, float]] = None,
) -> InstrumentResult:
    domain_results = {
        code: score_domain(code, item_scores) for code in DOMAIN_ITEMS
    }

    triggered_overrides = evaluate_critical_overrides(item_scores)

    if domain_weights is None:
        domain_weights = {code: 1.0 for code in DOMAIN_ITEMS}

    total_weight = sum(domain_weights.values())
    if total_weight <= 0:
        raise ValueError("domain_weights must have a positive total weight")

    weighted_composite = sum(
        domain_results[code].normalized_score * domain_weights.get(code, 0)
        for code in DOMAIN_ITEMS
    ) / total_weight

    forced_band = None
    composite_score = weighted_composite
    if triggered_overrides:
        forced_band = "Critical Concern"
        composite_score = max(composite_score, 76.0)

    band = forced_band or _band_for_score(composite_score)
    cross_domain_flags = evaluate_cross_domain_rules(
        triggered_overrides, domain_results, prior_timepoint_domain_scores
    )

    return InstrumentResult(
        instrument_code=INSTRUMENT_CODE,
        domain_results=domain_results,
        triggered_overrides=triggered_overrides,
        forced_band=forced_band,
        composite_score=round(composite_score, 2),
        band=band,
        cross_domain_flags=cross_domain_flags,
    )


def to_rri_contribution(result: InstrumentResult) -> Dict[str, object]:
    """
    Adapter for the existing Reunification Readiness Index composite engine.

    Returns a contribution dict consistent with other seeded instruments. A
    critical override caps readiness contribution so a single aggregate score
    cannot silently drive the decision.
    """
    max_contribution = 25.0
    capped_rri_points = None

    if result.forced_band == "Critical Concern":
        contribution_score = min(result.composite_score, 100.0)
        capped_rri_points = max_contribution * (100 - contribution_score) / 100

    return {
        "instrument_code": result.instrument_code,
        "composite_score": result.composite_score,
        "band": result.band,
        "critical_override_active": bool(result.forced_band),
        "triggered_overrides": result.triggered_overrides,
        "cross_domain_flags": result.cross_domain_flags,
        "rri_points_cap": capped_rri_points,
    }


if __name__ == "__main__":
    sample_scores = {
        "DFV1": 3,
        "DFV2": 2,
        "DFV3": 1,
        "DFV4": 2,
        "AOD1": 1,
        "AOD2": 3,
        "AOD3": 2,
        "AOD4": 0,
        "MH1": 2,
        "MH2": 1,
        "MH3": 3,
        "MH4": 2,
        "PC1": 3,
        "PC2": 2,
        "PC3": 2,
        "PA1": 2,
        "PA2": 1,
        "PA3": 0,
        "SC1": 2,
        "SC2": 1,
        "CI1": 1,
        "CI2": 2,
    }
    result = score_instrument(
        sample_scores,
        prior_timepoint_domain_scores={"AOD_IMPACT": 50.0},
    )
    print(result)
    print(to_rri_contribution(result))
