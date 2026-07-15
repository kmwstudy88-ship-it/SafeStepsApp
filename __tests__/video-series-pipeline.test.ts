import fs from "fs";
import path from "path";

import { courseAreas } from "../curriculum/courses";
import {
  buildVideoSeriesCourseDraft,
  getVideoSeriesLessonPreviewSlots,
  getVideoSeriesReviewGates,
  parseVideoSeriesEpisodesFromRtf,
  summarizeVideoSeriesPipelines,
  videoSeriesPipelines,
} from "../lib/data/videoSeriesPipeline";

const productionPacksAvailable = videoSeriesPipelines.every((series) =>
  fs.existsSync(path.join(process.cwd(), series.jsonPackPath)),
);
const productionPackIt = productionPacksAvailable ? it : it.skip;

describe("video series production pipeline", () => {
  it("catalogs the unified production pipeline series", () => {
    const summary = summarizeVideoSeriesPipelines();

    expect(summary.totalSeries).toBe(9);
    expect(summary.readySeries).toBe(8);
    expect(summary.needsCompletion).toBe(1);
    expect(summary.totalEpisodes).toBe(97);
    expect(summary.expectedEpisodes).toBe(108);
  });

  it("keeps incomplete series marked for completion instead of launch import", () => {
    const incomplete = videoSeriesPipelines.find((series) => series.id === "behaviour-as-communication");

    expect(incomplete?.detectedEpisodes).toBe(1);
    expect(incomplete?.status).toBe("needs_episode_completion");
  });

  productionPackIt("parses episode JSON from each available RTF production pack", () => {
    for (const series of videoSeriesPipelines) {
      const absolutePath = path.join(process.cwd(), series.jsonPackPath);
      const rtf = fs.readFileSync(absolutePath, "utf8");
      const episodes = parseVideoSeriesEpisodesFromRtf(rtf);

      expect(episodes).toHaveLength(series.detectedEpisodes);
      expect(episodes[0]).toEqual(
        expect.objectContaining({
          episode: 1,
          title: expect.any(String),
          keyMessage: expect.any(String),
        }),
      );
      expect(episodes.every((episode) => episode.reflection.length > 0 && episode.actions.length > 0)).toBe(true);
    }
  });

  it("maps every ready series to a course area and production source files", () => {
    const readySeries = videoSeriesPipelines.filter((series) => series.status === "ready_for_curriculum_review");
    const courseAreaIds = new Set(courseAreas.map((area) => area.id));

    expect(readySeries.every((series) => courseAreaIds.has(series.courseAreaId))).toBe(true);
    expect(readySeries.every((series) => series.masterDocumentPath.endsWith(".rtf"))).toBe(true);
    expect(readySeries.every((series) => series.parentWorkbookPath.endsWith(".rtf"))).toBe(true);
    expect(readySeries.every((series) => series.storyboardPath.endsWith(".rtf"))).toBe(true);
  });

  productionPackIt("builds course-review drafts only from complete available production packs", () => {
    const drafts = videoSeriesPipelines.map((series) => {
      const absolutePath = path.join(process.cwd(), series.jsonPackPath);
      const rtf = fs.readFileSync(absolutePath, "utf8");
      const episodes = parseVideoSeriesEpisodesFromRtf(rtf);

      return buildVideoSeriesCourseDraft(series, episodes);
    });

    const completeDrafts = drafts.filter(Boolean);
    const incompleteDraft = drafts[videoSeriesPipelines.findIndex((series) => series.id === "behaviour-as-communication")];

    expect(completeDrafts).toHaveLength(8);
    expect(incompleteDraft).toBeNull();
    expect(
      completeDrafts.every(
        (draft) =>
          draft?.status === "draft_ready_for_human_review" &&
          draft.lessons.length === 12 &&
          draft.lessons.every(
            (lesson) =>
              lesson.content.parentMeaningPrompt.length > 0 &&
              lesson.content.positiveItems.length > 0 &&
              lesson.content.steps.length > 0,
          ),
      ),
    ).toBe(true);
  });

  it("exposes explicit review gates for ready and incomplete series", () => {
    const ready = videoSeriesPipelines.find((series) => series.id === "attachment-connection");
    const incomplete = videoSeriesPipelines.find((series) => series.id === "behaviour-as-communication");

    expect(ready).toBeDefined();
    expect(incomplete).toBeDefined();

    const readyGates = getVideoSeriesReviewGates(ready!);
    const incompleteGates = getVideoSeriesReviewGates(incomplete!);

    expect(readyGates.every((gate) => gate.passed)).toBe(true);
    expect(incompleteGates.find((gate) => gate.id === "episode-pack-complete")?.passed).toBe(false);
    expect(incompleteGates.find((gate) => gate.id === "human-review-required")?.passed).toBe(true);
  });

  it("builds a stable episode review manifest for each production pack", () => {
    const ready = videoSeriesPipelines.find((series) => series.id === "attachment-connection");
    const incomplete = videoSeriesPipelines.find((series) => series.id === "behaviour-as-communication");

    expect(ready).toBeDefined();
    expect(incomplete).toBeDefined();

    const readySlots = getVideoSeriesLessonPreviewSlots(ready!);
    const incompleteSlots = getVideoSeriesLessonPreviewSlots(incomplete!);

    expect(readySlots).toHaveLength(12);
    expect(readySlots.every((slot) => slot.status === "ready_for_review")).toBe(true);
    expect(incompleteSlots).toHaveLength(12);
    expect(incompleteSlots.filter((slot) => slot.status === "ready_for_review")).toHaveLength(1);
    expect(incompleteSlots.filter((slot) => slot.status === "missing_from_pack")).toHaveLength(11);
  });
});
