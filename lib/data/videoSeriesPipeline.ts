export type VideoSeriesPipelineStatus = "ready_for_curriculum_review" | "needs_episode_completion";

export type VideoSeriesPipeline = {
  id: string;
  title: string;
  courseAreaId: string;
  sourceFolder: string;
  masterDocumentPath: string;
  storyboardPath: string;
  parentWorkbookPath: string;
  jsonPackPath: string;
  expectedEpisodes: number;
  detectedEpisodes: number;
  status: VideoSeriesPipelineStatus;
};

export type VideoSeriesEpisode = {
  episode: number;
  title: string;
  keyMessage: string;
  cards: string[];
  reflection: string[];
  actions: string[];
};

export type VideoSeriesCourseDraftLesson = {
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  summary: string;
  content: {
    whyItMatters: string;
    parentMeaningPrompt: string;
    positiveTitle: string;
    positiveItems: string[];
    stepsTitle: string;
    steps: {
      title: string;
      body: string;
      prompt: string;
    }[];
  };
  productionSource: {
    seriesId: string;
    episodeNumber: number;
    jsonPackPath: string;
  };
};

export type VideoSeriesCourseDraft = {
  id: string;
  title: string;
  description: string;
  courseAreaId: string;
  status: "draft_ready_for_human_review";
  lessons: VideoSeriesCourseDraftLesson[];
  source: Pick<
    VideoSeriesPipeline,
    "masterDocumentPath" | "storyboardPath" | "parentWorkbookPath" | "jsonPackPath"
  >;
};

export type VideoSeriesReviewGate = {
  id: string;
  title: string;
  passed: boolean;
  detail: string;
};

export type VideoSeriesLessonPreviewSlot = {
  episodeNumber: number;
  status: "ready_for_review" | "missing_from_pack";
  label: string;
  detail: string;
};

const rootPath = "Unified Production Pipeline Master Document video series";

export const videoSeriesPipelines: VideoSeriesPipeline[] = [
  {
    id: "attachment-connection",
    title: "Attachment & Connection Series",
    courseAreaId: "connection-regulation",
    sourceFolder: `${rootPath}/Attachment & Connection Series`,
    masterDocumentPath: `${rootPath}/Attachment & Connection Series/UNIFIED PRODUCTION PIPELINE MASTER DOCUMENT.rtf`,
    storyboardPath: `${rootPath}/Attachment & Connection Series/STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/Attachment & Connection Series/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/Attachment & Connection Series/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
  {
    id: "behaviour-as-communication",
    title: "Behaviour as Communication Series",
    courseAreaId: "behaviour-routines",
    sourceFolder: `${rootPath}/Behaviour as Communication Series`,
    masterDocumentPath: `${rootPath}/Behaviour as Communication Series/UNIFIED PRODUCTION PIPELINE MASTER DOCUMENT.rtf`,
    storyboardPath: `${rootPath}/Behaviour as Communication Series/STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/Behaviour as Communication Series/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/Behaviour as Communication Series/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 1,
    status: "needs_episode_completion",
  },
  {
    id: "behaviour-support",
    title: "Behaviour Support Series",
    courseAreaId: "behaviour-routines",
    sourceFolder: `${rootPath}/BEHAVIOUR SUPPORT SERIES`,
    masterDocumentPath: `${rootPath}/BEHAVIOUR SUPPORT SERIES/UNIFIED PRODUCTION PIPELINE MASTER DOCUMENT.rtf`,
    storyboardPath: `${rootPath}/BEHAVIOUR SUPPORT SERIES/STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/BEHAVIOUR SUPPORT SERIES/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/BEHAVIOUR SUPPORT SERIES/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
  {
    id: "emotional-regulation-skills",
    title: "Emotional Regulation Skills Series",
    courseAreaId: "connection-regulation",
    sourceFolder: `${rootPath}/Emotional Regulation Skills Series`,
    masterDocumentPath: `${rootPath}/Emotional Regulation Skills Series/UNIFIED PRODUCTION PIPELINE MASTER DOCUMENT.rtf`,
    storyboardPath: `${rootPath}/Emotional Regulation Skills Series/STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/Emotional Regulation Skills Series/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/Emotional Regulation Skills Series/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
  {
    id: "healthy-relationships",
    title: "Healthy Relationships Series",
    courseAreaId: "healthy-relationships",
    sourceFolder: `${rootPath}/Healthy Relationships Series`,
    masterDocumentPath: `${rootPath}/Healthy Relationships Series/UNIFIED PRODUCTION PIPELINE MASTER DOCUMENT.rtf`,
    storyboardPath: `${rootPath}/Healthy Relationships Series/STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/Healthy Relationships Series/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/Healthy Relationships Series/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
  {
    id: "parenting-foundations",
    title: "Parenting Foundations Series",
    courseAreaId: "start-here",
    sourceFolder: `${rootPath}/Parenting Foundations Series`,
    masterDocumentPath: `${rootPath}/Parenting Foundations Series/Parenting Foundations Unified Production Pipeline Master Document.rtf`,
    storyboardPath: `${rootPath}/Parenting Foundations Series/FULL STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/Parenting Foundations Series/parents workbook.rtf`,
    jsonPackPath: `${rootPath}/Parenting Foundations Series/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
  {
    id: "parenting-under-stress",
    title: "Parenting Under Stress Series",
    courseAreaId: "specialist-support",
    sourceFolder: `${rootPath}/Parenting Under Stress Series`,
    masterDocumentPath: `${rootPath}/Parenting Under Stress Series/UNIFIED PRODUCTION PIPELINE MASTER DOCUMENT.rtf`,
    storyboardPath: `${rootPath}/Parenting Under Stress Series/STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/Parenting Under Stress Series/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/Parenting Under Stress Series/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
  {
    id: "safety-stabilisation",
    title: "Safety & Stabilisation Series",
    courseAreaId: "safety-stability",
    sourceFolder: `${rootPath}/Safety & Stabilisation Series`,
    masterDocumentPath: `${rootPath}/Safety & Stabilisation Series/Unified Production Pipeline Master Document.rtf`,
    storyboardPath: `${rootPath}/Safety & Stabilisation Series/STORYBOARD PACK.rtf`,
    parentWorkbookPath: `${rootPath}/Safety & Stabilisation Series/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/Safety & Stabilisation Series/JSON PACK.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
  {
    id: "trauma-child-development",
    title: "Trauma & Child Development Series",
    courseAreaId: "child-development",
    sourceFolder: `${rootPath}/TRAUMA & CHILD DEVELOPMENT SERIES`,
    masterDocumentPath: `${rootPath}/TRAUMA & CHILD DEVELOPMENT SERIES/UNIFIED PRODUCTION PIPELINE MASTER DOCUMENT.rtf`,
    storyboardPath: `${rootPath}/TRAUMA & CHILD DEVELOPMENT SERIES/storyboard library.rtf`,
    parentWorkbookPath: `${rootPath}/TRAUMA & CHILD DEVELOPMENT SERIES/PARENT WORKBOOK.rtf`,
    jsonPackPath: `${rootPath}/TRAUMA & CHILD DEVELOPMENT SERIES/JSON Pack.rtf`,
    expectedEpisodes: 12,
    detectedEpisodes: 12,
    status: "ready_for_curriculum_review",
  },
];

export function summarizeVideoSeriesPipelines(series = videoSeriesPipelines) {
  const totalEpisodes = series.reduce((sum, item) => sum + item.detectedEpisodes, 0);
  const expectedEpisodes = series.reduce((sum, item) => sum + item.expectedEpisodes, 0);
  const readySeries = series.filter((item) => item.status === "ready_for_curriculum_review").length;

  return {
    totalSeries: series.length,
    readySeries,
    needsCompletion: series.length - readySeries,
    totalEpisodes,
    expectedEpisodes,
    completionPercentage: expectedEpisodes > 0 ? Math.round((totalEpisodes / expectedEpisodes) * 100) : 0,
  };
}

export function getVideoSeriesPipelineById(seriesId: string) {
  return videoSeriesPipelines.find((series) => series.id === seriesId) ?? null;
}

export function getVideoSeriesReviewGates(series: VideoSeriesPipeline): VideoSeriesReviewGate[] {
  const completeEpisodePack = series.detectedEpisodes === series.expectedEpisodes;
  const hasProductionDocuments = Boolean(
    series.masterDocumentPath && series.storyboardPath && series.parentWorkbookPath && series.jsonPackPath,
  );

  return [
    {
      id: "episode-pack-complete",
      title: "Episode pack complete",
      passed: completeEpisodePack,
      detail: completeEpisodePack
        ? `${series.detectedEpisodes} of ${series.expectedEpisodes} episode records are present.`
        : `${series.expectedEpisodes - series.detectedEpisodes} episode records still need to be completed before promotion.`,
    },
    {
      id: "course-area-mapped",
      title: "Course area mapped",
      passed: series.courseAreaId.length > 0,
      detail: `Mapped to course area: ${series.courseAreaId}.`,
    },
    {
      id: "production-sources-present",
      title: "Production sources present",
      passed: hasProductionDocuments,
      detail: hasProductionDocuments
        ? "Master document, storyboard, workbook, and JSON pack paths are registered."
        : "One or more production source paths are missing.",
    },
    {
      id: "human-review-required",
      title: "Human curriculum review required",
      passed: true,
      detail: "Drafts are review-ready only; this pipeline does not publish lessons automatically.",
    },
  ];
}

export function getVideoSeriesLessonPreviewSlots(series: VideoSeriesPipeline): VideoSeriesLessonPreviewSlot[] {
  return Array.from({ length: series.expectedEpisodes }, (_, index) => {
    const episodeNumber = index + 1;
    const ready = episodeNumber <= series.detectedEpisodes;

    return {
      episodeNumber,
      status: ready ? "ready_for_review" : "missing_from_pack",
      label: `Episode ${episodeNumber}`,
      detail: ready
        ? "Detected in the source JSON pack and eligible for human lesson review."
        : "Missing from the source JSON pack and blocked from course draft generation.",
    };
  });
}

export function rtfToPlainText(rtf: string) {
  return rtf
    .replace(/\\rquote/g, "'")
    .replace(/\\lquote/g, "'")
    .replace(/\\emdash/g, "-")
    .replace(/\\endash/g, "-")
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\\{/g, "{")
    .replace(/\\\}/g, "}")
    .replace(/\\"/g, '"')
    .replace(/\\'[0-9a-fA-F]{2}/g, "")
    .replace(/\\[a-zA-Z]+\d* ?/g, "")
    .replace(/[{}]/g, (match) => match)
    .trim();
}

function extractJsonObjects(text: string) {
  return text.match(/\{\s*"episode"\s*:[\s\S]*?\n\s*\}/g) ?? [];
}

export function parseVideoSeriesEpisodesFromRtf(rtf: string): VideoSeriesEpisode[] {
  const plainText = rtfToPlainText(rtf);

  return extractJsonObjects(plainText)
    .map((candidate) => {
      try {
        const parsed = JSON.parse(candidate) as Partial<VideoSeriesEpisode> & { episode?: number | string };
        return {
          ...parsed,
          episode: typeof parsed.episode === "number" ? parsed.episode : 1,
        };
      } catch {
        return null;
      }
    })
    .filter((episode): episode is VideoSeriesEpisode =>
      Boolean(
        episode &&
          typeof episode.episode === "number" &&
          typeof episode.title === "string" &&
          typeof episode.keyMessage === "string" &&
          Array.isArray(episode.cards) &&
          Array.isArray(episode.reflection) &&
          Array.isArray(episode.actions),
      ),
    );
}

function toDraftLesson(series: VideoSeriesPipeline, episode: VideoSeriesEpisode): VideoSeriesCourseDraftLesson {
  const actionSteps = episode.actions.map((action, index) => ({
    title: `Practice ${index + 1}`,
    body: action,
    prompt: episode.reflection[index] ?? episode.reflection[0] ?? "What did you notice while practising this?",
  }));

  return {
    lessonNumber: episode.episode,
    title: episode.title,
    durationMinutes: 15,
    summary: episode.keyMessage,
    content: {
      whyItMatters: episode.keyMessage,
      parentMeaningPrompt:
        episode.reflection[0] ?? "What does this lesson mean for the way you want your child to experience you?",
      positiveTitle: "Key ideas from this episode",
      positiveItems: episode.cards,
      stepsTitle: "Practice this safely",
      steps: actionSteps,
    },
    productionSource: {
      seriesId: series.id,
      episodeNumber: episode.episode,
      jsonPackPath: series.jsonPackPath,
    },
  };
}

export function buildVideoSeriesCourseDraft(
  series: VideoSeriesPipeline,
  episodes: VideoSeriesEpisode[],
): VideoSeriesCourseDraft | null {
  if (series.status !== "ready_for_curriculum_review") return null;
  if (episodes.length !== series.expectedEpisodes) return null;

  return {
    id: `video-series-${series.id}`,
    title: series.title.replace(/\s+Series$/i, ""),
    description: `Draft SafeSteps course generated from the ${series.title} production pack for human curriculum review.`,
    courseAreaId: series.courseAreaId,
    status: "draft_ready_for_human_review",
    lessons: episodes
      .slice()
      .sort((first, second) => first.episode - second.episode)
      .map((episode) => toDraftLesson(series, episode)),
    source: {
      masterDocumentPath: series.masterDocumentPath,
      storyboardPath: series.storyboardPath,
      parentWorkbookPath: series.parentWorkbookPath,
      jsonPackPath: series.jsonPackPath,
    },
  };
}
