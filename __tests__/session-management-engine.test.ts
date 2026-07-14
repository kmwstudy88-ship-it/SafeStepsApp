import {
  evaluateSessionAlerts,
  generateSessionAgenda,
  sessionIsMissed,
} from "../lib/engines/sessionManagementEngine";

describe("session management engine", () => {
  test("generates phase, course, risk, evidence, and next-action agenda items", () => {
    const agenda = generateSessionAgenda({
      phase: "Generalisation",
      courseContext: "Safe Contact and Repair",
      currentRiskBand: "High",
    });

    expect(agenda.map((item) => item.source)).toEqual(
      expect.arrayContaining(["standing", "evidence", "phase", "course", "risk"]),
    );
    expect(agenda.at(-1)?.title).toBe("Next actions and accountability");
  });

  test("detects missed scheduled sessions only", () => {
    const now = new Date("2026-07-13T00:00:00.000Z");

    expect(sessionIsMissed({ scheduled_start_at: "2026-07-12T09:00:00.000Z", status: "scheduled" }, now)).toBe(true);
    expect(sessionIsMissed({ scheduled_start_at: "2026-07-12T09:00:00.000Z", status: "completed" }, now)).toBe(false);
    expect(sessionIsMissed({ scheduled_start_at: "2026-07-14T09:00:00.000Z", status: "scheduled" }, now)).toBe(false);
  });

  test("creates missed-session alert for worker and supervisor review", () => {
    const alerts = evaluateSessionAlerts([
      { scheduled_start_at: "2026-07-12T09:00:00.000Z", status: "scheduled" },
      { scheduled_start_at: "2026-07-14T09:00:00.000Z", status: "scheduled" },
    ]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe("missed_session");
    expect(alerts[0].notificationType).toBe("session_alert");
    expect(alerts[0].audience).toEqual(["worker", "supervisor"]);
  });
});
