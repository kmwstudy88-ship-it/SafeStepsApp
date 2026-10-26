import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ParentLessonWorkbookScreen } from '../../lib/lessons/ParentLessonWorkbookScreen';

export default function LessonsRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();

  return (
    <ParentLessonWorkbookScreen
      initialLessonId={lessonId || 'taking_responsibility'}
      onFinishLesson={() => router.back()}
    />
  );
}
