import test from 'node:test';
import assert from 'node:assert/strict';

import { importTypeScriptModule } from './load-typescript-module.mjs';

const {
  saveLessonProgress,
  loadLessonProgress,
  completeLesson,
} = await importTypeScriptModule('../../lib/lessons/lessonPersistenceService.ts');

test('saveLessonProgress preserves opening baseline definition and interactive answers', async () => {
  const lessonId = 'taking_responsibility';
  const baselineDef = 'Taking responsibility means acknowledging mistakes and repairing with my child.';

  const saveResult = await saveLessonProgress(lessonId, {
    currentPage: 2,
    currentStep: 'before_you_start',
    completedSteps: ['page_1_intro'],
    baselineDefinition: baselineDef,
    baselineTimestamp: new Date().toISOString(),
    rating: 4,
    checkInAnswer: 'I feel ready to learn today.',
  });

  assert.equal(saveResult.success, true);

  const loaded = await loadLessonProgress(lessonId);
  assert(loaded, 'must load saved lesson progress');
  assert.equal(loaded.lessonId, lessonId);
  assert.equal(loaded.baselineDefinition, baselineDef);
  assert.equal(loaded.rating, 4);
  assert.equal(loaded.checkInAnswer, 'I feel ready to learn today.');
});

test('completeLesson issues non-legal certificate receipt and updates assessment status', async () => {
  const lessonId = 'emotional_regulation';
  const reflection = 'I practiced box breathing when feeling frustrated and it helped me remain calm.';

  const certResult = await completeLesson(lessonId, {
    quizScore: 95,
    quizPassed: true,
    reflectionSummary: reflection,
  });

  assert.equal(certResult.success, true);
  assert(certResult.certificateId.startsWith(`cert_${lessonId}_`));
  assert(certResult.completedAt);

  const progress = await loadLessonProgress(lessonId);
  assert(progress);
  assert.equal(progress.assessmentStatus, 'submitted');
  assert.equal(progress.quizPassed, true);
  assert.equal(progress.wrapUpResponse, reflection);
});
