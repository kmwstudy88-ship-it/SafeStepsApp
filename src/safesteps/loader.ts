// SafeSteps Loader — web + mobile compatible

import bundle from '../../safesteps/assets/SafeSteps.bundle.json';
import master from '../../safesteps/assets/SafeSteps.master.index.json';
import programMap from '../../safesteps/assets/SafeSteps.program.map.json';
import searchIndex from '../../safesteps/assets/SafeSteps.search.index.json';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export const SafeStepsData = {
  bundle,
  master,
  programMap,
  searchIndex,
};

export function getProgramLessons(programId: string) {
  const lessonIds = SafeStepsData.programMap[programId] || [];
  return lessonIds.map((id: string) => SafeStepsData.bundle[id]);
}

export async function loadAllLessons(): Promise<any[]> {
  // ✅ Web: return all lessons from bundle
  if (Platform.OS === 'web') {
    console.log('Running on web — using bundled lessons');
    return Object.values(SafeStepsData.bundle);
  }

  // ✅ Mobile: read local lesson files
  const dataPath = FileSystem.documentDirectory + 'data/';
  const lessons: any[] = [];

  try {
    const files = await FileSystem.readDirectoryAsync(dataPath);
    for (const file of files) {
      if (file.startsWith('lesson_') && file.endsWith('.json')) {
        const content = await FileSystem.readAsStringAsync(dataPath + file);
        lessons.push(JSON.parse(content));
      }
    }
  } catch (error) {
    console.error('Error loading lessons:', error);
  }

  return lessons;
}
