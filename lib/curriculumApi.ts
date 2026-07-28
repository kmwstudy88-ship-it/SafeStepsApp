export type ApiCurriculumModuleSummary = {
  order: number;
  module: {
    id: string;
    title: string;
  };
};

export type ApiCurriculumCourseSummary = {
  id: string;
  title: string;
  description: string | null;
  sourcePath: string;
  modules: ApiCurriculumModuleSummary[];
};

export type ApiCurriculumModuleLesson = {
  order: number;
  lesson: ApiCurriculumLessonSummary & {
    raw?: unknown;
    createdAt?: string;
    updatedAt?: string;
  };
};

export type ApiCurriculumCourseDetail = Omit<ApiCurriculumCourseSummary, "modules"> & {
  raw: unknown;
  createdAt: string;
  updatedAt: string;
  modules: {
    order: number;
    module: {
      id: string;
      title: string;
      sourcePath: string;
      raw: unknown;
      createdAt: string;
      updatedAt: string;
      lessons: ApiCurriculumModuleLesson[];
    };
  }[];
};

export type ApiCurriculumLessonSummary = {
  id: string;
  title: string;
  weekId: string | null;
  body: string | null;
  content: string | null;
  parentMeaningPrompt: string | null;
  sourcePath: string;
};

export function isCurriculumApiEnabled() {
  return (
    process.env.EXPO_PUBLIC_SAFESTEPS_CURRICULUM_API_ENABLED === "true" &&
    Boolean(process.env.EXPO_PUBLIC_SAFESTEPS_API_URL?.trim())
  );
}

function apiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_SAFESTEPS_API_URL?.trim();

  if (!isCurriculumApiEnabled() || !configuredUrl) {
    throw new Error(
      "The external curriculum API is disabled. SafeSteps will use the built-in reviewed curriculum library.",
    );
  }

  return configuredUrl.replace(/\/$/, "");
}

function isGenericCurriculumTitle(title: string) {
  return [
    /^lesson\s+\d+$/i,
    /^stage\s+\d+\s+-\s+week\s+\d+\s+-\s+lesson\s+\d+$/i,
    /^week\s+\d+\s+-\s+lesson\s+\d+$/i,
    /^module name$/i,
    /^lesson title$/i,
  ].some((pattern) => pattern.test(title.trim()));
}

function isPlaceholderCurriculumText(value: string | null | undefined) {
  if (!value) return false;
  return [/placeholder content/i, /^content pending$/i, /^add short/i, /^todo\b/i].some((pattern) =>
    pattern.test(value.trim()),
  );
}

export function isLaunchReadyCurriculumLesson(lesson: ApiCurriculumLessonSummary) {
  return (
    !isGenericCurriculumTitle(lesson.title) &&
    !isPlaceholderCurriculumText(lesson.content) &&
    !isPlaceholderCurriculumText(lesson.body)
  );
}

function filterCourseDetail(course: ApiCurriculumCourseDetail): ApiCurriculumCourseDetail {
  return {
    ...course,
    modules: course.modules
      .map((moduleLink) => ({
        ...moduleLink,
        module: {
          ...moduleLink.module,
          lessons: moduleLink.module.lessons.filter((lessonLink) =>
            isLaunchReadyCurriculumLesson(lessonLink.lesson),
          ),
        },
      }))
      .filter((moduleLink) => moduleLink.module.lessons.length > 0),
  };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`);
  if (!response.ok) {
    throw new Error(`SafeSteps API returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function listCurriculumCoursesFromApi() {
  return getJson<ApiCurriculumCourseSummary[]>("/curriculum/courses");
}

export async function getCurriculumCourseFromApi(courseId: string) {
  const course = await getJson<ApiCurriculumCourseDetail>(`/curriculum/courses/${encodeURIComponent(courseId)}`);
  return filterCourseDetail(course);
}

export async function listCurriculumLessonsFromApi(limit = 100) {
  const lessons = await getJson<ApiCurriculumLessonSummary[]>(`/curriculum/lessons?limit=${limit}`);
  return lessons.filter(isLaunchReadyCurriculumLesson);
}
