"""
PDF report section for the AOD_MH_DFV_v1 instrument.

Returns ReportLab Platypus flowables to append into an existing case report
story. Critical overrides are rendered before the composite score, and
victim-parent safety content is kept visually separate from perpetrator
accountability content.
"""

import os
import sys
from typing import Dict, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

SCORING_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scoring"))
if SCORING_DIR not in sys.path:
    sys.path.insert(0, SCORING_DIR)

styles = getSampleStyleSheet()

section_title_style = ParagraphStyle(
    "AODMHDFVSectionTitle",
    parent=styles["Heading2"],
    textColor=colors.HexColor("#1a1a1a"),
    spaceAfter=6,
)
override_banner_style = ParagraphStyle(
    "OverrideBanner",
    parent=styles["Normal"],
    backColor=colors.HexColor("#fdecea"),
    textColor=colors.HexColor("#8a1f11"),
    borderPadding=8,
    fontSize=10,
    leading=13,
    spaceAfter=10,
)
subheading_style = ParagraphStyle(
    "SubHeading",
    parent=styles["Heading3"],
    spaceBefore=8,
    spaceAfter=4,
)
body_style = styles["Normal"]
flag_style = ParagraphStyle(
    "CrossDomainFlag",
    parent=styles["Normal"],
    textColor=colors.HexColor("#8a1f11"),
    fontSize=9,
    leftIndent=10,
)

DOMAIN_LABELS = {
    "DFV_SAFETY": "DFV Safety & Coercive Control",
    "AOD_IMPACT": "AOD Impact on Caregiving",
    "MH_FUNCTIONAL": "Mental Health Functional Impact",
    "PROTECTIVE_CAPACITY": "Protective Capacity & Support Network",
    "PERPETRATOR_ACCOUNTABILITY": "Perpetrator Accountability & Behaviour Change",
    "SERVICE_COORDINATION": "Coordination & Service Engagement",
    "CHILD_IMPACT": "Child Impact Indicators",
}

VICTIM_DOMAINS = {"DFV_SAFETY", "PROTECTIVE_CAPACITY", "CHILD_IMPACT"}


def _trend_arrow(current: float, prior: Optional[float] = None) -> str:
    if prior is None:
        return "-"
    if current > prior + 1:
        return "UP"
    if current < prior - 1:
        return "DOWN"
    return "FLAT"


def _override_domain(override_code: str) -> Optional[str]:
    mapping = {
        "DFV1_HIGH": "DFV_SAFETY",
        "DFV3_HIGH": "DFV_SAFETY",
        "AOD4_HIGH": "AOD_IMPACT",
        "MH2_HIGH": "MH_FUNCTIONAL",
        "PA3_HIGH": "PERPETRATOR_ACCOUNTABILITY",
    }
    return mapping.get(override_code)


def _domain_row(domain_code, result, prior_scores, triggered_overrides):
    domain_result = result.domain_results[domain_code]
    prior = (prior_scores or {}).get(domain_code)
    trend = _trend_arrow(domain_result.normalized_score, prior)
    override_domains = {_override_domain(code) for code in triggered_overrides}
    flag = "FLAG" if domain_code in override_domains else ""

    return [
        DOMAIN_LABELS.get(domain_code, domain_code),
        f"{domain_result.normalized_score:.1f}",
        trend,
        flag,
    ]


def build_aod_mh_dfv_section(result, prior_scores: Optional[Dict[str, float]] = None):
    """
    Build the AOD/MH/DFV report section.

    result: InstrumentResult from aod_mh_dfv_scoring.score_instrument()
    prior_scores: optional dict of {domain_code: normalized_score} from the
    previous timepoint.
    """
    story = []

    story.append(
        Paragraph(
            "Co-Occurring AOD, Mental Health & DFV Assessment",
            section_title_style,
        )
    )

    if result.triggered_overrides:
        override_lines = "<br/>".join(
            f"CRITICAL OVERRIDE ACTIVE - {code} ({_override_domain(code)})"
            for code in result.triggered_overrides
        )
        story.append(
            Paragraph(
                "<b>CRITICAL SAFETY OVERRIDE - BAND FORCED TO "
                "'CRITICAL CONCERN'</b><br/>"
                f"{override_lines}<br/>"
                "This section's composite score is capped and does not reflect "
                "aggregate domain averages. No favourable trend below offsets "
                "this override.",
                override_banner_style,
            )
        )

    story.append(
        Paragraph(
            f"Composite Score: {result.composite_score:.1f} &nbsp;&nbsp; "
            f"Band: <b>{result.band}</b>",
            body_style,
        )
    )
    story.append(Spacer(1, 8))

    table_data = [["Domain", "Score (0-100)", "Trend", "Flag"]]
    for domain_code in DOMAIN_LABELS:
        table_data.append(
            _domain_row(
                domain_code,
                result,
                prior_scores,
                result.triggered_overrides,
            )
        )

    domain_table = Table(
        table_data,
        colWidths=[2.6 * inch, 1.1 * inch, 0.7 * inch, 0.6 * inch],
    )
    domain_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f5f5f5")],
                ),
            ]
        )
    )
    story.append(domain_table)
    story.append(Spacer(1, 10))

    story.append(
        Paragraph("Protective Parent / Victim-Survivor Safety Summary", subheading_style)
    )
    victim_scores = ", ".join(
        f"{DOMAIN_LABELS[domain]}: {result.domain_results[domain].normalized_score:.1f}"
        for domain in VICTIM_DOMAINS
    )
    story.append(Paragraph(victim_scores, body_style))
    story.append(Spacer(1, 6))

    perpetrator_domain = result.domain_results.get("PERPETRATOR_ACCOUNTABILITY")
    if perpetrator_domain and any(
        value is not None for value in perpetrator_domain.item_scores.values()
    ):
        story.append(
            Paragraph(
                "Perpetrator Accountability Summary (separate tracking)",
                subheading_style,
            )
        )
        story.append(
            Paragraph(
                f"{DOMAIN_LABELS['PERPETRATOR_ACCOUNTABILITY']}: "
                f"{perpetrator_domain.normalized_score:.1f}. Scored and "
                "case-planned independently of the protective parent's plan.",
                body_style,
            )
        )
        story.append(Spacer(1, 6))

    if result.cross_domain_flags:
        story.append(Paragraph("Cross-Domain Rule Flags", subheading_style))
        for flag in result.cross_domain_flags:
            story.append(Paragraph(f"- {flag}", flag_style))
        story.append(Spacer(1, 6))

    return [KeepTogether(story)]


if __name__ == "__main__":
    from aod_mh_dfv_scoring import score_instrument

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
    report_result = score_instrument(
        sample_scores,
        prior_timepoint_domain_scores={"AOD_IMPACT": 50.0},
    )
    prior_scores_for_report = {"AOD_IMPACT": 50.0, "DFV_SAFETY": 30.0}

    doc = SimpleDocTemplate("aod_mh_dfv_section_demo.pdf", pagesize=LETTER)
    doc.build(build_aod_mh_dfv_section(report_result, prior_scores_for_report))
    print("Demo PDF written: aod_mh_dfv_section_demo.pdf")
