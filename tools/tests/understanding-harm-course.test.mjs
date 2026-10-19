import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const course = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, 'lessons', 'understanding_harm.json'),
    'utf8',
  ),
);

test('Understanding Harm exposes the complete production-draft course', () => {
  assert.equal(course.courseId, 'understanding_harm_basic');
  assert.equal(course.reviewStatus.status, 'production_draft');
  assert.equal(course.sections.length, 6);
  assert.equal(course.durationMinutes, 270);
  assert.equal(course.finalAssessment.questions.length, 8);
  assert.equal(course.finalAssessment.passMark, 80);
  assert.equal(course.finalAssessment.attemptsAllowed, 3);
});

test('every lesson has facilitator, activity, assessment, and safety content', () => {
  const lessonIds = new Set();

  for (const lesson of course.sections) {
    assert.equal(lessonIds.has(lesson.id), false, `duplicate ${lesson.id}`);
    lessonIds.add(lesson.id);
    assert.equal(lesson.durationMinutes, 45);
    assert.ok(lesson.facilitator.openingScript.length > 20);
    assert.ok(lesson.facilitator.feedback.remediation.length > 20);
    assert.ok(lesson.activities.length >= 1);
    assert.equal(
      lesson.scenario.choices.filter((choice) => choice.correct).length,
      1,
    );
    assert.ok(lesson.quiz.length >= 1);
    for (const question of lesson.quiz) {
      assert.equal(
        question.choices.filter((choice) => choice.correct).length,
        1,
      );
    }
    assert.ok(lesson.safety_guidance.red_flags.length >= 3);
    assert.ok(lesson.safety_guidance.when_to_escalate.length >= 3);
  }
});

test('final assessment covers every competency at the required threshold', () => {
  const questionsByCompetency = new Map();
  for (const question of course.finalAssessment.questions) {
    assert.equal(
      question.choices.filter((choice) => choice.correct).length,
      1,
    );
    questionsByCompetency.set(
      question.competencyId,
      (questionsByCompetency.get(question.competencyId) ?? 0) + 1,
    );
  }

  for (const competency of course.competencies) {
    assert.equal(competency.requiredScore, 80);
    assert.ok(
      (questionsByCompetency.get(competency.id) ?? 0) >= 2,
      `${competency.id} needs at least two assessment questions`,
    );
  }
});

test('sharing is opt-in and excludes private learning content', () => {
  assert.equal(
    course.outcomeTracking.shareWithAssignedPractitioner,
    'explicit_learner_consent_only',
  );
  assert.deepEqual(course.outcomeTracking.privateByDefault, [
    'Reflection text',
    'Personal notes',
    'Unsubmitted activity drafts',
  ]);
  assert.match(course.certificate.disclaimer, /not evidence/i);
});

