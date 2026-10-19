import catalogJson from '../../src/safesteps/imports/curriculum-seeds/directory-import/catalog.json';

export type ImportedFacilitatorProfile = {
  id: string;
  title: string;
  sourcePaths: string[];
  content: Record<string, unknown>;
};

export type ImportedLesson = {
  id: string;
  title: string;
  summary?: string;
  durationMinutes?: number | null;
  reviewStatus: string;
  content: Record<string, unknown>;
  facilitatorProfiles: ImportedFacilitatorProfile[];
  sourcePaths: string[];
  contentHash: string;
};

export type ImportedCourse = {
  id: string;
  title: string;
  level: string;
  reviewStatus: string;
  description?: string;
  lessons: ImportedLesson[];
  sourcePaths: string[];
  sourceDocument?: Record<string, unknown>;
};

type ImportedCatalog = {
  schemaVersion: number;
  title: string;
  reviewStatus: string;
  notice: string;
  counts: {
    courses: number;
    courseLessons: number;
    standaloneLessons: number;
    learningPackages: number;
  };
  courses: ImportedCourse[];
  standaloneLessons: ImportedLesson[];
  learningPackages: Array<{
    id: string;
    type: string;
    title: string;
    sourcePaths: string[];
    contentHash: string;
    content: Record<string, unknown>;
  }>;
};

export const IMPORTED_CURRICULUM = catalogJson as ImportedCatalog;

export const IMPORTED_COURSES: ImportedCourse[] = [
  ...IMPORTED_CURRICULUM.courses,
  {
    id: 'standalone-lessons',
    title: 'Additional standalone lessons',
    level: 'mixed',
    reviewStatus: IMPORTED_CURRICULUM.reviewStatus,
    description:
      'Imported lessons that do not yet have a verified course relationship in the source material.',
    lessons: IMPORTED_CURRICULUM.standaloneLessons,
    sourcePaths: [],
  },
];

export function findImportedCourse(courseId: string | undefined) {
  return IMPORTED_COURSES.find((course) => course.id === courseId);
}
