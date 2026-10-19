import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function readAsset(relativePath) {
  return JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

const course = readAsset('../../curriculum/courses/lesson-videos/safesteps_nervous_system_course.json');
const banks = [
  readAsset('../../definition matchup/safesteps_definition_matchup_100.json'),
  readAsset('../../definition matchup/safesteps_definition_matchup_201_1200.json'),
];

test('restored nervous-system course supplies the twelve lessons expected by its reader', () => {
  assert.equal(course.course_id, 'NSR-COURSE-01');
  assert.equal(course.lessons.length, 12);
  assert.deepEqual(
    course.lessons.map(lesson => lesson.id),
    Array.from({ length: 12 }, (_, index) => `NSR-${String(index + 1).padStart(2, '0')}`),
  );
  assert.ok(course.title);
  assert.ok(course.subtitle);
  assert.ok(course.clinical_notes.some(note => /not a diagnostic or treatment service/.test(note)));
  for (const lesson of course.lessons) {
    for (const field of ['title', 'duration', 'video_duration', 'overview']) {
      assert.equal(typeof lesson[field], 'string', `${lesson.id}.${field}`);
      assert.ok(lesson[field].length, `${lesson.id}.${field}`);
    }
    assert.ok(lesson.reflection.length);
    assert.ok(lesson.quiz.length);
    for (const quiz of lesson.quiz) {
      assert.ok(quiz.q);
      assert.ok(quiz.options.length > 1);
      assert.ok(Number.isInteger(quiz.answer) && quiz.answer >= 0 && quiz.answer < quiz.options.length);
    }
  }
});

test('restored definition banks retain their declared sizes and valid question/answer references', () => {
  assert.deepEqual(banks.map(bank => bank.questionCount), [100, 1000]);
  const allIds = new Set();
  for (const bank of banks) {
    assert.equal(bank.questions.length, bank.questionCount);
    assert.equal(bank.delivery.selectionMode, 'single_answer');
    assert.ok(bank.scoring.interpretationSafeguard);
    assert.ok(bank.scoring.scoreBands.length);
    for (const question of bank.questions) {
      assert.ok(!allIds.has(question.id), `Duplicate question ${question.id}`);
      allIds.add(question.id);
      assert.equal(question.options.length, bank.delivery.optionsPerQuestion, question.id);
      assert.equal(new Set(question.options.map(option => option.id)).size, question.options.length, question.id);
      assert.equal(question.options.filter(option => option.id === question.correctOptionId).length, 1, question.id);
      for (const option of question.options) {
        assert.ok(option.id && option.label && option.text, question.id);
      }
      assert.ok(question.term && question.prompt && question.explanation, question.id);
    }
  }
  assert.equal(allIds.size, 1100);
});

test('restoration does not manufacture the missing question range or production video assets', () => {
  const numbers = banks.flatMap(bank => bank.questions.map(question => question.number));
  assert.equal(Math.min(...numbers), 1);
  assert.equal(Math.max(...numbers), 1200);
  assert.ok(numbers.every(number => number <= 100 || number >= 201));
  assert.equal(numbers.filter(number => number >= 101 && number <= 200).length, 0);
  const reader = fs.readFileSync(new URL('../../lib/data/nervousSystemVideoCourse.ts', import.meta.url), 'utf8');
  assert.match(reader, /const demoVideoUrl = /);
  assert.match(reader, /url: demoVideoUrl/);
});
