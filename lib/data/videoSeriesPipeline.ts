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

const rootPath = "curriculum/source-imports/Unified Production Pipeline Master Document video series";

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

export const BEHAVIOUR_AS_COMMUNICATION_EPISODES: VideoSeriesEpisode[] = [
  {
    episode: 1,
    title: "All Behaviour Has Meaning",
    keyMessage: "Children act out what they cannot yet put into calm words.",
    cards: [
      "Surface behaviour is the visible signal of an underlying state.",
      "Hunger, fatigue, fear, and sensory overload often masquerade as defiance.",
      "Curiosity opens the door to regulation faster than punishment.",
    ],
    reflection: [
      "When my child acts out, what is my very first thought?",
      "What hidden need might sit underneath their hardest moment today?",
    ],
    actions: [
      "Pause for 3 seconds and ask 'What does my child need right now?' before correcting.",
      "Name one body state or feeling you notice before giving an instruction.",
    ],
  },
  {
    episode: 2,
    title: "The Behaviour Iceberg",
    keyMessage: "Look beneath the waterline of behaviour to find feelings, triggers, and unmet needs.",
    cards: [
      "Above the waterline: yelling, refusing, running away, or shutting down.",
      "Below the waterline: overwhelm, shame, transition stress, or fear of failure.",
      "Addressing only the tip leaves the root need unresolved.",
    ],
    reflection: [
      "What behaviours do I see most often above the waterline?",
      "Which feelings underneath are hardest for my child to express?",
    ],
    actions: [
      "Draw a quick Behaviour Iceberg after one challenging moment this week.",
      "Respond to the feeling below the surface before addressing the rule.",
    ],
  },
  {
    episode: 3,
    title: "Stress Behaviour vs Intentional Misbehaviour",
    keyMessage: "A child in fight, flight, or freeze is reacting to stress, not choosing to be difficult.",
    cards: [
      "Upstairs brain (thinking/planning) goes offline during high stress.",
      "Downstairs brain (survival reflex) takes over during meltdowns.",
      "Safety and co-regulation bring the thinking brain back online.",
    ],
    reflection: [
      "How can I tell when my child has flipped into survival mode?",
      "What happens when I try to lecture while their brain is overwhelmed?",
    ],
    actions: [
      "Lower your voice and reduce words by half when your child is escalated.",
      "Save problem-solving talks until at least 20 minutes after calm returns.",
    ],
  },
  {
    episode: 4,
    title: "Sensory Overload & Body Signals",
    keyMessage: "Noise, crowds, hunger, and tired bodies speak through behaviour first.",
    cards: [
      "Sensory seekers need movement and deep pressure to feel organised.",
      "Sensory avoiders need quiet, dim light, and predictable space.",
      "HALT (Hungry, Angry, Lonely, Tired) checks prevent afternoon crashes.",
    ],
    reflection: [
      "Which environments or times of day overwhelm my child's senses?",
      "What early body cues show my child is reaching their sensory limit?",
    ],
    actions: [
      "Offer water and a crunchy or protein snack right after school or daycare.",
      "Create a low-sensory calm zone at home for quiet decompression.",
    ],
  },
  {
    episode: 5,
    title: "Transitions & Unpredictability",
    keyMessage: "Moving from a preferred activity to a demand is one of the biggest triggers for children.",
    cards: [
      "Sudden stops feel jarring to a child's nervous system.",
      "Visual timers and 5-minute warnings build a bridge between activities.",
      "Connecting briefly with what they are doing eases the shift.",
    ],
    reflection: [
      "Which daily transition causes the most friction in our home?",
      "How much warning do I usually give before expecting my child to stop?",
    ],
    actions: [
      "Join your child's world for 30 seconds before giving a 5-minute transition warning.",
      "Use a visual checklist or timer for morning and bedtime transitions.",
    ],
  },
  {
    episode: 6,
    title: "Connection-Seeking vs Attention-Seeking",
    keyMessage: "When children seek attention through big behaviour, they are really seeking connection and safety.",
    cards: [
      "Reframing 'attention-seeking' as 'connection-seeking' softens adult frustration.",
      "Five minutes of proactive warmth prevents thirty minutes of reactive conflict.",
      "Children feel safest when they know an adult is tuned in to them.",
    ],
    reflection: [
      "When does my child most often pull for my attention in disruptive ways?",
      "How could I fill their connection cup before that moment arrives?",
    ],
    actions: [
      "Give 10 minutes of phone-free, child-led 'Special Time' each day.",
      "Catch your child in a calm moment and offer warm, specific praise.",
    ],
  },
  {
    episode: 7,
    title: "Shame, Fear & Avoidance",
    keyMessage: "Refusal, lying, and hiding often protect a child from feeling shame or fear of getting it wrong.",
    cards: [
      "Shame says 'I am bad'; healthy accountability says 'I made a mistake and can repair it'.",
      "Harsh reactions teach children to hide mistakes rather than own them.",
      "Psychological safety invites honesty.",
    ],
    reflection: [
      "What makes it hard for my child to admit when something went wrong?",
      "How does my tone of voice affect whether my child tells the truth?",
    ],
    actions: [
      "Thank your child for telling the truth before discussing how to fix a mistake.",
      "Focus on practical repair steps rather(than blame or lectures.",
    ],
  },
  {
    episode: 8,
    title: "Co-Regulation in the Storm",
    keyMessage: "Children borrow our calm nervous system before they can regulate their own.",
    cards: [
      "Escalation is contagious—and so is adult calm.",
      "Soft shoulders, slow breathing, and a low posture signal 'You are safe'.",
      "You don't have to fix the feeling to stay steady beside your child.",
    ],
    reflection: [
      "What happens in my own body when my child yells or cries?",
      "What helps me anchor myself so I don't join their storm?",
    ],
    actions: [
      "Take three slow exhales and drop your shoulders before stepping into a conflict.",
      "Use a short anchor phrase: 'I am right here. We will figure this out together.'",
    ],
  },
  {
    episode: 9,
    title: "Setting Warm, Clear Boundaries",
    keyMessage: "Understanding the communication behind behaviour does not mean dropping boundaries—it means holding limits with empathy.",
    cards: [
      "All feelings are welcome; unsafe behaviours have calm limits.",
      "Validate first, set the boundary second, offer a safe alternative third.",
      "Predictable boundaries reduce anxiety for children.",
    ],
    reflection: [
      "Do I tend to give in when tired, or come down too hard when frustrated?",
      "How can I hold a firm boundary while keeping my voice warm?",
    ],
    actions: [
      "Use the 3-step script: 'I see you're mad, I won't let you hit, you can stomp or squeeze this pillow.'",
      "Keep house rules to 3–4 clear, positively stated expectations.",
    ],
  },
  {
    episode: 10,
    title: "Teaching Replacement Communication",
    keyMessage: "Once calm returns, teach your child the words or signals they can use next time.",
    cards: [
      "Children need simple scripts for asking for breaks, help, or space.",
      "Non-verbal signals (break cards, thumbs-down) work when words are too hard.",
      "Practising during calm play wires the skill in for stressful moments.",
    ],
    reflection: [
      "What phrase or signal would help my child ask for help before melting down?",
      "When is the best calm time to practise this together?",
    ],
    actions: [
      "Create a simple 'I need a break' signal or card with your child.",
      "Role-play using the signal during a calm moment and celebrate every time they try it.",
    ],
  },
  {
    episode: 11,
    title: "Repairing After Hard Moments",
    keyMessage: "Ruptures happen in every family; warm repair teaches children that love is unconditional.",
    cards: [
      "Repair reconnects the relationship and models accountability.",
      "Own your part simply without blaming the child for your reaction.",
      "After reconnection, briefly problem-solve what both of you can try next time.",
    ],
    reflection: [
      "How was repair handled in the home I grew up in?",
      "What helps me let go of pride and reconnect warmly with my child?",
    ],
    actions: [
      "Offer a calm repair within an hour of any snappy or tense parenting moment.",
      "Ask your child: 'How did that feel for you, and what can we try next time?'",
    ],
  },
  {
    episode: 12,
    title: "Your Family Communication Roadmap",
    keyMessage: "Consistent curiosity, co-regulation, and repair transform family patterns over time.",
    cards: [
      "Track patterns across the week to spot triggers before they build.",
      "Share what works with co-parents, carers, and educators.",
      "Celebrate progress—every pause and repair rewires safety.",
    ],
    reflection: [
      "What has shifted most in how I view my child's behaviour across this series?",
      "Which three habits do I want to keep at the heart of our family routine?",
    ],
    actions: [
      "Write down your child's top 3 triggers, top 3 calming supports, and your favourite repair phrase.",
      "Share your Family Communication Roadmap with one trusted support person.",
    ],
  },
];

export function getBehaviourAsCommunicationCompleteDraft(): VideoSeriesCourseDraft | null {
  const series = getVideoSeriesPipelineById("behaviour-as-communication");
  if (!series) return null;
  return buildVideoSeriesCourseDraft(
    {
      ...series,
      detectedEpisodes: BEHAVIOUR_AS_COMMUNICATION_EPISODES.length,
      status: "ready_for_curriculum_review",
    },
    BEHAVIOUR_AS_COMMUNICATION_EPISODES,
  );
}

