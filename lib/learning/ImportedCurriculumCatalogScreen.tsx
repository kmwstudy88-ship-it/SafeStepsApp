import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  IMPORTED_COURSES,
  IMPORTED_CURRICULUM,
} from './importedCurriculum';

export function ImportedCurriculumCatalogScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCourses = useMemo(
    () =>
      IMPORTED_COURSES.filter((course) => {
        if (!normalizedQuery) return true;
        return (
          course.title.toLowerCase().includes(normalizedQuery) ||
          course.description?.toLowerCase().includes(normalizedQuery) ||
          course.lessons.some((lesson) =>
            lesson.title.toLowerCase().includes(normalizedQuery),
          )
        );
      }),
    [normalizedQuery],
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>Learning library</Text>
          <Text style={styles.lead}>
            Parenting courses and standalone lessons gathered into one
            searchable library.
          </Text>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Draft material for supported learning</Text>
            <Text style={styles.noticeText}>{IMPORTED_CURRICULUM.notice}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{IMPORTED_CURRICULUM.counts.courses}</Text>
            <Text style={styles.summaryLabel}>course groups</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {IMPORTED_CURRICULUM.counts.courseLessons +
                IMPORTED_CURRICULUM.counts.standaloneLessons}
            </Text>
            <Text style={styles.summaryLabel}>lessons</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {IMPORTED_CURRICULUM.counts.learningPackages}
            </Text>
            <Text style={styles.summaryLabel}>support packages</Text>
          </View>
        </View>

        <TextInput
          accessibilityLabel="Search courses and lessons"
          autoCapitalize="none"
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search by course or lesson"
          placeholderTextColor="#718096"
          style={styles.search}
          value={query}
        />

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            {normalizedQuery ? 'Search results' : 'Browse courses'}
          </Text>
          <Text style={styles.resultCount}>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'group' : 'groups'}
          </Text>
        </View>

        <View style={styles.courseList}>
          {filteredCourses.map((course) => (
            <Pressable
              accessibilityRole="button"
              key={course.id}
              onPress={() => router.push(`/learning/catalog/${course.id}` as never)}
              style={({ pressed }) => [styles.courseRow, pressed && styles.pressed]}
            >
              <View style={styles.courseMain}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseMeta}>
                  {course.lessons.length}{' '}
                  {course.lessons.length === 1 ? 'lesson' : 'lessons'} ·{' '}
                  {course.level === 'mastery' ? 'Mastery' : 'Foundation'}
                </Text>
                {course.description ? (
                  <Text numberOfLines={2} style={styles.courseDescription}>
                    {course.description}
                  </Text>
                ) : null}
              </View>
              <Text accessibilityElementsHidden style={styles.arrow}>
                ›
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matching lessons</Text>
            <Text style={styles.emptyText}>
              Try a broader topic such as safety, communication, attachment, or
              routines.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7FAFC' },
  content: {
    alignSelf: 'center',
    gap: 24,
    maxWidth: 820,
    padding: 20,
    paddingBottom: 56,
    width: '100%',
  },
  intro: { gap: 10 },
  title: { color: '#102033', fontSize: 32, fontWeight: '800', letterSpacing: -0.6 },
  lead: { color: '#4A5568', fontSize: 17, lineHeight: 25, maxWidth: 620 },
  notice: {
    backgroundColor: '#E8F5F3',
    borderColor: '#B8DED8',
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginTop: 6,
    padding: 14,
  },
  noticeTitle: { color: '#174E48', fontSize: 14, fontWeight: '800' },
  noticeText: { color: '#285F59', fontSize: 13, lineHeight: 19 },
  summaryRow: {
    borderBottomColor: '#D9E2EC',
    borderBottomWidth: 1,
    borderTopColor: '#D9E2EC',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  summaryItem: { flex: 1, gap: 2 },
  summaryValue: { color: '#126E66', fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: '#52667A', fontSize: 12, fontWeight: '600' },
  search: {
    backgroundColor: '#FFFFFF',
    borderColor: '#AAB8C5',
    borderRadius: 10,
    borderWidth: 1,
    color: '#102033',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  listHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -10,
  },
  sectionTitle: { color: '#1A2B3C', fontSize: 20, fontWeight: '800' },
  resultCount: { color: '#60758A', fontSize: 13, fontWeight: '600' },
  courseList: { borderTopColor: '#D9E2EC', borderTopWidth: 1 },
  courseRow: {
    alignItems: 'center',
    borderBottomColor: '#D9E2EC',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 16,
    minHeight: 96,
    paddingVertical: 16,
  },
  courseMain: { flex: 1, gap: 4 },
  courseTitle: { color: '#172A3A', fontSize: 17, fontWeight: '700' },
  courseMeta: { color: '#126E66', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  courseDescription: { color: '#52667A', fontSize: 14, lineHeight: 20 },
  arrow: { color: '#6B7F91', fontSize: 28 },
  pressed: { backgroundColor: '#EDF6F5' },
  emptyState: { alignItems: 'center', gap: 6, paddingVertical: 40 },
  emptyTitle: { color: '#203548', fontSize: 18, fontWeight: '800' },
  emptyText: { color: '#60758A', fontSize: 14, lineHeight: 21, maxWidth: 420, textAlign: 'center' },
});
