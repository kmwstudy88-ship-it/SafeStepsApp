import nervousSystemCourseJson from "../../curriculum/courses/lesson-videos/safesteps_nervous_system_course.json";

import {
  interactiveVideoCourseUsesPlaceholderVideos,
  type InteractiveVideoCourse,
  type InteractiveVideoStep,
} from "./interactiveVideoCourse";

type NervousSystemJsonLesson = {
  id: string;
  title: string;
  duration: string;
  video_duration: string;
  overview: string;
  reflection: string[];
  quiz: {
    q: string;
    options: string[];
    answer: number;
  }[];
  video_goal?: string;
  evidence_prompt?: string;
};

const demoVideoUrl = "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";

const assetManifest = [
  ["NSR-01", "videos/NSR-01_what-is-the-nervous-system.mp4", "video_scripts_md/NSR-01_what-is-the-nervous-system_video_script.md", "captions_srt/NSR-01_what-is-the-nervous-system.srt", "lesson_json/NSR-01_what-is-the-nervous-system.json", "4-5 minutes", "9"],
  ["NSR-02", "videos/NSR-02_brain-in-three-systems.mp4", "video_scripts_md/NSR-02_brain-in-three-systems_video_script.md", "captions_srt/NSR-02_brain-in-three-systems.srt", "lesson_json/NSR-02_brain-in-three-systems.json", "5 minutes", "9"],
  ["NSR-03", "videos/NSR-03_fight-flight-freeze-fawn.mp4", "video_scripts_md/NSR-03_fight-flight-freeze-fawn_video_script.md", "captions_srt/NSR-03_fight-flight-freeze-fawn.srt", "lesson_json/NSR-03_fight-flight-freeze-fawn.json", "5-6 minutes", "9"],
  ["NSR-04", "videos/NSR-04_understanding-triggers.mp4", "video_scripts_md/NSR-04_understanding-triggers_video_script.md", "captions_srt/NSR-04_understanding-triggers.srt", "lesson_json/NSR-04_understanding-triggers.json", "5 minutes", "9"],
  ["NSR-05", "videos/NSR-05_nervous-system-affects-children.mp4", "video_scripts_md/NSR-05_nervous-system-affects-children_video_script.md", "captions_srt/NSR-05_nervous-system-affects-children.srt", "lesson_json/NSR-05_nervous-system-affects-children.json", "5 minutes", "9"],
  ["NSR-06", "videos/NSR-06_window-of-tolerance.mp4", "video_scripts_md/NSR-06_window-of-tolerance_video_script.md", "captions_srt/NSR-06_window-of-tolerance.srt", "lesson_json/NSR-06_window-of-tolerance.json", "5 minutes", "9"],
  ["NSR-07", "videos/NSR-07_dysregulation-in-the-body.mp4", "video_scripts_md/NSR-07_dysregulation-in-the-body_video_script.md", "captions_srt/NSR-07_dysregulation-in-the-body.srt", "lesson_json/NSR-07_dysregulation-in-the-body.json", "5 minutes", "9"],
  ["NSR-08", "videos/NSR-08_early-warning-signs.mp4", "video_scripts_md/NSR-08_early-warning-signs_video_script.md", "captions_srt/NSR-08_early-warning-signs.srt", "lesson_json/NSR-08_early-warning-signs.json", "4-5 minutes", "9"],
  ["NSR-09", "videos/NSR-09_grounding-techniques.mp4", "video_scripts_md/NSR-09_grounding-techniques_video_script.md", "captions_srt/NSR-09_grounding-techniques.srt", "lesson_json/NSR-09_grounding-techniques.json", "6 minutes", "9"],
  ["NSR-10", "videos/NSR-10_breathing-and-body-tools.mp4", "video_scripts_md/NSR-10_breathing-and-body-tools_video_script.md", "captions_srt/NSR-10_breathing-and-body-tools.srt", "lesson_json/NSR-10_breathing-and-body-tools.json", "6 minutes", "9"],
  ["NSR-11", "videos/NSR-11_co-regulation.mp4", "video_scripts_md/NSR-11_co-regulation_video_script.md", "captions_srt/NSR-11_co-regulation.srt", "lesson_json/NSR-11_co-regulation.json", "6 minutes", "9"],
  ["NSR-12", "videos/NSR-12_personal-regulation-plan.mp4", "video_scripts_md/NSR-12_personal-regulation-plan_video_script.md", "captions_srt/NSR-12_personal-regulation-plan.srt", "lesson_json/NSR-12_personal-regulation-plan.json", "7 minutes", "9"],
] as const;

const assetByLessonId: Map<string, {
  productionVideoUrl: string;
  videoScriptMarkdown: string;
  captionFile: string;
  lessonJson: string;
  targetRuntime: string;
  workbookPages: string;
}> = new Map(
  assetManifest.map(([lessonId, productionVideoUrl, videoScriptMarkdown, captionFile, lessonJson, targetRuntime, workbookPages]) => [
    lessonId,
    { productionVideoUrl, videoScriptMarkdown, captionFile, lessonJson, targetRuntime, workbookPages },
  ]),
);

const sourceCourse = nervousSystemCourseJson as {
  course_id: string;
  title: string;
  subtitle: string;
  lessons: NervousSystemJsonLesson[];
};

export const nervousSystemVideoLessonId = sourceCourse.course_id;
export const nervousSystemVideoCourseTitle = sourceCourse.title;
export const nervousSystemPlaceholderVideoUrl = demoVideoUrl;

export const nervousSystemVideoSteps: InteractiveVideoStep[] = sourceCourse.lessons.map((lesson, index) => {
  const asset = assetByLessonId.get(lesson.id);
  const firstQuiz = lesson.quiz[0];

  return {
    id: index + 1,
    lessonId: lesson.id,
    title: lesson.title,
    subtitle: `${lesson.video_duration || asset?.targetRuntime || "Video lesson"} | ${lesson.duration}`,
    url: demoVideoUrl,
    productionVideoUrl: asset?.productionVideoUrl,
    overview: lesson.overview,
    videoGoal: lesson.video_goal,
    reflectionPrompt: lesson.reflection[0] ?? lesson.evidence_prompt ?? "What stood out for you in this lesson?",
    evidencePrompt: lesson.evidence_prompt,
    assetManifest: asset,
    quiz: firstQuiz
      ? {
          question: firstQuiz.q,
          options: firstQuiz.options.map((option, optionIndex) => ({
            id: optionIndex,
            label: option,
            correct: optionIndex === firstQuiz.answer,
          })),
        }
      : undefined,
  };
});

export const nervousSystemVideoCourse: InteractiveVideoCourse = {
  lessonId: nervousSystemVideoLessonId,
  title: nervousSystemVideoCourseTitle,
  description: sourceCourse.subtitle,
  placeholderVideoUrl: nervousSystemPlaceholderVideoUrl,
  steps: nervousSystemVideoSteps,
};

export function nervousSystemVideoCourseUsesPlaceholderVideos() {
  return interactiveVideoCourseUsesPlaceholderVideos(nervousSystemVideoCourse);
}
