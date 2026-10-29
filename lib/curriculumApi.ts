export type ApiCurriculumModuleSummary = {
  id: string;
  title: string;
  summary?: string;
};

export type ApiCurriculumCourseSummary = {
  id: string;
  title: string;
  description?: string;
  modules: ApiCurriculumModuleSummary[];
};

export type ApiCurriculumCourseDetail = ApiCurriculumCourseSummary & {
  lessons?: Array<{
    id: string;
    lessonNumber: number;
    title: string;
    durationMinutes: number;
    summary?: string;
  }>;
};

export async function listCurriculumCoursesFromApi(): Promise<ApiCurriculumCourseSummary[]> {
  throw new Error("Local Prisma curriculum API not connected; using built-in course library.");
}

export async function getCurriculumCourseFromApi(
  _courseId: string,
): Promise<ApiCurriculumCourseDetail | null> {
  return null;
}
