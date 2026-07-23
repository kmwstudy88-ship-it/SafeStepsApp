import {
  nervousSystemVideoCourse,
  nervousSystemVideoCourseUsesPlaceholderVideos,
  nervousSystemVideoLessonId,
  nervousSystemVideoSteps,
} from "../lib/data/nervousSystemVideoCourse";
import {
  buildInteractiveVideoCourseCompletionPayload,
  getInteractiveVideoCourseAssetStatus,
} from "../lib/data/interactiveVideoCourse";

describe("nervous system video course", () => {
  it("maps the uploaded 12-lesson course into interactive video steps", () => {
    expect(nervousSystemVideoLessonId).toBe("NSR-COURSE-01");
    expect(nervousSystemVideoSteps).toHaveLength(12);
    expect(nervousSystemVideoSteps[0]).toEqual(
      expect.objectContaining({
        lessonId: "NSR-01",
        title: "What Is the Nervous System and Why Does It Matter for Parenting?",
        productionVideoUrl: "videos/NSR-01_what-is-the-nervous-system.mp4",
      }),
    );
    expect(nervousSystemVideoSteps.at(-1)?.lessonId).toBe("NSR-12");
  });

  it("keeps manifest paths attached until real video and caption assets are added", () => {
    expect(nervousSystemVideoCourseUsesPlaceholderVideos()).toBe(true);
    expect(getInteractiveVideoCourseAssetStatus(nervousSystemVideoCourse)).toEqual(
      expect.objectContaining({
        isProductionReady: false,
        placeholderStepCount: 12,
        missingCaptionStepIds: [],
        missingScriptStepIds: [],
      }),
    );
    expect(nervousSystemVideoSteps[0].assetManifest).toEqual(
      expect.objectContaining({
        captionFile: "captions_srt/NSR-01_what-is-the-nervous-system.srt",
        videoScriptMarkdown: "video_scripts_md/NSR-01_what-is-the-nervous-system_video_script.md",
        workbookPages: "9",
      }),
    );
  });

  it("builds completion metadata for reporting and timeline evidence", () => {
    const payload = buildInteractiveVideoCourseCompletionPayload(nervousSystemVideoCourse, {
      answers: { 1: "I notice my shoulders tightening first." },
      selectedQuizAnswerId: nervousSystemVideoSteps[0].quiz?.options.find((option) => option.correct)?.id ?? null,
    });

    expect(payload).toEqual(
      expect.objectContaining({
        lessonId: "NSR-COURSE-01",
        quizPassed: true,
        videoStepCount: 12,
      }),
    );
  });
});
