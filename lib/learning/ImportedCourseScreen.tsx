import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  findImportedCourse,
  ImportedLesson,
} from './importedCurriculum';

const hiddenContentKeys = new Set([
  'answerkey',
  'correctanswer',
  'correctanswers',
  'correctoption',
  'facilitatorconfig',
  'aifacilitator',
  'aifacilitatorconfig',
  'agentconfig',
  'systemprompt',
  'markingguide',
  'modelanswer',
  'scoringrubric',
  'teacheronly',
]);

function labelFor(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isHiddenKey(key: string) {
  return hiddenContentKeys.has(key.replace(/[^a-z0-9]/gi, '').toLowerCase());
}

function ContentValue({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={styles.body}>{String(value)}</Text>;
  }
  if (typeof value === 'boolean') {
    return <Text style={styles.body}>{value ? 'Yes' : 'No'}</Text>;
  }
  if (Array.isArray(value)) {
    return (
      <View style={styles.array}>
        {value.map((item, index) => (
          <View key={index} style={styles.arrayItem}>
            {typeof item === 'string' ? <Text style={styles.bullet}>•</Text> : null}
            <View style={styles.arrayContent}>
              <ContentValue value={item} depth={depth + 1} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  if (typeof value === 'object') {
    return (
      <View style={depth > 0 ? styles.objectGroup : undefined}>
        {Object.entries(value as Record<string, unknown>)
          .filter(([key, child]) => !isHiddenKey(key) && child !== null && child !== '')
          .map(([key, child]) => (
            <View key={key} style={styles.field}>
              <Text style={depth === 0 ? styles.fieldTitle : styles.fieldSubtitle}>
                {labelFor(key)}
              </Text>
              <ContentValue value={child} depth={depth + 1} />
            </View>
          ))}
      </View>
    );
  }
  return null;
}

function LessonReader({
  lesson,
  onClose,
}: {
  lesson: ImportedLesson;
  onClose: () => void;
}) {
  return (
    <View style={styles.reader}>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back to course</Text>
      </Pressable>
      <View style={styles.readerHeading}>
        <Text style={styles.lessonStatus}>{lesson.reviewStatus}</Text>
        <Text style={styles.readerTitle}>{lesson.title}</Text>
        {lesson.summary ? <Text style={styles.readerLead}>{lesson.summary}</Text> : null}
        <View style={styles.lessonMetaRow}>
          {lesson.durationMinutes ? (
            <Text style={styles.metaChip}>{lesson.durationMinutes} minutes</Text>
          ) : null}
          {lesson.facilitatorProfiles.length > 0 ? (
            <Text style={styles.metaChip}>Guided support available</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.contentDivider} />
      <ContentValue value={lesson.content} />
      <View style={styles.sourceNote}>
        <Text style={styles.sourceNoteTitle}>About this imported lesson</Text>
        <Text style={styles.sourceNoteText}>
          This material retains its source provenance and has not yet completed
          SafeSteps safeguarding, cultural, clinical, legal, and lived-experience
          review.
        </Text>
      </View>
    </View>
  );
}

export function ImportedCourseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const course = useMemo(() => findImportedCourse(courseId), [courseId]);
  const [selectedLessonHash, setSelectedLessonHash] = useState<string>();
  const selectedLesson = course?.lessons.find(
    (lesson) => lesson.contentHash === selectedLessonHash,
  );

  if (!course) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.missing}>
          <Text style={styles.readerTitle}>Course not found</Text>
          <Text style={styles.body}>
            This imported course is not available in the current catalog.
          </Text>
          <Pressable onPress={() => router.replace('/learning/catalog' as never)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Return to learning library</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.pageContent}>
        {selectedLesson ? (
          <LessonReader lesson={selectedLesson} onClose={() => setSelectedLessonHash(undefined)} />
        ) : (
          <>
            <View style={styles.courseHeading}>
              <Text style={styles.lessonStatus}>{course.reviewStatus}</Text>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseLead}>
                {course.description ||
                  `${course.lessons.length} imported lessons gathered from the supplied curriculum.`}
              </Text>
              <Text style={styles.courseBoundary}>
                Course completion is learning evidence only. It does not establish
                parenting fitness, legal compliance, clinical clearance, or that a
                safety risk has ended.
              </Text>
            </View>

            {course.id === 'understanding-harm-basic-imported' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/learning/understanding-harm' as never)}
                style={styles.featureLink}
              >
                <View style={styles.featureLinkText}>
                  <Text style={styles.featureLinkTitle}>Use the SafeSteps course experience</Text>
                  <Text style={styles.featureLinkBody}>
                    Open the expanded six-lesson version with progress, assessment,
                    remediation, and consent controls.
                  </Text>
                </View>
                <Text style={styles.featureArrow}>›</Text>
              </Pressable>
            ) : null}

            <View style={styles.lessonHeader}>
              <Text style={styles.sectionTitle}>Lessons</Text>
              <Text style={styles.lessonCount}>{course.lessons.length} total</Text>
            </View>
            <View style={styles.lessonList}>
              {course.lessons.map((lesson, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={`${lesson.id}-${lesson.contentHash}`}
                  onPress={() => setSelectedLessonHash(lesson.contentHash)}
                  style={({ pressed }) => [styles.lessonRow, pressed && styles.pressed]}
                >
                  <Text style={styles.lessonNumber}>{String(index + 1).padStart(2, '0')}</Text>
                  <View style={styles.lessonMain}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonMeta}>
                      {lesson.durationMinutes
                        ? `${lesson.durationMinutes} minutes`
                        : 'Duration not supplied'}
                      {lesson.facilitatorProfiles.length > 0
                        ? ' · Guided support package'
                        : ''}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              ))}
            </View>
            {course.lessons.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Course source imported</Text>
                <Text style={styles.body}>
                  This source does not expose a lesson sequence that can be shown
                  safely yet. Its original document and provenance remain preserved
                  in the import catalog.
                </Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7FAFC' },
  pageContent: {
    alignSelf: 'center',
    maxWidth: 820,
    padding: 20,
    paddingBottom: 64,
    width: '100%',
  },
  courseHeading: { gap: 10, marginBottom: 26 },
  lessonStatus: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5D8',
    borderRadius: 6,
    color: '#755A00',
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  courseTitle: { color: '#102033', fontSize: 32, fontWeight: '800', letterSpacing: -0.6 },
  courseLead: { color: '#52667A', fontSize: 16, lineHeight: 24, maxWidth: 680 },
  courseBoundary: {
    borderTopColor: '#CDD8E2',
    borderTopWidth: 1,
    color: '#44596C',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    paddingTop: 12,
  },
  featureLink: {
    alignItems: 'center',
    backgroundColor: '#E8F5F3',
    borderColor: '#A9D8D1',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
    padding: 16,
  },
  featureLinkText: { flex: 1, gap: 3 },
  featureLinkTitle: { color: '#174E48', fontSize: 15, fontWeight: '800' },
  featureLinkBody: { color: '#285F59', fontSize: 13, lineHeight: 19 },
  featureArrow: { color: '#126E66', fontSize: 28 },
  lessonHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: { color: '#203548', fontSize: 20, fontWeight: '800' },
  lessonCount: { color: '#60758A', fontSize: 13, fontWeight: '600' },
  lessonList: { borderTopColor: '#D9E2EC', borderTopWidth: 1 },
  lessonRow: {
    alignItems: 'center',
    borderBottomColor: '#D9E2EC',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 76,
    paddingVertical: 13,
  },
  lessonNumber: { color: '#126E66', fontSize: 12, fontWeight: '800', width: 24 },
  lessonMain: { flex: 1, gap: 4 },
  lessonTitle: { color: '#1B3042', fontSize: 16, fontWeight: '700' },
  lessonMeta: { color: '#60758A', fontSize: 12 },
  arrow: { color: '#6B7F91', fontSize: 26 },
  pressed: { backgroundColor: '#EDF6F5' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyTitle: { color: '#203548', fontSize: 18, fontWeight: '800' },
  reader: { gap: 18 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 4 },
  backButtonText: { color: '#126E66', fontSize: 14, fontWeight: '800' },
  readerHeading: { gap: 10 },
  readerTitle: { color: '#102033', fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  readerLead: { color: '#52667A', fontSize: 16, lineHeight: 24 },
  lessonMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    backgroundColor: '#E5EEF5',
    borderRadius: 5,
    color: '#3C566D',
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  contentDivider: { backgroundColor: '#CDD8E2', height: 1 },
  field: { gap: 7, marginBottom: 20 },
  fieldTitle: { color: '#203548', fontSize: 19, fontWeight: '800', marginTop: 8 },
  fieldSubtitle: { color: '#2C465B', fontSize: 15, fontWeight: '700', marginTop: 4 },
  body: { color: '#42586B', fontSize: 15, lineHeight: 23 },
  array: { gap: 9 },
  arrayItem: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  bullet: { color: '#126E66', fontSize: 18, lineHeight: 23 },
  arrayContent: { flex: 1 },
  objectGroup: {
    borderColor: '#D9E2EC',
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
    padding: 14,
  },
  sourceNote: {
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    gap: 4,
    marginTop: 16,
    padding: 14,
  },
  sourceNoteTitle: { color: '#344D62', fontSize: 13, fontWeight: '800' },
  sourceNoteText: { color: '#52697C', fontSize: 12, lineHeight: 18 },
  missing: { alignSelf: 'center', gap: 12, maxWidth: 520, padding: 28, width: '100%' },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#126E66',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
