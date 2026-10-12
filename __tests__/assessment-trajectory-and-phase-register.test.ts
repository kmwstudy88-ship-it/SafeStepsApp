import {
  flagScoreRegression,
  summarizeDomainTrajectory,
  type DomainScore,
} from "../lib/engines/assessmentScoringEngine";
import {
  ASSESSMENT_PHASE_TOOL_REGISTER,
  getAllTools,
  getPhaseToolEntry,
  type ProgramPhase,
} from "../lib/data/assessmentPhaseToolRegister";

// ---------------------------------------------------------------------------
// flagScoreRegression
// ---------------------------------------------------------------------------

function makeDomainScore(domainId: string, normalized: number): DomainScore {
  return {
    domainId,
    rawScore: normalized,
    maxPossible: 100,
    normalizedScore: normalized / 100,
  };
}

describe("flagScoreRegression", () => {
  test("returns empty array when no scores drop", () => {
    const prev = [makeDomainScore("safety", 70), makeDomainScore("routines", 60)];
    const curr = [makeDomainScore("safety", 75), makeDomainScore("routines", 65)];
    expect(flagScoreRegression(prev, curr)).toEqual([]);
  });

  test("ignores drops below the minor threshold", () => {
    const prev = [makeDomainScore("safety", 70)];
    const curr = [makeDomainScore("safety", 67)];
    expect(flagScoreRegression(prev, curr)).toEqual([]);
  });

  test("flags minor drop (5–14 points)", () => {
    const prev = [makeDomainScore("safety", 70)];
    const curr = [makeDomainScore("safety", 62)];
    const flags = flagScoreRegression(prev, curr);
    expect(flags).toHaveLength(1);
    expect(flags[0].severity).toBe("minor");
    expect(flags[0].drop).toBe(8);
  });

  test("flags significant drop (15–29 points)", () => {
    const prev = [makeDomainScore("safety", 80)];
    const curr = [makeDomainScore("safety", 62)];
    const flags = flagScoreRegression(prev, curr);
    expect(flags).toHaveLength(1);
    expect(flags[0].severity).toBe("significant");
    expect(flags[0].drop).toBe(18);
  });

  test("flags critical drop (30+ points)", () => {
    const prev = [makeDomainScore("safety", 90)];
    const curr = [makeDomainScore("safety", 55)];
    const flags = flagScoreRegression(prev, curr);
    expect(flags).toHaveLength(1);
    expect(flags[0].severity).toBe("critical");
    expect(flags[0].drop).toBe(35);
  });

  test("only flags domains present in both sets", () => {
    const prev = [makeDomainScore("safety", 80)];
    const curr = [
      makeDomainScore("safety", 60),
      makeDomainScore("new_domain", 40),
    ];
    const flags = flagScoreRegression(prev, curr);
    expect(flags).toHaveLength(1);
    expect(flags[0].domainId).toBe("safety");
  });

  test("correctly records previousScore and currentScore", () => {
    const prev = [makeDomainScore("routines", 75)];
    const curr = [makeDomainScore("routines", 55)];
    const flags = flagScoreRegression(prev, curr);
    expect(flags[0].previousScore).toBe(75);
    expect(flags[0].currentScore).toBe(55);
  });
});

// ---------------------------------------------------------------------------
// summarizeDomainTrajectory
// ---------------------------------------------------------------------------

describe("summarizeDomainTrajectory", () => {
  test("returns insufficient_data for empty input", () => {
    const result = summarizeDomainTrajectory([]);
    expect(result.assessmentCount).toBe(0);
    expect(result.overallDirection).toBe("insufficient_data");
    expect(result.domains).toEqual([]);
  });

  test("returns insufficient_data direction for a single record", () => {
    const result = summarizeDomainTrajectory([
      {
        assessmentId: "a1",
        assessedAt: "2026-01-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 60)],
      },
    ]);
    expect(result.assessmentCount).toBe(1);
    const domain = result.domains[0];
    expect(domain.direction).toBe("insufficient_data");
    expect(domain.firstScore).toBe(60);
    expect(domain.latestScore).toBe(60);
  });

  test("detects improving direction", () => {
    const result = summarizeDomainTrajectory([
      {
        assessmentId: "a1",
        assessedAt: "2026-01-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 50)],
      },
      {
        assessmentId: "a2",
        assessedAt: "2026-03-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 70)],
      },
    ]);
    expect(result.domains[0].direction).toBe("improving");
    expect(result.overallDirection).toBe("improving");
  });

  test("detects declining direction", () => {
    const result = summarizeDomainTrajectory([
      {
        assessmentId: "a1",
        assessedAt: "2026-01-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 80)],
      },
      {
        assessmentId: "a2",
        assessedAt: "2026-03-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 50)],
      },
    ]);
    expect(result.domains[0].direction).toBe("declining");
    expect(result.overallDirection).toBe("declining");
  });

  test("detects stable direction (within ±5 points)", () => {
    const result = summarizeDomainTrajectory([
      {
        assessmentId: "a1",
        assessedAt: "2026-01-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 65)],
      },
      {
        assessmentId: "a2",
        assessedAt: "2026-03-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 67)],
      },
    ]);
    expect(result.domains[0].direction).toBe("stable");
  });

  test("counts regression flags across consecutive pairs", () => {
    const result = summarizeDomainTrajectory([
      {
        assessmentId: "a1",
        assessedAt: "2026-01-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 80)],
      },
      {
        assessmentId: "a2",
        assessedAt: "2026-03-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 60)],
      },
      {
        assessmentId: "a3",
        assessedAt: "2026-06-01T00:00:00Z",
        domainScores: [makeDomainScore("safety", 65)],
      },
    ]);
    const domain = result.domains[0];
    // First pair: 80→60 = 20-point drop (significant)
    // Second pair: 60→65 = improvement, no flag
    expect(domain.regressionFlags).toHaveLength(1);
    expect(domain.regressionFlags[0].severity).toBe("significant");
  });

  test("handles multiple domains", () => {
    const result = summarizeDomainTrajectory([
      {
        assessmentId: "a1",
        assessedAt: "2026-01-01T00:00:00Z",
        domainScores: [
          makeDomainScore("safety", 50),
          makeDomainScore("routines", 40),
        ],
      },
      {
        assessmentId: "a2",
        assessedAt: "2026-03-01T00:00:00Z",
        domainScores: [
          makeDomainScore("safety", 70),
          makeDomainScore("routines", 30),
        ],
      },
    ]);
    expect(result.domains).toHaveLength(2);
    const safety = result.domains.find((d) => d.domainId === "safety");
    const routines = result.domains.find((d) => d.domainId === "routines");
    expect(safety?.direction).toBe("improving");
    expect(routines?.direction).toBe("declining");
  });

  test("records assessmentCount correctly", () => {
    const records = [1, 2, 3].map((i) => ({
      assessmentId: `a${i}`,
      assessedAt: `2026-0${i}-01T00:00:00Z`,
      domainScores: [makeDomainScore("safety", 50 + i * 5)],
    }));
    const result = summarizeDomainTrajectory(records);
    expect(result.assessmentCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// assessmentPhaseToolRegister
// ---------------------------------------------------------------------------

const ALL_PHASES: ProgramPhase[] = [
  "pre_entry",
  "phase_1",
  "phase_2",
  "phase_3",
  "exit",
];

describe("ASSESSMENT_PHASE_TOOL_REGISTER", () => {
  test("has exactly 5 phase entries", () => {
    expect(ASSESSMENT_PHASE_TOOL_REGISTER).toHaveLength(5);
  });

  test("contains all required phases", () => {
    const phases = ASSESSMENT_PHASE_TOOL_REGISTER.map((e) => e.phase);
    for (const phase of ALL_PHASES) {
      expect(phases).toContain(phase);
    }
  });

  test("every phase has at least one tool", () => {
    for (const entry of ASSESSMENT_PHASE_TOOL_REGISTER) {
      expect(entry.tools.length).toBeGreaterThan(0);
    }
  });

  test("every tool has required fields", () => {
    const tools = getAllTools();
    for (const tool of tools) {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.fullName).toBeTruthy();
      expect(tool.domain).toBeTruthy();
      expect(["psychologist", "worker", "trained_observer", "licensed_platform", "worker_under_policy", "forensic_psychologist"]).toContain(tool.adminRole);
      expect(["app_native", "external_summary", "metadata_only"]).toContain(tool.storageMode);
    }
  });

  test("getPhaseToolEntry returns correct entry", () => {
    const entry = getPhaseToolEntry("pre_entry");
    expect(entry?.phase).toBe("pre_entry");
    expect(entry?.tools.length).toBeGreaterThan(0);
  });

  test("getPhaseToolEntry returns null for invalid phase", () => {
    expect(getPhaseToolEntry("invalid_phase" as ProgramPhase)).toBeNull();
  });

  test("getAllTools returns unique tools only", () => {
    const tools = getAllTools();
    const ids = tools.map((t) => t.id);
    expect(ids).toHaveLength(new Set(ids).size);
  });

  test("contradiction_log tool appears in all phases", () => {
    for (const entry of ASSESSMENT_PHASE_TOOL_REGISTER) {
      const hasLog = entry.tools.some((t) => t.id === "contradiction_log");
      expect(hasLog).toBe(true);
    }
  });

  test("restricted tools use external_summary storage", () => {
    const restrictedIds = ["pai", "mcmi_iv", "wais_iv", "pca", "care_index"];
    const tools = getAllTools();
    for (const id of restrictedIds) {
      const tool = tools.find((t) => t.id === id);
      if (tool) {
        expect(tool.storageMode).toBe("external_summary");
      }
    }
  });
});
