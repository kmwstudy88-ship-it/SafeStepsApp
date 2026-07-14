import { evaluateSafetyAlerts } from "../lib/engines/safetyAlertEngine";

describe("safety alert engine", () => {
  test("routes critical child safety and crisis alerts to review audiences", () => {
    const alerts = evaluateSafetyAlerts({
      childSafetyConcern: true,
      crisisButtonActivated: true,
    });

    expect(alerts.map((alert) => alert.type)).toEqual(["child_safety_concern", "crisis_button"]);
    expect(alerts[0].severity).toBe("critical");
    expect(alerts[0].audience).toEqual(["worker", "child_protection"]);
    expect(alerts[1].audience).toEqual(["on_call_worker"]);
  });

  test("detects compliance gaps, regression, and positive milestones", () => {
    const alerts = evaluateSafetyAlerts({
      missedDailyCheckIns: 1,
      consecutiveMissedCheckIns: 3,
      weeksSinceFinancialEvidence: 2,
      regressedDomains: [{ domainId: "protective-capacity", currentScore: 1.5, previousScore: 3 }],
      establishedDomains: ["emotional-regulation"],
    });

    expect(alerts.map((alert) => alert.type)).toEqual(
      expect.arrayContaining([
        "missed_daily_check_in",
        "consecutive_missed_check_ins",
        "financial_evidence_gap",
        "score_regression",
        "positive_milestone",
      ]),
    );
  });
});
